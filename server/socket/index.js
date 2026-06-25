import { Server as SocketIOServer } from "socket.io";
import Message from "../models/MessageModel.js";
import redis from "../redis/client.js";

const ONLINE_SET = "online_users"; // Redis SET  — who is online
const LAST_SEEN_NS = "last_seen"; // Redis keys — last_seen:<userId>
const SOCKET_MAP = "socket_map"; // Redis HASH — userId → socketId

/**
 * In-memory map still used for fast socket-ID lookups during message routing.
 * Redis holds the authoritative online set + last seen for external queries.
 */
const userSocketMap = {};

let ioInstance;
export const getIO = () => ioInstance;

export const getReceiverSocketId = (userId) => userSocketMap[userId];

export const initSocket = (httpServer) => {
  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  ioInstance.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;

    if (!userId) {
      console.warn(`[Socket] Connection rejected — no userId in handshake`);
      socket.disconnect(true);
      return;
    }

    // ── Register user ────────────────────────────────────────────────────────

    // 1. In-memory map (fast routing)
    userSocketMap[userId] = socket.id;

    // 2. Redis SET — marks this user as online
    await redis.sadd(ONLINE_SET, userId);

    // 3. Redis HASH — maps userId → socketId (useful for other services)
    await redis.hset(SOCKET_MAP, userId, socket.id);

    console.log(
      `[Socket] User connected | userId=${userId} socketId=${socket.id}`,
    );

    // Broadcast full online list to all clients
    const onlineUsers = await redis.smembers(ONLINE_SET);
    ioInstance.emit("onlineUsers", onlineUsers);

    // ── sendMessage ──────────────────────────────────────────────────────────
    socket.on("sendMessage", async (message) => {
      const { _id, senderId, recipientId, content, messageType, fileUrl } =
        message;

      if (!recipientId || !senderId) {
        socket.emit("error", {
          message: "senderId and recipientId are required.",
        });
        return;
      }

      try {
        const recipientSocketId = getReceiverSocketId(recipientId);

        let savedMessage;

        if (_id) {
          // File message already saved via REST upload — just fetch it
          savedMessage = await Message.findByIdAndUpdate(
            _id,
            {
              status: recipientSocketId ? "delivered" : "sent",
              deliveredAt: recipientSocketId ? new Date() : null,
            },
            { returnDocument: "after" },
          );
        } else {
          // Text message — create fresh
          const initialStatus = recipientSocketId ? "delivered" : "sent";
          savedMessage = await Message.create({
            senderId,
            recipientId,
            messageType: messageType || "text",
            content: content || null,
            fileUrl: fileUrl || null,
            timestamp: new Date(),
            status: initialStatus,
            deliveredAt: recipientSocketId ? new Date() : null,
          });
        }

        const payload = {
          _id: savedMessage._id,
          senderId,
          recipientId,
          content: savedMessage.content,
          messageType: savedMessage.messageType,
          fileUrl: savedMessage.fileUrl,
          timestamp: savedMessage.timestamp,
          status: savedMessage.status,
        };

        if (recipientSocketId) {
          ioInstance.to(recipientSocketId).emit("receiveMessage", payload);
        }

        // Only echo text messages back to sender — file messages are added
        // directly by addMessage() in the client after the REST upload
        if (!_id) {
          socket.emit("receiveMessage", payload);
        }

        if (recipientSocketId) {
          socket.emit("messageStatusUpdate", {
            messageId: savedMessage._id,
            status: "delivered",
          });
        }

        if (recipientSocketId) {
          ioInstance.to(recipientSocketId).emit("refreshDMList", payload);
        }
        socket.emit("refreshDMList", payload);
      } catch (err) {
        console.error("[Socket] Failed to save message:", err.message);
        socket.emit("error", {
          message: "Failed to send message. Please try again.",
        });
      }
    });
    // ── getLastSeen ──────────────────────────────────────────────────────────
    socket.on("getLastSeen", async ({ userId: targetId }, callback) => {
      // If the user is currently online, last seen is "now"
      const isOnline = await redis.sismember(ONLINE_SET, targetId);
      if (isOnline) {
        return callback({ online: true, lastSeen: null });
      }

      const lastSeen = await redis.get(`${LAST_SEEN_NS}:${targetId}`);
      callback({ online: false, lastSeen: lastSeen || null });
    });

    // ── markAsRead ───────────────────────────────────────────────────────────
    // Client emits this when the user opens a conversation.
    // Bulk-flips all unread messages from that sender to "read" and
    // notifies the sender's socket so their ticks turn blue.
    socket.on("markAsRead", async ({ senderId: otherUserId }) => {
      if (!otherUserId) return;

      try {
        const now = new Date();

        // Step 1 — capture the exact IDs that need marking before touching them.
        // This avoids a second query after the update and eliminates any
        // timestamp precision issues.
        const unreadMessages = await Message.find(
          {
            senderId: otherUserId,
            recipientId: userId,
            status: { $in: ["sent", "delivered"] },
          },
          { _id: 1 },
        ).lean();

        const messageIds = unreadMessages.map((m) => m._id);
        if (messageIds.length === 0) return; // Nothing to mark — skip emit

        // Step 2 — bulk update using the exact IDs we captured.
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $set: { status: "read", readAt: new Date() } },
        );

        // Step 3 — tell the sender's socket to flip those ticks to blue.
        const senderSocketId = getReceiverSocketId(otherUserId);
        if (senderSocketId) {
          ioInstance.to(senderSocketId).emit("messageStatusUpdate", {
            messageIds,
            status: "read",
          });
        }
      } catch (err) {
        console.error("[Socket] markAsRead failed:", err.message);
      }
    });

    // ── disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(
        `[Socket] User disconnected | userId=${userId} socketId=${socket.id}`,
      );

      // 1. Remove from in-memory map
      delete userSocketMap[userId];

      // 2. Remove from Redis online SET
      await redis.srem(ONLINE_SET, userId);

      // 3. Remove from Redis socket map
      await redis.hdel(SOCKET_MAP, userId);

      // 4. Write last seen timestamp
      await redis.set(`${LAST_SEEN_NS}:${userId}`, new Date().toISOString());

      // Broadcast updated online list
      const onlineUsers = await redis.smembers(ONLINE_SET);
      ioInstance.emit("onlineUsers", onlineUsers);
    });
  });

  return ioInstance;
};

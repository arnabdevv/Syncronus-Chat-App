import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Message from "../models/MessageModel.js";
import redis from "../redis/client.js";

export const searchContacts = async (request, response, next) => {
  try {
    const { searchTerm } = request.body;

    // Escape special characters for regex
    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    // Create a case-insensitive regex for search
    const regex = new RegExp(sanitizedSearchTerm, "i");

    // Find contacts excluding the requesting user
    const contacts = await User.find({
      $and: [
        { _id: { $ne: request.userId } }, // Exclude the current user
        {
          $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
        },
      ],
    });

    return response.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

/**
 * GET /api/contacts/dm-contacts
 * Returns all users the authenticated user has previously messaged,
 * sorted by the most recent message timestamp (newest first).
 */
export const getDMContacts = async (request, response, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(request.userId);

    const contacts = await Message.aggregate([
      // Step 1: Find every message where the current user is sender or recipient
      {
        $match: {
          $or: [{ senderId: userId }, { recipientId: userId }],
        },
      },
      // Step 2: Sort by newest first so $first inside $group picks the latest
      {
        $sort: { timestamp: -1 },
      },
      // Step 3: Group by the OTHER participant, capturing the latest timestamp
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$senderId", userId] },
              then: "$recipientId",
              else: "$senderId",
            },
          },
          lastMessageTime: { $first: "$timestamp" },
          lastMessageContent: { $first: "$content" },
          lastMessageType: { $first: "$messageType" },
          lastMessageSenderId: { $first: "$senderId" },
          lastMessageStatus: { $first: "$status" },
          lastMessageId: { $first: "$_id" },
        },
      },
      // Step 4: Look up full user info for each contact
      {
        $lookup: {
          from: "users", // Mongoose model "Users" → collection "users"
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      // Step 5: Flatten the contactInfo array (always one element)
      {
        $unwind: "$contactInfo",
      },
      // Step 6: Shape the output
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          lastMessageContent: 1, // ← add this
          lastMessageType: 1, // ← add this
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.colors",
          lastMessageSenderId: 1,
          lastMessageStatus: 1,
          lastMessageId: 1,
        },
      },
      // Step 7: Newest conversation at the top
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    return response.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const getLastSeen = async (request, response, next) => {
  try {
    const { userId: targetId } = request.params;

    const isOnline = await redis.sismember("online_users", targetId);
    if (isOnline) {
      return response.status(200).json({ online: true, lastSeen: null });
    }

    const lastSeen = await redis.get(`last_seen:${targetId}`);
    return response
      .status(200)
      .json({ online: false, lastSeen: lastSeen || null });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

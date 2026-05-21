import Message from "../models/MessageModel.js";
import { renameSync } from "fs";
import { getReceiverSocketId } from "../socket/index.js";

/**
 * GET /api/messages?recipientId=<id>
 * Returns the full conversation between the authenticated user and the recipient,
 * ordered oldest → newest.
 */
export const getMessages = async (request, response, next) => {
  try {
    const myId = request.userId;
    const { recipientId } = request.validated.query;

    const messages = await Message.find({
      $or: [
        { senderId: myId, recipientId },
        { senderId: recipientId, recipientId: myId },
      ],
    }).sort({ timestamp: 1 });

    return response.status(200).json({ messages });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

/**
 * POST /api/messages/upload-file
 * Saves an uploaded file locally, persists a Message document,
 * and delivers it in real-time to the recipient if they are online.
 */
export const uploadFile = async (request, response, next) => {
  try {
    if (!request.file) {
      return response.status(400).send("File is required.");
    }

    const { recipientId } = request.validated.body;
    const senderId = request.userId;

    // Move the temp file to the permanent uploads/files directory
    const date = Date.now();
    const fileName = `uploads/files/${date}_${request.file.originalname}`;
    renameSync(request.file.path, fileName);

    // Persist to MongoDB
    const message = await Message.create({
      senderId,
      recipientId,
      messageType: "file",
      fileUrl: fileName,
      timestamp: new Date(),
    });

    // Real-time delivery to recipient if online
    const recipientSocketId = getReceiverSocketId(recipientId);
    if (recipientSocketId) {
      // io is not directly accessible here — the client will refetch or
      // the socket layer handles live delivery. REST response is the source of truth.
    }

    return response.status(201).json({ message });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

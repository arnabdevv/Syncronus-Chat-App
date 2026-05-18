import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { getMessages, uploadFile } from "../controllers/MessagesController.js";
import { getMessagesSchema, uploadFileSchema } from "../validators/messageSchemas.js";
import multer from "multer";

const messagesRoutes = Router();
const upload = multer({ dest: "uploads/files/" });

// GET /api/messages?recipientId=<id>  — fetch conversation history
messagesRoutes.get("/", verifyToken, validate(getMessagesSchema, "query"), getMessages);

// POST /api/messages/upload-file  — upload a file message
messagesRoutes.post(
  "/upload-file",
  verifyToken,
  upload.single("file"),
  validate(uploadFileSchema),
  uploadFile
);

export default messagesRoutes;

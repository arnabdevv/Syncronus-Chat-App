import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: [true, "senderId is required."],
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: [true, "recipientId is required."],
  },
  messageType: {
    type: String,
    enum: ["text", "file"],
    default: "text",
  },
  content: {
    type: String,
    // Required only for text messages — enforced at application level
  },
  fileUrl: {
    type: String,
    // Required only for file messages — enforced at application level
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },

  // ── Delivery / read receipts ───────────────────────────────────────────────
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  deliveredAt: {
    type: Date,
    default: null, // set when recipient's socket receives the message
  },
  readAt: {
    type: Date,
    default: null, // set when recipient opens the conversation
  },
});

// Compound index so conversation queries (sender ↔ recipient sorted by time)
// are served without a full collection scan.
messageSchema.index({ senderId: 1, recipientId: 1, timestamp: 1 });

// Sparse index on status — efficient queries for undelivered / unread messages
// without bloating the index with every "read" document.
messageSchema.index({ status: 1, recipientId: 1 }, { sparse: true });

const Message = mongoose.model("Messages", messageSchema);

export default Message;

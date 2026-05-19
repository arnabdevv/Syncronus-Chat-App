import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import { useSocket } from "@/context/SocketContext";
import { apiClient } from "@/lib/api-client";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants";
import { useAppStore } from "@/store";

const MessageBar = () => {
  const emojiRef = useRef();
  const [message, setMessage] = useState("");
  const [emojiPicker, setEmojiPicker] = useState(false);
  const socket = useSocket();
  const { userInfo, selectedChatData, selectedChatType, addMessage } =
    useAppStore();
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    function handelClinkOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handelClinkOutside);
    return () => {
      document.removeEventListener("mousedown", handelClinkOutside);
    };
  }, [emojiRef]);

  const handelAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handelSendMessage = async () => {
    if (!message.trim()) return;
    if (!socket || !selectedChatData) return;

    const payload = {
      senderId: userInfo.id,
      recipientId: selectedChatData._id,
      content: message,
      messageType: "text",
    };

    socket.emit("sendMessage", payload);

    setMessage("");
    setEmojiPicker(false);
  };

  const handelAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handelFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChatData) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("recipientId", selectedChatData._id);

    setUploading(true);
    try {
      const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData);

      if (response.status === 201 && response.data.message) {
        // Add to local message list immediately — no socket echo for file uploads
        addMessage(response.data.message);

        // Notify recipient via socket so their sidebar and message list update
        if (socket) {
          socket.emit("sendMessage", {
            senderId: userInfo.id,
            recipientId: selectedChatData._id,
            messageType: "file",
            fileUrl: response.data.message.fileUrl,
            _id: response.data.message._id,
          });
        }
      }
    } catch (error) {
      console.error("[MessageBar] File upload failed:", error);
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected if needed
      e.target.value = "";
    }
  };

  return (
    <div className="h-[10vh] bg-transparent flex justify-center items-center px-8 mb-6 gap-6 z-10">
      <div className="flex-1 flex glass-panel rounded-full items-center gap-5 pr-5 border border-white/10">
        <input
          type="text"
          className="flex-1 p-5 px-6 bg-transparent rounded-full focus:border-none focus:outline-none text-white placeholder-neutral-400"
          placeholder="Write Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handelSendMessage();
            }
          }}
        />
        <button
          className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
          onClick={handelAttachmentClick}
          disabled={uploading}
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <GrAttachment className="text-2xl" />
          )}
        </button>

        {/* Hidden file input — triggered by the attachment button */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handelFileChange}
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        />
        <div className="relative">
          <button
            className=" text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
            onClick={() => setEmojiPicker((prev) => !prev)}
          >
            <RiEmojiStickerLine className=" text-2xl" />
          </button>
          <div className=" absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker
              theme="dark"
              open={emojiPicker}
              onEmojiClick={handelAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      <button
        className="bg-electric-violet hover:bg-deep-indigo rounded-full flex items-center justify-center p-5 focus:border-none focus:outline-none focus:text-white duration-300 transition-all neon-border shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
        onClick={handelSendMessage}
      >
        <IoSend className=" text-2xl" />
      </button>
    </div>
  );
};

export default MessageBar;

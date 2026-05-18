import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { GET_MESSAGES_ROUTE, HOST } from "@/utils/constants";
import { useAppStore } from "@/store";
import { useSocket } from "@/context/SocketContext";
import { getColor } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import moment from "moment";

const MessageContainer = () => {
  const {
    selectedChatData,
    selectedChatType,
    selectedChatMessages,
    setSelectedChatMessages,
    userInfo,
  } = useAppStore();

  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  // ── Fetch history when the active chat changes ────────────────────────────
  useEffect(() => {
    if (!selectedChatData?._id) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(GET_MESSAGES_ROUTE, {
          params: { recipientId: selectedChatData._id },
        });
        if (response.status === 200 && response.data.messages) {
          setSelectedChatMessages(response.data.messages);

          // Tell the server we've read everything this contact sent us.
          // Fires only after messages are loaded and visible to the user.
          if (socket) {
            socket.emit("markAsRead", {
              senderId: selectedChatData._id,
            });
          }
        }
      } catch (error) {
        console.error("[MessageContainer] Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Clear stale messages when switching chats
    return () => setSelectedChatMessages([]);
  }, [selectedChatData?._id, selectedChatType]);

  // ── Auto-scroll to bottom on every new message ────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isMine = (message) => message.senderId === userInfo.id;

  const formatTime = (timestamp) => moment(timestamp).format("h:mm A");

  const isSameDay = (a, b) =>
    moment(a.timestamp).isSame(moment(b.timestamp), "day");

  const formatDateDivider = (timestamp) => {
    const d = moment(timestamp);
    if (d.isSame(moment(), "day")) return "Today";
    if (d.isSame(moment().subtract(1, "day"), "day")) return "Yesterday";
    return d.format("MMMM D, YYYY");
  };

  // ── Shared avatar (only shown on the other person's messages) ─────────────
  const ContactAvatar = () => (
    <Avatar className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0 mb-1">
      {selectedChatData?.image ? (
        <AvatarImage
          src={`${HOST}/${selectedChatData.image}`}
          alt="avatar"
          className="object-cover w-full h-full"
        />
      ) : (
        <div
          className={`uppercase h-7 w-7 text-xs border flex items-center
            justify-center rounded-full ${getColor(selectedChatData?.color)}`}
        >
          {selectedChatData?.firstName?.[0] ?? selectedChatData?.email?.[0]}
        </div>
      )}
    </Avatar>
  );

  // ── Message status ticks ──────────────────────────────────────────────────
  const MessageStatus = ({ status }) => {
    // Only render on the sender's own messages — handled by the caller
    if (status === "read") {
      // Double blue tick
      return (
        <span className="inline-flex items-center ml-1" title="Read">
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path
              d="M1 5L4.5 8.5L10 1"
              stroke="#53BDEB"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 5L8.5 8.5L14 1"
              stroke="#53BDEB"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );
    }

    if (status === "delivered") {
      // Double grey tick
      return (
        <span className="inline-flex items-center ml-1" title="Delivered">
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path
              d="M1 5L4.5 8.5L10 1"
              stroke="#8696A0"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 5L8.5 8.5L14 1"
              stroke="#8696A0"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );
    }

    // Default — single grey tick (sent)
    return (
      <span className="inline-flex items-center ml-1" title="Sent">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M1 5L4 8L9 1"
            stroke="#8696A0"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  };

  // ── Text bubble ───────────────────────────────────────────────────────────
  const TextMessage = ({ message }) => (
    <div
      className={`flex items-end gap-2 mb-1
        ${isMine(message) ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isMine(message) && <ContactAvatar />}

      <div
        className={`max-w-[65%] px-4 py-2 rounded-2xl text-sm leading-relaxed
          break-words ${
            isMine(message)
              ? "bg-[#8417ff] text-white rounded-br-sm"
              : "bg-[#2a2b33] text-neutral-100 rounded-bl-sm"
          }`}
      >
        {message.content}
        <span
          className={`flex items-center justify-end text-[10px] mt-1 select-none gap-0.5 ${
            isMine(message) ? "text-purple-300" : "text-neutral-500"
          }`}
        >
          {formatTime(message.timestamp)}
          {isMine(message) && <MessageStatus status={message.status} />}
        </span>
      </div>
    </div>
  );

  // ── File bubble (image preview or generic download link) ──────────────────
  const FileMessage = ({ message }) => {
    const url = `${HOST}/${message.fileUrl}`;
    const isImage = /\.(jpe?g|png|gif|webp|svg)$/i.test(message.fileUrl ?? "");

    return (
      <div
        className={`flex items-end gap-2 mb-1
          ${isMine(message) ? "flex-row-reverse" : "flex-row"}`}
      >
        {!isMine(message) && <ContactAvatar />}

        <div
          className={`max-w-[65%] rounded-2xl overflow-hidden text-sm ${
            isMine(message)
              ? "bg-[#8417ff] text-white rounded-br-sm"
              : "bg-[#2a2b33] text-neutral-100 rounded-bl-sm"
          }`}
        >
          {isImage ? (
            <img
              src={url}
              alt="shared image"
              className="max-w-full max-h-60 object-cover cursor-pointer
                hover:opacity-90 transition-opacity"
              onClick={() => window.open(url, "_blank")}
            />
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3
      hover:opacity-80 transition-opacity"
            >
              <div
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center
                justify-center flex-shrink-0"
              >
                <svg
                  className="w-5 h-5 opacity-80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125
                      1.125 0 0113.5 7.125v-1.5a3.375 3.375 0
                      00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5
                      2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0
                      .621.504 1.125 1.125 1.125h12.75c.621 0
                      1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <span className="truncate text-xs opacity-90">
                {message.fileUrl?.split("/").pop() ?? "File"}
              </span>
            </a>
          )}

          <span
            className={`flex items-center justify-end text-[10px] px-3 pb-2 select-none gap-0.5 ${
              isMine(message) ? "text-purple-300" : "text-neutral-500"
            }`}
          >
            {formatTime(message.timestamp)}
            {isMine(message) && <MessageStatus status={message.status} />}
          </span>
        </div>
      </div>
    );
  };

  // ── Date divider ──────────────────────────────────────────────────────────
  const DateDivider = ({ timestamp }) => (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-[#2f303b]" />
      <span className="text-xs text-neutral-500 whitespace-nowrap">
        {formatDateDivider(timestamp)}
      </span>
      <div className="flex-1 h-px bg-[#2f303b]" />
    </div>
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div
          className="w-6 h-6 border-2 border-purple-500 border-t-transparent
          rounded-full animate-spin"
        />
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div
      className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8
      md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full"
    >
      {selectedChatMessages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-neutral-600 text-sm">
            No messages yet. Say hello!
          </p>
        </div>
      ) : (
        selectedChatMessages.map((message, index) => {
          const showDivider =
            index === 0 || !isSameDay(selectedChatMessages[index - 1], message);

          return (
            <div key={message._id ?? index}>
              {showDivider && <DateDivider timestamp={message.timestamp} />}
              {message.messageType === "text" ? (
                <TextMessage message={message} />
              ) : (
                <FileMessage message={message} />
              )}
            </div>
          );
        })
      )}

      {/* Invisible anchor — scrolled into view on new messages */}
      <div ref={scrollRef} />
    </div>
  );
};

export default MessageContainer;

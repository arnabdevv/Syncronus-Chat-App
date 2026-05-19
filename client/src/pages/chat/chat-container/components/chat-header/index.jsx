import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { useSocket } from "@/context/SocketContext";
import { RiCloseFill } from "react-icons/ri";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { HOST, GET_LAST_SEEN_ROUTE } from "@/utils/constants";
import { getColor } from "@/lib/utils";
import moment from "moment";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType, onlineUsers } =
    useAppStore();
  const socket = useSocket();
  const [lastSeen, setLastSeen] = useState(null);

  const isOnline = onlineUsers.includes(selectedChatData?._id);

  // ── Fetch last seen when chat opens or online status changes ─────────────
  useEffect(() => {
    if (!selectedChatData?._id) return;

    if (isOnline) {
      setLastSeen(null); // online — no last seen needed
      return;
    }

    // Try socket first (faster, no HTTP)
    if (socket) {
      socket.emit(
        "getLastSeen",
        { userId: selectedChatData._id },
        ({ lastSeen: ts }) => {
          setLastSeen(ts ?? null);
        },
      );
      return;
    }

    // Fallback to REST (e.g. socket not ready yet)
    apiClient
      .get(`${GET_LAST_SEEN_ROUTE}/${selectedChatData._id}`)
      .then(({ data }) => setLastSeen(data.lastSeen ?? null))
      .catch(() => setLastSeen(null));
  }, [selectedChatData?._id, isOnline]);

  // ── Format last seen text ─────────────────────────────────────────────────
  const formatLastSeen = (ts) => {
    if (!ts) return "Offline";
    const m = moment(ts);
    if (m.isSame(moment(), "day"))
      return `Last seen today at ${m.format("h:mm A")}`;
    if (m.isSame(moment().subtract(1, "day"), "day"))
      return `Last seen yesterday at ${m.format("h:mm A")}`;
    return `Last seen ${m.format("MMM D [at] h:mm A")}`;
  };

  const displayName =
    selectedChatType === "contact" && selectedChatData.firstName
      ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
      : selectedChatData.email;

  return (
    <div className="h-[10vh] border-b border-white/5 bg-surface-container/30 backdrop-blur-md flex items-center justify-between px-20 z-10">
      <div className="flex gap-5 items-center w-full justify-between">
        <div className="flex gap-3 items-center">
          {/* Avatar with online dot */}
          <div className="w-12 h-12 relative flex-shrink-0">
            <Avatar className="h-12 w-12 rounded-full overflow-hidden">
              {selectedChatData.image ? (
                <AvatarImage
                  src={`${HOST}/${selectedChatData.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                    selectedChatData.color,
                  )}`}
                >
                  {selectedChatData.firstName
                    ? selectedChatData.firstName[0]
                    : selectedChatData.email[0]}
                </div>
              )}
            </Avatar>

            {/* Online indicator dot */}
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            )}
          </div>

          {/* Name + online/last seen status */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {displayName}
            </span>
            <span className="text-xs text-neutral-400">
              {isOnline ? (
                <span className="text-green-400">Online</span>
              ) : (
                formatLastSeen(lastSeen)
              )}
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          className="text-neutral-500 hover:text-white focus:border-none focus:outline-none focus:text-white duration-300 transition-all hover:bg-white/5 p-2 rounded-full"
          onClick={closeChat}
        >
          <RiCloseFill className="text-3xl" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;

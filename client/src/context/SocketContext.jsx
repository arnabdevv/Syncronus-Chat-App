import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAppStore } from "@/store";
import { HOST, GET_DM_CONTACTS_ROUTE } from "@/utils/constants";
import { apiClient } from "@/lib/api-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const {
    userInfo,
    addMessage,
    setDmContacts,
    updateMessageStatus,
    setOnlineUsers,
  } = useAppStore();

  useEffect(() => {
    // Only connect when the user is authenticated
    if (!userInfo) return;

    socketRef.current = io(HOST, {
      withCredentials: true,
      query: { userId: userInfo.id },
    });

    socketRef.current.on("connect", () => {
      console.log("[Socket] Connected:", socketRef.current.id);
    });

    // ── Incoming messages ───────────────────────────────────────────────────
    const handleReceiveMessage = (message) => {
      // Only add the message to the store if the conversation is currently open
      const store = useAppStore.getState();
      const { selectedChatData, selectedChatType } = store;

      if (
        selectedChatType === "contact" &&
        (selectedChatData?._id === message.senderId ||
          selectedChatData?._id === message.recipientId)
      ) {
        store.addMessage(message);
      }
    };

    // ── Online presence ─────────────────────────────────────────────────────
    const handleOnlineUsers = (users) => {
      useAppStore.getState().setOnlineUsers(users);
    };

    socketRef.current.on("onlineUsers", handleOnlineUsers);

    socketRef.current.on("receiveMessage", handleReceiveMessage);

    // ── Sidebar sync ────────────────────────────────────────────────────────
    // refreshDMList fires after every saved message (sent or received).
    // Re-fetches the authoritative sorted DM contact list from the server
    // so both sidebars stay perfectly in sync without a manual refresh.
    const handleRefreshDMList = async () => {
      try {
        const { data } = await apiClient.get(GET_DM_CONTACTS_ROUTE);
        useAppStore.getState().setDmContacts(data.contacts);
      } catch (err) {
        console.error("[Socket] refreshDMList fetch failed:", err.message);
      }
    };

    // ── Message status updates (delivered / read ticks) ─────────────────────
    const handleMessageStatusUpdate = ({ messageId, messageIds, status }) => {
      useAppStore
        .getState()
        .updateMessageStatus({ messageId, messageIds, status });
    };

    socketRef.current.on("messageStatusUpdate", handleMessageStatusUpdate);

    socketRef.current.on("refreshDMList", handleRefreshDMList);

    return () => {
      socketRef.current?.off("receiveMessage", handleReceiveMessage);
      socketRef.current?.off("refreshDMList", handleRefreshDMList);
      socketRef.current?.off("messageStatusUpdate", handleMessageStatusUpdate);
      socketRef.current?.disconnect();
      socketRef.current?.off("onlineUsers", handleOnlineUsers);
    };
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

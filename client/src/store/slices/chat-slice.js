export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  dmContacts: [],
  onlineUsers: [],

  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),

  addMessage: (message) =>
    set((state) => ({
      selectedChatMessages: [...state.selectedChatMessages, message],
    })),

  setDmContacts: (dmContacts) => set({ dmContacts }),

  /**
   * updateDmContactLastMessage(message)
   * Called whenever a new message arrives (sent or received).
   * - Updates the matching contact's lastMessageTime
   * - Moves them to the top of the list (most-recent-first order)
   * - No API refetch required
   */
  updateDmContactLastMessage: (message) =>
    set((state) => {
      const { senderId, recipientId, timestamp } = message;
      const { userInfo } = get(); // read auth slice via get()
      const myId = userInfo?.id;

      // The "other" participant is whoever isn't us
      const otherUserId = senderId === myId ? recipientId : senderId;

      const updatedContacts = state.dmContacts.map((contact) =>
        contact._id === otherUserId
          ? {
              ...contact,
              lastMessageTime: timestamp ?? new Date().toISOString(),
              lastMessageContent: message.content ?? null,
              lastMessageType: message.messageType ?? "text",
              lastMessageSenderId: message.senderId ?? null,
              lastMessageStatus: message.status ?? "sent",
              lastMessageId: message._id ?? null,
            }
          : contact,
      );

      // Re-sort: newest lastMessageTime first
      updatedContacts.sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
      );

      return { dmContacts: updatedContacts };
    }),

  // updateMessageStatus({ messageId, messageIds, status })
  // Handles both single-message updates (delivered) and
  // bulk updates (read — array of IDs from markAsRead).
  updateMessageStatus: ({ messageId, messageIds, status }) =>
    set((state) => {
      const ids = new Set(
        messageIds
          ? messageIds.map((id) => id.toString())
          : [messageId.toString()],
      );

      // Update ticks inside the open conversation
      const updatedMessages = state.selectedChatMessages.map((msg) =>
        ids.has(msg._id.toString()) ? { ...msg, status } : msg,
      );

      // Also update the sidebar tick if the contact's last message is among the updated IDs
      const updatedContacts = state.dmContacts.map((contact) =>
        contact.lastMessageId && ids.has(contact.lastMessageId.toString())
          ? { ...contact, lastMessageStatus: status }
          : contact,
      );

      return {
        selectedChatMessages: updatedMessages,
        dmContacts: updatedContacts,
      };
    }),

  markContactMessagesAsRead: (contactId) =>
    set((state) => {
      const updatedContacts = state.dmContacts.map((contact) =>
        contact._id === contactId
          ? { ...contact, lastMessageStatus: "read" }
          : contact,
      );

      return { dmContacts: updatedContacts };
    }),

  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }),
});

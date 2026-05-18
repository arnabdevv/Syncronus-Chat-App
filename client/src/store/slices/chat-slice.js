export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  dmContacts: [],

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
      // Normalise: always work with an array of IDs
      const ids = new Set(
        messageIds
          ? messageIds.map((id) => id.toString())
          : [messageId.toString()],
      );

      return {
        selectedChatMessages: state.selectedChatMessages.map((msg) =>
          ids.has(msg._id.toString()) ? { ...msg, status } : msg,
        ),
      };
    }),

  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }),
});

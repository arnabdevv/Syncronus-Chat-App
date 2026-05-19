# Changelog

All notable changes to Syncronus are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-05-19

### 🎉 Initial Release

#### Auth
- Signup and login with email and password
- JWT cookie authentication (`httpOnly`, `secure`, `sameSite: None`)
- Zod input validation on all auth routes
- Duplicate email handled with 409 response
- Password visibility toggle on login and signup
- Error toasts for wrong credentials

#### Profile
- Profile setup with first name, last name, and avatar colour
- Profile image upload (Multer) with old image auto-deletion
- Profile image removal with disk cleanup
- Back button guards: prevents skipping profile setup

#### Real-time Messaging
- Socket.io server attached to HTTP server
- `sendMessage` event saves to MongoDB and delivers to recipient
- `receiveMessage` echo to sender replaces optimistic updates
- Enter key sends message

#### Message Receipts
- Single grey tick — sent
- Double grey tick — delivered (set at create time when recipient is online)
- Double purple tick — read (bulk-updated via `markAsRead` on chat open)
- Ticks update in real time via `messageStatusUpdate` socket event
- Sidebar ticks update alongside in-chat ticks

#### Online Presence
- Redis SET tracks online users on connect/disconnect
- `onlineUsers` broadcast to all clients on every change
- Green online dot and "Online" text in chat header
- Last seen written to Redis on disconnect
- Chat header shows "Last seen today at 3:42 PM" format

#### File Sharing
- Attachment button opens file picker
- Files uploaded via REST endpoint, delivered via socket
- Images render inline with click-to-fullscreen
- Non-image files show download card with filename

#### Contacts & Sidebar
- Contact search by first name, last name, and email
- DM contact list sorted by latest message time
- Last message preview with tick indicator for sent messages
- Unread messages shown in bold white
- Live sidebar sync via `refreshDMList` socket event

#### UI / Design
- Full glassmorphism redesign across all pages
- Electric violet accent colour with neon glow effects
- Ambient background blurs on auth, profile, and chat pages
- Consistent dark theme throughout
- Lottie animation in empty states

#### State Management
- Zustand store with auth and chat slices
- Actions: `addMessage`, `updateDmContactLastMessage`, `updateMessageStatus`, `markContactMessagesAsRead`, `closeChat`, `setOnlineUsers`

#### Redis
- Shared `ioredis` client
- Online users SET, last seen STRING, socketId HASH

#### Fixes
- `httpOnly` flag added to login cookie
- JWT expiry fixed from seconds to "3d" string
- Route typo `/remove-profile-ipmage` corrected
- Password check uncommented in login
- Optimistic message duplicate removed
- Chat state cleared on logout to prevent ghost chat on next login
- Socket disconnected on logout
- Auth error toasts wired up via try/catch in handleLogin and handleSignup

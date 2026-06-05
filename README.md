# Syncronus 💬

A modern real-time chat application built with React, Node.js, Socket.io, MongoDB, and Redis.

![Syncronus](https://img.shields.io/badge/version-1.0.0-8B5CF6?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-4F46E5?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green?style=flat-square)

---

## ✨ Features

- 🔐 **Auth** — Signup, login, logout with JWT cookie authentication
- 💬 **Real-time messaging** — Instant message delivery via Socket.io
- ✓✓ **Message receipts** — Sent, delivered, and read ticks (WhatsApp-style)
- 🟢 **Online presence** — Live online indicator and last seen timestamp
- 📎 **File sharing** — Send images and files directly in chat
- 🔍 **Contact search** — Search users by name or email
- 🎨 **Profile** — Custom avatar colour and profile image upload
- 📋 **DM sidebar** — Contact list sorted by latest message with live sync

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Backend | Node.js, Express |
| Real-time | Socket.io |
| Database | MongoDB + Mongoose |
| Cache / Presence | Redis (ioredis) |
| Auth | JWT, bcrypt |
| Validation | Zod |
| File uploads | Multer |

---

## 📁 Project Structure

```
Chat-App-2/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/        # Login & signup
│   │   │   ├── chat/        # Main chat UI
│   │   │   └── profile/     # Profile setup
│   │   ├── store/           # Zustand state (auth + chat slices)
│   │   ├── context/         # Socket context
│   │   ├── lib/             # Axios client, utils
│   │   └── utils/           # API constants
│   └── .env
│
└── server/                  # Express backend
    ├── controllers/         # AuthController, ContactsController, MessagesController
    ├── models/              # UserModel, MessageModel
    ├── routes/              # Auth, Contacts, Messages routes
    ├── middlewares/         # JWT auth middleware
    ├── socket/              # Socket.io event handlers
    ├── redis/               # ioredis client
    └── .env
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Redis (local or [Upstash](https://upstash.com))

### 1. Clone the repository

```bash
git clone https://github.com/your-username/syncronus.git
cd syncronus
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=8747
DATABASE_URL=mongodb://localhost:27017/syncronus
JWT_KEY=your_super_secret_jwt_key_here
ORIGIN=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

Start the server:

```bash
# Development
npm run dev

# Production
npm start
```

### 3. Set up the client

```bash
cd client
npm install
```

Create a `.env` file inside `client/`:

```env
VITE_SERVER_URL=http://localhost:8747
```

Start the client:

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

---

## 🔧 Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `8747` |
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/syncronus` |
| `JWT_KEY` | Secret key for JWT signing | `your_secret_key` |
| `ORIGIN` | Allowed CORS origin (client URL) | `http://localhost:5173` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |

### Client (`client/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_SERVER_URL` | Backend server URL | `http://localhost:8747` |

---

## 📡 API Routes

### Auth — `/api/auth`
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/signup` | Create new account | ❌ |
| POST | `/login` | Login | ❌ |
| POST | `/logout` | Logout | ✅ |
| GET | `/user-info` | Get logged-in user profile | ✅ |
| POST | `/update-profile` | Update name and colour | ✅ |
| POST | `/add-profile-image` | Upload profile image | ✅ |
| DELETE | `/remove-profile-image` | Delete profile image | ✅ |

### Contacts — `/api/contacts`
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/search` | Search users | ✅ |
| GET | `/dm-contacts` | Get DM contact list | ✅ |
| GET | `/last-seen/:userId` | Get last seen timestamp | ✅ |

### Messages — `/api/messages`
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/` | Get message history | ✅ |
| POST | `/upload-file` | Upload a file in chat | ✅ |

---

## 🔌 Socket Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `sendMessage` | `{ senderId, recipientId, content, messageType, fileUrl?, _id? }` | Send a message |
| `markAsRead` | `{ senderId }` | Mark conversation as read |
| `getLastSeen` | `{ userId }` | Get a user's last seen (with callback) |

### Server → Client
| Event | Payload | Description |
|---|---|---|
| `receiveMessage` | `message` | New message delivered |
| `onlineUsers` | `string[]` | Updated list of online user IDs |
| `messageStatusUpdate` | `{ messageId?, messageIds?, status }` | Tick status change |
| `refreshDMList` | `message` | Trigger sidebar re-fetch |

---

## 📦 Deployment

### Server (Railway / Render / VPS)

1. Set all environment variables from the table above
2. Make sure `ORIGIN` points to your deployed client URL
3. Run `npm start`

### Client (Vercel / Netlify)

1. Set `VITE_SERVER_URL` to your deployed server URL
2. Run `npm run build` — deploy the `dist/` folder
3. Add a rewrite rule so all routes point to `index.html`:
   - Vercel: add `vercel.json` with rewrites
   - Netlify: add `public/_redirects` with `/* /index.html 200`

### Redis

Use [Upstash](https://upstash.com) for a free serverless Redis instance. Copy the connection URL into `REDIS_URL`.

---

## 🤝 Contributing

Pull requests are welcome. For major changes please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

Built with ❤️ by **Arnab Dinda**
- GitHub: [@your-username](https://github.com/arnabdevv)
- LinkedIn: [your-linkedin](https://linkedin.com/in/arnabdevv)

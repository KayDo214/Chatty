# Chatty Architecture

This project is a MERN-style fullstack chat application with a React/Vite frontend, an Express/MongoDB backend, JWT cookie authentication, Cloudinary-backed image uploads, and Socket.IO for online-user presence and live incoming messages.

## Top-Level Shape

```text
.
├── backend/              # Express API, Socket.IO server, MongoDB models
├── frontend/             # React client built with Vite, Zustand, Tailwind, daisyUI
├── package.json          # Root install/build/start orchestration
├── README.md             # Minimal project readme
└── package.zip           # Packaged archive; not part of runtime source
```

### Critical Files

- `package.json`: Root scripts install both apps, build the frontend, and start the backend.
- `backend/src/index.js`: Main production server entry point.
- `frontend/src/App.jsx`: Main React route and auth gate entry point.

## Frontend UI

### `frontend/`

The frontend is a Vite React single-page app. It renders the chat UI, auth screens, profile management, settings, and theme selection. In development, it calls the backend at `http://localhost:5001`; in production, the backend serves the built frontend from `frontend/dist`.

Critical files:

- `frontend/package.json`: Frontend dependencies and scripts for `dev`, `build`, `lint`, and `preview`.
- `frontend/vite.config.js`: Vite configuration using React and Tailwind plugins.
- `frontend/index.html`: Browser document shell that mounts React at `#root`.

### `frontend/src/`

Main source root for the client application.

Critical files:

- `frontend/src/main.jsx`: Mounts React into the DOM and wraps the app in `BrowserRouter`.
- `frontend/src/App.jsx`: Defines protected/public routes and applies the selected daisyUI theme.
- `frontend/src/index.css`: Imports Tailwind CSS and enables all daisyUI themes.

### `frontend/src/pages/`

Page-level route components. These components compose stores and reusable UI components into full screens.

Critical files:

- `HomePage.jsx`: Main authenticated chat layout with sidebar and active conversation area.
- `LoginPage.jsx` and `SignUpPage.jsx`: Auth forms that call `useAuthStore` actions.
- `ProfilePage.jsx`: Displays user account details and uploads profile images.
- `SettingsPage.jsx`: Theme picker and chat preview using the theme store.

### `frontend/src/components/`

Reusable UI components used by pages. The chat surface is assembled here: contact list, selected conversation, message input, headers, empty states, and loading skeletons.

Critical files:

- `Sidebar.jsx`: Loads users, shows online/offline state, filters online users, and selects the active chat.
- `ChatContainer.jsx`: Loads messages for the selected user, subscribes to realtime messages, renders the conversation, and auto-scrolls.
- `MessageInput.jsx`: Handles text/image input, local image preview, and calls the message send action.
- `ChatHeader.jsx`: Shows the selected user's avatar/name/online state and closes the active chat.
- `NavBar.jsx`: Global navigation, profile/settings links, and logout action.

### `frontend/src/components/skeletons/`

Loading placeholders for chat and contact data while API calls are pending.

Critical files:

- `MessageSkeleton.jsx`: Placeholder rows for the message thread.
- `SidebarSkeleton.jsx`: Placeholder contact list while users are loading.

### `frontend/src/constants/`

Static client constants.

Critical files:

- `index.js`: Defines the list of daisyUI theme names shown in settings.

### `frontend/src/lib/`

Small client utilities and service setup.

Critical files:

- `axios.js`: Creates the shared Axios client with API base URL and `withCredentials: true` for JWT cookies.
- `utils.js`: Formats message timestamps and decides when date separators should appear.

## State Management

### `frontend/src/store/`

Zustand stores act as the client-side integration layer. UI components call store actions; stores call backend HTTP endpoints, manage async loading flags, hold selected chat state, and manage Socket.IO lifecycle.

Critical files:

- `useAuthStore.js`: Owns authenticated user state, signup/login/logout/profile update flows, online users, and Socket.IO connection setup/teardown.
- `useChatStore.js`: Owns contact list, selected user, message list, message fetching/sending, and realtime message subscription handling.
- `useThemeStore.js`: Persists the selected daisyUI theme in `localStorage`.

Key client state flow:

1. `App.jsx` calls `useAuthStore.checkAuth()` on mount.
2. If authenticated, `useAuthStore.connectSocket()` opens a Socket.IO connection with the user id in the query string.
3. `HomePage.jsx` renders `Sidebar`; `Sidebar.jsx` calls `useChatStore.getUsers()`.
4. Selecting a user updates `selectedUser`; `ChatContainer.jsx` then fetches messages and subscribes to `newMessage`.
5. `MessageInput.jsx` calls `useChatStore.sendMessage()`, which posts to the backend and appends the saved message locally.

## Backend API

### `backend/`

The backend is an Express app using ES modules. It exposes REST routes under `/api`, manages auth cookies, connects to MongoDB, uploads images to Cloudinary, and hosts the Socket.IO server.

Critical files:

- `backend/package.json`: Backend dependencies and `dev`/`start` scripts.
- `backend/src/index.js`: Configures middleware, registers API routes, serves the frontend build, starts the HTTP server, and connects MongoDB.

### `backend/src/routes/`

Thin Express routers that map HTTP endpoints to controller functions. Protected routes use `protectRoute`.

Critical files:

- `auth.route.js`: Defines `/api/auth/signup`, `/login`, `/logout`, `/update-profile`, and `/check`.
- `message.route.js`: Defines `/api/messages/users`, `/:id`, and `/send/:id`.

### `backend/src/controller/`

Request handlers containing the main backend business logic for auth, profile updates, user listing, message retrieval, and message creation.

Critical files:

- `auth.controller.js`: Validates signup/login input, hashes passwords, normalizes emails, issues JWT cookies, uploads profile pictures, and returns authenticated user data.
- `message.controller.js`: Fetches sidebar users, retrieves a two-user conversation, uploads message images, saves messages, and emits live messages to online receivers.

### `backend/src/middleware/`

Express middleware shared across routes.

Critical files:

- `auth.middleware.js`: Reads the `jwt` cookie, verifies it with `JWT_SECRET`, loads the user from MongoDB, strips the password field, and attaches the user to `req.user`.

### `backend/src/lib/`

Backend infrastructure helpers.

Critical files:

- `db.js`: Connects Mongoose to `process.env.MONGODB_URI`.
- `utils.js`: Generates signed JWTs and writes them to an HTTP-only cookie.
- `cloudinary.js`: Configures the Cloudinary SDK from environment variables.
- `socket.js`: Creates the Express app, HTTP server, Socket.IO server, and online-user socket map.

## Real-Time / WebSockets

### Backend: `backend/src/lib/socket.js`

Socket.IO is attached to the same HTTP server used by Express. When a client connects, it passes `userId` in the socket handshake query. The backend stores `userId -> socket.id` in memory and broadcasts the current online user ids with `getOnlineUsers`.

Critical files:

- `backend/src/lib/socket.js`: Owns Socket.IO server creation, connection/disconnection handlers, and `getReceiverSocketId()`.
- `backend/src/controller/message.controller.js`: Uses `getReceiverSocketId(receiverId)` and emits `newMessage` to the recipient socket after a message is saved.

### Frontend: Socket Client Integration

The frontend opens the socket only after authentication succeeds and stores the socket instance in `useAuthStore`.

Critical files:

- `frontend/src/store/useAuthStore.js`: Creates the Socket.IO client, sends the authenticated user's id as a query param, stores `onlineUsers`, and disconnects on logout.
- `frontend/src/store/useChatStore.js`: Subscribes/unsubscribes to `newMessage` and appends incoming messages only when they belong to the currently selected conversation.
- `frontend/src/components/Sidebar.jsx`: Displays online status from `onlineUsers`.

Realtime event map:

| Event | Direction | Purpose |
| --- | --- | --- |
| `getOnlineUsers` | Server to all clients | Broadcasts the list of currently connected user ids. |
| `newMessage` | Server to one client | Delivers a newly saved message to the receiver if they are online. |

## Database / Models

### `backend/src/models/`

Mongoose schemas define the persisted data model.

Critical files:

- `user.model.js`: Stores `email`, `fullName`, hashed `password`, optional `profilePic`, and timestamps.
- `message.model.js`: Stores `senderId`, `receiverId`, optional `text`, optional `image`, and timestamps.

### `backend/src/seeds/`

Developer data setup for local testing.

Critical files:

- `user.seed.js`: Connects to MongoDB and inserts a fixed set of sample users with profile pictures.

Important model relationships:

- `Message.senderId` references `User`.
- `Message.receiverId` references `User`.
- Conversations are queried by matching both sender/receiver directions between the authenticated user and the selected contact.

## Request And Data Flow

### Auth Flow

1. User submits login or signup from `LoginPage.jsx` / `SignUpPage.jsx`.
2. `useAuthStore` posts to `/api/auth/login` or `/api/auth/signup`.
3. `auth.controller.js` validates credentials, hashes or compares passwords, and calls `generateToken()`.
4. `generateToken()` writes a signed JWT into an HTTP-only `jwt` cookie.
5. Later protected requests pass through `protectRoute`, which resolves the current user into `req.user`.

### Messaging Flow

1. `Sidebar.jsx` calls `/api/messages/users` to list all users except the authenticated user.
2. Selecting a user causes `ChatContainer.jsx` to call `/api/messages/:id`.
3. Sending a message posts to `/api/messages/send/:id`.
4. `message.controller.js` optionally uploads an image to Cloudinary, saves the message to MongoDB, and emits `newMessage` to the receiver's active socket.
5. The sender appends the HTTP response locally; the receiver appends the socket event if that sender is the selected conversation.

## Deployment Shape

The root build script installs dependencies for both apps and builds the frontend:

```sh
npm run build
```

The root start script starts the backend:

```sh
npm start
```

In `backend/src/index.js`, Express serves `../frontend/dist` and falls back to `frontend/dist/index.html` for client-side routes. Because the current condition is `if (process.env.NODE_ENV === "production" || true)`, static frontend serving is always enabled.


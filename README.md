# Chatty

A full-stack, real-time messaging application built with the MERN stack. ChatApp supports secure cookie-based authentication, one-to-one text and image messages, live delivery with Socket.IO, online presence, profile photos, and customizable themes.

## Features

- Sign up, log in, log out, and restore authenticated sessions
- Send and receive messages in real time
- Share text, images, or both in a conversation
- See which contacts are online and filter the contact list accordingly
- Upload profile photos through Cloudinary
- Choose from 30+ daisyUI themes, persisted in the browser
- Responsive chat interface with loading states and toast notifications
- Protected REST endpoints and authenticated WebSocket connections

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Zustand, Axios |
| Styling | Tailwind CSS 4, daisyUI, Lucide React |
| Backend | Node.js, Express 5, Socket.IO |
| Database | MongoDB, Mongoose |
| Authentication | JWT in HTTP-only cookies, bcryptjs |
| Media | Cloudinary |

## Project Structure

```text
ChatApp/
├── backend/
│   └── src/
│       ├── controller/     # Authentication and message handlers
│       ├── lib/            # Database, JWT, Cloudinary, and Socket.IO setup
│       ├── middleware/     # Authentication and request validation
│       ├── models/         # User and message schemas
│       ├── routes/         # REST API routes
│       ├── seeds/          # Optional sample-user seed data
│       └── index.js        # Backend entry point
├── frontend/
│   └── src/
│       ├── components/     # Chat and navigation components
│       ├── pages/          # Route-level screens
│       ├── store/          # Zustand auth, chat, and theme stores
│       └── App.jsx         # Routes and authentication gates
├── ARCHITECTURE.md         # Detailed application architecture
└── package.json            # Production build and start scripts
```

For a deeper explanation of the request, state, authentication, and real-time messaging flows, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- A MongoDB database
- A Cloudinary account for image uploads

### 1. Clone and install

```bash
git clone https://github.com/KayDo214/ChatApp.git
cd ChatApp
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure the backend

Create `backend/.env`:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

The development client and Socket.IO configuration expect the backend on port `5001` and the Vite client on port `5173`.

### 3. Run in development

Start the backend:

```bash
npm run dev --prefix backend
```

In another terminal, start the frontend:

```bash
npm run dev --prefix frontend
```

Open [http://localhost:5173](http://localhost:5173).

### Optional: seed sample users

With `backend/.env` configured, run:

```bash
cd backend
node src/seeds/user.seed.js
```

The seed inserts development-only sample user records into the configured database. It does not clear existing users, so repeated runs may fail on duplicate email addresses.

## Production Build

The root build command installs both applications and creates the frontend bundle:

```bash
npm run build
```

Then start the Express server:

```bash
npm start
```

Express serves the built frontend from `frontend/dist` and exposes the API and Socket.IO server from the same process. Set `NODE_ENV=production` and provide all backend environment variables in the deployment environment.

## API Overview

All protected routes authenticate through the `jwt` HTTP-only cookie.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Public | Create an account and start a session |
| `POST` | `/api/auth/login` | Public | Log in and start a session |
| `POST` | `/api/auth/logout` | Public | Clear the session cookie |
| `GET` | `/api/auth/check` | Protected | Return the authenticated user |
| `PUT` | `/api/auth/update-profile` | Protected | Upload and save a profile photo |
| `GET` | `/api/messages/users` | Protected | List available contacts |
| `GET` | `/api/messages/:id` | Protected | Fetch a conversation with a user |
| `POST` | `/api/messages/send/:id` | Protected | Send text and/or an image to a user |

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run build` | Install backend/frontend dependencies and build the client |
| `npm start` | Start the production backend server |
| `npm run dev --prefix backend` | Start the backend with nodemon |
| `npm run dev --prefix frontend` | Start the Vite development server |
| `npm run build --prefix frontend` | Build the frontend only |
| `npm run lint --prefix frontend` | Run ESLint on the frontend |
| `npm run preview --prefix frontend` | Preview the frontend production bundle |

## License

This project is licensed under the ISC License.

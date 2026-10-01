import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173'],
        credentials: true,
    }
});

// Parse cookies on the handshake request so the jwt cookie is readable below.
io.engine.use(cookieParser());

// Identify the user from their login cookie, never from client-sent data
// like handshake.query, which anyone can set to any userId.
io.use((socket, next) => {
    const token = socket.request.cookies?.jwt;
    if (!token) return next(new Error("Unauthorized - No Token Provided"));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
    } catch {
        next(new Error("Unauthorized - Invalid Token"));
    }
});

const onlineUsers = new Set();

io.on('connection', (socket) => {
    const { userId } = socket;

    // Every tab of the same user joins the same room, so io.to(userId)
    // reaches all of them.
    socket.join(userId);
    onlineUsers.add(userId);
    io.emit('getOnlineUsers', [...onlineUsers]);

    socket.on('disconnect', () => {
        // The socket has already left its rooms here; the user is offline
        // only once their last tab is gone.
        if (!io.sockets.adapter.rooms.has(userId)) {
            onlineUsers.delete(userId);
            io.emit('getOnlineUsers', [...onlineUsers]);
        }
    });
});

export { io, server, app };

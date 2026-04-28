import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        // Connect to the backend socket server
        const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socketInstance.on('connect', () => {
            console.log('✅ Connected to socket server:', socketInstance.id);
            // If user is already logged in, join their room immediately
            if (user?._id || user?.id) {
                socketInstance.emit('join', user?._id || user?.id);
            }
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Disconnected from socket server');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Also join room if user logs in later
    useEffect(() => {
        if (socket && (user?._id || user?.id)) {
            socket.emit('join', user?._id || user?.id);
            console.log('📢 Emitted join for user:', user?._id || user?.id);
        }
    }, [socket, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

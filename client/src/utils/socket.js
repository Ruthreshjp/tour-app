import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  const baseUrl = (import.meta.env.VITE_API_URL || 'https://travelzone.onrender.com').replace(/\/+$/, '');

  socket = io(baseUrl, {
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const joinBusinessRoom = (businessId) => {
  if (socket) {
    socket.emit('join-business-room', businessId);
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
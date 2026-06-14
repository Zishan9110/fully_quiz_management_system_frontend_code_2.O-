import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initSocket, disconnectSocket, getSocket } from '@/services/socket';
import { addNotification } from '@/store/slices/notificationSlice';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { isAuthenticated } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('accessToken');
      const socket = initSocket(token);
      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));
      socket.on('notification', (n) => dispatch(addNotification(n)));
    } else {
      disconnectSocket();
      setConnected(false);
    }
    return () => { if (!isAuthenticated) disconnectSocket(); };
  }, [isAuthenticated]);

  return <SocketContext.Provider value={{ socket: getSocket(), connected }}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected:', newSocket.id);
        
        // Auto-join admin room if applicable
        if (user.role === 'admin') {
          newSocket.emit('joinRoom', 'admin');
        }
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      // Global Notification Listener
      newSocket.on('newViolation', (violation) => {
        toast((t) => (
          <div className="flex items-start gap-4 p-1">
            <div className={`mt-1 p-2 rounded-lg ${violation.severity === 'critical' ? 'bg-accent-red/20' : 'bg-accent-yellow/20'}`}>
              <AlertTriangle className={`w-5 h-5 ${violation.severity === 'critical' ? 'text-accent-red' : 'text-accent-yellow'}`} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-white">{violation.type.toUpperCase().replace('_', ' ')} DETECTED</p>
              <p className="text-xs text-white/60 mt-0.5">Camera: {violation.cameraId}</p>
              <div className="mt-2 flex gap-2">
                <button 
                  onClick={() => toast.dismiss(t.id)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-colors"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => {
                    toast.dismiss(t.id);
                    // Navigate logic could go here
                  }}
                  className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded text-[10px] border border-accent-blue/30"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ), { duration: 6000 });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      setSocket(null);
      setIsConnected(false);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

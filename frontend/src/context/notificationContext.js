import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './authContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [notReadCount, setNotReadCount] = useState(0);

  const readNotification = (index) => {
    setNotReadCount((prev) => prev - 1);
    setNotifications((prev) =>
      prev.map((notification, i) => {
        if (index !== i) {
          return notification;
        }

        return {
          ...notification,
          notRead: false,
        };
      })
    );
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const getNotifications = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.application.get(
          `/api/v1/notification/user?userId=${user.userId}`
        );
        const notifications = response.data.data;
        setNotifications(notifications.reverse());
      } catch {
        console.error("What 's up?");
      }
      setLoading(false);
    };

    getNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${process.env.REACT_APP_API_URL}/ws`),
      onConnect: () => {
        console.log('Connected to WebSocket');

        stompClient.subscribe(`/topic/user/${user.userId}`, (message) => {
          const notification = JSON.parse(message.body);
          setNotReadCount((prev) => prev + 1);
          setNotifications((prev) => [
            { ...notification, notRead: true },
            ...prev,
          ]);
        });
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{ notifications, loading, notReadCount, readNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};
import React, { createContext, useContext, useEffect, useState } from "react";
import { getNotificationsForUser } from "../data/api/notifications";

const NotificationsContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationsContext);
};

export const NotificationsProvider = ({ address, children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      try {
        const fetchedUserNotifications = await getNotificationsForUser(address);

        // Filter out notifications that are already marked as read in local storage
        const readNotifications = localStorage.getItem("readBuilderNotifications");
        const readNotificationsIds = readNotifications ? JSON.parse(readNotifications) : [];
        const filteredNotifications = fetchedUserNotifications.filter(
          notification => !readNotificationsIds.includes(notification.id),
        );

        setNotifications(filteredNotifications);
      } catch (e) {
        // Handle errors, maybe set some state to show an error message to the user
      }
    };

    if (address) {
      fetchUserNotifications();
    }
  }, [address]);

  const getReadNotificationsFromLocalStorage = () => {
    const storedReadNotifications = localStorage.getItem("readBuilderNotifications");
    return storedReadNotifications ? JSON.parse(storedReadNotifications) : [];
  };

  const markNotificationAsRead = notificationId => {
    const readNotifications = getReadNotificationsFromLocalStorage();
    readNotifications.push(notificationId);
    localStorage.setItem("readBuilderNotifications", JSON.stringify(readNotifications));

    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
  };

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications, markNotificationAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
};

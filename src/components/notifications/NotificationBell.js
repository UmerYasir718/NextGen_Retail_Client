import React, { useState, useEffect } from "react";
import { FaBell, FaTimes, FaCheck, FaTrash } from "react-icons/fa";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../../utils/api/notificationAPI";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications(1, 10);
      if (data) {
        setNotifications(data.notifications || []);
        setUnreadCount(
          (data.notifications || []).filter((n) => !n.read).length
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification._id);
        setUnreadCount((prev) => prev - 1);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate to related item if applicable
    if (notification.relatedTo?.model === "Inventory") {
      // Navigate to inventory item
      console.log("Navigate to inventory item:", notification.relatedTo.id);
    }

    setVisible(false);
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (!notifications.find((n) => n._id === notificationId)?.read) {
        setUnreadCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const notificationContent = (
    <div className="w-80 max-h-96 overflow-auto bg-white rounded-lg shadow-lg border">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <FaBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4
                        className={`font-medium ${
                          !notification.read ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTimeAgo(notification.createdAt)}</span>
                      <span className="capitalize">
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) =>
                      handleDeleteNotification(notification._id, e)
                    }
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete notification"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <button
            onClick={() => {
              // Navigate to all notifications page
              console.log("Navigate to all notifications");
              setVisible(false);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setVisible(!visible)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
        title="Notifications"
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {visible && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setVisible(false)}
          ></div>
          <div className="absolute right-0 mt-2 z-50">
            {notificationContent}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

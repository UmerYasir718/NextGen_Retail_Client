import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const WebSocketExample = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const serverUrl = process.env.REACT_APP_API_URL || "/api";

    if (!token) {
      setError("No authentication token found");
      return;
    }

    // Get company ID from user
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Create socket connection with new configuration
    const socket = io(serverUrl, {
      path: "/socket.io/",
      auth: {
        token,
        companyId: user.companyId,
      },
      transports: ["websocket", "polling"],
    });

    // Connection event handlers
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
      setError(null);

      // Subscribe to notifications
      socket.emit("subscribe_notifications");
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket server:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setError(`Connection failed: ${error.message}`);
      setIsConnected(false);
    });

    // Notification event handlers
    socket.on("unread_count", (data) => {
      console.log("Unread count received:", data);
      setMessages((prev) => [...prev, { type: "unread_count", data }]);
    });

    socket.on("recent_notifications", (data) => {
      console.log("Recent notifications received:", data);
      setMessages((prev) => [...prev, { type: "recent_notifications", data }]);
    });

    socket.on("new_notification", (notification) => {
      console.log("New notification received:", notification);
      setMessages((prev) => [
        ...prev,
        { type: "new_notification", data: notification },
      ]);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMarkAsRead = (notificationId) => {
    const token = localStorage.getItem("accessToken");
    const serverUrl = process.env.REACT_APP_API_URL || "/api";

    // Get company ID from user
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const socket = io(serverUrl, {
      path: "/socket.io/",
      auth: {
        token,
        companyId: user.companyId,
      },
      transports: ["websocket", "polling"],
    });

    socket.emit("mark_read", { notificationId });
    console.log("Marked notification as read:", notificationId);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">WebSocket Connection Example</h2>

      {/* Connection Status */}
      <div className="mb-4">
        <div
          className={`inline-flex items-center px-4 py-2 rounded-lg ${
            isConnected
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Configuration Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Connection Configuration:</h3>
        <pre className="text-sm text-gray-700 bg-white p-2 rounded border">
          {`const socket = io(serverUrl, {
  path: "/socket.io/",
  auth: { token },
  transports: ["websocket", "polling"],
});`}
        </pre>
      </div>

      {/* Messages */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Received Messages:</h3>
        <div className="max-h-64 overflow-y-auto border rounded-lg p-2">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages received yet...</p>
          ) : (
            messages.map((message, index) => (
              <div key={index} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                <div className="font-medium text-blue-600">{message.type}</div>
                <div className="text-gray-700">
                  {JSON.stringify(message.data, null, 2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => handleMarkAsRead("test-notification-id")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Test Mark as Read
        </button>
        <button
          onClick={() => setMessages([])}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Clear Messages
        </button>
      </div>
    </div>
  );
};

export default WebSocketExample;

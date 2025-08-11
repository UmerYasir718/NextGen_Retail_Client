import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaPaperPlane,
  FaDownload,
  FaSpinner,
  FaTimes,
  FaRobot,
  FaUser,
} from "react-icons/fa";
import aiAPI from "../utils/api/aiAPI";
import AI_CONFIG from "../config/aiConfig";

const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: "ai",
          content:
            "Hello! I'm your AI forecasting assistant. I can help you with sales forecasting, trend analysis, and business insights. What would you like to know?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Check if the message contains forecasting keywords
      const isForecastingRequest = AI_CONFIG.FORECASTING_KEYWORDS.some(
        (keyword) => inputText.toLowerCase().includes(keyword)
      );

      if (isForecastingRequest) {
        // Use forecasting API
        const response = await aiAPI.getForecastText(inputText);

        const aiMessage = {
          id: Date.now() + 1,
          type: "ai",
          content: response.forecastText,
          timestamp: new Date(),
          forecastCsvUrl: response.forecastCsvUrl,
        };

        setMessages((prev) => [...prev, aiMessage]);
        setForecastData(response);
      } else {
        // Use regular chat API
        const response = await aiAPI.chatWithAI(inputText);

        const aiMessage = {
          id: Date.now() + 1,
          type: "ai",
          content: response.response || response.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content:
          "I'm sorry, I encountered an error processing your request. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to get response from AI assistant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadForecast = async (csvUrl) => {
    try {
      await aiAPI.downloadForecastCsv(csvUrl, "forecast.csv");
      toast.success("Forecast CSV downloaded successfully!");
    } catch (error) {
      console.error("Error downloading forecast:", error);
      toast.error("Failed to download forecast CSV");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaRobot className="text-xl" />
          <h3 className="font-semibold">AI Forecasting Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === "user"
                  ? "bg-blue-600 text-white"
                  : message.isError
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === "ai" && (
                  <FaRobot className="text-sm mt-1 flex-shrink-0" />
                )}
                {message.type === "user" && (
                  <FaUser className="text-sm mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.forecastCsvUrl && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <button
                        onClick={() =>
                          handleDownloadForecast(message.forecastCsvUrl)
                        }
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <FaDownload />
                        <span>Download Forecast CSV</span>
                      </button>
                    </div>
                  )}
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <FaRobot className="text-sm" />
                <FaSpinner className="animate-spin text-sm" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about forecasting, sales trends, or business insights..."
            className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

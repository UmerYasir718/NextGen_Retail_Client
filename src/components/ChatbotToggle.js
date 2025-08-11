import React, { useState } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";
import Chatbot from "./Chatbot";

const ChatbotToggle = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={toggleChatbot}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 transition-all duration-300 ${
          isChatbotOpen
            ? "bg-red-500 hover:bg-red-600 rotate-45"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        title="AI Forecasting Assistant"
      >
        {isChatbotOpen ? (
          <FaTimes className="text-white text-xl" />
        ) : (
          <FaRobot className="text-white text-xl" />
        )}
      </button>

      {/* Chatbot Component */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  );
};

export default ChatbotToggle;

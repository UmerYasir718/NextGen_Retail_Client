import React, { useState, useRef, useEffect } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm NextGen Assistant. How can I help you today?", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Toggle chatbot open/closed
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputText);
      setMessages(prevMessages => [...prevMessages, {
        id: prevMessages.length + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000);
  };

  // Simple bot response logic (would be replaced with actual AI in production)
  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! How can I assist you today?";
    } else if (input.includes('inventory') || input.includes('stock')) {
      return "You can check inventory levels in the Inventory Management section. Would you like me to help you navigate there?";
    } else if (input.includes('sales') || input.includes('revenue')) {
      return "Sales information can be found in the Dashboard or Sales Inventory pages. You can also generate reports from the Admin Dashboard.";
    } else if (input.includes('order') || input.includes('purchase')) {
      return "To create a new purchase order, go to the Purchase Inventory page and click on 'Add New Purchase'.";
    } else if (input.includes('forecast')) {
      return "Our forecasting tools are available in the Forecasting Management section. You can upload data files and view predictions in the Forecasting Dashboard.";
    } else if (input.includes('help') || input.includes('support')) {
      return "I'm here to help! You can ask me questions about inventory, sales, forecasting, or system navigation. For technical support, please contact our support team at support@nextgenretail.com";
    } else if (input.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    } else if (input.includes('bye') || input.includes('goodbye')) {
      return "Goodbye! Feel free to chat again if you need assistance.";
    } else {
      return "I'm not sure I understand. Could you rephrase your question? You can ask about inventory, sales, forecasting, or system navigation.";
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chatbot Button */}
      <button
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 ${
          isOpen ? 'bg-red-500 rotate-45' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        onClick={toggleChatbot}
      >
        <span className="text-white text-2xl">
          {isOpen ? '✕' : '💬'}
        </span>
      </button>
      
      {/* Chatbot Window */}
      <div
        className={`fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl z-50 transition-all duration-300 transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        } flex flex-col`}
        style={{ maxHeight: '500px' }}
      >
        {/* Chat Header */}
        <div className="bg-blue-500 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-white text-blue-500 flex items-center justify-center mr-2">
              🤖
            </div>
            <div>
              <h3 className="font-medium">NextGen Assistant</h3>
              <p className="text-xs opacity-75">Online</p>
            </div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ maxHeight: '350px' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start mb-3">
              <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 flex">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!inputText.trim()}
          >
            <span>➤</span>
          </button>
        </form>
        
        {/* Quick Actions */}
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex flex-wrap gap-2">
          <button 
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-full"
            onClick={() => setInputText("How do I check inventory?")}
          >
            Check inventory
          </button>
          <button 
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-full"
            onClick={() => setInputText("How to create a purchase order?")}
          >
            Create purchase
          </button>
          <button 
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-full"
            onClick={() => setInputText("Help with forecasting")}
          >
            Forecasting help
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;

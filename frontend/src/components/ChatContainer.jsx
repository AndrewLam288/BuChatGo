import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import { X, ArrowDownCircle } from "lucide-react"; // Arrow for scrolling down

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/util";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  
  const [imagePreview, setImagePreview] = useState(null); // Image preview state
  const messagesEndRef = useRef(null); // Ref for auto-scrolling
  const chatContainerRef = useRef(null); // Ref to detect scrolling
  const [showScrollButton, setShowScrollButton] = useState(false); // Controls visibility of the scroll button

  useEffect(() => {
    getMessages(selectedUser._id);
  }, [selectedUser._id, getMessages]);

  // Auto-scroll to the latest message when a new message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Detect when the user scrolls up
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    
    // Show button if scrolled far up
    if (scrollHeight - scrollTop > clientHeight + 200) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  // Scroll to the latest message
  const scrollToLatestMessage = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setShowScrollButton(false);
    }
  };

  // Close preview when clicking outside the image
  const handleClosePreview = (e) => {
    if (e.target.id === "imagePreviewOverlay") {
      setImagePreview(null);
    }
  };

  // If messages are loading, show skeleton loader
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100 text-base-content relative">
      <ChatHeader />

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        onScroll={handleScroll} // Detect scrolling
      >
        {messages.map((message) => {
          const isSentByCurrentUser = message.senderId === authUser._id;

          return (
            <div
              key={message._id}
              className={`chat ${isSentByCurrentUser ? "chat-end" : "chat-start"}`}
            >
              {/* Profile Picture */}
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={isSentByCurrentUser ? authUser.profilePic || "/cat.png" : selectedUser.profilePic || "/cat.png"}
                    alt="profile pic"
                  />
                </div>
              </div>

              {/* Chat Header (Timestamp) */}
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              {/* Render Image Message Without a Bubble */}
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[300px] rounded-md shadow-md border mb-2 cursor-pointer"
                  onClick={() => setImagePreview(message.image)} // Open Image Preview
                />
              )}

              {/* Render Text Message Inside a Chat Bubble */}
              {message.text && (
                <div
                  className={`chat-bubble flex flex-col ${
                    isSentByCurrentUser
                      ? "bg-primary text-white" // Apply theme for sender
                      : "bg-base-200 text-base-content" // Apply theme for receiver
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>
          );
        })}

        {/* Invisible div to auto-scroll to the latest message */}
        <div ref={messagesEndRef} />
      </div>

      {/* "Scroll to Latest Message" Button (Centered Above Input Field) */}
      {showScrollButton && (
        <div className="absolute bottom-[70px] left-1/2 transform -translate-x-1/2">
          <button
            className="bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-all"
            onClick={scrollToLatestMessage}
          >
            <ArrowDownCircle size={24} />
          </button>
        </div>
      )}

      <MessageInput />

      {/* Image Preview Modal (Click outside to close) */}
      {imagePreview && (
        <div
          id="imagePreviewOverlay"
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={handleClosePreview} // Close when clicking outside the image
        >
          <div className="relative p-4">
            <button
              className="absolute top-2 right-2 bg-gray-700 text-white rounded-full p-2"
              onClick={() => setImagePreview(null)}
            >
              <X size={20} />
            </button>
            <img src={imagePreview} alt="Preview" className="max-w-full max-h-[90vh] rounded-lg shadow-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;

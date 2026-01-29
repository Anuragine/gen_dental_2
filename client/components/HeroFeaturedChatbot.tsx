import { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { useChatbot } from "@/context/ChatbotContext";
import BookAppointmentDialog from "@/components/BookAppointmentDialog";

export default function HeroFeaturedChatbot() {
  const [chatbotHovered, setChatbotHovered] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const { messages, isLoading, sendMessage } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const placeholders = [
    "Help me book an appointment",
    "What are your dental services?",
    "Tell me about teeth cleaning",
    "How much does a checkup cost?",
    "Do you accept insurance?",
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatbotHovered || isConversationStarted) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatbotHovered, isConversationStarted]);

  // Typing animation for placeholder
  useEffect(() => {
    const currentPlaceholder = placeholders[placeholderIndex];
    const typingSpeed = 100;
    const deleteSpeed = 50;
    const pauseBeforeDelete = 2000;

    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing phase
      if (charIndex < currentPlaceholder.length) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(currentPlaceholder.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, typingSpeed);
      } else {
        // Pause before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseBeforeDelete);
      }
    } else {
      // Deleting phase
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(currentPlaceholder.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, deleteSpeed);
      } else {
        // Move to next placeholder
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setDisplayedPlaceholder("");
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, placeholderIndex, isDeleting]);

  // Check if conversation has started (more than just the initial welcome message)
  useEffect(() => {
    if (messages.length > 1) {
      setIsConversationStarted(true);
      setChatbotHovered(true);
    }
  }, [messages.length]);

  // Listen for Escape key to close chatbot
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isConversationStarted) {
        handleCloseMessages();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isConversationStarted]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const msg = inputValue;
    setInputValue("");
    await sendMessage(msg);
  };

  const handleCloseMessages = () => {
    setIsConversationStarted(false);
    setChatbotHovered(false);
  };

  // Keep messages visible if conversation is active
  const showMessages = chatbotHovered || isConversationStarted;

  return (
    <>
      {/* Backdrop blur overlay */}
      {(chatbotHovered || isConversationStarted) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300" />
      )}

      {/* Chatbot Card - Fixed position */}
      <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-5xl px-4 z-50">
        {/* Messages floating above - Only visible on hover or when conversation is active */}
        {showMessages && (
          <div className="absolute bottom-full mb-4 left-0 right-0 max-h-96 overflow-y-auto p-4 space-y-3 pointer-events-auto z-[9999] rounded-2xl ">
            {/* Close Button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={handleCloseMessages}
                className="text-gray-500 hover:text-gray-700 transition p-1 rounded-lg hover:bg-gray-100"
                title="Close messages"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-lg"
                      : "bg-white/90 text-gray-900 border border-gray-200/50 rounded-bl-none shadow-lg"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div
          onMouseEnter={() => setChatbotHovered(true)}
          onMouseLeave={() => setChatbotHovered(false)}
          className={`bg-white rounded-2xl shadow-lg overflow-hidden relative z-50 transition-all duration-300 mx-auto max-w-5xl ${
            chatbotHovered ? "scale-105 shadow-2xl" : "scale-100"
          }`}
        >
          {/* Input Area */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
              {/* Left: Icon and Label */}
              <div className="flex items-center gap-3 flex-shrink-0">
                
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 whitespace-nowrap">
                    Just in Dental
                  </h3>
                  <p className="text-sm text-gray-600">chat assistant</p>
                </div>
              </div>

              {/* Center: Intro message and Input field */}
              <div className="flex-1 w-full">
                <p className="text-gray-700 text-sm md:text-base mb-3 line-clamp-2"></p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !isLoading) handleSendMessage();
                    }}
                    placeholder={displayedPlaceholder}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="send-button"
                  >
                    <div className="svg-wrapper-1">
                      <div className="svg-wrapper">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="20"
                          height="30"
                        >
                          <path fill="none" d="M0 0h24v24H0z"></path>
                          <path
                            fill="currentColor"
                            d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <span>{isLoading ? "Sending..." : "Send"}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <BookAppointmentDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </>
  );
}

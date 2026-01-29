import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatbotContextType {
  messages: ChatMessage[];
  sessionId: string | null;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  addMessage: (role: "user" | "assistant", content: string) => void;
  loadPreviousChat: (userEmail: string | null) => Promise<void>;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastUserEmail, setLastUserEmail] = useState<string | null>(null);

  // Initialize session ID on first mount
  React.useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  // Load previous chat history for logged-in user
  const loadPreviousChat = useCallback(async (userEmail: string | null) => {
    // If user email changed (login/logout), handle it
    if (userEmail !== lastUserEmail) {
      if (userEmail) {
        // User logged in - try to fetch their previous chat history
        try {
          const response = await fetch(
            `/api/chat/history?email=${encodeURIComponent(userEmail)}`,
            { headers: { "Content-Type": "application/json" } }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.messages && data.messages.length > 0) {
              // Load previous messages
              const loadedMessages = data.messages.map((msg: any) => ({
                id: msg._id || Date.now().toString(),
                role: msg.role,
                content: msg.content,
              }));
              setMessages(loadedMessages);
              // Use their previous session ID if available
              if (data.sessionId) {
                setSessionId(data.sessionId);
              }
            } else {
              // No previous chat, clear messages for fresh start with logged-in context
              setMessages([]);
            }
          } else {
            // Error fetching, start fresh
            setMessages([]);
          }
        } catch (error) {
          console.error("Error loading previous chat:", error);
          // Start fresh if fetch fails
          setMessages([]);
        }
      } else {
        // User logged out - clear chat for anonymous user
        setMessages([]);
        // Generate new session for anonymous user
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
      }

      setLastUserEmail(userEmail);
    }
  }, [lastUserEmail]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || !sessionId) return;

      addMessage("user", message);
      setIsLoading(true);

      try {
        // Get user email from localStorage
        const userEmail = localStorage.getItem("userEmail");
        
        // Get user object and extract role
        const userJson = localStorage.getItem("user");
        let userRole = undefined;
        if (userJson) {
          try {
            const userObj = JSON.parse(userJson);
            userRole = userObj.role;
          } catch (e) {
            // Failed to parse user object
          }
        }

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            sessionId,
            userEmail: userEmail || undefined,
            userRole: userRole || undefined,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();
        addMessage("assistant", data.message);
      } catch (error) {
        console.error("Chat error:", error);
        addMessage(
          "assistant",
          "Sorry, I encountered an error. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, addMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <ChatbotContext.Provider
      value={{
        messages,
        sessionId,
        isLoading,
        isOpen,
        setIsOpen,
        sendMessage,
        clearMessages,
        addMessage,
        loadPreviousChat,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }
  return context;
}

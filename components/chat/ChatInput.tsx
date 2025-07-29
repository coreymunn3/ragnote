"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon, MicIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import WidgetList from "../web/WidgetList";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatInput = ({
  onSend,
  disabled = false,
  placeholder = "Ask about this note...",
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick action suggestions
  const suggestions = [
    { id: 1, label: "Summarize this note" },
    { id: 2, label: "Find action items" },
    { id: 3, label: "Tell me more about this note" },
  ];

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // Max 5 lines
    }
  };

  // Handle send
  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter = new line (default behavior)
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  // Start voice recognition
  const startListening = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false; // Stop after user stops talking
    recognition.interimResults = true; // Show results as user speaks
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage((prev) => prev + transcript); // Append to existing text
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  // Auto-focus when component mounts
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize on input change
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Hide suggestions when user starts typing
  useEffect(() => {
    setShowSuggestions(message.length === 0);
  }, [message]);

  return (
    <div className="flex flex-col space-y-2">
      {/* Quick Suggestions */}
      <div className="min-h-10">
        {showSuggestions && (
          <div className="flex gap-2 overflow-scroll">
            {suggestions.map((suggestion) => (
              <Button
                variant={"secondary"}
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion.label)}
                disabled={disabled}
                className="text-sm"
              >
                {suggestion.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Input Area - Integrated Design */}
      <div
        className={cn(
          "flex flex-row, items-center",
          "relative rounded-2xl border border-input bg-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent border-none p-2 pr-20 text-sm",
            "placeholder:text-muted-foreground",
            "focus:outline-none",
            "disabled:cursor-not-allowed",
            "max-h-[120px]" // 1-5 lines
          )}
        />

        {/* Buttons positioned inside the input */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Voice Input Button */}
          <Button
            onClick={startListening}
            disabled={disabled || isListening}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted/50"
            title={isListening ? "Listening..." : "Voice input"}
          >
            {isListening ? (
              <div className="h-4 w-4 bg-red-500 rounded-full animate-pulse" />
            ) : (
              <MicIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            )}
          </Button>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted/50"
            title="Send message"
          >
            <SendIcon
              className={cn(
                "h-4 w-4 transition-colors",
                message.trim() && !disabled
                  ? "text-primary hover:text-primary/80"
                  : "text-muted-foreground"
              )}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

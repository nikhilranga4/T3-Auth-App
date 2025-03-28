"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Bot, Send, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "~/components/ui/use-toast";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  words?: string[];
  currentWordIndex?: number;
  isMarkdown?: boolean;
  isEditing?: boolean;
  animationComplete?: boolean;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Animate the latest AI message if it exists
    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.role === "assistant" && !latestMessage.animationComplete && latestMessage.words) {
      const animationInterval = setInterval(() => {
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (!lastMessage || lastMessage.animationComplete || !lastMessage.words) {
            clearInterval(animationInterval);
            return prevMessages;
          }

          const nextWordIndex = (lastMessage.currentWordIndex || 0) + 1;
          if (nextWordIndex > lastMessage.words.length) {
            clearInterval(animationInterval);
            return prevMessages.map((msg, idx) => 
              idx === prevMessages.length - 1 
                ? { ...msg, animationComplete: true, content: msg.words!.join(" ") }
                : msg
            );
          }

          return prevMessages.map((msg, idx) => 
            idx === prevMessages.length - 1 
              ? { ...msg, currentWordIndex: nextWordIndex }
              : msg
          );
        });
      }, 50); // Adjust speed here (lower = faster)

      return () => clearInterval(animationInterval);
    }
  }, [messages]);

  const handleEdit = (messageId: string) => {
    const messageToEdit = messages.find(m => m.id === messageId);
    if (messageToEdit) {
      setInput(messageToEdit.content);
      setEditingMessageId(messageId);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied successfully",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    // Add loading message immediately
    const loadingMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Thinking...",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput("");
    scrollToBottom();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();

      // Replace loading message with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? {
              id: msg.id,
              role: "assistant",
              content: data.response,
              timestamp: new Date(),
              isMarkdown: true,
            }
          : msg
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI",
        variant: "destructive",
      });
      // Remove loading message on error
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
    }
    scrollToBottom();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back</span>
          </Button>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
              AI Assistant
            </h1>
          </div>
          <div className="flex-shrink-0">
            {session?.user?.image && (
              <Avatar className="h-8 w-8 ring-2 ring-blue-600/20 dark:ring-blue-400/20">
                <AvatarImage src={session.user.image} alt="User" />
                <AvatarFallback className="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                  {session.user.name?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center px-4"
            >
              <div className="w-16 h-16 mb-6 rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center">
                <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Welcome to AI Assistant
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-md">
                Start a conversation by typing your message below. I'm here to help!
              </p>
            </motion.div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[85%] ${
                    message.role === "user"
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {message.role === "assistant" ? (
                      <div className="relative">
                        <Avatar className="h-8 w-8 ring-2 ring-blue-600/20 dark:ring-blue-400/30">
                          <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                          <AvatarFallback className="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                            AI
                          </AvatarFallback>
                        </Avatar>
                        {message.isLoading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -bottom-1 -right-1 h-3 w-3"
                          >
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-600 dark:bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <Avatar className="h-8 w-8 ring-2 ring-blue-600/20 dark:ring-blue-400/30">
                        {session?.user?.image ? (
                          <AvatarImage src={session.user.image} alt="User" />
                        ) : (
                          <AvatarFallback className="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                            {session?.user?.name?.[0] ?? "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                  </div>

                  <div
                    className={`rounded-lg px-4 py-3 shadow-sm transition-all duration-200 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md dark:shadow-gray-900/10"
                    } ${message.isLoading ? "animate-pulse" : ""}`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Thinking</span>
                        <motion.div
                          animate={{
                            opacity: [0.4, 1, 0.4],
                            transition: { duration: 1.5, repeat: Infinity }
                          }}
                          className="flex gap-1"
                        >
                          <span className="text-blue-200 dark:text-blue-400">.</span>
                          <span className="text-blue-300 dark:text-blue-500">.</span>
                          <span className="text-blue-400 dark:text-blue-600">.</span>
                        </motion.div>
                      </div>
                    ) : message.isMarkdown ? (
                      <div
                        className="prose dark:prose-invert max-w-none prose-p:text-gray-900 dark:prose-p:text-gray-100 prose-pre:bg-gray-900 prose-pre:text-gray-100 dark:prose-pre:bg-gray-950 prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-700 dark:hover:prose-a:text-blue-300"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(marked.parse(message.content, { breaks: true }).toString())
                        }}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/95 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/95 py-4 px-4 border-t border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
          <div className="relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="pr-24 py-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600/50 dark:focus:ring-blue-400/50 transition-shadow duration-300 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="absolute right-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:hover:shadow-none"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 
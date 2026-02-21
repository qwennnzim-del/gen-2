'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { 
  Menu, 
  Smartphone, 
  MessageSquarePlus, 
  Globe, 
  Paperclip, 
  ArrowUp,
  Bot,
  User,
  Loader2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini API
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

interface Message {
  role: 'user' | 'model';
  content: string;
  groundingMetadata?: any;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{id: string, title: string, date: string}[]>([]);

  useEffect(() => {
    if (!apiKey) {
      setIsApiKeyMissing(true);
    }
  }, []);

  useEffect(() => {
    // Load dummy history for demonstration (or from local storage in a real app)
    setChatHistory([
      { id: '1', title: 'Belajar Next.js', date: 'Hari ini' },
      { id: '2', title: 'Resep Nasi Goreng', date: 'Kemarin' },
      { id: '3', title: 'Analisis Data Saham', date: '7 hari lalu' },
    ]);
  }, []);

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setIsSidebarOpen(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !ai) {
      if (!ai) setIsApiKeyMissing(true);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Convert history for the API
      // The history format for @google/genai is slightly different
      // It expects an array of Content objects
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        history: history,
        config: {
          systemInstruction: "You are Gen2, an advanced AI chatbot created by M Fariz Alfauzi. Fariz is a 17-year-old student and CEO from SMK Nurul Islam Affandiyah in Cianjur, West Java, born on August 8, 2008. You are helpful, expert, and provide accurate, relevant responses. You excel at coding and technical tasks, mimicking the high quality of DeepSeek's interactions but with your own unique identity as Gen2.",
          tools: isSearchEnabled ? [{ googleSearch: {} }] : undefined,
        }
      });

      const result = await chat.sendMessage({ message: userMessage });
      const response = result.text; // Access text property directly
      const groundingMetadata = result.candidates?.[0]?.groundingMetadata;

      if (response) {
        setMessages(prev => [...prev, { role: 'model', content: response, groundingMetadata }]);
      } else {
        throw new Error('No response text');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: 'Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#101010] text-gray-100 font-sans overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed md:relative z-50 w-[260px] h-full bg-[#171717] flex flex-col border-r border-white/5"
          >
            <div className="p-4 flex items-center justify-between">
              <button 
                onClick={handleNewChat}
                className="flex-1 flex items-center gap-2 bg-[#212121] hover:bg-[#303030] text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <MessageSquarePlus size={16} />
                <span>Chat Baru</span>
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="ml-2 p-2 hover:bg-[#212121] rounded-lg text-gray-400 hover:text-white md:hidden"
              >
                <Menu size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-hide">
              <div className="text-xs font-medium text-gray-500 px-2 mb-2">Hari Ini</div>
              {chatHistory.map((chat) => (
                <button 
                  key={chat.id}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#212121] text-sm text-gray-300 hover:text-white transition-colors truncate"
                >
                  {chat.title}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/5 space-y-2">
              <Link href="/about" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#212121] cursor-pointer transition-colors text-gray-300 hover:text-white">
                <div className="w-8 h-8 rounded-full bg-[#212121] flex items-center justify-center text-gray-400">
                  <Info size={16} />
                </div>
                <div className="text-sm font-medium">Tentang Saya</div>
              </Link>
              
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#212121] cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                  <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">M Fariz Alfauzi</div>
                  <div className="text-xs text-gray-500 truncate">CEO Gen2 AI</div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#101010] z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#212121] rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <span className="text-lg font-semibold text-gray-200 md:hidden">Gen2</span>
          </div>
          
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#212121] hover:bg-[#303030] rounded-full transition-colors text-sm font-medium text-gray-200 border border-white/5">
            <Smartphone size={16} />
            <span>Dapatkan Aplikasi</span>
          </button>

          <button 
            onClick={handleNewChat}
            className="p-2 hover:bg-[#212121] rounded-lg transition-colors text-gray-400 hover:text-white"
            title="New Chat"
          >
            <MessageSquarePlus size={24} />
          </button>
        </header>

        {/* Main Chat Area */}
        <main className="flex-1 overflow-y-auto relative scrollbar-hide">
        {isApiKeyMissing && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 text-center text-sm">
            API Key is missing. Please add GEMINI_API_KEY to your environment variables.
          </div>
        )}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center space-y-8">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                 {/* Whale-ish logo placeholder */}
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-10 h-10 text-blue-500"
                >
                  <path d="M2 12h6" />
                  <path d="M22 12h-6" />
                  <path d="M12 2v6" />
                  <path d="M12 22v-6" />
                  <circle cx="12" cy="12" r="4" />
                  <path d="M20 12a8 8 0 0 1-8 8" />
                  <path d="M4 12a8 8 0 0 1 8-8" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-100">
              Ada yang bisa saya bantu?
            </h1>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {messages.map((msg, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={18} className="text-blue-400" />
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-[#212121] text-gray-100' 
                    : 'text-gray-100'
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown 
                      components={{
                        pre: ({node, ...props}) => (
                          <div className="overflow-auto w-full my-2 bg-black/30 p-2 rounded-lg">
                            <pre {...props} />
                          </div>
                        ),
                        code: ({node, ...props}) => (
                          <code className="bg-black/30 rounded px-1" {...props} />
                        )
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                    {msg.groundingMetadata?.groundingChunks && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs font-semibold text-gray-400 mb-2">Sources:</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                            chunk.web?.uri && (
                              <a 
                                key={i} 
                                href={chunk.web.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-blue-400 hover:text-blue-300 transition-colors truncate max-w-[200px]"
                              >
                                {chunk.web.title || chunk.web.uri}
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#212121] flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={18} className="text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-blue-400" />
                </div>
                <div className="flex items-center">
                  <Loader2 className="animate-spin text-gray-500" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-[#101010]">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-[#212121] rounded-3xl border border-white/5 focus-within:border-white/10 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pesan Gen2"
              className="w-full bg-transparent text-gray-100 placeholder-gray-500 px-4 pt-4 pb-12 resize-none focus:outline-none max-h-[200px] min-h-[56px] scrollbar-hide"
              rows={1}
            />
            
            <div className="absolute bottom-2 left-2 flex items-center gap-1">
               <button 
                onClick={() => setIsSearchEnabled(!isSearchEnabled)}
                className={`p-2 rounded-lg transition-colors ${isSearchEnabled ? 'text-blue-400 bg-blue-400/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} 
                title={isSearchEnabled ? "Disable Search" : "Enable Search"}
              >
                <Globe size={18} />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Attach File">
                <Paperclip size={18} />
              </button>
            </div>

            <div className="absolute bottom-2 right-2">
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
                  input.trim() && !isLoading
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-[#303030] text-gray-500 cursor-not-allowed'
                }`}
              >
                <ArrowUp size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
          <div className="text-center mt-3">
             <p className="text-[11px] text-gray-500">
               Gen2 dapat membuat kesalahan. Periksa informasi penting.
             </p>
          </div>
        </div>
      </footer>
    </div>
  </div>
  );
}

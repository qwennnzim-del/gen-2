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
  Info,
  Trash2,
  Search,
  X,
  ThumbsUp,
  Copy,
  Share2,
  Check
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
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [likedMessages, setLikedMessages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!apiKey) {
      setIsApiKeyMissing(true);
    }
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveChatToHistory = (chatId: string, title: string, msgs: Message[]) => {
    const newHistoryItem = {
      id: chatId,
      title: title,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    };
    
    setChatHistory(prev => {
      const existing = prev.find(h => h.id === chatId);
      let newHistory;
      if (existing) {
        newHistory = prev.map(h => h.id === chatId ? { ...h, title: title } : h);
      } else {
        newHistory = [newHistoryItem, ...prev];
      }
      localStorage.setItem('chatHistory', JSON.stringify(newHistory));
      return newHistory;
    });
    
    localStorage.setItem(`chat_${chatId}`, JSON.stringify(msgs));
  };

  const loadChat = (id: string) => {
    const savedMessages = localStorage.getItem(`chat_${id}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
      setCurrentChatId(id);
      setIsSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setCurrentChatId(null);
    setIsSidebarOpen(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(id);
  };

  const confirmDeleteChat = () => {
    if (chatToDelete) {
      setChatHistory(prev => {
        const newHistory = prev.filter(h => h.id !== chatToDelete);
        localStorage.setItem('chatHistory', JSON.stringify(newHistory));
        return newHistory;
      });
      localStorage.removeItem(`chat_${chatToDelete}`);
      if (currentChatId === chatToDelete) {
        handleNewChat();
      }
      setChatToDelete(null);
    }
  };

  const confirmClearAll = () => {
    chatHistory.forEach(chat => {
      localStorage.removeItem(`chat_${chat.id}`);
    });
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
    handleNewChat();
    setIsClearAllConfirmOpen(false);
  };

  const filteredHistory = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gen2 AI Response',
          text: text,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      handleCopy(text, -1);
    }
  };

  const toggleLike = (index: number) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !ai) {
      if (!ai) setIsApiKeyMissing(true);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    // Create or update chat history
    let chatId = currentChatId;
    if (!chatId) {
      chatId = Date.now().toString();
      setCurrentChatId(chatId);
    }
    
    // Generate title from first message if it's a new chat
    const title = messages.length === 0 ? (userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage) : (chatHistory.find(h => h.id === chatId)?.title || 'New Chat');
    saveChatToHistory(chatId, title, newMessages);

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
        const updatedMessages: Message[] = [...newMessages, { role: 'model', content: response, groundingMetadata }];
        setMessages(updatedMessages);
        if (chatId) saveChatToHistory(chatId, title, updatedMessages);
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
    <div className="flex h-[100dvh] bg-[#101010] text-gray-100 font-sans overflow-hidden fixed inset-0">
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

            <div className="px-4 pb-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Cari riwayat..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#212121] text-sm text-gray-200 placeholder-gray-500 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="text-xs font-medium text-gray-500">Riwayat Chat</div>
                {chatHistory.length > 0 && (
                  <button 
                    onClick={() => setIsClearAllConfirmOpen(true)}
                    className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>
              
              {filteredHistory.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4">
                  {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada riwayat chat'}
                </div>
              ) : (
                filteredHistory.map((chat) => (
                  <div key={chat.id} className="relative group flex items-center">
                    <button 
                      onClick={() => loadChat(chat.id)}
                      className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors truncate text-sm pr-8 ${currentChatId === chat.id ? 'bg-[#212121] text-white' : 'hover:bg-[#212121] text-gray-300 hover:text-white'}`}
                    >
                      {chat.title}
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="absolute right-2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      title="Hapus chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
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

      {/* Modals */}
      <AnimatePresence>
        {chatToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#171717] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Hapus Chat?</h3>
              <p className="text-sm text-gray-400 mb-6">
                Apakah Anda yakin ingin menghapus chat ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setChatToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDeleteChat}
                  className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isClearAllConfirmOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#171717] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Hapus Semua Riwayat?</h3>
              <p className="text-sm text-gray-400 mb-6">
                Apakah Anda yakin ingin menghapus <strong>semua</strong> riwayat chat? Tindakan ini akan menghapus semua data percakapan Anda secara permanen.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsClearAllConfirmOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmClearAll}
                  className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                >
                  Hapus Semua
                </button>
              </div>
            </motion.div>
          </motion.div>
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
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
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
                          <div className="overflow-auto w-full my-2 bg-black/40 p-3 rounded-lg font-mono text-sm custom-scrollbar border border-white/5">
                            <pre {...props} />
                          </div>
                        ),
                        code: ({node, ...props}) => (
                          <code className="bg-black/40 rounded px-1.5 py-0.5 font-mono text-[0.9em] text-blue-200" {...props} />
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
                    
                    {msg.role === 'model' && (
                      <div className="flex items-center gap-1 mt-4 pt-3 border-t border-white/10 text-gray-400">
                        <button 
                          onClick={() => handleCopy(msg.content, index)}
                          className="p-1.5 hover:bg-white/10 hover:text-white rounded-md transition-colors flex items-center gap-1.5 text-xs"
                          title="Salin pesan"
                        >
                          {copiedIndex === index ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          <span className="hidden sm:inline">{copiedIndex === index ? 'Tersalin!' : 'Salin'}</span>
                        </button>
                        <button 
                          onClick={() => toggleLike(index)}
                          className={`p-1.5 hover:bg-white/10 hover:text-white rounded-md transition-colors flex items-center gap-1.5 text-xs ${likedMessages.has(index) ? 'text-blue-400' : ''}`}
                          title="Suka pesan ini"
                        >
                          <ThumbsUp size={14} className={likedMessages.has(index) ? 'fill-blue-400/20' : ''} />
                          <span className="hidden sm:inline">Suka</span>
                        </button>
                        <button 
                          onClick={() => handleShare(msg.content)}
                          className="p-1.5 hover:bg-white/10 hover:text-white rounded-md transition-colors flex items-center gap-1.5 text-xs"
                          title="Bagikan pesan"
                        >
                          <Share2 size={14} />
                          <span className="hidden sm:inline">Bagikan</span>
                        </button>
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
                className="w-full bg-transparent text-gray-100 placeholder-gray-500 px-5 pt-4 pb-14 resize-none focus:outline-none max-h-[200px] min-h-[60px] custom-scrollbar text-base"
                rows={1}
              />
              
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
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

              <div className="absolute bottom-3 right-3">
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

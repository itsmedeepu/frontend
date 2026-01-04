import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { X, Send, User, Tractor } from 'lucide-react';
import { api } from '../services/api';

const connectionString = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const socket = io(connectionString);

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currentUserId: string;
  receiverId: string;
  senderName: string; // Name of current user
  receiverName: string; // Name of other party
}

interface Message {
  _id?: string;
  authorId?: string; // from socket
  senderId?: string | { _id: string }; // from db
  message: string;
  timestamp?: string;
  time?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ 
  isOpen, 
  onClose, 
  orderId, 
  currentUserId, 
  receiverId,
  receiverName
}) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  useEffect(() => {
    if (isOpen && orderId) {
      // Join Room
      socket.emit("join_room", orderId);

      // Fetch history
      const fetchHistory = async () => {
        try {
          const res = await api.getChatHistory(orderId);
          setMessageList(res);
        } catch (err) {
          console.error("Failed to load chat history", err);
        }
      };
      fetchHistory();

      // Listen for messages
      socket.on("receive_message", (data: Message) => {
        setMessageList((list) => [...list, data]);
      });
    }

    return () => {
      socket.off("receive_message");
    };
  }, [isOpen, orderId]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: orderId,
        authorId: currentUserId,
        receiverId: receiverId,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString()
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-[600px] border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <User className="h-5 w-5" />
             </div>
             <div>
               <h3 className="font-bold text-slate-800 dark:text-slate-100">{receiverName}</h3>
               <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium flex items-center gap-1">
                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
               </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950/50 space-y-4 custom-scrollbar">
          {messageList.map((msg, index) => {
            // Determine if message is from current user
            // Check both 'authorId' (socket) and 'senderId' (db populate or simple id)
            const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
            const isMe = msg.authorId === currentUserId || senderId === currentUserId;

            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  isMe 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                }`}>
                  <p>{msg.message}</p>
                  <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {msg.time || (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '')}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
           <form 
             onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
             className="flex items-center gap-2"
           >
             <input
               type="text"
               value={currentMessage}
               onChange={(e) => setCurrentMessage(e.target.value)}
               placeholder="Type your message..."
               className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
             />
             <button 
               type="submit"
               disabled={!currentMessage.trim()}
               className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100 dark:shadow-none"
             >
               <Send className="h-5 w-5" />
             </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;

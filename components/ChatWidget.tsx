import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { MessageCircle, X, Send, ChevronLeft, ChevronRight, User as UserIcon, Store, Package, Receipt, Info, Bell } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

const connectionString = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const socket = io(connectionString);

interface ChatWidgetProps {
  userId: string;
  role: 'customer' | 'farmer';
}

interface Message {
  message: string;
  authorId?: string;
  senderId?: string | { _id: string };
  time?: string;
  timestamp?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ userId, role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'home' | 'list' | 'chat'>('home');
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const getOtherPartyId = (order: Order) => {
    if (role === 'customer') {
       const farmer = order.farmer;
       return typeof farmer === 'object' && farmer ? (farmer as any)._id || (farmer as any).id : farmer;
    } else {
        const user = order.user;
        return typeof user === 'object' && user ? (user as any)._id || (user as any).id : user;
    }
  };

  const getOtherPartyName = (order: Order) => {
    if (role === 'customer') {
      const farmer = order.farmer;
      if (typeof farmer === 'object' && farmer) {
         return (farmer as any).farmDetails?.farmName || (farmer as any).name || 'Farmer';
      }
      return 'Farmer';
    } else {
      const user = order.user;
      if (typeof user === 'object' && user) {
        return user.name || 'Customer';
      }
      return 'Customer';
    }
  };

  const getOtherPartyDetails = (order: Order) => {
      if (role === 'customer') {
         const farmer = order.farmer;
          if (typeof farmer === 'object' && farmer) {
             return (farmer as any).name; 
          }
      } else {
          const user = order.user;
          if (typeof user === 'object' && user) {
            return user.email || user.phone;
          }
      }
      return '';
  };

  const playNotificationSound = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => {});
    } catch (e) {
        console.error("Audio error", e);
    }
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setView('chat');
    setIsOrderDetailsOpen(false);
    setOtherUserTyping(false);
    
    const partnerId = getOtherPartyId(order);
    if(partnerId) {
        socket.emit("check_online", partnerId);
    }
    
    setIsOnline(false); 
  };

  const handleBack = () => {
      if (view === 'chat') setView('list');
      else if (view === 'list') setView('home');
  };

  useEffect(() => {
    if (userId) {
        socket.emit("register_user", userId);
    }

    const handleUserOnline = (id: string) => {
        if (selectedOrder) {
            const partnerId = getOtherPartyId(selectedOrder);
            if (partnerId === id) setIsOnline(true);
        }
    };

    const handleUserOffline = (id: string) => {
        if (selectedOrder) {
             const partnerId = getOtherPartyId(selectedOrder);
             if (partnerId === id) setIsOnline(false);
        }
    };

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openChatWidget', handleOpenChat);
    
    const handleIsOnlineResponse = (data: { userId: string, isOnline: boolean }) => {
        if (selectedOrder) {
             const partnerId = getOtherPartyId(selectedOrder);
             if (partnerId === data.userId) setIsOnline(data.isOnline);
        }
    };
    
    socket.on("is_online_response", handleIsOnlineResponse);

    return () => {
        socket.off("user_online");
        socket.off("user_offline");
        socket.off("is_online_response", handleIsOnlineResponse);
        window.removeEventListener('openChatWidget', handleOpenChat);
    };
  }, [userId, selectedOrder]);

  useEffect(() => {
    if (isOpen) {
      const fetchOrders = async () => {
        try {
          const orders = role === 'farmer' 
            ? await api.getActiveConversations()
            : await api.getOrders();
          setActiveOrders(orders);
        } catch (err) {
          console.error("Failed to load orders for chat", err);
        }
      };
      fetchOrders();
    }
  }, [isOpen, role]);

  useEffect(() => {
    scrollToBottom();
  }, [messageList, view]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (view === 'chat' && selectedOrder) {
      const orderId = selectedOrder.id || selectedOrder._id;
      socket.emit("join_room", orderId);

      const fetchHistory = async () => {
        try {
          const res = await api.getChatHistory(orderId);
          setMessageList(res);
        } catch (err) {
          console.error("Failed to load chat history", err);
        }
      };
      fetchHistory();
      
      const handleReceiveMessage = (data: Message) => {
        setMessageList((list) => [...list, data]);
        if (data.authorId !== userId) {
            playNotificationSound();
        }
      };

      const handleTyping = (room: string) => {
         if (room === (selectedOrder.id || selectedOrder._id)) setOtherUserTyping(true);
      };

      const handleStopTyping = (room: string) => {
         if (room === (selectedOrder.id || selectedOrder._id)) setOtherUserTyping(false);
      };

      socket.on("receive_message", handleReceiveMessage);
      socket.on("typing", handleTyping);
      socket.on("stop_typing", handleStopTyping);

      return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("typing", handleTyping);
        socket.off("stop_typing", handleStopTyping);
      };
    }
  }, [view, selectedOrder, userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentMessage(e.target.value);
      
      if (selectedOrder) {
          const room = selectedOrder.id || selectedOrder._id;
          if (!isTyping) {
              setIsTyping(true);
              socket.emit("typing", room);
          }
          
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          
          typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
              socket.emit("stop_typing", room);
          }, 2000);
      }
  };

  const sendMessage = async () => {
    if (currentMessage !== "" && selectedOrder) {
      const orderId = selectedOrder.id || selectedOrder._id;
      
      let receiverId = '';
      if (role === 'customer') {
          const farmer = selectedOrder.farmer;
          receiverId = typeof farmer === 'object' && farmer ? (farmer as any)._id || (farmer as any).id : farmer;
      } else {
          const user = selectedOrder.user;
          receiverId = typeof user === 'object' ? (user as any)._id || (user as any).id : user;
      }

      const messageData = {
        room: orderId,
        authorId: userId,
        receiverId: receiverId,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString()
      };

      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");

      await socket.emit("send_message", messageData);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      socket.emit("stop_typing", orderId);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all hover:scale-110 active:scale-95 animate-in slide-in-from-bottom-5"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  const renderOrderSummary = () => {
      if (!selectedOrder) return null;
      return (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40">
              <button 
                onClick={() => setIsOrderDetailsOpen(!isOrderDetailsOpen)}
                className="w-full flex items-center justify-between p-3 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-colors"
               >
                  <div className="flex items-center gap-2">
                       <Receipt className="h-4 w-4" />
                       <span>Order #{ (selectedOrder.id || selectedOrder._id).slice(-6).toUpperCase() }</span>
                       <span className="bg-white dark:bg-emerald-900 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                           {selectedOrder.status}
                       </span>
                  </div>
                  <Info className={`h-4 w-4 transition-transform ${isOrderDetailsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOrderDetailsOpen && (
                  <div className="px-3 pb-3 space-y-2 animate-in slide-in-from-top-2">
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Items:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                              {selectedOrder.items?.map((item: any, i: number) => (
                                  <li key={i}>{item.quantity} {item.unit} x {item.product?.name || item.name}</li>
                              ))}
                          </ul>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-emerald-200/50 dark:border-emerald-800/50">
                          <span className="text-xs font-bold text-slate-500">Total Amount</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">₹{selectedOrder.totalAmount?.toFixed(2) || selectedOrder.total?.toFixed(2)}</span>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in zoom-in-95">
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2 overflow-hidden">
          {view !== 'home' && (
            <button onClick={handleBack} className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-full mr-1 -ml-2 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          
          <div className="min-w-0">
             <h3 className="font-bold text-lg truncate leading-tight flex items-center gap-2">
                {view === 'home' ? 'AgriChat' : view === 'list' ? 'My Conversations' : getOtherPartyName(selectedOrder!)}
                {view === 'chat' && isOnline && (
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse border border-white dark:border-slate-900 ring-2 ring-green-500/20" title="Online" />
                )}
             </h3>
             {view === 'chat' && selectedOrder && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate opacity-90 font-medium">
                      {getOtherPartyDetails(selectedOrder)}
                  </p>
             )}
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-full transition-colors">
          <X className="h-5 w-5 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/50 custom-scrollbar relative flex flex-col">
        {view === 'home' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 text-center">
                 <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 animate-bounce">
                     <MessageCircle className="h-8 w-8" />
                 </div>
                 <div>
                     <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 space-y-1">
                         Welcome, {role === 'customer' ? 'Shopper' : 'Farmer'}!
                     </h4>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-[200px] mx-auto leading-relaxed">
                         Connect with your {role === 'customer' ? 'Farmers' : 'Customers'} directly to discuss orders.
                     </p>
                 </div>
                 
                 <button 
                  onClick={() => setView('list')}
                  className="w-full py-3 px-6 bg-white dark:bg-slate-800 border-2 border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                 >
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                             <Package className="h-5 w-5" />
                         </div>
                         <div className="text-left">
                             <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">
                                 {role === 'customer' ? 'My Orders' : 'Customer Enquiries'}
                             </div>
                             <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                 {activeOrders.length} active chats
                             </div>
                         </div>
                     </div>
                     <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                 </button>
            </div>
        )}

        {view === 'list' && (
          <div className="p-2 space-y-2 animate-in slide-in-from-right-10 duration-200">
            {activeOrders.length === 0 ? (
               <div className="text-center py-20 text-slate-400">
                 <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                 <p className="text-sm font-medium">No order history found.</p>
               </div>
            ) : (
              activeOrders.map(order => (
                <button
                  key={order.id || order._id}
                  onClick={() => handleSelectOrder(order)}
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4 group active:scale-[0.98]"
                >
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 border-2 ${role === 'customer' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                    {role === 'customer' ? <Store className="h-6 w-6" /> : <UserIcon className="h-6 w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">{getOtherPartyName(order)}</div>
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-wide shrink-0">
                            {order.status}
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        Order #{ (order.id || order._id).slice(-6).toUpperCase() }
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))
            )}
          </div>
        )}

        {view === 'chat' && (
          <div className="flex flex-col min-h-0 h-full animate-in slide-in-from-right-10 duration-200">
             {renderOrderSummary()}
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {messageList.length === 0 && (
                 <div className="text-center py-10">
                     <div className="inline-block p-3 rounded-full bg-emerald-50 dark:bg-slate-800 mb-3">
                        <MessageCircle className="h-6 w-6 text-emerald-300" />
                     </div>
                     <p className="text-xs text-slate-400 font-medium">Start the conversation!</p>
                 </div>
               )}
              {messageList.map((msg, index) => {
                const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
                const isMe = msg.authorId === userId || senderId === userId;
                return (
                  <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isMe 
                          ? 'bg-emerald-600 text-white rounded-br-none' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                      }`}>
                        <p>{msg.message}</p>
                        <div className={`text-[10px] mt-1 text-right font-medium opacity-70 ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {msg.time || (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '')}
                        </div>
                      </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
             </div>
             {otherUserTyping && (
                 <div className="px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400 italic animate-pulse flex items-center gap-2">
                     <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                     <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                     <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                     <span>{getOtherPartyName(selectedOrder!)} is typing...</span>
                 </div>
             )}
          </div>
        )}
      </div>

      {view === 'chat' && (
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 z-10">
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={currentMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
            />
            <button 
              type="submit"
              disabled={!currentMessage.trim()}
              className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

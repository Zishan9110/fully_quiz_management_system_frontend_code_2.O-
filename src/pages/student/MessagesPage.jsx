import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { studentApi as api } from '@/services/api';
import { useSocket } from '@/contexts/SocketContext';

export default function MessagesPage() {
  const { user } = useSelector(s => s.auth);
  const { socket } = useSocket() || {};
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  // Admin conversation (student always talks to admin)
  const ADMIN_ID = 'admin';

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['student-messages'],
    queryFn: () => api.get(`/messages/conversation/${ADMIN_ID}`).then(r => r.data.data),
    refetchInterval: 10000
  });

  const sendMut = useMutation({
    mutationFn: (content) => api.post('/messages/send', {
      receiverId: ADMIN_ID,
      receiverModel: 'Admin',
      content
    }),
    onSuccess: () => {
      setMessage('');
      qc.invalidateQueries(['student-messages']);
    },
    onError: () => toast.error('Failed to send message')
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    socket.on('message', () => qc.invalidateQueries(['student-messages']));
    socket.on('typing', ({ senderId }) => { if (senderId !== user?._id) setIsTyping(true); });
    socket.on('stop_typing', () => setIsTyping(false));
    return () => { socket.off('message'); socket.off('typing'); socket.off('stop_typing'); };
  }, [socket]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (socket) {
      socket.emit('typing', { receiverId: ADMIN_ID });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => socket.emit('stop_typing', { receiverId: ADMIN_ID }), 1500);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMut.mutate(message.trim());
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const label = formatDate(msg.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Messages</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Chat with your admin</p>
      </div>

      {/* Chat window */}
      <div className="card flex flex-col flex-1 overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: 'rgba(226,232,240,0.6)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ background: 'var(--color-primary)' }}>A</div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Admin Support</p>
            <p className="text-xs" style={{ color: 'var(--color-success)' }}>● Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
              <div className="text-5xl mb-3">💬</div>
              <p className="font-medium">No messages yet</p>
              <p className="text-sm">Send a message to start the conversation</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(226,232,240,0.6)' }} />
                  <span className="text-xs px-2" style={{ color: 'var(--color-text-muted)' }}>{date}</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(226,232,240,0.6)' }} />
                </div>
                {msgs.map((msg) => {
                  const isMine = msg.senderModel === 'User';
                  return (
                    <motion.div key={msg._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                        style={{
                          background: isMine ? 'var(--color-primary)' : 'rgba(248,250,252,0.9)',
                          color: isMine ? 'white' : 'var(--color-text-primary)',
                          border: isMine ? 'none' : '1px solid rgba(226,232,240,0.6)'
                        }}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : ''}`}
                          style={{ color: isMine ? undefined : 'var(--color-text-muted)' }}>
                          {formatTime(msg.createdAt)}
                          {isMine && <span className="ml-1">{msg.isRead ? ' ✓✓' : ' ✓'}</span>}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))
          )}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm"
                  style={{ background: 'rgba(248,250,252,0.9)', border: '1px solid rgba(226,232,240,0.6)' }}>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: 'var(--color-text-muted)', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-3 border-t"
          style={{ borderColor: 'rgba(226,232,240,0.6)' }}>
          <input
            className="input-field flex-1"
            placeholder="Type your message..."
            value={message}
            onChange={handleTyping}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
          />
          <button type="submit" className="btn-primary px-4 py-2.5 flex-shrink-0"
            disabled={!message.trim() || sendMut.isPending}>
            {sendMut.isPending ? '⏳' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}

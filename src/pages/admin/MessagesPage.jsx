import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminApi as api } from '@/services/api';

export default function AdminMessagesPage() {
  const qc = useQueryClient();
  const [activeConv, setActiveConv] = useState(null);
  const [message, setMessage] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: () => api.get('/messages/admin/conversations').then(r => r.data.data),
    refetchInterval: 8000
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages', activeConv],
    queryFn: () => api.get(`/messages/admin/conversation/${activeConv}`).then(r => r.data.data),
    enabled: !!activeConv,
    refetchInterval: 5000
  });

  const sendMut = useMutation({
    mutationFn: ({ content, receiverId }) => api.post('/messages/admin/send', { receiverId, receiverModel: 'User', content }),
    onSuccess: () => { setMessage(''); qc.invalidateQueries(['admin-messages', activeConv]); qc.invalidateQueries(['admin-conversations']); },
    onError: () => toast.error('Send failed')
  });

  const broadcastMut = useMutation({
    mutationFn: async (content) => {
      const { data } = await api.get('/admin/students?limit=1000');
      const ids = data.data.map(s => s._id);
      return api.post('/messages/admin/broadcast', { content, receiverIds: ids });
    },
    onSuccess: () => { setBroadcastMsg(''); setShowBroadcast(false); toast.success('Broadcast sent!'); }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeConv) return;
    sendMut.mutate({ content: message.trim(), receiverId: activeConv });
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Messages</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Student conversations</p>
        </div>
        <button className="btn-primary text-sm" onClick={() => setShowBroadcast(!showBroadcast)}>
          📢 Broadcast
        </button>
      </div>

      {/* Broadcast panel */}
      {showBroadcast && (
        <div className="card border-2" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>📢 Broadcast to All Students</h3>
          <textarea className="input-field resize-none h-20 mb-3" value={broadcastMsg}
            onChange={e => setBroadcastMsg(e.target.value)} placeholder="Type broadcast message..." />
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={() => broadcastMut.mutate(broadcastMsg)}
              disabled={!broadcastMsg.trim() || broadcastMut.isPending}>
              {broadcastMut.isPending ? 'Sending...' : 'Send to All Students'}
            </button>
            <button className="btn-secondary text-sm" onClick={() => setShowBroadcast(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Chat layout */}
      <div className="flex gap-4 h-[calc(100vh-260px)]">
        {/* Conversations list */}
        <div className="w-64 flex-shrink-0 card p-0 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b font-medium text-sm" style={{ borderColor: 'rgba(226,232,240,0.6)', color: 'var(--color-text-primary)' }}>
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>No conversations</p>
            ) : conversations.map((c) => {
              const otherId = c._id?.replace(/(.*_)/, '').replace(/(_.*)/,'');
              return (
                <button key={c._id} onClick={() => setActiveConv(c.lastMessage?.sender === c.lastMessage?.receiver ? null : c.lastMessage?.sender)}
                  className={`w-full flex items-start gap-3 px-4 py-3 border-b text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${activeConv === c.lastMessage?.sender ? 'bg-primary-50 dark:bg-slate-800' : ''}`}
                  style={{ borderColor: 'rgba(226,232,240,0.4)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'var(--color-primary)' }}>S</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>Student</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{c.lastMessage?.content}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                      style={{ background: 'var(--color-danger)' }}>{c.unread}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 card p-0 overflow-hidden flex flex-col">
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
              <div className="text-center">
                <div className="text-5xl mb-3">💬</div>
                <p className="font-medium">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: 'rgba(226,232,240,0.6)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: 'var(--color-primary)' }}>S</div>
                <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>Student</span>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                {messages.map((msg) => {
                  const isAdmin = msg.senderModel === 'Admin';
                  return (
                    <div key={msg._id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isAdmin ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                        style={{
                          background: isAdmin ? 'var(--color-primary)' : 'rgba(248,250,252,0.9)',
                          color: isAdmin ? 'white' : 'var(--color-text-primary)',
                          border: isAdmin ? 'none' : '1px solid rgba(226,232,240,0.6)'
                        }}>
                        <p>{msg.content}</p>
                        <p className="text-xs mt-0.5 opacity-70">{formatTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t" style={{ borderColor: 'rgba(226,232,240,0.6)' }}>
                <input className="input-field flex-1" placeholder="Reply..." value={message}
                  onChange={e => setMessage(e.target.value)} />
                <button type="submit" className="btn-primary px-4" disabled={!message.trim() || sendMut.isPending}>➤</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

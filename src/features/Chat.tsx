// Chat Screen with Smart FAQ

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message, FaqItem } from '@/data/models';
import { MockDataSource } from '@/data/sources/MockDataSource';

const dataSource = new MockDataSource();

interface ChatProps {
  venueId: string;
  venueName: string;
  onBack: () => void;
}

export function Chat({ venueId, venueName, onBack }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [showFaq, setShowFaq] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, [venueId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      const id = await dataSource.createChat(venueId);
      setChatId(id);
      
      const msgs = await dataSource.getMessages(id);
      setMessages(msgs);
      
      const faqs = await dataSource.listFaq(venueId);
      setFaqItems(faqs);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!chatId || !text.trim() || sending) return;

    setSending(true);
    setNewMessage('');
    setShowFaq(false);

    try {
      await dataSource.createMessage(chatId, text.trim());
      const updatedMessages = await dataSource.getMessages(chatId);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleFaqClick = (faq: FaqItem) => {
    sendMessage(faq.question);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-card-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl glass-light transition-smooth hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1">
              <h1 className="font-semibold">{venueName}</h1>
              <p className="text-sm text-muted-foreground">Chat with venue</p>
            </div>
            
            <button
              onClick={() => setShowFaq(!showFaq)}
              className={cn(
                'p-2 rounded-xl transition-smooth',
                showFaq ? 'bg-primary text-primary-foreground' : 'glass-light hover:bg-primary/10'
              )}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Quick Replies */}
      {showFaq && faqItems.length > 0 && (
        <div className="px-4 py-3 border-b border-card-border/50">
          <div className="text-xs text-muted-foreground mb-2">Quick questions:</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {faqItems.slice(0, 4).map((faq) => (
              <button
                key={faq.id}
                onClick={() => handleFaqClick(faq)}
                className="flex-shrink-0 px-3 py-2 rounded-full glass-light text-sm hover:bg-primary/10 transition-smooth"
              >
                {faq.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {sending && (
            <div className="flex justify-end">
              <div className="bg-primary/20 text-primary px-4 py-2 rounded-2xl rounded-br-md max-w-xs">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-card-border/50 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 px-4 py-3 bg-input border border-card-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={cn(
              'p-3 rounded-2xl transition-smooth',
              newMessage.trim() && !sending
                ? 'bg-primary text-primary-foreground glow-primary hover:scale-105'
                : 'glass-light text-muted-foreground'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === 'guest';
  const isBot = message.sender === 'bot';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex gap-2 max-w-xs', isUser && 'flex-row-reverse')}>
        {/* Avatar */}
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
          isUser ? 'bg-primary text-primary-foreground' : 
          isBot ? 'bg-secondary text-secondary-foreground' : 'bg-accent text-accent-foreground'
        )}>
          {isUser ? 'U' : isBot ? '🤖' : 'M'}
        </div>
        
        {/* Message */}
        <div className={cn(
          'px-4 py-2 rounded-2xl',
          isUser 
            ? 'bg-primary text-primary-foreground rounded-br-md' 
            : 'glass-light rounded-bl-md'
        )}>
          <p className="text-sm">{message.text}</p>
          <p className={cn(
            'text-xs mt-1',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {new Date(message.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
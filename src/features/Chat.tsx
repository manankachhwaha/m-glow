// Chat Screen — Claude AI venue assistant

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message, FaqItem, VenueDetail } from '@/data/models';
import { MockDataSource } from '@/data/sources/MockDataSource';
import { getClaudeResponse, type ClaudeMessage } from '@/utils/claude';

const dataSource = new MockDataSource();

interface ChatProps {
  venueId: string;
  venueName: string;
  onBack: () => void;
}

function buildSystemPrompt(venue: VenueDetail, faqs: FaqItem[]): string {
  const priceLabel =
    venue.venue.price_level === 3 ? 'Premium (₹₹₹)' :
    venue.venue.price_level === 2 ? 'Mid-range (₹₹)' : 'Budget-friendly (₹)';

  const faqBlock = faqs.length
    ? faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : 'No FAQ data available.';

  return `You are a friendly and knowledgeable assistant for ${venue.venue.name}, a ${venue.venue.type} located at ${venue.venue.address}, Mumbai.

Opening hours: ${venue.venue.open_hours ?? 'Not specified'}
Price level: ${priceLabel}
Current crowd: ${venue.current_crowd}

Frequently asked questions:
${faqBlock}

Answer guest questions helpfully and concisely (1–3 sentences). If you are unsure about something not covered above, say you will check with the manager. Stay friendly and on-topic for this venue.`;
}

function makeId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function Chat({ venueId, venueName, onBack }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [claudeHistory, setClaudeHistory] = useState<ClaudeMessage[]>([]);
  const [venueDetail, setVenueDetail] = useState<VenueDetail | null>(null);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showFaq, setShowFaq] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, [venueId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = useCallback(async () => {
    try {
      const [detail, faqs] = await Promise.all([
        dataSource.getVenue(venueId),
        dataSource.listFaq(venueId),
      ]);
      setVenueDetail(detail);
      setFaqItems(faqs);

      const welcome: Message = {
        id: makeId(),
        chat_id: venueId,
        sender: 'bot',
        text: `Hi! I'm the assistant for ${detail.venue.name}. Ask me anything — parking, cover charges, hours, dress code, and more.`,
        created_at: new Date().toISOString(),
      };
      setMessages([welcome]);
    } catch (err) {
      console.error('Failed to initialize chat:', err);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending || !venueDetail) return;

    const trimmed = text.trim();
    setSending(true);
    setNewMessage('');
    setShowFaq(false);
    setError(null);

    const userMsg: Message = {
      id: makeId(),
      chat_id: venueId,
      sender: 'guest',
      text: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    const updatedHistory: ClaudeMessage[] = [
      ...claudeHistory,
      { role: 'user', content: trimmed },
    ];

    try {
      const systemPrompt = buildSystemPrompt(venueDetail, faqItems);
      const reply = await getClaudeResponse(systemPrompt, updatedHistory);

      const botMsg: Message = {
        id: makeId(),
        chat_id: venueId,
        sender: 'bot',
        text: reply,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMsg]);
      setClaudeHistory([
        ...updatedHistory,
        { role: 'assistant', content: reply },
      ]);
    } catch (err) {
      console.error('Claude API error:', err);
      setError('Could not get a response. Please check your API key or try again.');
      const errMsg: Message = {
        id: makeId(),
        chat_id: venueId,
        sender: 'bot',
        text: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
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
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Claude AI assistant
              </p>
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
                onClick={() => sendMessage(faq.question)}
                className="flex-shrink-0 px-3 py-2 rounded-full glass-light text-sm hover:bg-primary/10 transition-smooth"
              >
                {faq.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-xs">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-secondary text-secondary-foreground">
                  AI
                </div>
                <div className="glass-light px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
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
            placeholder="Ask about the venue..."
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
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
          isUser ? 'bg-primary text-primary-foreground' :
          isBot ? 'bg-secondary text-secondary-foreground' : 'bg-accent text-accent-foreground'
        )}>
          {isUser ? 'U' : isBot ? 'AI' : 'M'}
        </div>

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
              hour12: true,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

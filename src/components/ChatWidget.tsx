'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── FAQ Knowledge Base ────────────────────────────────────────────────────────

interface FAQ {
  keywords: string[];
  answer: string;
  followUp?: string[];
}

const WHATSAPP_NUMBER = '923001234567';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const FAQ_DATA: FAQ[] = [
  {
    keywords: ['price', 'pricing', 'cost', 'rate', 'how much', 'kitna', 'kitne', 'charges', 'budget'],
    answer: 'Our cards start from **PKR 120/card** for minimalist designs and go up to **PKR 450+/card** for luxury collections. Pricing depends on design complexity, paper quality, and finishing. We offer quantity-based discounts too!',
    followUp: ['What are the add-ons?', 'Minimum order?', 'Show me luxury cards'],
  },
  {
    keywords: ['minimum', 'min order', 'minimum order', 'least', 'kam se kam'],
    answer: 'Our minimum order is **50 cards** for standard designs and **100 cards** for luxury & custom designs. The more you order, the better the per-card rate!',
    followUp: ['What are the prices?', 'Bulk discount?'],
  },
  {
    keywords: ['delivery', 'shipping', 'deliver', 'time', 'days', 'kitne din', 'kab tak', 'how long'],
    answer: 'Standard delivery takes **7-10 working days** from order confirmation. We offer **express delivery in 4-5 days** for urgent orders (additional charges apply). Delivery is available across Pakistan!',
    followUp: ['Delivery charges?', 'Do you deliver outside Karachi?'],
  },
  {
    keywords: ['delivery charge', 'shipping cost', 'delivery fee', 'delivery charges'],
    answer: 'Delivery within **Karachi is FREE** for orders above PKR 10,000. For other cities, shipping charges range from **PKR 200-500** depending on location.',
    followUp: ['How long does delivery take?', 'Minimum order?'],
  },
  {
    keywords: ['custom', 'customize', 'bespoke', 'design', 'own design', 'apna design', 'customise'],
    answer: "Yes! We offer **fully custom designs**. Share your inspiration, color palette, and theme — our designers will create a unique mockup within **24 hours**. Custom cards start from **PKR 250/card**. You'll get 2 free revision rounds!",
    followUp: ['How to order custom?', 'What are the prices?'],
  },
  {
    keywords: ['mockup', 'sample', 'preview', 'proof', 'dekhna'],
    answer: 'We provide a **free digital mockup** before production! You can see exactly how your card will look and request changes. Physical samples are available at **PKR 500** (deducted from your final order).',
    followUp: ['How to order?', 'Visit your studio?'],
  },
  {
    keywords: ['category', 'categories', 'type', 'types', 'collection', 'kind'],
    answer: 'We offer cards in these categories:\n\n🕌 **Nikkah** — Elegant & traditional\n💐 **Barat** — Grand & luxurious\n🎊 **Valima/Walima** — Modern & sophisticated\n🎨 **Mehndi** — Vibrant & festive\n✨ **Luxury** — Premium materials\n📐 **Minimalist** — Clean & modern',
    followUp: ['Show me cards', 'Prices?'],
  },
  {
    keywords: ['add-on', 'addon', 'add on', 'extra', 'foil', 'ribbon', 'wax seal', 'envelope', 'rsvp'],
    answer: 'Our popular add-ons:\n\n✨ **Gold Foil Stamping** — PKR 45/card\n🔴 **Custom Wax Seal** — PKR 30/card\n🎀 **Satin Ribbon Tie** — PKR 20/card\n✉️ **Printed Envelope Liner** — PKR 25/card\n💌 **RSVP Insert Card** — PKR 35/card\n🎁 **Gift Box Packaging** — PKR 60/card',
    followUp: ['Prices?', 'Minimum order?'],
  },
  {
    keywords: ['order', 'how to order', 'place order', 'buy', 'kaise', 'process'],
    answer: "Ordering is simple!\n\n1️⃣ **Browse** our collection on the website\n2️⃣ **Select** your card and add-ons\n3️⃣ **Order via WhatsApp** — we'll confirm details\n4️⃣ **Get mockup** within 24 hours\n5️⃣ **Approve & pay** — production begins!\n\nPayment via **bank transfer, JazzCash, or EasyPaisa**.",
    followUp: ['Prices?', 'Chat on WhatsApp'],
  },
  {
    keywords: ['location', 'address', 'studio', 'visit', 'shop', 'kahan', 'where'],
    answer: '📍 Our studio is at:\n**Shop #12, Tariq Road, PECHS Block 2, Karachi**\n\n🕐 **Mon-Sat: 11am - 9pm**\n📞 **+92 300 123 4567**\n\nWalk-ins welcome! See samples in person and discuss your requirements.',
    followUp: ['How to order?', 'Chat on WhatsApp'],
  },
  {
    keywords: ['payment', 'pay', 'bank', 'jazzcash', 'easypaisa', 'cash'],
    answer: 'We accept:\n\n🏦 **Bank Transfer** (HBL, Meezan)\n📱 **JazzCash / EasyPaisa**\n💵 **Cash on Delivery** (Karachi only)\n\nA **50% advance** is required to start production, with the balance due before delivery.',
    followUp: ['Delivery time?', 'How to order?'],
  },
  {
    keywords: ['discount', 'offer', 'deal', 'bulk', 'wholesale'],
    answer: 'Yes! We offer **quantity-based discounts**:\n\n📦 100-199 cards → **5% off**\n📦 200-499 cards → **10% off**\n📦 500+ cards → **15% off**\n\nContact us on WhatsApp for corporate & bulk pricing!',
    followUp: ['Prices?', 'Chat on WhatsApp'],
  },
  {
    keywords: ['hi', 'hello', 'hey', 'salam', 'assalam', 'aoa'],
    answer: "Assalamu Alaikum! 👋 Welcome to **Paighaam Wedding Cards**. I'm here to help you with any questions about our cards, pricing, or ordering process. How can I assist you?",
    followUp: ['Show me categories', 'What are the prices?', 'How to order?'],
  },
  {
    keywords: ['thank', 'thanks', 'shukriya', 'jazak'],
    answer: "You're welcome! 😊 If you have any more questions, feel free to ask. Or chat with our team on WhatsApp for personalized assistance!",
    followUp: ['Chat on WhatsApp'],
  },
];

const QUICK_TOPICS = [
  '💰 Pricing',
  '📦 Minimum Order',
  '🚚 Delivery',
  '🎨 Custom Design',
  '📋 How to Order',
  '📍 Location',
];

// ─── Chat message types ────────────────────────────────────────────────────────

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  followUp?: string[];
}

// ─── Find best matching answer ─────────────────────────────────────────────────

function findAnswer(query: string): { answer: string; followUp?: string[] } {
  const lower = query.toLowerCase().trim();

  let bestMatch: FAQ | null = null;
  let bestScore = 0;

  for (const faq of FAQ_DATA) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (lower.includes(kw)) {
        score += kw.length; // Longer keyword matches = more specific
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && bestScore > 0) {
    return { answer: bestMatch.answer, followUp: bestMatch.followUp };
  }

  return {
    answer:
      "I'm not sure about that, but our team would love to help! You can chat with us directly on WhatsApp for a quick response. 😊",
    followUp: ['Chat on WhatsApp', 'Show me categories', 'Prices?'],
  };
}

// ─── Markdown-like bold formatter ──────────────────────────────────────────────

function formatMessage(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: idCounter.current++,
          role: 'bot',
          text: "Assalamu Alaikum! 👋 Welcome to **Paighaam Wedding Cards**. I can help you with pricing, ordering, delivery, and more. What would you like to know?",
          followUp: ['💰 Pricing', '📋 How to Order', '🎨 Custom Design'],
        },
      ]);
    }
    if (isOpen) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages.length]);

  const addBotReply = useCallback((query: string) => {
    setIsTyping(true);

    // Simulate natural typing delay (300-800ms)
    const delay = 400 + Math.random() * 400;

    setTimeout(() => {
      const { answer, followUp } = findAnswer(query);
      setMessages((prev) => [
        ...prev,
        {
          id: idCounter.current++,
          role: 'bot',
          text: answer,
          followUp,
        },
      ]);
      setIsTyping(false);
      if (!isOpen) setHasNewMessage(true);
    }, delay);
  }, [isOpen]);

  const handleSend = useCallback(
    (text?: string) => {
      const msg = (text || input).trim();
      if (!msg) return;

      // Handle WhatsApp redirect
      if (msg.toLowerCase().includes('whatsapp') || msg === 'Chat on WhatsApp') {
        window.open(`${WHATSAPP_URL}?text=Hi%20Paighaam!%20I%20have%20a%20query.`, '_blank');
        return;
      }

      // Handle "Show me cards" redirect
      if (msg.toLowerCase().includes('show me cards') || msg.toLowerCase().includes('show me luxury')) {
        const section = document.getElementById('collection');
        if (section) {
          setIsOpen(false);
          section.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: idCounter.current++, role: 'user', text: msg },
      ]);
      setInput('');
      addBotReply(msg);
    },
    [input, addBotReply]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <motion.button
        id="chat-widget-trigger"
        className="chat-fab"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Notification dot */}
        {hasNewMessage && !isOpen && (
          <span className="chat-fab__dot" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header__info">
                <div className="chat-header__avatar">P</div>
                <div>
                  <h3 className="chat-header__name">Paighaam Assistant</h3>
                  <span className="chat-header__status">
                    <span className="chat-header__status-dot" />
                    Online
                  </span>
                </div>
              </div>
              <button
                className="chat-header__close"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-bubble chat-bubble--${msg.role}`}>
                  {msg.role === 'bot' && <div className="chat-bubble__avatar">P</div>}
                  <div className="chat-bubble__content">
                    <div
                      className="chat-bubble__text"
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                    />
                    {/* Follow-up suggestions */}
                    {msg.followUp && msg.followUp.length > 0 && (
                      <div className="chat-follow-ups">
                        {msg.followUp.map((f) => (
                          <button
                            key={f}
                            className="chat-follow-up-btn"
                            onClick={() => handleSend(f)}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="chat-bubble chat-bubble--bot">
                  <div className="chat-bubble__avatar">P</div>
                  <div className="chat-bubble__content">
                    <div className="chat-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Topics (shown when few messages) */}
            {messages.length <= 1 && (
              <div className="chat-quick-topics">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    className="chat-quick-btn"
                    onClick={() => handleSend(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}

            {/* WhatsApp banner */}
            <a
              href={`${WHATSAPP_URL}?text=Hi%20Paighaam!%20I%20have%20a%20query.`}
              target="_blank"
              rel="noopener noreferrer"
              className="chat-wa-banner"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat with our team on WhatsApp
            </a>

            {/* Input */}
            <div className="chat-input-area">
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder="Type a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="chat-send-btn"
                onClick={() => handleSend()}
                disabled={!input.trim()}
                aria-label="Send message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* ─── Floating Action Button ─── */
        .chat-fab {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C9A96E, #B8944D);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(201,169,110,0.4), 0 2px 8px rgba(0,0,0,0.15);
          transition: box-shadow 0.3s;
        }
        .chat-fab:hover {
          box-shadow: 0 6px 28px rgba(201,169,110,0.55), 0 4px 12px rgba(0,0,0,0.2);
        }
        .chat-fab__dot {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ef4444;
          border: 3px solid white;
          animation: chat-pulse 1.5s ease infinite;
        }
        @keyframes chat-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        /* ─── Chat Window ─── */
        .chat-window {
          position: fixed;
          bottom: 5.5rem;
          right: 1.5rem;
          z-index: 998;
          width: 380px;
          max-width: calc(100vw - 2rem);
          max-height: calc(100vh - 8rem);
          border-radius: 20px;
          background: #FAF8F5;
          border: 1px solid rgba(201,169,110,0.15);
          box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
        }

        /* ─── Header ─── */
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, #1A1710, #0A0807);
          flex-shrink: 0;
        }
        .chat-header__info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .chat-header__avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #C9A96E, #D4B87A);
          color: #0A0807;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          flex-shrink: 0;
        }
        .chat-header__name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #FAF8F5;
          margin: 0;
        }
        .chat-header__status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          color: #8a7a6a;
        }
        .chat-header__status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          display: inline-block;
        }
        .chat-header__close {
          background: none;
          border: none;
          color: #6a5a4a;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
        }
        .chat-header__close:hover {
          background: rgba(255,255,255,0.08);
          color: #C9A96E;
        }

        /* ─── Messages ─── */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 1rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-height: 200px;
          max-height: 340px;
        }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-thumb {
          background: rgba(201,169,110,0.2);
          border-radius: 4px;
        }

        /* ─── Bubble ─── */
        .chat-bubble {
          display: flex;
          gap: 0.5rem;
          max-width: 92%;
          animation: chat-msg-in 0.3s ease;
        }
        @keyframes chat-msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-bubble--user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .chat-bubble__avatar {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #C9A96E, #D4B87A);
          color: #0A0807;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.7rem;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .chat-bubble__content {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .chat-bubble__text {
          padding: 0.625rem 0.875rem;
          border-radius: 14px;
          font-size: 0.8125rem;
          line-height: 1.55;
          white-space: pre-line;
          word-break: break-word;
        }
        .chat-bubble--bot .chat-bubble__text {
          background: white;
          color: #2a2018;
          border: 1px solid rgba(201,169,110,0.1);
          border-top-left-radius: 4px;
        }
        .chat-bubble--user .chat-bubble__text {
          background: linear-gradient(135deg, #C9A96E, #B8944D);
          color: white;
          border-top-right-radius: 4px;
        }
        .chat-bubble__text strong {
          font-weight: 600;
          color: #96793f;
        }
        .chat-bubble--user .chat-bubble__text strong {
          color: #fff;
        }

        /* ─── Follow-up buttons ─── */
        .chat-follow-ups {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-top: 0.125rem;
        }
        .chat-follow-up-btn {
          padding: 0.3rem 0.65rem;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 500;
          background: rgba(201,169,110,0.08);
          border: 1px solid rgba(201,169,110,0.2);
          color: #96793f;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .chat-follow-up-btn:hover {
          background: rgba(201,169,110,0.15);
          border-color: rgba(201,169,110,0.4);
        }

        /* ─── Typing indicator ─── */
        .chat-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0.75rem 1rem;
          background: white;
          border: 1px solid rgba(201,169,110,0.1);
          border-radius: 14px;
          border-top-left-radius: 4px;
        }
        .chat-typing span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #C9A96E;
          animation: chat-typing-bounce 1.2s ease infinite;
        }
        .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
        .chat-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes chat-typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }

        /* ─── Quick topics ─── */
        .chat-quick-topics {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          padding: 0 1rem 0.5rem;
          flex-shrink: 0;
        }
        .chat-quick-btn {
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          background: white;
          border: 1px solid rgba(201,169,110,0.2);
          color: #5a4a3a;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .chat-quick-btn:hover {
          background: rgba(201,169,110,0.08);
          border-color: rgba(201,169,110,0.4);
          color: #96793f;
        }

        /* ─── WhatsApp banner ─── */
        .chat-wa-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem;
          background: #25D366;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .chat-wa-banner:hover { background: #1ebe57; }

        /* ─── Input ─── */
        .chat-input-area {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-top: 1px solid rgba(201,169,110,0.1);
          background: white;
          flex-shrink: 0;
        }
        .chat-input {
          flex: 1;
          padding: 0.6rem 0.875rem;
          border: 1px solid rgba(201,169,110,0.15);
          border-radius: 12px;
          font-size: 0.8125rem;
          font-family: inherit;
          color: #2a2018;
          background: #FAF8F5;
          outline: none;
          transition: border-color 0.2s;
        }
        .chat-input:focus { border-color: rgba(201,169,110,0.4); }
        .chat-input::placeholder { color: #baa88a; }

        .chat-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #C9A96E, #B8944D);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .chat-send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #B8944D, #A6823C);
          transform: scale(1.05);
        }
        .chat-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ─── Mobile responsive ─── */
        @media (max-width: 480px) {
          .chat-window {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            max-width: 100%;
            max-height: 100vh;
            border-radius: 0;
          }
          .chat-messages { max-height: calc(100vh - 260px); }
          .chat-fab {
            bottom: 1rem;
            right: 1rem;
          }
        }
      `}</style>
    </>
  );
}

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X } from "lucide-react";

const chatbotAvatar =
  "https://res.cloudinary.com/dlkovvlud/image/upload/c_scale,q_80,w_80/v1751536902/a-modern-logo-design-featuring-primoboos_XhhkS8E_Q5iOwxbAXB4CqQ_HnpCsJn4S1yrhb826jmMDw_nmycqj.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFaq, setShowFaq] = useState(true);

  const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    console.log("Gemini API Key Loaded:", GEMINI_KEY ? "✅ Loaded" : "❌ Undefined");
  }, [GEMINI_KEY]);

  const toggleOpen = () => {
    if (isOpen) {
      // Reset chat when closing
      setMessages([]);
      setShowFaq(true);
    }
    setIsOpen((p) => !p);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setShowFaq(false); // hide FAQs after first interaction

    const userMsg = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = `
You are **PrimoBoost AI**, the official AI assistant for PrimoBoostAI.in — a platform for AI-powered resume optimization, job listings, and interview preparation.

🧭 **Your job:**
- Help users with resume optimization, job search, pricing plans, and support.
- When users mention "payment", "pricing", "plan", "buy", or "subscription", show the pricing details below.
- Always end payment-related replies with:  
  👉 “For any billing or payment issues, please contact **primoboostai@gmail.com** with a screenshot of your issue. Our team will respond within 2 minutes.”

💸 **PrimoBoost AI Pricing Plans (50% OFF):**
🏆 **Leader Plan** — ₹6400 (One-time) — 100 Resume Credits  
💼 **Achiever Plan** — ₹3200 (One-time) — 50 Resume Credits  
🚀 **Accelerator Plan** — ₹1600 (One-time) — 25 Resume Credits  
✨ **Starter Plan** — ₹640 (One-time) — 10 Resume Credits  
🎯 **Kickstart Plan** — ₹320 (One-time) — 5 Resume Credits  

Each plan includes:
- Resume Optimizations  
- ATS Score Checks  
- Premium Support  

🏁 Encourage users to choose a plan that suits their career stage.

If users ask about non-related topics, kindly bring them back to career, resume, or PrimoBoost-related help.
      `;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: `${systemPrompt}\n\nUser: ${text}` }] },
            ],
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Gemini Error:", data);
        throw new Error(data.error?.message || "Gemini request failed");
      }

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚙️ Sorry, I’m having trouble connecting right now.";
      setMessages((p) => [...p, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "❌ Network error. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAsk = (q: string) => sendMessage(q);

  const faqs = [
    "What is PrimoBoost AI?",
    "How do I optimize my resume?",
    "Tell me about job listings.",
    "How do I fix payment issues?",
    "Explain subscription plans.",
    "How to contact support?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 20, stiffness: 240 }}
            className="w-[min(380px,calc(100vw-2.5rem))] overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur dark:bg-gray-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <img
                  src={chatbotAvatar}
                  alt="PrimoBoost AI"
                  className="h-10 w-10 rounded-full border border-white/40 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">PrimoBoost AI Assistant</p>
                  <p className="text-xs text-white/80">Always here to help 💬</p>
                </div>
              </div>
              <button
                onClick={toggleOpen}
                className="rounded-full p-1.5 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Section */}
            <div className="flex h-[420px] flex-col bg-white dark:bg-gray-900">
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                    PrimoBoost AI is typing...
                  </p>
                )}
              </div>
            </div>

            {/* FAQ Section - visible only initially */}
            {showFaq && (
              <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {faqs.map((f) => (
                    <button
                      key={f}
                      onClick={() => handleQuickAsk(f)}
                      className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2.5 py-1.5 rounded-full font-medium transition"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about resume, jobs, or plans..."
                className="flex-1 rounded-xl border-none bg-white px-3 py-2 text-sm outline-none dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 p-2 text-white shadow hover:scale-105 transition disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Icon */}
      <motion.button
        key="chat-toggle"
        onClick={toggleOpen}
        initial={false}
        animate={{ scale: 1, rotate: isOpen ? 90 : 0 }}
        whileTap={{ scale: 0.9 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700 text-white shadow-lg hover:shadow-xl focus:outline-none"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </motion.button>
    </div>
  );
};

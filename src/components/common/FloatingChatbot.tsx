import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Send, X } from 'lucide-react'

const chatbotAvatar =
  'https://res.cloudinary.com/dlkovvlud/image/upload/c_scale,q_80,w_80/v1751536902/a-modern-logo-design-featuring-primoboos_XhhkS8E_Q5iOwxbAXB4CqQ_HnpCsJn4S1yrhb826jmMDw_nmycqj.jpg'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleOpen = () => setIsOpen((prev) => !prev)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: input }],
              },
            ],
          }),
        }
      )

      const data = await res.json()
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        '⚙️ Sorry, I’m having trouble connecting right now.'
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Network error. Please try again later.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 20, stiffness: 240 }}
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
                  <p className="text-sm font-semibold">PrimoBoost Support Agent</p>
                  <p className="text-xs text-white/80">AI Assistant • Online</p>
                </div>
              </div>
              <button
                onClick={toggleOpen}
                className="rounded-full p-1.5 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex h-[460px] flex-col bg-white dark:bg-gray-900">
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                    PrimoBot is typing...
                  </p>
                )}
              </div>

              {/* Input area */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about ATS, payments, or resume tips..."
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble */}
      <motion.button
        key="chat-toggle"
        onClick={toggleOpen}
        initial={false}
        animate={{ scale: 1, rotate: isOpen ? 90 : 0 }}
        whileTap={{ scale: 0.9 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700 text-white shadow-lg hover:shadow-xl focus:outline-none"
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </motion.button>
    </div>
  )
}

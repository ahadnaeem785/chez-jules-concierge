import { useEffect, useMemo, useRef, useState } from "react"
import MessageBubble from "./MessageBubble"
import { postChat } from "../utils/api"

const SLOW_PAUSE = [".", "!", "?", ","]

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [typingFrame, setTypingFrame] = useState("")
  const scrollRef = useRef(null)

  const sessionId = useMemo(() => crypto.randomUUID?.() || Math.random().toString(36).slice(2), [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typingFrame])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setMessages(prev => [...prev, { role: "user", content: text }])
    setInput("")
    setSending(true)
    setTypingFrame("")

    // try {
    //   const data = await postChat({ message: text, sessionId })
    //   const reply = data?.reply || "Hmm... I didn’t quite catch that."
    //   await typeOut(reply, setTypingFrame)
    //   setMessages(prev => [...prev, { role: "assistant", content: reply }])
    //   setTypingFrame("")
    // } catch (err) {
    //   setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.message}` }])
    //   setTypingFrame("")
    // } finally {
    //   setSending(false)
    // }
    try {
  // 1️⃣ Get API reply
  const data = await postChat({ message: text, sessionId })
  const reply = data?.reply || "Hmm... I didn’t quite catch that."

  // 2️⃣ Immediately hide 'thinking…' spinner
  setSending(false)

  // 3️⃣ Start typing animation (still async)
  await typeOut(reply, setTypingFrame)

  // 4️⃣ After typing completes, append full assistant message
  setMessages(prev => [...prev, { role: "assistant", content: reply }])
  setTypingFrame("")
} catch (err) {
  setMessages(prev => [
    ...prev,
    { role: "assistant", content: `Error: ${err.message}` },
  ])
  setTypingFrame("")
  setSending(false)
}

  }

  return (
    <>
      <div ref={scrollRef} className="messages">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} />
        ))}
        {sending && <div className="message-row assistant"><div className="bubble"><span className="spinner" />thinking…</div></div>}
        {typingFrame && <MessageBubble role="assistant" content={`${typingFrame}▌`} />}
      </div>

      <form className="input-bar" onSubmit={handleSend}>
        <div className="input-inner">
          <input
            className="input"
            placeholder="Send a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={sending}
          />
          <button className="button" disabled={!input.trim() || sending}>
            Send
          </button>
        </div>
      </form>
    </>
  )
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function typeOut(text, setFrame) {
  let acc = ""
  for (const ch of text) {
    acc += ch
    setFrame(acc)
    const [min, max] = SLOW_PAUSE.includes(ch) ? [80, 150] : [15, 30]
    await sleep(min + Math.random() * (max - min))
  }
}

export default function MessageBubble({ role, content }) {
  return (
    <div className={`message-row ${role}`}>
      <div className="bubble">{content}</div>
    </div>
  )
}

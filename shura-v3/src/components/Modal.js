'use client'
export default function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-bg fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal slide-up">
        <div className="modal-header">
          <span className="modal-title serif">{title}</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

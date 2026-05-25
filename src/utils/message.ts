type MessageType = 'success' | 'warning' | 'error' | 'info'

const ICON_MAP: Record<MessageType, string> = {
  success: '✓',
  warning: '!',
  error: '✕',
  info: 'i'
}

const COLOR_MAP: Record<MessageType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: '#f0f9eb', border: '#e1f3d8', text: '#67c23a', icon: '#fff' },
  warning: { bg: '#fdf6ec', border: '#faecd8', text: '#e6a23c', icon: '#fff' },
  error: { bg: '#fef0f0', border: '#fde2e2', text: '#f56c6c', icon: '#fff' },
  info: { bg: '#f4f4f5', border: '#e9e9eb', text: '#909399', icon: '#fff' }
}

function getMessageContainer(): HTMLElement {
  let container = document.getElementById('message-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'message-container'
    container.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none;'
    document.body.appendChild(container)
  }
  return container
}

function showMessage(type: MessageType, text: string, duration = 3000): void {
  const container = getMessageContainer()
  const colors = COLOR_MAP[type]

  const el = document.createElement('div')
  el.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background: ${colors.bg};
    border: 1px solid ${colors.border};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    font-size: 14px;
    color: #303133;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(-12px);
    transition: all 0.3s ease;
    max-width: 420px;
    word-break: break-word;
  `

  const iconEl = document.createElement('span')
  iconEl.textContent = ICON_MAP[type]
  iconEl.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${colors.text};
    color: ${colors.icon};
    font-size: 13px;
    font-weight: bold;
    flex-shrink: 0;
  `

  const textEl = document.createElement('span')
  textEl.textContent = text

  el.appendChild(iconEl)
  el.appendChild(textEl)
  container.appendChild(el)

  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  })

  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(-12px)'
    setTimeout(() => {
      el.remove()
      if (container.children.length === 0) {
        container.remove()
      }
    }, 300)
  }, duration)
}

export const Message = {
  success: (text: string, duration?: number) => showMessage('success', text, duration),
  warning: (text: string, duration?: number) => showMessage('warning', text, duration),
  error: (text: string, duration?: number) => showMessage('error', text, duration),
  info: (text: string, duration?: number) => showMessage('info', text, duration)
}

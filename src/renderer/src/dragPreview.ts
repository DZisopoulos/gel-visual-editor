export function setBlockDragPreview(event: React.DragEvent, label: string, color: string): void {
  if (!event.dataTransfer.setDragImage || typeof document === 'undefined') return
  const preview = document.createElement('div')
  preview.className = 'gve-drag-preview'
  preview.style.setProperty('--block-color', color)
  const icon = document.createElement('span')
  icon.className = 'gve-drag-preview-icon'
  icon.textContent = '◆'
  const text = document.createElement('span')
  text.textContent = label
  preview.append(icon, text)
  document.body.appendChild(preview)
  event.dataTransfer.setDragImage(preview, 16, 16)
  window.setTimeout(() => preview.remove(), 0)
}

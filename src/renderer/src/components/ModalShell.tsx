import { useEffect, useRef, type ReactNode } from 'react'

interface ModalShellProps {
  open: boolean
  onClose: () => void
  className: string
  ariaLabel?: string
  ariaLabelledBy?: string
  children: ReactNode
}

export function ModalShell({
  open,
  onClose,
  className,
  ariaLabel,
  ariaLabelledBy,
  children
}: ModalShellProps): React.JSX.Element | null {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  if (!open) return null
  return (
    <dialog
      ref={dialogRef}
      className={className}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      {children}
    </dialog>
  )
}

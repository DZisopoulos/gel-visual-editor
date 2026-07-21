interface AboutDialogProps { open: boolean; onClose: () => void }

function AboutDialog({ open, onClose }: AboutDialogProps): React.JSX.Element | null {
  if (!open) return null
  return (
    <div className="gve-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className="gve-about-dialog" role="dialog" aria-modal="true" aria-labelledby="gve-about-title">
        <div className="gve-about-hero">
          <div className="gve-about-mark" aria-hidden="true">GVE</div>
          <div><h2 id="gve-about-title">GEL Visual Editor</h2><p>Build Clarity PPM GEL scripts visually.</p></div>
          <button type="button" className="gve-modal-close" aria-label="Close About" onClick={onClose}>×</button>
        </div>
        <div className="gve-about-body">
          <div className="gve-about-meta"><span>Version 1.0.0</span><span>Created by Dimitrios Zisopoulos</span></div>
          <h3>Personal Use License</h3>
          <p>GVE is free for personal, educational, and non-commercial use.</p>
          <p>Commercial use, redistribution, resale, incorporation into a paid product or service, or any use intended to generate money requires prior written permission from the copyright holder.</p>
          <p className="gve-about-muted">All rights reserved. The software is provided as-is, without warranty.</p>
        </div>
        <div className="gve-about-actions"><button type="button" onClick={onClose}>Done</button></div>
      </section>
    </div>
  )
}

export default AboutDialog

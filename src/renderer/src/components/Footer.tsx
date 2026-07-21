import { THEME_OPTIONS, type ThemeId } from '../theme'

interface FooterProps {
  appTheme: ThemeId
  xmlTheme: ThemeId
  onAppThemeChange: (theme: ThemeId) => void
  onXmlThemeChange: (theme: ThemeId) => void
}

const APP_VERSION = '1.0.0'

function Footer({ appTheme, xmlTheme, onAppThemeChange, onXmlThemeChange }: FooterProps): React.JSX.Element {
  return (
    <footer className="gve-footer">
      <div className="gve-footer-meta">
        <span>© 2026 GVE</span>
        <span className="gve-footer-divider" />
        <span>Version {APP_VERSION}</span>
      </div>
      <div className="gve-footer-themes">
        <label className="gve-theme-picker">
          <span>App</span>
          <select aria-label="App theme" value={appTheme} onChange={event => onAppThemeChange(event.target.value as ThemeId)}>
            {THEME_OPTIONS.map(theme => <option value={theme.id} key={theme.id}>{theme.name}</option>)}
          </select>
        </label>
        <label className="gve-theme-picker">
          <span>XML</span>
          <select aria-label="XML theme" value={xmlTheme} onChange={event => onXmlThemeChange(event.target.value as ThemeId)}>
            {THEME_OPTIONS.map(theme => <option value={theme.id} key={theme.id}>{theme.name}</option>)}
          </select>
        </label>
      </div>
    </footer>
  )
}

export default Footer

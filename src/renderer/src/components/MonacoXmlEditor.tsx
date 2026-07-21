import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { getTheme, THEME_OPTIONS, type ThemeId } from '../theme'

loader.config({ monaco })
let xmlLanguageConfigured = false

function configureXmlLanguage(): void {
  if (xmlLanguageConfigured) return
  xmlLanguageConfigured = true
  monaco.languages.setLanguageConfiguration('xml', { brackets: [['<', '>']], autoClosingPairs: [{ open: '<', close: '>' }, { open: '"', close: '"' }] })
  monaco.languages.registerCompletionItemProvider('xml', {
    triggerCharacters: ['<', ':', ' '],
    provideCompletionItems: (model, position) => {
      const line = model.getLineContent(position.lineNumber).slice(0, position.column - 1)
      const range = new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)
      const suggestions = line.endsWith('<') ? ['gel:script', 'gel:set', 'gel:log', 'core:forEach', 'core:choose', 'sql:query', 'gel:email'].map(label => ({ label, kind: monaco.languages.CompletionItemKind.Keyword, insertText: label, range })) : []
      return { suggestions }
    }
  })
}

function MonacoXmlEditor({ xml, theme }: { xml: string; theme: ThemeId }): React.JSX.Element {
  const definition = getTheme(theme)
  return (
    <Editor
      height="100%"
      defaultLanguage="xml"
      value={xml}
      theme={definition.monacoName}
      beforeMount={monacoInstance => {
        configureXmlLanguage()
        for (const themeOption of THEME_OPTIONS) {
          monacoInstance.editor.defineTheme(themeOption.monacoName, themeOption.monaco)
        }
      }}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        folding: true,
        showFoldingControls: 'mouseover',
        smoothScrolling: true,
        padding: { top: 12, bottom: 16 },
        renderLineHighlight: 'line',
        wordWrap: 'on',
        wordWrapColumn: 110,
        lineNumbersMinChars: 3,
        scrollBeyondLastLine: false,
        automaticLayout: true
      }}
    />
  )
}

export default MonacoXmlEditor

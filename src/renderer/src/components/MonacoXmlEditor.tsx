import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { getTheme, THEME_OPTIONS, type ThemeId } from '../theme'

loader.config({ monaco })

function MonacoXmlEditor({ xml, theme }: { xml: string; theme: ThemeId }): React.JSX.Element {
  const definition = getTheme(theme)
  return (
    <Editor
      height="100%"
      defaultLanguage="xml"
      value={xml}
      theme={definition.monacoName}
      beforeMount={monacoInstance => {
        for (const themeOption of THEME_OPTIONS) {
          monacoInstance.editor.defineTheme(themeOption.monacoName, themeOption.monaco)
        }
      }}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        lineNumbersMinChars: 3,
        scrollBeyondLastLine: false,
        automaticLayout: true
      }}
    />
  )
}

export default MonacoXmlEditor

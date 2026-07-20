import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

loader.config({ monaco })

function MonacoXmlEditor({ xml }: { xml: string }): React.JSX.Element {
  return (
    <Editor
      height="100%"
      defaultLanguage="xml"
      value={xml}
      theme="vs-dark"
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

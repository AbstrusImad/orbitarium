/*
  ImportExportPanel.jsx
  Local JSON export and import controls. No network.
*/
import React, { useRef } from 'react'
import { downloadJSON, readJSONFile, isValidSystem } from '../../utils/exportImport.js'
import { useToast } from './Toast.jsx'

export default function ImportExportPanel({ onImport, exportData, exportName = 'orbitarium-system.json', label = 'System' }) {
  const fileRef = useRef(null)
  const { push } = useToast()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await readJSONFile(file)
      if (Array.isArray(data)) {
        let count = 0
        data.forEach((d) => {
          if (isValidSystem(d)) {
            onImport(d)
            count++
          }
        })
        push(`Imported ${count} system(s)`, 'champagne')
      } else if (isValidSystem(data)) {
        onImport(data)
        push('System imported', 'champagne')
      } else {
        push('File is not a valid Orbitarium system', 'crimson')
      }
    } catch (err) {
      push(err.message || 'Import failed', 'crimson')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      {exportData && (
        <button
          onClick={() => {
            downloadJSON(exportData, exportName)
            push(`${label} exported`, 'sage')
          }}
          className="rounded-lg px-3 py-2 text-xs hairline text-bone2"
          style={{ background: 'var(--ink2)' }}
        >
          Export JSON
        </button>
      )}
      {onImport && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-lg px-3 py-2 text-xs hairline text-bone2"
            style={{ background: 'var(--ink2)' }}
          >
            Import JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleFile} className="hidden" />
        </>
      )}
    </div>
  )
}

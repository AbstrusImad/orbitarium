/*
  exportImport.js
  Local JSON download and upload. No network. Uses Blob and FileReader only.
*/

export function downloadJSON(data, filename) {
  const text = JSON.stringify(data, null, 2)
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'orbitarium-export.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result))
      } catch (e) {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsText(file)
  })
}

export function isValidSystem(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.protocolName === 'string' &&
    Array.isArray(obj.roles) &&
    Array.isArray(obj.powers)
  )
}

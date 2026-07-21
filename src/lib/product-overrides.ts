import fs from 'fs'
import path from 'path'
import os from 'os'

const TMP_FILE = path.join(os.tmpdir(), 'faab-product-overrides.json')

export function getProductOverrides(): Record<string, any> {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch {
    // ignore
  }
  return {}
}

export function saveProductOverride(key: string, data: any) {
  try {
    const current = getProductOverrides()
    current[key.toLowerCase().trim()] = data
    fs.writeFileSync(TMP_FILE, JSON.stringify(current, null, 2), 'utf-8')
  } catch {
    // ignore
  }
}

export function deleteProductOverride(key: string) {
  try {
    const current = getProductOverrides()
    delete current[key.toLowerCase().trim()]
    fs.writeFileSync(TMP_FILE, JSON.stringify(current, null, 2), 'utf-8')
  } catch {
    // ignore
  }
}

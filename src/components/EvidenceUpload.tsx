import { useId } from 'react'
import type { EvidenceFile } from '../types'
import { MAX_FILE_SIZE } from '../types'

interface Props {
  label: string
  description: string
  required?: boolean
  error?: string
  file?: EvidenceFile
  onChange: (file: EvidenceFile | undefined) => void
  testId?: string
}

export function EvidenceUpload({ label, description, required = true, error, file, onChange, testId }: Props) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  return (
    <div className={`evidence-box ${error ? 'has-error' : ''}`}>
      <div className="evidence-copy">
        <label htmlFor={inputId}><strong>{label}</strong>{required && <span className="required-mark">Required</span>}</label>
        <p>{description}</p>
      </div>
      <input
        id={inputId}
        data-testid={testId}
        className="visually-hidden"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => {
          const fileValue = event.target.files?.[0]
          if (!fileValue) return
          onChange({ name: fileValue.name, size: fileValue.size, type: fileValue.type, lastModified: fileValue.lastModified })
        }}
      />
      <label className="upload-button" htmlFor={inputId}>{file ? 'Replace document' : 'Upload document'}</label>
      <div className="file-name" aria-live="polite">{file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'No document added yet'}</div>
      <small>PDF, JPG, or PNG · up to {MAX_FILE_SIZE / 1024 / 1024} MB. Your document is used for this application only.</small>
      {error && <p className="field-error" id={errorId} role="alert">{error}</p>}
    </div>
  )
}

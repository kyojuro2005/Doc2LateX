import { useCallback, useState, useRef } from 'react'
import { Upload, Camera, FileText, Image, FileSpreadsheet, File, RefreshCw } from 'lucide-react'
import type { FileType } from '../types'
import { detectFileType } from '../types'

interface UploadZoneProps {
  onFileSelected: (file: File) => void
  uploading: boolean
  disabled?: boolean
}

const fileTypeLabels: Record<FileType, { label: string; icon: React.ReactNode }> = {
  image: { label: 'Image (PNG, JPG)', icon: <Image size={28} className="text-charcoal" /> },
  pdf: { label: 'Document PDF', icon: <FileText size={28} className="text-charcoal" /> },
  docx: { label: 'Document Word', icon: <FileText size={28} className="text-charcoal" /> },
  xlsx: { label: 'Classeur Excel', icon: <FileSpreadsheet size={28} className="text-charcoal" /> },
  unknown: { label: 'Fichier', icon: <File size={28} className="text-stone-400" /> },
}

export default function UploadZone({ onFileSelected, uploading, disabled }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      setSelectedFile(file)
      onFileSelected(file)
    },
    [onFileSelected]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const detectedType = selectedFile
    ? detectFileType(selectedFile.type, selectedFile.name)
    : null

  return (
    <div className="space-y-3 font-sans">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer select-none bg-surface-card
          ${
            dragOver
              ? 'border-charcoal bg-stone-100 scale-[1.01]'
              : 'border-surface-border hover:border-stone-400 hover:bg-surface'
          }
          ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <RefreshCw size={28} className="animate-spin text-charcoal" />
            <p className="text-sm text-charcoal font-medium">Analyse et conversion en code LaTeX...</p>
            <p className="text-xs text-stone-500">Extraction des équations, tableaux et structures</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-charcoal">{fileTypeLabels[detectedType || 'unknown'].icon}</div>
            <div>
              <p className="text-sm font-semibold text-charcoal truncate max-w-[280px]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {(selectedFile.size / 1024).toFixed(0)} Ko • {fileTypeLabels[detectedType || 'unknown'].label}
              </p>
            </div>
            <span className="text-xs font-medium text-charcoal hover:underline">
              Cliquer pour sélectionner un autre document
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="text-charcoal">
              <Upload size={32} strokeWidth={1.5} className="text-charcoal" />
            </div>
            <div>
              <p className="text-base font-semibold text-charcoal">
                Déposez un document ou parcourez votre appareil
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Formats acceptés : Image (.png, .jpg), PDF, Word (.docx), Excel (.xlsx) — jusqu'à 20 Mo
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".png,.jpg,.jpeg,.pdf,.docx,.xlsx"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
      </div>

      {/* Camera capture button for mobile PWA */}
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border bg-surface-card text-sm font-medium text-charcoal hover:bg-surface hover:border-stone-400 transition-colors sm:hidden"
      >
        <Camera size={18} className="text-charcoal" />
        Numériser un document avec l'appareil photo
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />
    </div>
  )
}

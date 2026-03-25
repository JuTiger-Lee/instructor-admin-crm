import * as React from 'react'
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UploadedFile {
  id: string
  file: File
  previewUrl?: string
}

export interface FileUploadProps {
  value?: UploadedFile[]
  onChange?: (files: UploadedFile[]) => void
  accept?: string
  multiple?: boolean
  maxSizeMB?: number
  className?: string
  disabled?: boolean
}

export function FileUpload({
  value = [],
  onChange,
  accept,
  multiple = true,
  maxSizeMB = 10,
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function processFiles(files: FileList) {
    const maxBytes = maxSizeMB * 1024 * 1024
    const newFiles: UploadedFile[] = []

    Array.from(files).forEach((file) => {
      if (file.size > maxBytes) return

      const isImage = file.type.startsWith('image/')
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const uploaded: UploadedFile = { id, file }

      if (isImage) {
        uploaded.previewUrl = URL.createObjectURL(file)
      }

      newFiles.push(uploaded)
    })

    if (!multiple) {
      // 기존 previewUrl 해제
      value.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
      })
      onChange?.(newFiles.slice(0, 1))
    } else {
      onChange?.([...value, ...newFiles])
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  function handleRemove(id: string) {
    const target = value.find((f) => f.id === id)
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
    onChange?.(value.filter((f) => f.id !== id))
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* 드래그앤드롭 영역 */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-all duration-200',
          isDragging
            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
            : 'border-border/60 bg-gray-50/50 text-muted-foreground hover:border-emerald-300/70 hover:bg-emerald-50/30',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
          isDragging ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-muted-foreground shadow-sm'
        )}>
          <Upload className="h-5 w-5" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragging ? '여기에 놓으세요' : '클릭하거나 파일을 드래그하세요'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground/70">
            최대 {maxSizeMB}MB
            {accept && ` · ${accept}`}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            processFiles(e.target.files)
            e.target.value = ''
          }
        }}
      />

      {/* 파일 목록 */}
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((uploaded) => (
            <li
              key={uploaded.id}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-white px-3 py-2.5 shadow-sm"
            >
              {/* 썸네일 or 아이콘 */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                {uploaded.previewUrl ? (
                  <img
                    src={uploaded.previewUrl}
                    alt={uploaded.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : uploaded.file.type.startsWith('image/') ? (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* 파일 정보 */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {uploaded.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(uploaded.file.size)}
                </p>
              </div>

              {/* 제거 버튼 */}
              <button
                type="button"
                onClick={() => handleRemove(uploaded.id)}
                className="shrink-0 rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

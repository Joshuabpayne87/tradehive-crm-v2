"use client"

import * as React from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  isUploading?: boolean
  className?: string
}

export function FileUpload({ onUpload, isUploading, className }: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = React.useState(false)

  const handleFile = async (file: File) => {
    if (file) {
      await onUpload(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors",
        dragActive ? "border-primary bg-primary/5" : "border-muted",
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        disabled={isUploading}
      />
      <div className="bg-muted rounded-full p-3">
        <Upload className="h-6 w-6" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">
          {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs">SVG, PNG, JPG or PDF (max 10MB)</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        Select File
      </Button>
    </div>
  )
}


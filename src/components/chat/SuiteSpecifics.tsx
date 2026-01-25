import React, { useState, useEffect } from 'react'
import { FileText, X, Upload, Loader2, Play, ExternalLink } from 'lucide-react'
import { blink } from '@/lib/blink'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useBlinkAuth } from '@blinkdotnew/react'

/**
 * CODING SUITE: Sandbox Preview
 */
export const SandboxPreview: React.FC<{ sandboxId?: string, isLoading: boolean }> = ({ sandboxId, isLoading }) => {
  const [previewUrl, setPreviewUrl] = useState('')
  const [trustDelayPassed, setTrustDelayPassed] = useState(false)

  useEffect(() => {
    if (sandboxId) {
      setPreviewUrl(`https://3000-${sandboxId}.preview-blink.com`)
      const timer = setTimeout(() => setTrustDelayPassed(true), 3000)
      return () => clearTimeout(timer)
    } else {
      setTrustDelayPassed(false)
    }
  }, [sandboxId])

  if (!sandboxId) return null

  return (
    <div className="mt-6 rounded-2xl overflow-hidden glass-card h-[400px] flex flex-col">
      <div className="h-10 px-4 flex items-center justify-between bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 ml-2">localhost:3000</span>
        </div>
        <a href={previewUrl} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
          <ExternalLink size={14} />
        </a>
      </div>
      <div className="flex-1 bg-black/20 relative">
        {(!trustDelayPassed || isLoading) ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            <span className="text-xs text-zinc-500 font-mono">Syncing sandbox...</span>
          </div>
        ) : (
          <iframe 
            src={previewUrl} 
            className="w-full h-full border-none"
            title="Sandbox Preview"
          />
        )}
      </div>
    </div>
  )
}

/**
 * STUDY SUITE: Note Management
 */
export const NotesManager: React.FC<{ onFileProcessed: (text: string) => void }> = ({ onFileProcessed }) => {
  const { user } = useBlinkAuth()
  const [files, setFiles] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    try {
      toast.info(`Uploading ${file.name}...`)
      
      // 1. Upload to storage
      const storageResult = await blink.storage.upload(
        file,
        `notes/${user.id}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      )
      
      // 2. Extract text
      toast.info('Extracting text...')
      const extraction = await blink.data.extractFromUrl(storageResult.publicUrl)
      const extractedText = typeof extraction === 'string' ? extraction : extraction?.text || ''
      
      if (!extractedText) {
        throw new Error('No text could be extracted from this file.')
      }

      // 3. Upload to RAG collection
      toast.info('Indexing for study...')
      const colName = `notes_${user.id.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`
      
      try {
        await blink.rag.createCollection({ name: colName })
      } catch (err) {}

      await blink.rag.upload({
        collectionName: colName,
        filename: file.name,
        content: extractedText
      })

      setFiles(prev => [...prev, { name: file.name, status: 'ready' }])
      onFileProcessed(extractedText)
      toast.success(`${file.name} is ready for study!`)
    } catch (error: any) {
      toast.error(`Study indexing failed: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-4 rounded-2xl glass-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <BookOpen className="w-3 h-3" /> Note Library
        </h3>
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-[11px] font-bold">
            {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            Upload
          </div>
        </label>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
        {files.length === 0 ? (
          <div className="text-[11px] text-zinc-600 text-center py-4 italic">No documents uploaded yet</div>
        ) : (
          files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={14} className="text-amber-400 flex-shrink-0" />
                <span className="text-xs text-zinc-300 truncate">{file.name}</span>
              </div>
              <button className="text-zinc-600 hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

import { Brain, Zap, MessageSquare } from 'lucide-react'

/**
 * REASONING SUITE: Mentality Toggle
 */
export const MentalityToggle: React.FC<{ 
  mentality: 'logic' | 'reasoning' | 'grok'
  setMentality: (m: 'logic' | 'reasoning' | 'grok') => void 
}> = ({ mentality, setMentality }) => {
  const modes = [
    { id: 'logic', label: 'Meta Logic', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'reasoning', label: 'Deep Reasoning', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'grok', label: 'Grok Mentality', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ] as const

  return (
    <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setMentality(mode.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200",
            mentality === mode.id 
              ? `${mode.bg} ${mode.color} shadow-lg ring-1 ring-white/10` 
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          <mode.icon size={14} />
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  )
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ')

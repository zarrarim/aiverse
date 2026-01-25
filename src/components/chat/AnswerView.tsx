import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ExternalLink } from 'lucide-react'

interface AnswerViewProps {
  content: string | undefined
}

export const AnswerView: React.FC<AnswerViewProps> = ({ content }) => {
  const safeContent = typeof content === 'string' ? content : ''
  
  const { cleanContent, sources } = useMemo(() => {
    if (!safeContent) return { cleanContent: '', sources: [] }
    
    const lines = safeContent.split('\n')
    const sourcesIdx = lines.findIndex(l => /sources?|references?/i.test(l))
    
    if (sourcesIdx === -1) return { cleanContent: safeContent, sources: [] }
    
    const clean = lines.slice(0, sourcesIdx).join('\n')
    const extractedLines = lines.slice(sourcesIdx + 1)
    
    const extracted = extractedLines
      .map((line, idx) => {
        // Try different citation formats
        const match = line.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/) || 
                      line.match(/(?:(.+?):\s*)?(https?:\/\/[^\s]+)/)
        
        if (match) {
          return { 
            title: match[1] || `Source ${idx + 1}`, 
            url: match[2] || match[0], 
            index: idx + 1 
          }
        }
        return null
      })
      .filter(Boolean) as { title: string, url: string, index: number }[]

    return { cleanContent: clean, sources: extracted }
  }, [safeContent])

  if (!cleanContent) return null

  return (
    <div className="space-y-6">
      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-a:text-cyan-400 prose-strong:text-white">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {cleanContent}
        </ReactMarkdown>
      </div>

      {sources.length > 0 && (
        <div className="pt-6 border-t border-white/5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sources</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sources.map((source, i) => (
              <a 
                key={i} 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400 group-hover:text-white group-hover:bg-cyan-500/20">
                  {source.index}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate text-zinc-300 group-hover:text-white">{source.title}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{new URL(source.url).hostname}</div>
                </div>
                <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

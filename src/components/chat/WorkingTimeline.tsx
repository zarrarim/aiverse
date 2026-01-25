import React from 'react'
import { Search, Check, Loader2, Globe, Terminal, FileText, ImageIcon } from 'lucide-react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface WorkingTimelineProps {
  parts: any[]
  isComplete: boolean
  suiteType: string
}

export const WorkingTimeline: React.FC<WorkingTimelineProps> = ({ parts, isComplete, suiteType }) => {
  const toolInvocations = parts.filter(p => p.type === 'tool-invocation')
  
  if (toolInvocations.length === 0 && isComplete) return null

  const getIcon = (toolName: string) => {
    switch (toolName) {
      case 'webSearch': return Globe
      case 'read_file':
      case 'write_file':
      case 'list_dir': return Terminal
      case 'ragSearch': return FileText
      case 'generateImage':
      case 'generateVideo': return ImageIcon
      default: return Search
    }
  }

  const getStatusText = () => {
    if (isComplete) return 'Task complete'
    const lastTool = toolInvocations[toolInvocations.length - 1]
    if (lastTool) {
      switch (lastTool.toolName) {
        case 'webSearch': return 'Searching the web...'
        case 'write_file': return 'Writing code...'
        case 'ragSearch': return 'Analyzing documents...'
        default: return `Running ${lastTool.toolName}...`
      }
    }
    return 'Thinking...'
  }

  return (
    <div className="mb-6 animate-fade-in">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 border border-white/10">
            {isComplete ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
            )}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400">
            {getStatusText()}
          </span>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {toolInvocations.map((inv, i) => {
              const Icon = getIcon(inv.toolName)
              return (
                <div 
                  key={inv.toolCallId || i} 
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] transition-all",
                    inv.state === 'result' 
                      ? "bg-white/5 border-white/10 text-zinc-400" 
                      : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 animate-pulse"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span className="max-w-[150px] truncate">
                    {inv.toolName === 'webSearch' ? inv.args.query : inv.toolName}
                  </span>
                  {inv.state === 'result' && <Check className="w-3 h-3 text-green-500" />}
                </div>
              )
            })}
          </div>

          {/* Sources preview if webSearch results are available */}
          {toolInvocations.some(inv => inv.toolName === 'webSearch' && inv.state === 'result') && (
            <div className="flex gap-2 overflow-x-auto pb-2 px-1">
              {toolInvocations
                .filter(inv => inv.toolName === 'webSearch' && inv.state === 'result')
                .flatMap(inv => inv.result?.results || [])
                .slice(0, 5)
                .map((source: any, i: number) => (
                  <div key={i} className="flex-shrink-0 flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 max-w-[180px]">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=64`} 
                      className="w-3 h-3 rounded-sm opacity-60"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <span className="text-[10px] text-zinc-500 truncate">{source.title}</span>
                  </div>
                ))
              }
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

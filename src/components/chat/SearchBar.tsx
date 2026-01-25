import React, { useState, useRef, useEffect } from 'react'
import { Search, ArrowRight, Telescope, Globe, Paperclip, Sparkles, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  onSearch: (query: string, mode: 'search' | 'research') => void
  isLoading: boolean
  compact?: boolean
  suiteType: string
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  isLoading, 
  compact,
  suiteType
}) => {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'search' | 'research'>('search')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const [activeTooltip, setActiveTooltip] = useState<'search' | 'research' | null>(null)
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (triggerMode: 'search' | 'research') => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
    setActiveTooltip(triggerMode)
  }

  const handleMouseLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => setActiveTooltip(null), 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return
    onSearch(query, mode)
    setQuery('')
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [query])

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "relative flex flex-col bg-zinc-900/50 backdrop-blur-xl border border-white/10 transition-all duration-200 shadow-2xl",
        "focus-within:border-white/20 focus-within:bg-zinc-900/80",
        compact ? "rounded-3xl p-2 px-3" : "rounded-2xl p-4"
      )}
    >
      <textarea
        ref={textareaRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
        placeholder={
          suiteType === 'search' ? 'What do you want to know?' :
          suiteType === 'code' ? 'Describe what you want to build...' :
          suiteType === 'creation' ? 'Describe the image or video...' :
          suiteType === 'study' ? 'Ask about your notes...' :
          'Message BlinkGlass...'
        }
        className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 resize-none text-white text-sm placeholder:text-zinc-500 py-1"
        rows={1}
      />

      <div className="flex items-center justify-between mt-2 px-1 relative">
        <div className="flex items-center gap-2">
          {/* Mode Toggle - only for search */}
          {suiteType === 'search' && (
            <div className="relative flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
              <button 
                type="button" 
                onClick={() => setMode('search')}
                onMouseEnter={() => handleMouseEnter('search')}
                onMouseLeave={handleMouseLeave}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  mode === 'search' ? "bg-white/10 text-cyan-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Search size={14} strokeWidth={2.5} />
              </button>
              <button 
                type="button" 
                onClick={() => setMode('research')}
                onMouseEnter={() => handleMouseEnter('research')}
                onMouseLeave={handleMouseLeave}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  mode === 'research' ? "bg-white/10 text-cyan-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Telescope size={14} strokeWidth={2.5} />
              </button>

              {/* Tooltip Popover */}
              {activeTooltip && (
                <div className="absolute bottom-full mb-3 left-0 z-50 animate-fade-in pointer-events-none">
                  <div className="bg-zinc-950 text-white rounded-xl p-3 border border-white/10 shadow-2xl w-64">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-cyan-400">
                      {activeTooltip === 'search' ? 'Quick Search' : 'Deep Research'}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      {activeTooltip === 'search' 
                        ? 'Fast, direct answers to everyday questions.' 
                        : 'In-depth reports with multiple sources and advanced reasoning.'}
                    </p>
                  </div>
                  <div className="ml-4 w-2 h-2 bg-zinc-950 border-r border-b border-white/10 rotate-45 -mt-1" />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1">
            <button type="button" className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-full transition-all">
              <Globe size={16} />
            </button>
            <button type="button" className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-full transition-all">
              <Paperclip size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {suiteType === 'search' && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
              <Sparkles size={12} className="text-cyan-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Pro</span>
            </div>
          )}
          <button 
            type="submit" 
            disabled={!query.trim() || isLoading}
            className={cn(
              "p-2 rounded-full transition-all duration-300",
              query.trim() 
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 scale-100" 
                : "bg-white/5 text-zinc-600 scale-95 opacity-50"
            )}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowRight size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

const Loader2 = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

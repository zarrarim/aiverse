import React from 'react'
import { 
  Search, 
  Code2, 
  Image as ImageIcon, 
  Brain, 
  BookOpen, 
  Plus,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useBlinkAuth } from '@blinkdotnew/react'
import { blink } from '@/lib/blink'

export type SuiteType = 'search' | 'code' | 'creation' | 'reasoning' | 'study'

interface SidebarProps {
  activeSuite: SuiteType
  onSuiteChange: (suite: SuiteType) => void
  onNewThread: () => void
  onSelectThread: (id: string) => void
  threads: any[]
  isCollapsed: boolean
  setIsCollapsed: (v: boolean) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSuite,
  onSuiteChange,
  onNewThread,
  onSelectThread,
  threads,
  isCollapsed,
  setIsCollapsed
}) => {
  const { user, signOut } = useBlinkAuth()

  const suites = [
    { id: 'search', label: 'Deep Search', icon: Search, color: 'text-cyan-400' },
    { id: 'reasoning', label: 'Reasoning', icon: Brain, color: 'text-purple-400' },
    { id: 'code', label: 'Coding', icon: Code2, color: 'text-blue-400' },
    { id: 'creation', label: 'Creation', icon: ImageIcon, color: 'text-pink-400' },
    { id: 'study', label: 'Study Suite', icon: BookOpen, color: 'text-amber-400' },
  ] as const

  return (
    <aside className={cn(
      "glass-panel flex flex-col transition-all duration-300 z-50",
      isCollapsed ? "w-[72px]" : "w-64"
    )}>
      {/* Header / Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              BlinkGlass
            </span>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 py-4 flex flex-col gap-2 overflow-y-auto px-2">
        <Button 
          onClick={onNewThread}
          className={cn(
            "glass-button justify-start mb-4 mx-2",
            isCollapsed && "px-0 justify-center w-10 h-10 rounded-xl"
          )}
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span>New Thread</span>}
        </Button>

        <div className="space-y-1">
          {suites.map((suite) => (
            <button
              key={suite.id}
              onClick={() => onSuiteChange(suite.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                activeSuite === suite.id 
                  ? "bg-white/10 text-white shadow-lg shadow-black/20" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <suite.icon className={cn("w-5 h-5", suite.color)} />
              {!isCollapsed && <span className="text-sm font-medium">{suite.label}</span>}
            </button>
          ))}
        </div>

        <div className="mt-8 px-3">
          {!isCollapsed && <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-1">Recent</span>}
          <div className="mt-2 space-y-1">
            {threads.slice(0, 10).map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all text-left"
              >
                <History className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="text-xs truncate">{thread.title}</span>}
              </button>
            ))}
            {threads.length === 0 && !isCollapsed && (
              <div className="px-3 py-2 text-[10px] text-zinc-600 italic">No recent threads</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-white/5">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all">
            <Settings className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-2 w-full flex items-center justify-center p-2 text-zinc-500 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}
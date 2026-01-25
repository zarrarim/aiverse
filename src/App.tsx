import { useState, useCallback } from 'react'
import { useBlinkAuth } from '@blinkdotnew/react'
import { Sidebar, SuiteType } from '@/components/layout/Sidebar'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { useThreads } from '@/hooks/useThreads'
import { Toaster } from 'sonner'
import { blink } from './lib/blink'

function App() {
  const { isAuthenticated, isLoading: authLoading } = useBlinkAuth()
  const [activeSuite, setActiveSuite] = useState<SuiteType>('search')
  const [isSidebarCollapsed, setIsCollapsed] = useState(false)
  
  const { 
    threads, 
    createThread, 
    saveMessage, 
    getThreadMessages 
  } = useThreads(activeSuite)
  
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
  const [initialMessages, setInitialMessages] = useState<any[]>([])
  const [pendingQuery, setPendingQuery] = useState<string | null>(null)
  const [pendingMode, setPendingMode] = useState<'search' | 'research'>('search')

  const handleSearchStart = async (query: string, mode: 'search' | 'research') => {
    if (!isAuthenticated) {
      blink.auth.login(window.location.href)
      return ''
    }
    
    // Create thread based on query and suite
    const thread = await createThread(query.slice(0, 50), activeSuite)
    if (thread) {
      setPendingQuery(query)
      setPendingMode(mode)
      setCurrentThreadId(thread.id)
      return thread.id
    }
    return ''
  }

  const handleMessageComplete = async (threadId: string, message: any) => {
    await saveMessage(threadId, message)
  }

  const handleNewThread = () => {
    setCurrentThreadId(null)
    setInitialMessages([])
    setPendingQuery(null)
  }

  const handleSelectThread = async (id: string) => {
    const thread = threads.find(t => t.id === id)
    if (!thread) return
    
    setActiveSuite(thread.type as SuiteType)
    const messages = await getThreadMessages(id)
    setInitialMessages(messages)
    setCurrentThreadId(id)
    setPendingQuery(null)
  }

  const handleSuiteChange = (suite: SuiteType) => {
    setActiveSuite(suite)
    handleNewThread()
  }

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-950">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 animate-pulse border border-cyan-500/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-zinc-100 selection:bg-cyan-500/30">
      <Sidebar 
        activeSuite={activeSuite}
        onSuiteChange={handleSuiteChange}
        onNewThread={handleNewThread}
        onSelectThread={handleSelectThread}
        threads={threads}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <ChatInterface 
          key={`${activeSuite}-${currentThreadId || 'new'}`}
          suiteType={activeSuite}
          threadId={currentThreadId || undefined}
          initialMessages={initialMessages}
          onSearchStart={handleSearchStart}
          onMessageComplete={handleMessageComplete}
          pendingQuery={pendingQuery}
          pendingMode={pendingMode}
          onClearPendingQuery={() => setPendingQuery(null)}
        />
      </main>
      
      <Toaster position="bottom-right" theme="dark" />
    </div>
  )
}

export default App

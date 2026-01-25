import React, { useState, useEffect, useRef } from 'react'
import { useAgent, useBlinkAuth } from '@blinkdotnew/react'
import { 
  searchAgent, 
  researchAgent, 
  codingAgent, 
  getReasoningAgent, 
  studyAgent,
  creationAgent 
} from '@/features/agents'
import { SearchBar } from './SearchBar'
import { WorkingTimeline } from './WorkingTimeline'
import { AnswerView } from './AnswerView'
import { MessageItem } from './MessageItem'
import { SuiteType } from '../layout/Sidebar'
import { SandboxPreview, NotesManager, MentalityToggle } from './SuiteSpecifics'
import { Sparkles, Brain, Code2, ImageIcon, BookOpen, Download, Maximize2 } from 'lucide-react'
import { blink } from '@/lib/blink'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import type { Sandbox } from '@blinkdotnew/sdk'

interface ChatInterfaceProps {
  suiteType: SuiteType
  threadId?: string
  initialMessages?: any[]
  onSearchStart: (query: string, mode: 'search' | 'research') => Promise<string>
  onMessageComplete: (threadId: string, message: any) => void
  pendingQuery?: string | null
  pendingMode?: 'search' | 'research'
  onClearPendingQuery?: () => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  suiteType,
  threadId,
  initialMessages = [],
  onSearchStart,
  onMessageComplete,
  pendingQuery,
  pendingMode = 'search',
  onClearPendingQuery
}) => {
  const { isAuthenticated, user } = useBlinkAuth()
  const [hasSearched, setHasSearched] = useState(initialMessages.length > 0)
  const [mode, setMode] = useState<'search' | 'research'>(pendingMode)
  const [mentality, setMentality] = useState<'logic' | 'reasoning' | 'grok'>('reasoning')
  const [isGenerating, setIsGenerating] = useState(false)
  const [sandbox, setSandbox] = useState<Sandbox | null>(null)
  
  const threadIdRef = useRef(threadId)
  const pendingQuerySentRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initialize sandbox for code suite
  useEffect(() => {
    if (suiteType === 'code' && isAuthenticated && !sandbox) {
      blink.sandbox.create({ template: 'devtools-base' }).then(setSandbox)
    }
  }, [suiteType, isAuthenticated, sandbox])

  // Determine which agent to use
  const getAgent = () => {
    switch (suiteType) {
      case 'search': return mode === 'research' ? researchAgent : searchAgent
      case 'code': return codingAgent
      case 'reasoning': return getReasoningAgent(mentality)
      case 'study': return studyAgent
      case 'creation': return creationAgent
      default: return searchAgent
    }
  }

  const { messages, isLoading, sendMessage, append } = useAgent({
    agent: getAgent(),
    stream: true,
    initialMessages,
    sandbox: sandbox || undefined,
    onFinish: (result) => {
      if (!result?.messages?.length) return
      const lastMsg = result.messages[result.messages.length - 1]
      
      if (suiteType === 'creation' && lastMsg?.role === 'assistant') {
        handleCreationTrigger(lastMsg.content)
      }

      if (threadIdRef.current) {
        onMessageComplete(threadIdRef.current, lastMsg)
      }
    }
  })

  const handleCreationTrigger = async (content: string) => {
    const isVideo = content.toLowerCase().includes('video')
    const isPhoto = content.toLowerCase().includes('photo') || content.toLowerCase().includes('image')
    
    if (!isVideo && !isPhoto) return

    const promptMatch = content.match(/optimized prompt:?\s*"(.*?)"/i) || content.match(/prompt:?\s*(.*)$/is)
    const prompt = (promptMatch ? promptMatch[1] : content).trim()

    setIsGenerating(true)
    try {
      if (isVideo) {
        toast.info('Generating video...')
        const { result } = await blink.ai.generateVideo({ prompt })
        append({
          id: `gen-${Date.now()}`,
          role: 'assistant',
          content: `Here is your generated video:`,
          parts: [{ type: 'tool-invocation', toolName: 'generateVideo', state: 'result', result: { url: result.video.url } }]
        })
      } else {
        toast.info('Generating photo...')
        const { data } = await blink.ai.generateImage({ prompt, model: 'fal-ai/nano-banana-pro' })
        append({
          id: `gen-${Date.now()}`,
          role: 'assistant',
          content: `Here is your generated photo:`,
          parts: [{ type: 'tool-invocation', toolName: 'generateImage', state: 'result', result: { url: data[0].url } }]
        })
      }
    } catch (error: any) {
      toast.error(`Generation failed: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSearch = async (query: string, searchMode: 'search' | 'research') => {
    if (!isAuthenticated) {
      blink.auth.login(window.location.href)
      return
    }

    setHasSearched(true)
    setMode(searchMode)
    
    if (!threadIdRef.current) {
      const newId = await onSearchStart(query, searchMode)
      threadIdRef.current = newId
      return
    }
    
    await sendMessage(query)
  }

  useEffect(() => {
    if (pendingQuery && !isLoading && !pendingQuerySentRef.current) {
      pendingQuerySentRef.current = true
      setHasSearched(true)
      setMode(pendingMode)
      sendMessage(pendingQuery)
      onClearPendingQuery?.()
    }
  }, [pendingQuery, isLoading, pendingMode, sendMessage, onClearPendingQuery])

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isLoading, isGenerating])

  const suiteIcons = {
    search: { icon: Sparkles, color: 'text-cyan-400', label: 'Deep Search' },
    reasoning: { icon: Brain, color: 'text-purple-400', label: 'Reasoning' },
    code: { icon: Code2, color: 'text-blue-400', label: 'Coding' },
    creation: { icon: ImageIcon, color: 'text-pink-400', label: 'Creation' },
    study: { icon: BookOpen, color: 'text-amber-400', label: 'Study Suite' },
  }

  const activeInfo = suiteIcons[suiteType]

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {!hasSearched ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto w-full animate-fade-in">
          <div className="mb-12 text-center space-y-4">
            <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl ${activeInfo.color}`}>
              <activeInfo.icon size={32} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              {suiteType === 'search' ? 'What do you want to know?' :
               suiteType === 'code' ? 'What should we build today?' :
               suiteType === 'creation' ? 'What can I create for you?' :
               suiteType === 'study' ? 'Ready to master your notes?' :
               `BlinkGlass ${activeInfo.label}`}
            </h1>
            <p className="text-zinc-500 text-lg text-glow">Experience the next generation of AI multi-tools.</p>
          </div>

          <div className="w-full space-y-4">
            {suiteType === 'reasoning' && <MentalityToggle mentality={mentality} setMentality={setMentality} />}
            {suiteType === 'study' && <NotesManager onFileProcessed={(text) => setInput(`I've uploaded a new document. Can you summarize it?`)} />}
            <SearchBar onSearch={handleSearch} isLoading={isLoading || isGenerating} suiteType={suiteType} />
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {suiteType === 'search' && [
              "History of Rome", "How to bake sourdough", "Latest AI news", "Benefits of meditation"
            ].map(q => (
              <button 
                key={q}
                onClick={() => handleSearch(q, 'search')}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-zinc-400 text-sm hover:bg-white/10 hover:text-white transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <ScrollArea ref={scrollRef} className="flex-1 w-full">
            <div className="max-w-3xl mx-auto px-4 py-8 pb-40 space-y-12">
              {messages.map((msg, i) => (
                <MessageItem key={msg.id} isUser={msg.role === 'user'}>
                  {msg.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="bg-zinc-800/50 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl max-w-[85%] text-zinc-100 shadow-xl">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <WorkingTimeline 
                        parts={msg.parts || []}
                        isComplete={i < messages.length - 1 || (!isLoading && !isGenerating)}
                        suiteType={suiteType}
                      />
                      
                      {msg.parts?.some(p => p.toolName === 'generateImage' || p.toolName === 'generateVideo') ? (
                        <div className="grid grid-cols-1 gap-4">
                          {msg.parts.filter(p => p.state === 'result').map((part, idx) => (
                            <div key={idx} className="group relative rounded-2xl overflow-hidden glass-card aspect-video sm:aspect-square flex items-center justify-center bg-black/40">
                              {part.toolName === 'generateVideo' ? (
                                <video src={part.result.url} controls className="w-full h-full object-contain" />
                              ) : (
                                <img src={part.result.url} alt="Generated" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              )}
                              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={part.result.url} download className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all">
                                  <Download size={16} />
                                </a>
                                <button className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all">
                                  <Maximize2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <AnswerView content={msg.content} />
                      )}

                      {/* Code Preview Integration */}
                      {suiteType === 'code' && i === messages.length - 1 && sandbox && (
                        <SandboxPreview sandboxId={sandbox.id} isLoading={isLoading} />
                      )}
                    </div>
                  )}
                </MessageItem>
              ))}
              
              {(isLoading || isGenerating) && messages[messages.length - 1]?.role === 'user' && (
                <MessageItem isUser={false}>
                  <WorkingTimeline parts={[]} isComplete={false} suiteType={suiteType} />
                </MessageItem>
              )}
            </div>
          </ScrollArea>
          
          <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pt-20 pb-8 px-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {suiteType === 'reasoning' && <MentalityToggle mentality={mentality} setMentality={setMentality} />}
              <SearchBar onSearch={handleSearch} isLoading={isLoading || isGenerating} suiteType={suiteType} compact />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

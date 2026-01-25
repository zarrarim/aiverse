import { useState, useEffect, useCallback } from 'react'
import { blink } from '@/lib/blink'
import { useBlinkAuth } from '@blinkdotnew/react'

export interface Thread {
  id: string
  userId: string
  title: string
  type: string
  createdAt: string
}

export interface Message {
  id: string
  threadId: string
  role: 'user' | 'assistant'
  content: string
  parts: any[]
  createdAt: string
}

export function useThreads(suiteType?: string) {
  const { user } = useBlinkAuth()
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchThreads = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const { data } = await blink.db.table('threads').list({
        where: { userId: user.id, ...(suiteType ? { type: suiteType } : {}) },
        orderBy: { createdAt: 'desc' }
      })
      setThreads(data || [])
    } catch (error) {
      console.error('Error fetching threads:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, suiteType])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  const createThread = async (title: string, type: string) => {
    if (!user) return null
    try {
      const thread = await blink.db.table('threads').create({
        userId: user.id,
        title,
        type
      })
      setThreads(prev => [thread, ...prev])
      return thread
    } catch (error) {
      console.error('Error creating thread:', error)
      return null
    }
  }

  const deleteThread = async (id: string) => {
    try {
      await blink.db.table('threads').delete({ id })
      setThreads(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error deleting thread:', error)
    }
  }

  const saveMessage = async (threadId: string, message: any) => {
    try {
      return await blink.db.table('messages').create({
        threadId,
        role: message.role,
        content: message.content,
        parts: JSON.stringify(message.parts || [])
      })
    } catch (error) {
      console.error('Error saving message:', error)
      return null
    }
  }

  const getThreadMessages = async (threadId: string) => {
    try {
      const { data } = await blink.db.table('messages').list({
        where: { threadId },
        orderBy: { createdAt: 'asc' }
      })
      return (data || []).map(m => ({
        ...m,
        parts: m.parts ? JSON.parse(m.parts) : []
      }))
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  }

  return { 
    threads, 
    isLoading, 
    createThread, 
    deleteThread, 
    saveMessage, 
    getThreadMessages,
    refreshThreads: fetchThreads
  }
}

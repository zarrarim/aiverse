import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

interface MessageItemProps {
  children: React.ReactNode
  isUser: boolean
}

export const MessageItem: React.FC<MessageItemProps> = ({ children, isUser }) => {
  const elRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (elRef.current) {
      gsap.fromTo(elRef.current,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out", delay: 0.1 }
      )
    }
  }, [])

  return (
    <div ref={elRef} className="opacity-0 w-full">
      {children}
    </div>
  )
}

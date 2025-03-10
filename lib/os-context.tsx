"use client"

import { createContext, useContext, useState, type ReactNode, useCallback } from "react"

type MessageData = any

interface OSContextType {
  sendMessage: (from: string, to: string, data: MessageData) => void
  registerMessageHandler: (appId: string, handler: (from: string, data: MessageData) => void) => void
  unregisterMessageHandler: (appId: string) => void
  dragData: { appId: string; data: any } | null
  setDragData: (data: { appId: string; data: any } | null) => void
}

const OSContext = createContext<OSContextType | undefined>(undefined)

export function OSProvider({ children }: { children: ReactNode }) {
  const [messageHandlers, setMessageHandlers] = useState<Record<string, (from: string, data: MessageData) => void>>({})
  const [dragData, setDragData] = useState<{ appId: string; data: any } | null>(null)

  const sendMessage = useCallback(
    (from: string, to: string, data: MessageData) => {
      console.log(`Message from ${from} to ${to}:`, data)
      if (messageHandlers[to]) {
        messageHandlers[to](from, data)
      }
    },
    [messageHandlers],
  )

  const registerMessageHandler = useCallback((appId: string, handler: (from: string, data: MessageData) => void) => {
    setMessageHandlers((prev) => ({
      ...prev,
      [appId]: handler,
    }))
  }, [])

  const unregisterMessageHandler = useCallback((appId: string) => {
    setMessageHandlers((prev) => {
      const newHandlers = { ...prev }
      delete newHandlers[appId]
      return newHandlers
    })
  }, [])

  return (
    <OSContext.Provider
      value={{
        sendMessage,
        registerMessageHandler,
        unregisterMessageHandler,
        dragData,
        setDragData,
      }}
    >
      {children}
    </OSContext.Provider>
  )
}

export function useOS() {
  const context = useContext(OSContext)
  if (context === undefined) {
    throw new Error("useOS must be used within an OSProvider")
  }
  return context
}


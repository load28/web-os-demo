"use client"

import { useEffect, useRef } from "react"
import { useOS } from "./os-context"

export function useOSCommunication(appId: string, onMessage: (from: string, data: any) => void) {
  const { registerMessageHandler, unregisterMessageHandler, sendMessage } = useOS()
  const onMessageRef = useRef(onMessage)

  // Update the ref when onMessage changes
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  // Register/unregister the message handler
  useEffect(() => {
    // Use a stable wrapper function that uses the ref
    const handleMessage = (from: string, data: any) => {
      onMessageRef.current(from, data)
    }

    registerMessageHandler(appId, handleMessage)

    return () => {
      unregisterMessageHandler(appId)
    }
  }, [appId, registerMessageHandler, unregisterMessageHandler])

  const sendToApp = (toAppId: string, data: any) => {
    sendMessage(appId, toAppId, data)
  }

  return { sendToApp }
}


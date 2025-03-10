"use client"

import { type ReactNode, useCallback } from "react"
import { useDrop } from "react-dnd"
import { useOS } from "@/lib/os-context"
import type { Ref } from "react"

interface DroppableAreaProps {
  appId: string
  onDrop: (data: any) => void
  children: ReactNode
  className?: string
}

export function DroppableArea({ appId, onDrop, children, className = "" }: DroppableAreaProps) {
  const { dragData, sendMessage } = useOS()

  const handleDrop = useCallback(
    (item: { appId: string; itemId: string; data: any }) => {
      if (item.appId !== appId) {
        // Send message to the source app that its item was dropped
        sendMessage(appId, item.appId, {
          type: "ITEM_DROPPED",
          itemId: item.itemId,
          targetAppId: appId,
        })

        // Handle the drop in this app
        onDrop(item.data)
      }
      return { appId }
    },
    [appId, onDrop, sendMessage],
  )

  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: "OS_DRAGGABLE_ITEM",
      drop: handleDrop,
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [handleDrop],
  )

  return (
    <div
      ref={dropRef as unknown as Ref<HTMLDivElement>}
      className={`${className} ${isOver && canDrop ? "bg-blue-100/50 ring-2 ring-blue-300" : ""}`}
    >
      {children}
    </div>
  )
}


"use client"

import { type ReactNode, useCallback } from "react"
import { useDrag } from "react-dnd"
import { useOS } from "@/lib/os-context"
import type { Ref } from "react"

interface DraggableItemProps {
  appId: string
  itemId: string
  data: any
  children: ReactNode
}

export function DraggableItem({ appId, itemId, data, children }: DraggableItemProps) {
  const { setDragData } = useOS()

  const beginDrag = useCallback(() => {
    setDragData({ appId, data: { itemId, ...data } })
    return { appId, itemId, data }
  }, [appId, itemId, data, setDragData])

  const endDrag = useCallback(() => {
    setDragData(null)
  }, [setDragData])

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: "OS_DRAGGABLE_ITEM",
      item: beginDrag,
      end: endDrag,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [beginDrag, endDrag],
  )

  return (
    <div
      ref={dragRef as unknown as Ref<HTMLDivElement>}
      className={`cursor-grab ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      {children}
    </div>
  )
}


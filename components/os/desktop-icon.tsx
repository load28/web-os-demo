"use client"

import { useDrag } from "react-dnd"
import * as LucideIcons from "lucide-react"
import type { ComponentType } from "react"
import type { Ref } from "react"

interface DesktopIconProps {
  appId: string
  name: string
  icon: string
  onClick: () => void
}

export function DesktopIcon({ appId, name, icon, onClick }: DesktopIconProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "DESKTOP_ICON",
    item: { appId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  // Dynamically get the icon component with explicit typing
  const IconComponent = (LucideIcons[icon as keyof typeof LucideIcons] || LucideIcons.Box) as ComponentType<any>

  return (
    <div
      ref={dragRef as unknown as Ref<HTMLDivElement>}
      className={`flex flex-col items-center justify-center gap-1 p-2 rounded cursor-pointer hover:bg-blue-100/50 ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm">
        <IconComponent className="w-6 h-6 text-blue-600" />
      </div>
      <span className="text-xs font-medium text-center text-gray-800">{name}</span>
    </div>
  )
}


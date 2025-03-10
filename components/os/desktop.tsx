"use client"

import type { AppManifest } from "@/lib/types"
import { DesktopIcon } from "./desktop-icon"

interface DesktopProps {
  availableApps: AppManifest[]
  onLaunchApp: (appId: string) => void
}

export default function Desktop({ availableApps, onLaunchApp }: DesktopProps) {
  return (
    <div className="absolute inset-0 p-4 grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] auto-rows-[80px] gap-4">
      {availableApps.map((app) => (
        <DesktopIcon key={app.id} appId={app.id} name={app.name} icon={app.icon} onClick={() => onLaunchApp(app.id)} />
      ))}
    </div>
  )
}


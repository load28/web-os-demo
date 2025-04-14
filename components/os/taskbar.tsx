"use client";

import { useAppUiContext } from "@/lib/app-ui-context";
import * as LucideIcons from "lucide-react";
import type { ComponentType } from "react";

export default function Taskbar() {
  const [{ openApps, activeApp, availableApps, launchApp, activateApp }] =
    useAppUiContext([
      "openApps",
      "activeApp",
      "availableApps",
      "launchApp",
      "activateApp",
    ]);

  return (
    <div className="flex items-center h-12 px-2 bg-gray-800 border-t border-gray-700">
      <div className="flex items-center gap-1">
        {availableApps.map((app) => {
          const isOpen = openApps.includes(app.id);
          const isActive = activeApp === app.id;

          // Dynamically get the icon component with explicit typing
          const IconComponent = (LucideIcons[
            app.icon as keyof typeof LucideIcons
          ] || LucideIcons.Box) as ComponentType<any>;

          return (
            <button
              key={app.id}
              className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : isOpen
                  ? "bg-gray-700 text-white"
                  : "bg-transparent text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => (isOpen ? activateApp(app.id) : launchApp(app.id))}
            >
              <IconComponent className="w-5 h-5" />
            </button>
          );
        })}
      </div>
      <div className="ml-auto text-xs text-gray-400 px-2">Next.js 14.2.23</div>
    </div>
  );
}

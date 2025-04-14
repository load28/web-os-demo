"use client";

import { useAppUiContext } from "@/lib/app-ui-context";
import { DesktopIcon } from "./desktop-icon";

export default function Desktop() {
  const [{ availableApps, launchApp }] = useAppUiContext([
    "availableApps",
    "launchApp",
  ]);

  return (
    <div className="absolute inset-0 p-4 grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] auto-rows-[80px] gap-4">
      {availableApps.map((app) => (
        <DesktopIcon
          key={app.id}
          appId={app.id}
          name={app.name}
          icon={app.icon}
          onClick={() => launchApp(app.id)}
        />
      ))}
    </div>
  );
}

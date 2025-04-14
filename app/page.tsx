"use client";

import { Main } from "@/components/os/main";
import { AppProvider } from "@/lib/app-context";
import { AppUiProvider } from "@/lib/app-ui-context";
import { OSProvider } from "@/lib/os-context";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function Home() {
  return (
    <DndProvider backend={HTML5Backend}>
      <OSProvider>
        <AppProvider>
          <AppUiProvider>
            <Main />
          </AppUiProvider>
        </AppProvider>
      </OSProvider>
    </DndProvider>
  );
}

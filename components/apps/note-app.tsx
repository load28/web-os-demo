"use client"

import { useState, useCallback, useTransition } from "react"
import { useOSCommunication } from "@/lib/use-os-communication"
import { DraggableItem } from "@/components/os/draggable-item"
import { DroppableArea } from "@/components/os/droppable-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { saveNote } from "@/app/actions"

export default function NoteApp() {
  const [notes, setNotes] = useState<{ id: string; content: string }[]>([])
  const [currentNote, setCurrentNote] = useState("")
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleMessage = useCallback((from: string, data: any) => {
    if (data.type === "ADD_NOTE" && data.content) {
      setNotes((prevNotes) => [
        ...prevNotes,
        {
          id: `note-${Date.now()}`,
          content: data.content,
        },
      ])
    } else if (data.type === "ITEM_DROPPED") {
      console.log("Note was dropped on another app:", data)
    }
  }, [])

  const { sendToApp } = useOSCommunication("note-app", handleMessage)

  const addNote = () => {
    if (currentNote.trim()) {
      const newNote = {
        id: `note-${Date.now()}`,
        content: currentNote,
      }

      // Using useTransition for server actions in Next.js 14.2.x
      startTransition(async () => {
        try {
          const result = await saveNote(currentNote)
          if (result.success) {
            setSaveStatus(`저장됨: ${result.timestamp}`)
            setNotes((prev) => [...prev, newNote])
            setCurrentNote("")
          } else {
            setSaveStatus(`저장 실패: ${result.error}`)
            // Still add to UI for better UX
            setNotes((prev) => [...prev, newNote])
            setCurrentNote("")
          }
        } catch (error) {
          console.error("노트 저장 실패:", error)
          // 서버 액션이 실패해도 UI에는 추가
          setNotes((prev) => [...prev, newNote])
          setCurrentNote("")
          setSaveStatus("오프라인 모드: 로컬에만 저장됨")
        }
      })
    }
  }

  const handleDrop = (data: any) => {
    if (data.type === "TODO_ITEM") {
      const newNote = {
        id: `note-${Date.now()}`,
        content: `Todo: ${data.text}`,
      }
      setNotes((prev) => [...prev, newNote])
    }
  }

  const sendNoteToTodo = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId)
    if (note) {
      sendToApp("todo-app", {
        type: "ADD_TODO",
        text: note.content,
      })
    }
  }

  return (
    <DroppableArea appId="note-app" onDrop={handleDrop} className="flex flex-col h-full p-4 text-gray-800">
      <div className="flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Notes</h2>
          {saveStatus && <p className="text-xs text-gray-500">{saveStatus}</p>}
        </div>

        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <DraggableItem appId="note-app" itemId={note.id} data={{ type: "NOTE", content: note.content }}>
                <div className="flex justify-between">
                  <p className="text-sm">{note.content}</p>
                  <Button size="sm" variant="ghost" onClick={() => sendNoteToTodo(note.id)} className="ml-2 h-6 w-6">
                    <Send className="h-3 w-3" />
                    <span className="sr-only">Send to Todo</span>
                  </Button>
                </div>
              </DraggableItem>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Textarea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          placeholder="새 노트 작성..."
          className="flex-1 min-h-[80px]"
          disabled={isPending}
        />
        <Button onClick={addNote} className="self-end" disabled={isPending}>
          {isPending ? "저장 중..." : "추가"}
        </Button>
      </div>
    </DroppableArea>
  )
}


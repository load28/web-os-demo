"use client"

import { useState, useCallback, useTransition } from "react"
import { useOSCommunication } from "@/lib/use-os-communication"
import { DraggableItem } from "@/components/os/draggable-item"
import { DroppableArea } from "@/components/os/droppable-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Send, Trash } from "lucide-react"
import { saveTodo } from "@/app/actions"

interface TodoItem {
  id: string
  text: string
  completed: boolean
}

export default function TodoApp() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleMessage = useCallback((from: string, data: any) => {
    if (data.type === "ADD_TODO" && data.text) {
      setTodos((prevTodos) => [
        ...prevTodos,
        {
          id: `todo-${Date.now()}`,
          text: data.text,
          completed: false,
        },
      ])
    } else if (data.type === "ITEM_DROPPED") {
      console.log("Todo was dropped on another app:", data)
    }
  }, [])

  const { sendToApp } = useOSCommunication("todo-app", handleMessage)

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem = {
        id: `todo-${Date.now()}`,
        text: newTodo,
        completed: false,
      }

      // Using useTransition for server actions in Next.js 14.2.x
      startTransition(async () => {
        try {
          const result = await saveTodo(newTodo)
          if (result.success) {
            setSaveStatus(`저장됨: ${result.timestamp}`)
            setTodos((prev) => [...prev, newTodoItem])
            setNewTodo("")
          } else {
            setSaveStatus(`저장 실패: ${result.error}`)
            // Still add to UI for better UX
            setTodos((prev) => [...prev, newTodoItem])
            setNewTodo("")
          }
        } catch (error) {
          console.error("할 일 저장 실패:", error)
          // 서버 액션이 실패해도 UI에는 추가
          setTodos((prev) => [...prev, newTodoItem])
          setNewTodo("")
          setSaveStatus("오프라인 모드: 로컬에만 저장됨")
        }
      })
    }
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const sendTodoToNote = (todoId: string) => {
    const todo = todos.find((t) => t.id === todoId)
    if (todo) {
      sendToApp("note-app", {
        type: "ADD_NOTE",
        content: `할 일: ${todo.text} (${todo.completed ? "완료" : "진행 중"})`,
      })
    }
  }

  const handleDrop = (data: any) => {
    if (data.type === "NOTE") {
      const newTodoItem = {
        id: `todo-${Date.now()}`,
        text: data.content,
        completed: false,
      }
      setTodos((prev) => [...prev, newTodoItem])
    }
  }

  return (
    <DroppableArea appId="todo-app" onDrop={handleDrop} className="flex flex-col h-full p-4 text-gray-800">
      <div className="flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">할 일 목록</h2>
          {saveStatus && <p className="text-xs text-gray-500">{saveStatus}</p>}
        </div>

        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`p-2 border rounded-md flex items-center justify-between ${
                todo.completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300"
              }`}
            >
              <DraggableItem
                appId="todo-app"
                itemId={todo.id}
                data={{ type: "TODO_ITEM", text: todo.text, completed: todo.completed }}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    id={`todo-${todo.id}`}
                  />
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={`text-sm ${todo.completed ? "line-through text-gray-500" : ""}`}
                  >
                    {todo.text}
                  </label>
                </div>
              </DraggableItem>

              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => sendTodoToNote(todo.id)} className="h-6 w-6">
                  <Send className="h-3 w-3" />
                  <span className="sr-only">노트로 보내기</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteTodo(todo.id)} className="h-6 w-6 text-red-500">
                  <Trash className="h-3 w-3" />
                  <span className="sr-only">삭제</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="새 할 일 추가..."
          className="flex-1"
          disabled={isPending}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTodo()
            }
          }}
        />
        <Button onClick={addTodo} disabled={isPending}>
          {isPending ? "저장 중..." : "추가"}
        </Button>
      </div>
    </DroppableArea>
  )
}


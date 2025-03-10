"use server"

// Note app server actions
export async function saveNote(note: string) {
  console.log("서버에 노트 저장:", note)
  // In Next.js 14.2.x, we should use structured responses
  try {
    // Simulate database operation
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { success: true, timestamp: new Date().toISOString() }
  } catch (error) {
    console.error("Error saving note:", error)
    return { success: false, error: "Failed to save note" }
  }
}

// Todo app server actions
export async function saveTodo(text: string) {
  console.log("서버에 할 일 저장:", text)
  // In Next.js 14.2.x, we should use structured responses
  try {
    // Simulate database operation
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { success: true, timestamp: new Date().toISOString() }
  } catch (error) {
    console.error("Error saving todo:", error)
    return { success: false, error: "Failed to save todo" }
  }
}


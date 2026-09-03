import { ref } from 'vue'

export function useChat() {
  const isChatOpen = ref(false)
  const unreadCount = ref(0)
  
  function toggleChat() {
    isChatOpen.value = !isChatOpen.value
  }
  
  function openChat() {
    isChatOpen.value = true
  }
  
  function closeChat() {
    isChatOpen.value = false
  }
  
  function markAsRead() {
    unreadCount.value = 0
  }
  
  return {
    isChatOpen,
    unreadCount,
    toggleChat,
    openChat,
    closeChat,
    markAsRead
  }
}

"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Send, Home } from "lucide-react"

interface Message {
  _id: string
  sender: {
    _id: string
    firstName: string
    lastName: string
    email: string
    profileImage?: string
  }
  receiver: {
    _id: string
    firstName: string
    lastName: string
    email: string
    profileImage?: string
  }
  property?: {
    _id: string
    title: string
    images: string[]
  }
  content: string
  isRead: boolean
  createdAt: string
}

interface Conversation {
  userId: string
  name: string
  profileImage?: string
  lastMessage: string
  lastMessageDate: string
  unreadCount: number
}

export default function MessagesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push("/auth/login?callbackUrl=/messages")
      return
    }

    // Fetch conversations
    if (user) {
      fetchConversations()
    }
  }, [user, loading, router])

  useEffect(() => {
    // Fetch messages when a conversation is selected
    if (selectedUserId) {
      fetchMessages(selectedUserId)
    }
  }, [selectedUserId])

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/messages")

      if (!response.ok) {
        throw new Error("Failed to fetch conversations")
      }

      const data = await response.json()

      // Process messages to get unique conversations
      const conversationsMap = new Map<string, Conversation>()

      data.forEach((message: Message) => {
        const otherUser = message.sender._id === user?.id ? message.receiver : message.sender
        const userId = otherUser._id

        if (!conversationsMap.has(userId)) {
          conversationsMap.set(userId, {
            userId,
            name: `${otherUser.firstName} ${otherUser.lastName}`,
            profileImage: otherUser.profileImage,
            lastMessage: message.content,
            lastMessageDate: message.createdAt,
            unreadCount: message.isRead || message.sender._id === user?.id ? 0 : 1,
          })
        } else {
          const existing = conversationsMap.get(userId)!
          const messageDate = new Date(message.createdAt)
          const existingDate = new Date(existing.lastMessageDate)

          if (messageDate > existingDate) {
            existing.lastMessage = message.content
            existing.lastMessageDate = message.createdAt

            if (!message.isRead && message.sender._id !== user?.id) {
              existing.unreadCount += 1
            }
          } else if (!message.isRead && message.sender._id !== user?.id) {
            existing.unreadCount += 1
          }
        }
      })

      setConversations(Array.from(conversationsMap.values()))

      // Select the first conversation if none is selected
      if (!selectedUserId && conversationsMap.size > 0) {
        setSelectedUserId(Array.from(conversationsMap.keys())[0])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (otherUserId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/messages?otherUserId=${otherUserId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }

      const data = await response.json()
      setMessages(data)

      // Mark messages as read
      markMessagesAsRead(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const markMessagesAsRead = async (messages: Message[]) => {
    try {
      const unreadMessages = messages.filter((message) => !message.isRead && message.sender._id !== user?.id)

      if (unreadMessages.length === 0) return

      // Update local state first
      setMessages((prev) =>
        prev.map((message) =>
          !message.isRead && message.sender._id !== user?.id ? { ...message, isRead: true } : message,
        ),
      )

      // Update conversations unread count
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.userId === selectedUserId ? { ...conversation, unreadCount: 0 } : conversation,
        ),
      )

      // Call API to mark messages as read
      for (const message of unreadMessages) {
        await fetch(`/api/messages/${message._id}/read`, {
          method: "PUT",
        })
      }
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserId || !newMessage.trim()) return

    try {
      setIsSending(true)

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver: selectedUserId,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const sentMessage = await response.json()

      // Add the new message to the list
      setMessages((prev) => [...prev, sentMessage])

      // Update the conversation
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.userId === selectedUserId
            ? {
                ...conversation,
                lastMessage: newMessage,
                lastMessageDate: new Date().toISOString(),
              }
            : conversation,
        ),
      )

      // Clear the input
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "long" })
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading || (isLoading && !selectedUserId)) {
    return <MessagesSkeleton />
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="md:col-span-1">
          <Card className="h-[600px] flex flex-col">
            <CardContent className="p-4 flex-1 overflow-y-auto">
              <h2 className="font-semibold text-lg mb-4">Conversations</h2>

              {conversations.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.userId}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUserId === conversation.userId
                          ? "bg-emerald-50 border-emerald-200 border"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                      onClick={() => setSelectedUserId(conversation.userId)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {conversation.profileImage ? (
                            <Image
                              src={conversation.profileImage || "/placeholder.svg"}
                              alt={conversation.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full text-gray-500">
                              {conversation.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium truncate">{conversation.name}</h3>
                            <span className="text-xs text-gray-500">{formatDate(conversation.lastMessageDate)}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages */}
        <div className="md:col-span-2">
          <Card className="h-[600px] flex flex-col">
            {selectedUserId && conversations.length > 0 ? (
              <>
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                      {conversations.find((c) => c.userId === selectedUserId)?.profileImage ? (
                        <Image
                          src={conversations.find((c) => c.userId === selectedUserId)?.profileImage || ""}
                          alt={conversations.find((c) => c.userId === selectedUserId)?.name || ""}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-gray-500">
                          {conversations.find((c) => c.userId === selectedUserId)?.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{conversations.find((c) => c.userId === selectedUserId)?.name}</h3>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-gray-500">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser = message.sender._id === user?.id

                      return (
                        <div key={message._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isCurrentUser ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {message.property && (
                              <div className="mb-2 p-2 bg-white bg-opacity-20 rounded">
                                <div className="flex items-center space-x-2">
                                  <Home className="h-4 w-4" />
                                  <span className="text-sm font-medium">{message.property.title}</span>
                                </div>
                              </div>
                            )}
                            <p>{message.content}</p>
                            <div className={`text-xs mt-1 ${isCurrentUser ? "text-emerald-100" : "text-gray-500"}`}>
                              {formatDate(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                    />
                    <Button type="submit" disabled={!newMessage.trim() || isSending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h3 className="font-medium mb-2">No conversation selected</h3>
                  <p className="text-gray-500">
                    {conversations.length === 0
                      ? "You don't have any messages yet"
                      : "Select a conversation to view messages"}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function MessagesSkeleton() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-[600px]">
            <CardContent className="p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <div className="p-4 border-b">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex-1 p-4">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-3/4" style={{ marginLeft: i % 2 === 0 ? 0 : "auto" }} />
                ))}
              </div>
            </div>
            <div className="p-4 border-t">
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

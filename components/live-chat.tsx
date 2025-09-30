'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Smile, 
  Settings, 
  Volume2, 
  VolumeX, 
  Users, 
  MessageCircle,
  Heart,
  Music,
  Star,
  Zap,
  Coffee,
  ThumbsUp,
  Flame,
  Crown,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  Headphones,
  X
} from 'lucide-react'

interface ChatMessage {
  id: string
  user: {
    id: string
    name: string
    avatar: string
    role: 'listener' | 'moderator' | 'dj' | 'vip'
    color: string
  }
  message: string
  timestamp: Date
  type: 'message' | 'reaction' | 'system' | 'song_request'
  reactions?: { emoji: string; count: number; users: string[] }[]
  isHighlighted?: boolean
  replyTo?: string
}

interface LiveChatProps {
  isVisible?: boolean
  onToggle?: () => void
  currentTrack?: {
    title: string
    artist: string
  }
}

export default function LiveChat({ isVisible = false, onToggle, currentTrack }: LiveChatProps) {
  const [chatVisible, setChatVisible] = useState(isVisible)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [isTyping, setIsTyping] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const emojis = ['😀', '😂', '❤️', '🎵', '🎶', '🔥', '👏', '🎉', '⭐', '☕', '👍', '⚡']
  
  const quickReactions = [
    { emoji: '❤️', icon: Heart, label: 'Love' },
    { emoji: '🎵', icon: Music, label: 'Music' },
    { emoji: '🔥', icon: Flame, label: 'Fire' },
    { emoji: '⭐', icon: Star, label: 'Star' },
    { emoji: '👏', icon: ThumbsUp, label: 'Clap' },
    { emoji: '⚡', icon: Zap, label: 'Energy' }
  ]

  // Initialize with sample messages
  useEffect(() => {
    const sampleMessages: ChatMessage[] = [
      {
        id: '1',
        user: {
          id: 'dj1',
          name: 'DJ Alex',
          avatar: '#8B5CF6',
          role: 'dj',
          color: '#8B5CF6'
        },
        message: 'Welcome to the live stream! 🎵',
        timestamp: new Date(Date.now() - 300000),
        type: 'system',
        isHighlighted: true
      },
      {
        id: '2',
        user: {
          id: 'user1',
          name: 'MusicLover92',
          avatar: '#EF4444',
          role: 'vip',
          color: '#EF4444'
        },
        message: 'This track is amazing! 🔥',
        timestamp: new Date(Date.now() - 240000),
        type: 'message',
        reactions: [
          { emoji: '🔥', count: 5, users: ['user2', 'user3', 'user4', 'user5', 'user6'] },
          { emoji: '👏', count: 3, users: ['user7', 'user8', 'user9'] }
        ]
      },
      {
        id: '3',
        user: {
          id: 'user2',
          name: 'BeatMaster',
          avatar: '#10B981',
          role: 'listener',
          color: '#10B981'
        },
        message: 'Can you play some electronic music next?',
        timestamp: new Date(Date.now() - 180000),
        type: 'song_request'
      },
      {
        id: '4',
        user: {
          id: 'mod1',
          name: 'ModeratorSarah',
          avatar: '#F59E0B',
          role: 'moderator',
          color: '#F59E0B'
        },
        message: 'Remember to keep the chat friendly and respectful! 😊',
        timestamp: new Date(Date.now() - 120000),
        type: 'message'
      }
    ]
    
    setMessages(sampleMessages)
    setUserCount(127)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulate new messages
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomUsers = [
          { id: 'user' + Math.random(), name: 'RadioFan' + Math.floor(Math.random() * 100), avatar: '#3B82F6', role: 'listener' as const, color: '#3B82F6' },
          { id: 'user' + Math.random(), name: 'MusicNinja' + Math.floor(Math.random() * 100), avatar: '#EC4899', role: 'listener' as const, color: '#EC4899' },
          { id: 'user' + Math.random(), name: 'BeatLover' + Math.floor(Math.random() * 100), avatar: '#06B6D4', role: 'vip' as const, color: '#06B6D4' }
        ]
        
        const randomMessages = [
          'This is my favorite song! 🎵',
          'Great music selection! 👏',
          'Love this vibe ❤️',
          'Can\'t stop dancing! 💃',
          'Perfect for my morning! ☕',
          'This beat is incredible! 🔥',
          'More like this please! ⭐',
          'Amazing mix! 🎶'
        ]

        const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)]
        const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)]

        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          user: randomUser,
          message: randomMessage,
          timestamp: new Date(),
          type: 'message'
        }

        setMessages(prev => [...prev.slice(-49), newMsg])
        setUserCount(prev => prev + Math.floor(Math.random() * 3) - 1)
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [isConnected])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: {
        id: 'current-user',
        name: 'You',
        avatar: '#8B5CF6',
        role: 'listener',
        color: '#8B5CF6'
      },
      message: newMessage.trim(),
      timestamp: new Date(),
      type: newMessage.includes('request:') ? 'song_request' : 'message'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    inputRef.current?.focus()
  }

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojis(false)
    inputRef.current?.focus()
  }

  const handleQuickReaction = (emoji: string) => {
    const reactionMessage: ChatMessage = {
      id: Date.now().toString(),
      user: {
        id: 'current-user',
        name: 'You',
        avatar: '#8B5CF6',
        role: 'listener',
        color: '#8B5CF6'
      },
      message: emoji,
      timestamp: new Date(),
      type: 'reaction'
    }

    setMessages(prev => [...prev, reactionMessage])
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'dj': return <Crown className="h-3 w-3 text-yellow-500" />
      case 'moderator': return <Shield className="h-3 w-3 text-blue-500" />
      case 'vip': return <Star className="h-3 w-3 text-purple-500" />
      default: return null
    }
  }

  const getRoleBadge = (role: string) => {
    const badges = {
      dj: { label: 'DJ', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      moderator: { label: 'MOD', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      vip: { label: 'VIP', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      listener: { label: '', className: '' }
    }
    
    const badge = badges[role as keyof typeof badges] || badges.listener
    if (!badge.label) return null
    
    return (
      <Badge variant="secondary" className={`text-xs px-1 py-0 ${badge.className}`}>
        {badge.label}
      </Badge>
    )
  }

  if (!chatVisible) {
    return (
      <Button
        onClick={() => setChatVisible(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg"
        size="sm"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] sm:w-96">
      <Card className="h-96 flex flex-col bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Chat en Vivo</h3>
            <Badge variant="secondary" className="text-xs">
              {messages.length}
            </Badge>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChatVisible(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {/* Current Track Info */}
          {currentTrack && (
            <div className="px-3 py-2 bg-primary/5 border-b border-border/30 mb-2">
              <div className="flex items-center gap-2 text-xs">
                <Music className="h-3 w-3 text-primary" />
                <span className="text-foreground font-medium truncate">
                  {currentTrack.title} - {currentTrack.artist}
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
          <div
            key={msg.id}
            className={`group ${msg.isHighlighted ? 'bg-primary/5 -mx-1 px-1 py-1 rounded' : ''}`}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-0.5"
                style={{ backgroundColor: msg.user.avatar }}
              >
                {msg.user.name.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <span 
                    className="text-xs font-medium truncate"
                    style={{ color: msg.user.color }}
                  >
                    {msg.user.name}
                  </span>
                  {getRoleIcon(msg.user.role)}
                  {getRoleBadge(msg.user.role)}
                  <span className="text-xs text-muted-foreground">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className={`text-sm ${
                  msg.type === 'reaction' ? 'text-2xl' : 
                  msg.type === 'system' ? 'text-muted-foreground italic' :
                  msg.type === 'song_request' ? 'text-primary' : 'text-foreground'
                }`}>
                  {msg.type === 'song_request' && <Music className="h-3 w-3 inline mr-1" />}
                  {msg.message}
                </div>
                
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {msg.reactions.map((reaction, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1 text-xs hover:bg-muted/50"
                      >
                        <span className="mr-1">{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>{isTyping.join(', ')} {isTyping.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reactions */}
      <div className="px-3 py-2 border-t border-border/30 bg-muted/10">
        <div className="flex items-center gap-1 overflow-x-auto">
          {quickReactions.map((reaction, idx) => (
            <Button
              key={idx}
              variant="ghost"
              size="sm"
              onClick={() => handleQuickReaction(reaction.emoji)}
              className="h-6 px-2 text-xs hover:bg-primary/10 flex-shrink-0"
              title={reaction.label}
            >
              <span className="text-sm">{reaction.emoji}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isConnected ? "Type a message..." : "Disconnected"}
              disabled={!isConnected}
              className="pr-8 text-sm"
              maxLength={200}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojis(!showEmojis)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
            >
              <Smile className="h-3 w-3" />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>

        {/* Emoji Picker */}
        {showEmojis && (
          <div className="absolute bottom-full mb-2 left-3 right-3 bg-popover border border-border rounded-lg p-2 shadow-lg z-10">
            <div className="grid grid-cols-6 gap-1">
              {emojis.map((emoji, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEmojiClick(emoji)}
                  className="h-8 w-8 p-0 hover:bg-muted/50"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Character Count */}
        <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
          <span>Tip: Use "request: song name" for song requests</span>
          <span>{newMessage.length}/200</span>
        </div>
      </div>
    </Card>
  </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  TrendingUp, 
  Users, 
  Clock,
  Star,
  Award,
  Zap,
  Target,
  BarChart3,
  ThumbsUp
} from 'lucide-react'

interface Track {
  id: string
  title: string
  artist: string
  likes: number
  isLiked: boolean
  likedAt?: Date
}

interface LikeSystemProps {
  currentTrack?: {
    id?: string
    title: string
    artist: string
    album?: string
  }
  onLike?: (trackId: string, isLiked: boolean) => void
}

export default function LikeSystem({ currentTrack, onLike }: LikeSystemProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [totalLikes, setTotalLikes] = useState(0)
  const [streak, setStreak] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showStats, setShowStats] = useState(false)

  // Initialize with some sample data
  useEffect(() => {
    const sampleTracks: Track[] = [
      {
        id: 'track-1',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        likes: 1247,
        isLiked: true,
        likedAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: 'track-2',
        title: 'Hotel California',
        artist: 'Eagles',
        likes: 892,
        isLiked: false
      },
      {
        id: 'track-3',
        title: 'Imagine',
        artist: 'John Lennon',
        likes: 1156,
        isLiked: true,
        likedAt: new Date(Date.now() - 172800000) // 2 days ago
      }
    ]
    
    setTracks(sampleTracks)
    setTotalLikes(sampleTracks.reduce((sum, track) => sum + track.likes, 0))
    setStreak(sampleTracks.filter(track => track.isLiked).length)
  }, [])

  const handleLike = (trackId: string) => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600)

    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        const newIsLiked = !track.isLiked
        const newLikes = newIsLiked ? track.likes + 1 : track.likes - 1
        
        if (newIsLiked) {
          setStreak(prev => prev + 1)
          setTotalLikes(prev => prev + 1)
        } else {
          setStreak(prev => Math.max(0, prev - 1))
          setTotalLikes(prev => prev - 1)
        }

        onLike?.(trackId, newIsLiked)

        return {
          ...track,
          isLiked: newIsLiked,
          likes: newLikes,
          likedAt: newIsLiked ? new Date() : undefined
        }
      }
      return track
    }))
  }

  const getCurrentTrackData = () => {
    if (!currentTrack?.id) return null
    return tracks.find(track => track.id === currentTrack.id)
  }

  const currentTrackData = getCurrentTrackData()
  const likedTracks = tracks.filter(track => track.isLiked)
  const topTrack = tracks.reduce((max, track) => track.likes > max.likes ? track : max, tracks[0])

  const getStreakBadge = () => {
    if (streak >= 10) return { icon: Award, color: 'text-yellow-500', label: 'Music Lover' }
    if (streak >= 5) return { icon: Star, color: 'text-blue-500', label: 'Fan' }
    if (streak >= 3) return { icon: ThumbsUp, color: 'text-green-500', label: 'Enthusiast' }
    return { icon: Heart, color: 'text-red-500', label: 'Listener' }
  }

  const streakBadge = getStreakBadge()

  return (
    <Card className={`p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-primary/10 transition-all duration-300 ${isAnimating ? 'animate-pulse' : ''}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground transition-colors duration-500 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Like System
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="text-xs"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            {showStats ? 'Hide' : 'Stats'}
          </Button>
        </div>

        {/* Current Track Like Button */}
        {currentTrack && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{currentTrack.title}</p>
                <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
                {currentTrackData && (
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {currentTrackData.likes.toLocaleString()} likes
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant={currentTrackData?.isLiked ? "default" : "outline"}
                size="lg"
                onClick={() => currentTrack.id && handleLike(currentTrack.id)}
                className={`relative overflow-hidden transition-all duration-300 ${
                  currentTrackData?.isLiked 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 hover:border-red-500'
                }`}
              >
                <Heart 
                  className={`h-5 w-5 transition-all duration-300 ${
                    currentTrackData?.isLiked ? 'fill-current scale-110' : ''
                  }`} 
                />
                {isAnimating && (
                  <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-md"></div>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* User Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/30">
            <div className="flex items-center justify-center mb-1">
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-lg font-bold text-foreground">{likedTracks.length}</p>
            <p className="text-xs text-muted-foreground">Liked</p>
          </div>
          
          <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/30">
            <div className="flex items-center justify-center mb-1">
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-lg font-bold text-foreground">{streak}</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          
          <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/30">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-bold text-foreground">{totalLikes.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          
          <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/30">
            <div className="flex items-center justify-center mb-1">
              <streakBadge.icon className={`h-4 w-4 ${streakBadge.color}`} />
            </div>
            <p className="text-xs font-medium text-foreground">{streakBadge.label}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
        </div>

        {/* Achievement Badge */}
        {streak > 0 && (
          <div className="flex items-center justify-center">
            <Badge 
              variant="secondary" 
              className={`${streakBadge.color} bg-opacity-10 border-current`}
            >
              <streakBadge.icon className="h-3 w-3 mr-1" />
              {streakBadge.label} • {streak} likes
            </Badge>
          </div>
        )}

        {/* Detailed Stats */}
        {showStats && (
          <div className="space-y-3 pt-3 border-t border-border/30">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Your Activity
            </h4>
            
            {/* Top Liked Track */}
            {topTrack && (
              <div className="p-3 bg-muted/20 rounded-lg border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">Most Popular</span>
                </div>
                <p className="text-sm text-foreground">{topTrack.title}</p>
                <p className="text-xs text-muted-foreground">{topTrack.artist} • {topTrack.likes.toLocaleString()} likes</p>
              </div>
            )}

            {/* Recent Likes */}
            {likedTracks.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recently Liked
                </h5>
                {likedTracks
                  .filter(track => track.likedAt)
                  .sort((a, b) => (b.likedAt?.getTime() || 0) - (a.likedAt?.getTime() || 0))
                  .slice(0, 3)
                  .map(track => (
                    <div key={track.id} className="flex items-center gap-2 text-xs">
                      <Heart className="h-3 w-3 text-red-500 fill-current" />
                      <span className="text-foreground truncate flex-1">
                        {track.title} - {track.artist}
                      </span>
                      {track.likedAt && (
                        <span className="text-muted-foreground">
                          {Math.floor((Date.now() - track.likedAt.getTime()) / 86400000)}d ago
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Motivational Message */}
        <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border/30">
          {streak === 0 && "Start liking tracks to build your streak! 🎵"}
          {streak > 0 && streak < 5 && "Keep going! You're building a great music taste 🎶"}
          {streak >= 5 && streak < 10 && "Amazing! You're a true music fan 🌟"}
          {streak >= 10 && "Incredible! You're a certified music lover 🏆"}
        </div>
      </div>
    </Card>
  )
}
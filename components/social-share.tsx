"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Facebook, Twitter, Share2, Copy, Check } from "lucide-react"
import { useState } from "react"

interface SocialShareProps {
  currentTrack: {
    title: string
    artist: string
  }
}

export function SocialShare({ currentTrack }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareText = `🎵 Now playing: ${currentTrack.title} by ${currentTrack.artist} on MyRadio!`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=550,height=420")
  }

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=550,height=420")
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MyRadio",
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    }
  }

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-500">
      <h3 className="text-lg font-semibold mb-4 text-foreground transition-colors duration-500">Share Radio</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-[100px] hover:bg-primary/10 hover:scale-105 transition-all duration-300 bg-transparent"
          onClick={handleTwitterShare}
        >
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-[100px] hover:bg-primary/10 hover:scale-105 transition-all duration-300 bg-transparent"
          onClick={handleFacebookShare}
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        {navigator.share && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[100px] hover:bg-primary/10 hover:scale-105 transition-all duration-300 bg-transparent"
            onClick={handleNativeShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-[100px] hover:bg-primary/10 hover:scale-105 transition-all duration-300 bg-transparent"
          onClick={handleCopyLink}
        >
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      </div>
    </Card>
  )
}

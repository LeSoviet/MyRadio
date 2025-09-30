'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink,
  MessageCircle,
  Mail,
  Download,
  QrCode
} from 'lucide-react'
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  RedditShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  LinkedinIcon,
  RedditIcon,
  EmailIcon
} from 'react-share'

interface SocialShareProps {
  currentTrack?: {
    title: string
    artist: string
    album?: string
    artwork?: string
  }
}

export default function SocialShare({ currentTrack }: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://myradio.com'
  const shareTitle = currentTrack 
    ? `🎵 Escuchando "${currentTrack.title}" de ${currentTrack.artist} en MyRadio`
    : '🎵 Escucha música increíble en MyRadio - Radio Online'
  
  const shareDescription = currentTrack
    ? `Descubre esta increíble canción: "${currentTrack.title}" de ${currentTrack.artist}${currentTrack.album ? ` del álbum "${currentTrack.album}"` : ''}. ¡Únete a nosotros en MyRadio!`
    : 'Descubre música increíble las 24 horas del día en MyRadio. ¡La mejor selección musical te espera!'

  const hashtags = ['MyRadio', 'MusicOnline', 'Radio', 'Music']

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  const downloadTrackInfo = () => {
    if (!currentTrack) return
    
    const trackInfo = `
🎵 Track Information
━━━━━━━━━━━━━━━━━━━━
Title: ${currentTrack.title}
Artist: ${currentTrack.artist}
${currentTrack.album ? `Album: ${currentTrack.album}` : ''}
Shared from: MyRadio
URL: ${shareUrl}
━━━━━━━━━━━━━━━━━━━━
Generated on ${new Date().toLocaleString()}
    `.trim()

    const blob = new Blob([trackInfo], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentTrack.title} - ${currentTrack.artist}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
    return qrUrl
  }

  const socialButtons = [
    {
      Component: FacebookShareButton,
      Icon: FacebookIcon,
      props: { url: shareUrl, hashtag: '#MyRadio' },
      label: 'Facebook',
      color: 'hover:bg-blue-50 dark:hover:bg-blue-950'
    },
    {
      Component: TwitterShareButton,
      Icon: TwitterIcon,
      props: { url: shareUrl, title: shareTitle, hashtags },
      label: 'Twitter',
      color: 'hover:bg-sky-50 dark:hover:bg-sky-950'
    },
    {
      Component: WhatsappShareButton,
      Icon: WhatsappIcon,
      props: { url: shareUrl, title: shareTitle },
      label: 'WhatsApp',
      color: 'hover:bg-green-50 dark:hover:bg-green-950'
    },
    {
      Component: TelegramShareButton,
      Icon: TelegramIcon,
      props: { url: shareUrl, title: shareTitle },
      label: 'Telegram',
      color: 'hover:bg-blue-50 dark:hover:bg-blue-950'
    },
    {
      Component: LinkedinShareButton,
      Icon: LinkedinIcon,
      props: { url: shareUrl, title: shareTitle, summary: shareDescription },
      label: 'LinkedIn',
      color: 'hover:bg-blue-50 dark:hover:bg-blue-950'
    },
    {
      Component: RedditShareButton,
      Icon: RedditIcon,
      props: { url: shareUrl, title: shareTitle },
      label: 'Reddit',
      color: 'hover:bg-orange-50 dark:hover:bg-orange-950'
    },
    {
      Component: EmailShareButton,
      Icon: EmailIcon,
      props: { url: shareUrl, subject: shareTitle, body: shareDescription },
      label: 'Email',
      color: 'hover:bg-gray-50 dark:hover:bg-gray-950'
    }
  ]

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-primary/10 transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground transition-colors duration-500 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Music
          </h3>
          {currentTrack && (
            <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              Now Playing
            </div>
          )}
        </div>

        {/* Current Track Info */}
        {currentTrack && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-3 rounded-lg border border-border/30">
            <div className="flex items-center gap-3">
              {currentTrack.artwork && (
                <img 
                  src={currentTrack.artwork} 
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-lg object-cover shadow-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{currentTrack.title}</p>
                <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
                {currentTrack.album && (
                  <p className="text-xs text-muted-foreground/70 truncate">{currentTrack.album}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Social Media Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {socialButtons.map(({ Component, Icon, props, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1 group">
              <Component {...props}>
                <div className={`p-2 rounded-full transition-all duration-300 ${color} group-hover:scale-110 group-active:scale-95 cursor-pointer`}>
                  <Icon size={24} round />
                </div>
              </Component>
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="flex items-center gap-2 hover:bg-primary/10 transition-all duration-300"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            <span className="text-xs">{copied ? 'Copied!' : 'Copy Link'}</span>
          </Button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button
              variant="ghost"
              size="sm"
              onClick={shareNative}
              className="flex items-center gap-2 hover:bg-primary/10 transition-all duration-300"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-xs">Native Share</span>
            </Button>
          )}

          {currentTrack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTrackInfo}
              className="flex items-center gap-2 hover:bg-primary/10 transition-all duration-300"
            >
              <Download className="h-4 w-4" />
              <span className="text-xs">Download Info</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-2 hover:bg-primary/10 transition-all duration-300"
          >
            <QrCode className="h-4 w-4" />
            <span className="text-xs">QR Code</span>
          </Button>
        </div>

        {/* QR Code Display */}
        {showQR && (
          <div className="flex flex-col items-center gap-2 p-4 bg-muted/20 rounded-lg border border-border/30">
            <img 
              src={generateQRCode()} 
              alt="QR Code" 
              className="w-32 h-32 rounded-lg shadow-md"
            />
            <p className="text-xs text-muted-foreground text-center">
              Scan to share this music
            </p>
          </div>
        )}

        {/* Share Stats */}
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-border/30">
          <span>Share the music you love</span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            Social
          </span>
        </div>
      </div>
    </Card>
  )
}

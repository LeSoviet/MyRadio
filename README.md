# MyRadio - Personal Streaming Radio

Broadcast your music from AIMP, Winamp, or Spotify and share with your friends in real-time.

## Features

- 🎵 Real-time music streaming with Icecast
- 🌓 Dark/Light mode with smooth transitions
- 📱 Responsive and minimalist design
- 🎨 Smooth and elegant animations
- 👥 Live listeners list
- 📋 Playlist visualization
- 🎨 **Real-time audio visualizer** - Connected to your actual music stream using Web Audio API
- 📊 Radio statistics (uptime, songs played, listeners)
- 📜 Song history
- 🔗 Social sharing (Twitter, Facebook, native share)
- 💖 **Live reactions** - Listeners can react to songs in real-time
- ⚡ Real-time updates with SWR
- 🎙️ Icecast server integration ready

## Technologies

- **Next.js 15** - React Framework
- **TypeScript** - Static typing
- **Tailwind CSS v4** - Styling
- **SWR** - Data fetching
- **shadcn/ui** - UI Components
- **Web Audio API** - Real-time audio visualization and analysis
- **Icecast** - Audio streaming server

## Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Create a `.env.local` file:

\`\`\`env
# Optional: Your Icecast stream URL (if you have one running)
NEXT_PUBLIC_ICECAST_URL=http://localhost:8000/myradio

# Optional: Spotify credentials (for future integration)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
\`\`\`

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

---

## 🎙️ COMPLETE SETUP GUIDE - From Mock to Real Radio

This guide will take you from the current mock/demo state to a **fully functional streaming radio**.

### Current State (What You Have Now)

✅ Beautiful UI with animations  
✅ Dark/Light theme  
✅ Mock data for songs, playlist, listeners  
✅ Demo audio visualizer (animated bars)  
⚠️ **NOT CONNECTED** to real music yet

### What You Need to Make It Real

1. **Icecast Server** - Streams your audio to the web
2. **Source Client** - AIMP/Winamp plugin to send audio to Icecast
3. **Metadata Sync** - Script to sync song info from Icecast to your app
4. **Audio Connection** - Connect visualizer to real stream

---

## Step-by-Step: Make It Real

### STEP 1: Install Icecast Server

Icecast is the streaming server that broadcasts your audio.

**Linux (Ubuntu/Debian):**
\`\`\`bash
sudo apt-get update
sudo apt-get install icecast2
\`\`\`

**macOS:**
\`\`\`bash
brew install icecast
\`\`\`

**Windows:**
1. Download from [icecast.org](https://icecast.org/download/)
2. Run installer
3. Install as Windows service (recommended)

### STEP 2: Configure Icecast

Edit Icecast config file:
- **Linux**: `/etc/icecast2/icecast.xml`
- **macOS**: `/usr/local/etc/icecast.xml`
- **Windows**: `C:\Program Files\Icecast2\etc\icecast.xml`

\`\`\`xml
<icecast>
    <limits>
        <clients>100</clients>
        <sources>2</sources>
        <burst-size>65535</burst-size>
    </limits>

    <authentication>
        <source-password>YOUR_PASSWORD_HERE</source-password>
        <relay-password>YOUR_PASSWORD_HERE</relay-password>
        <admin-user>admin</admin-user>
        <admin-password>YOUR_ADMIN_PASSWORD</admin-password>
    </authentication>

    <hostname>localhost</hostname>

    <listen-socket>
        <port>8000</port>
    </listen-socket>

    <http-headers>
        <header name="Access-Control-Allow-Origin" value="*" />
        <header name="Access-Control-Allow-Methods" value="GET, POST, OPTIONS" />
        <header name="Access-Control-Allow-Headers" value="*" />
    </http-headers>

    <paths>
        <logdir>/var/log/icecast2</logdir>
        <webroot>/usr/share/icecast2/web</webroot>
        <adminroot>/usr/share/icecast2/admin</adminroot>
    </paths>
</icecast>
\`\`\`

**Start Icecast:**
\`\`\`bash
# Linux
sudo systemctl start icecast2
sudo systemctl enable icecast2  # Auto-start on boot

# macOS
icecast -c /usr/local/etc/icecast.xml

# Windows
# Start from Services or run icecast.exe
\`\`\`

**Verify it's running:**
Open `http://localhost:8000` in your browser. You should see the Icecast admin page.

### STEP 3: Connect AIMP to Icecast

**3.1 Install AIMP Icecast Plugin**

1. Download from [AIMP Plugins](https://www.aimp.ru/?do=catalog&rec_id=1098)
2. Extract to AIMP plugins folder: `C:\Program Files\AIMP\Plugins\`
3. Restart AIMP

**3.2 Configure AIMP Plugin**

1. Open AIMP
2. Go to `Menu > Preferences > Plugins > Icecast Source`
3. Configure:
   - **Server**: `localhost`
   - **Port**: `8000`
   - **Password**: (your source-password from icecast.xml)
   - **Mount point**: `/myradio`
   - **Format**: MP3
   - **Bitrate**: 128 kbps (or higher)
   - **Name**: My Personal Radio
   - **Description**: Broadcasting from AIMP
4. Click **Connect**

**Your stream is now live at:** `http://localhost:8000/myradio`

### STEP 4: Connect Winamp to Icecast (Alternative)

**4.1 Install Edcast DSP Plugin**

1. Download [Edcast DSP](https://www.oddsock.org/tools/edcast/)
2. Install to Winamp plugins folder
3. Restart Winamp

**4.2 Configure Edcast**

1. Open Winamp
2. Go to `Options > Preferences > DSP/Effect > Edcast DSP`
3. Click **Add Encoder**
4. Configure:
   - **Server Type**: Icecast 2
   - **Server**: `localhost`
   - **Port**: `8000`
   - **Password**: (your source-password)
   - **Mount point**: `/myradio`
   - **Encoder**: MP3 Lame
   - **Bitrate**: 128 kbps
5. Click **Connect**

### STEP 5: Connect Your Web App to Icecast

**5.1 Update Environment Variable**

Edit `.env.local`:
\`\`\`env
NEXT_PUBLIC_ICECAST_URL=http://localhost:8000/myradio
\`\`\`

**5.2 Restart Your Dev Server**

\`\`\`bash
npm run dev
\`\`\`

**5.3 Test the Audio Visualizer**

1. Open `http://localhost:3000`
2. Make sure AIMP/Winamp is connected to Icecast and playing music
3. Click **Play** in your web app
4. The visualizer should now react to your actual music! 🎉

### STEP 6: Sync Metadata (Song Info)

Create a sync script to update song information from Icecast.

**Create `scripts/sync-icecast.js`:**

\`\`\`javascript
const ICECAST_STATUS_URL = 'http://localhost:8000/status-json.xsl'
const API_BASE_URL = 'http://localhost:3000/api/radio'

async function syncMetadata() {
  try {
    // Fetch Icecast status
    const response = await fetch(ICECAST_STATUS_URL)
    const data = await response.json()
    
    // Find your mount point
    const sources = Array.isArray(data.icestats.source) 
      ? data.icestats.source 
      : [data.icestats.source]
    
    const myStream = sources.find(s => s.listenurl?.includes('/myradio'))
    
    if (!myStream) {
      console.log('⚠️  Stream not found')
      return
    }

    // Parse metadata (format: "Artist - Title")
    const title = myStream.title || 'Unknown'
    const [artist, ...titleParts] = title.split(' - ')
    const songTitle = titleParts.join(' - ') || title

    // Update current track
    await fetch(`${API_BASE_URL}/current`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: songTitle,
        artist: artist || 'Unknown Artist',
        album: myStream.server_description || '',
        duration: 0,
        currentTime: 0,
        isPlaying: true
      })
    })

    // Update listeners count
    await fetch(`${API_BASE_URL}/listeners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: myStream.listeners || 0
      })
    })

    // Add to history
    await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: songTitle,
        artist: artist || 'Unknown Artist',
        timestamp: Date.now()
      })
    })

    console.log(`✅ Synced: ${artist} - ${songTitle} (${myStream.listeners} listeners)`)
  } catch (error) {
    console.error('❌ Sync error:', error.message)
  }
}

// Sync every 5 seconds
setInterval(syncMetadata, 5000)
syncMetadata()

console.log('🎵 Icecast metadata sync started...')
\`\`\`

**Run the sync script:**

\`\`\`bash
node scripts/sync-icecast.js
\`\`\`

Keep this running in a separate terminal while your radio is broadcasting.

### STEP 7: Production Deployment

**7.1 Deploy to Vercel**

\`\`\`bash
# Push to GitHub
git add .
git commit -m "My personal radio"
git push

# Deploy on Vercel
# Go to vercel.com and import your GitHub repo
\`\`\`

**7.2 Set Up Production Icecast**

For production, you need a VPS (Virtual Private Server):

**Recommended Providers:**
- DigitalOcean ($6/month)
- Linode ($5/month)
- AWS Lightsail ($5/month)

**On your VPS:**

\`\`\`bash
# Install Icecast
sudo apt-get update
sudo apt-get install icecast2

# Configure with your domain
sudo nano /etc/icecast2/icecast.xml
# Change hostname to your domain: radio.yourdomain.com

# Start Icecast
sudo systemctl start icecast2
sudo systemctl enable icecast2

# Open firewall
sudo ufw allow 8000
\`\`\`

**7.3 Update Your App**

Update `.env.local` on Vercel:
\`\`\`env
NEXT_PUBLIC_ICECAST_URL=http://radio.yourdomain.com:8000/myradio
\`\`\`

**7.4 Connect AIMP/Winamp to Production**

Change server from `localhost` to `radio.yourdomain.com` in your AIMP/Winamp plugin settings.

---

## 🎯 Verification Checklist

Use this to verify everything is working:

- [ ] Icecast server is running (`http://localhost:8000` shows admin page)
- [ ] AIMP/Winamp is connected to Icecast (shows "Connected" in plugin)
- [ ] Music is playing in AIMP/Winamp
- [ ] Stream URL works in browser (`http://localhost:8000/myradio` plays audio)
- [ ] Web app is running (`http://localhost:3000`)
- [ ] Clicking Play in web app starts audio
- [ ] **Audio visualizer bars move with the music** (this confirms real connection!)
- [ ] Metadata sync script is running
- [ ] Song title/artist updates in web app
- [ ] Listener count updates

---

## 🔧 Troubleshooting

### Visualizer Not Moving

**Problem**: Bars are animated but don't react to music  
**Solution**: 
1. Check browser console for CORS errors
2. Verify `NEXT_PUBLIC_ICECAST_URL` is set correctly
3. Make sure Icecast has CORS headers (see Step 2)
4. Try clicking Play button (browsers require user interaction for audio)

### No Audio in Browser

**Problem**: Visualizer works but no sound  
**Solution**:
1. Check browser volume
2. Check if stream URL works: `http://localhost:8000/myradio`
3. Verify AIMP/Winamp is connected and playing

### Metadata Not Updating

**Problem**: Song info stuck on "Waiting for broadcast..."  
**Solution**:
1. Check if sync script is running
2. Verify API endpoints are accessible
3. Check AIMP/Winamp is sending metadata (enable in plugin settings)

### CORS Errors

**Problem**: Browser console shows CORS errors  
**Solution**:
Add to `icecast.xml`:
\`\`\`xml
<http-headers>
    <header name="Access-Control-Allow-Origin" value="*" />
</http-headers>
\`\`\`
Restart Icecast.

---

## 📡 API Endpoints

All endpoints support real-time updates:

### GET /api/radio/current
Returns currently playing song

### POST /api/radio/current
Update current song (used by sync script)

### GET /api/radio/playlist
Returns playlist

### GET /api/radio/listeners
Returns connected listeners

### POST /api/radio/listeners
Update listener count (used by sync script)

### GET /api/radio/history
Returns last 20 songs played

### POST /api/radio/history
Add song to history (used by sync script)

### GET /api/radio/stats
Returns radio statistics

### POST /api/radio/control
Control playback (play/pause, next, previous)

### GET /api/radio/reactions
Get recent reactions

### POST /api/radio/reactions
Add a reaction to current song

---

## 🎨 Features Explained

### Real-Time Audio Visualizer

Uses **Web Audio API** to analyze frequency data from your Icecast stream:
- Connects directly to your audio stream
- Analyzes 512 frequency bins in real-time
- Renders 256 bars that react to music
- Adapts colors to dark/light theme
- Fullscreen mode for immersive experience

**How it works:**
1. Creates AudioContext and AnalyserNode
2. Connects to your Icecast stream URL
3. Extracts frequency data 60 times per second
4. Renders bars on HTML5 canvas

### Live Reactions

Listeners can react to songs in real-time with emojis:
- 6 reaction types (heart, thumbs up, music, flame, star, zap)
- Floating animation when reacted
- Synced across all listeners
- Tracks reaction counts per song

---

## 🚀 Future Improvements

- [ ] WebSockets for instant updates
- [ ] User authentication
- [ ] Live chat between listeners
- [ ] Song request queue
- [ ] Last.fm scrobbling
- [ ] Spotify integration
- [ ] Mobile apps
- [ ] Recording/podcast mode
- [ ] Scheduled broadcasts
- [ ] Multiple DJ support

---

## 📄 License

MIT

## 💬 Support

Having issues? Open an issue on GitHub or check the troubleshooting section above.

---

**You now have everything you need to run a real streaming radio! 🎉**

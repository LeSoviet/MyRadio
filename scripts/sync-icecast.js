#!/usr/bin/env node

/**
 * Script de sincronización con Icecast
 * Obtiene datos reales del servidor Icecast y los sincroniza con las APIs de MyRadio
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuración desde variables de entorno
const ICECAST_HOST = process.env.ICECAST_HOST || 'localhost';
const ICECAST_PORT = process.env.ICECAST_PORT || 8000;
const ICECAST_STATUS_URL = process.env.ICECAST_STATUS_URL || `http://${ICECAST_HOST}:${ICECAST_PORT}/status-json.xsl`;
const ICECAST_STATS_URL = process.env.ICECAST_STATS_URL || `http://${ICECAST_HOST}:${ICECAST_PORT}/admin/stats.xml`;
const SYNC_INTERVAL = 5000; // 5 segundos

class IcecastSync {
  constructor() {
    this.lastTrack = null;
    this.listeners = new Set();
    this.history = [];
    this.stats = {
      totalListeners: 0,
      peakListeners: 0,
      streamUptime: 0,
      bitrate: 128,
      sampleRate: 44100
    };
  }

  /**
   * Realiza una petición HTTP
   */
  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      client.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve(data);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Obtiene el estado actual del stream desde Icecast
   */
  async getStreamStatus() {
    try {
      const data = await this.makeRequest(ICECAST_STATUS_URL);
      const status = JSON.parse(data);
      
      if (status.icestats && status.icestats.source) {
        const source = Array.isArray(status.icestats.source) 
          ? status.icestats.source[0] 
          : status.icestats.source;
        
        return {
          isLive: true,
          listeners: parseInt(source.listeners) || 0,
          bitrate: parseInt(source.bitrate) || 128,
          sampleRate: parseInt(source.samplerate) || 44100,
          title: source.title || 'Sin título',
          artist: source.artist || 'Artista desconocido',
          genre: source.genre || 'Música',
          serverName: source.server_name || 'MyRadio',
          serverDescription: source.server_description || 'Tu estación de radio online',
          streamStart: source.stream_start || new Date().toISOString()
        };
      }
      
      return {
        isLive: false,
        listeners: 0,
        bitrate: 0,
        sampleRate: 0,
        title: 'Stream offline',
        artist: '',
        genre: '',
        serverName: 'MyRadio',
        serverDescription: 'Tu estación de radio online',
        streamStart: null
      };
    } catch (error) {
      console.error('Error obteniendo estado del stream:', error.message);
      return {
        isLive: false,
        listeners: 0,
        bitrate: 0,
        sampleRate: 0,
        title: 'Error de conexión',
        artist: '',
        genre: '',
        serverName: 'MyRadio',
        serverDescription: 'Tu estación de radio online',
        streamStart: null
      };
    }
  }

  /**
   * Actualiza las estadísticas del servidor
   */
  async updateStats(streamStatus) {
    this.stats.totalListeners = streamStatus.listeners;
    this.stats.peakListeners = Math.max(this.stats.peakListeners, streamStatus.listeners);
    this.stats.bitrate = streamStatus.bitrate;
    this.stats.sampleRate = streamStatus.sampleRate;
    
    if (streamStatus.streamStart) {
      const startTime = new Date(streamStatus.streamStart);
      this.stats.streamUptime = Math.floor((Date.now() - startTime.getTime()) / 1000);
    }
  }

  /**
   * Actualiza el historial de canciones
   */
  updateHistory(currentTrack) {
    if (this.lastTrack && 
        (this.lastTrack.title !== currentTrack.title || 
         this.lastTrack.artist !== currentTrack.artist)) {
      
      const historyEntry = {
        id: Date.now().toString(),
        title: this.lastTrack.title,
        artist: this.lastTrack.artist,
        genre: this.lastTrack.genre,
        playedAt: new Date().toISOString(),
        duration: 180 // Duración estimada en segundos
      };
      
      this.history.unshift(historyEntry);
      
      // Mantener solo las últimas 100 canciones
      if (this.history.length > 100) {
        this.history = this.history.slice(0, 100);
      }
      
      console.log(`Nueva canción en historial: ${historyEntry.artist} - ${historyEntry.title}`);
    }
    
    this.lastTrack = currentTrack;
  }

  /**
   * Guarda los datos sincronizados en archivos JSON
   */
  saveData() {
    const dataDir = path.join(__dirname, '..', 'data');
    
    // Crear directorio data si no existe
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Guardar datos actuales
    const currentData = {
      title: this.lastTrack?.title || 'Sin título',
      artist: this.lastTrack?.artist || 'Artista desconocido',
      genre: this.lastTrack?.genre || 'Música',
      isLive: this.stats.totalListeners > 0,
      listeners: this.stats.totalListeners,
      bitrate: this.stats.bitrate,
      sampleRate: this.stats.sampleRate,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(dataDir, 'current.json'),
      JSON.stringify(currentData, null, 2)
    );
    
    // Guardar historial
    fs.writeFileSync(
      path.join(dataDir, 'history.json'),
      JSON.stringify(this.history.slice(0, 20), null, 2)
    );
    
    // Guardar estadísticas
    fs.writeFileSync(
      path.join(dataDir, 'stats.json'),
      JSON.stringify(this.stats, null, 2)
    );
    
    // Guardar lista de oyentes (simulada por ahora)
    const listenersData = Array.from({ length: this.stats.totalListeners }, (_, i) => ({
      id: `listener_${i + 1}`,
      name: `Oyente ${i + 1}`,
      avatar: `/placeholder-user.jpg`,
      joinedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      location: ['España', 'México', 'Argentina', 'Colombia', 'Chile'][Math.floor(Math.random() * 5)]
    }));
    
    fs.writeFileSync(
      path.join(dataDir, 'listeners.json'),
      JSON.stringify(listenersData, null, 2)
    );
  }

  /**
   * Ejecuta un ciclo de sincronización
   */
  async sync() {
    try {
      console.log(`[${new Date().toISOString()}] Sincronizando con Icecast...`);
      
      const streamStatus = await this.getStreamStatus();
      
      console.log(`Estado: ${streamStatus.isLive ? 'EN VIVO' : 'OFFLINE'}`);
      console.log(`Oyentes: ${streamStatus.listeners}`);
      console.log(`Canción actual: ${streamStatus.artist} - ${streamStatus.title}`);
      
      this.updateStats(streamStatus);
      this.updateHistory({
        title: streamStatus.title,
        artist: streamStatus.artist,
        genre: streamStatus.genre
      });
      
      this.saveData();
      
      console.log('Sincronización completada\n');
    } catch (error) {
      console.error('Error durante la sincronización:', error.message);
    }
  }

  /**
   * Inicia el proceso de sincronización continua
   */
  start() {
    console.log('🎵 Iniciando sincronización con Icecast...');
    console.log(`📡 URL del servidor: ${ICECAST_STATUS_URL}`);
    console.log(`⏱️  Intervalo de sincronización: ${SYNC_INTERVAL}ms\n`);
    
    // Sincronización inicial
    this.sync();
    
    // Sincronización periódica
    setInterval(() => {
      this.sync();
    }, SYNC_INTERVAL);
  }

  /**
   * Detiene el proceso de sincronización
   */
  stop() {
    console.log('🛑 Deteniendo sincronización...');
    process.exit(0);
  }
}

// Manejo de señales para detener el proceso limpiamente
const sync = new IcecastSync();

process.on('SIGINT', () => {
  sync.stop();
});

process.on('SIGTERM', () => {
  sync.stop();
});

// Iniciar sincronización si se ejecuta directamente
if (require.main === module) {
  sync.start();
}

module.exports = IcecastSync;
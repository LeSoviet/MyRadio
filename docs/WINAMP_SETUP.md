# 🎵 Guía de Configuración de Winamp para Streaming

## 📋 Requisitos Previos

- Winamp instalado (versión 2.x o 5.x recomendada)
- Servidor Icecast funcionando (ver [ICECAST_SETUP.md](./ICECAST_SETUP.md))
- Plugin Edcast DSP o similar
- Biblioteca de música organizada

---

## 🚀 Instalación de Winamp

### Descargar Winamp

**Opción 1: Winamp Oficial**
```
https://winamp.com/
```

**Opción 2: Winamp Legacy (Recomendado para streaming)**
```
https://winamp.com/player
```
- Descargar Winamp 5.666 (última versión estable)
- Incluye mejor compatibilidad con plugins DSP

### Instalación

1. Ejecutar instalador como administrador
2. Seleccionar instalación completa
3. Incluir todos los plugins de audio
4. Configurar como reproductor predeterminado (opcional)

---

## 🎛 Instalación del Plugin Edcast DSP

### Descargar Edcast DSP

**Edcast DSP Plugin:**
```
http://www.oddsock.org/tools/edcast/
```

**Alternativas:**
- **jetCast DSP**: Plugin más moderno
- **BUTT (Broadcast Using This Tool)**: Aplicación independiente

### Instalación de Edcast DSP

1. **Descargar** `edcast_dsp_v3_2_1_3.exe`
2. **Ejecutar** como administrador
3. **Instalar** en directorio de Winamp:
   ```
   C:\Program Files (x86)\Winamp\Plugins\
   ```
4. **Reiniciar** Winamp

### Verificar Instalación

1. Abrir Winamp
2. Ir a: `Options > Preferences` (Ctrl+P)
3. Expandir `Plug-ins > DSP/Effect`
4. Buscar `Edcast DSP v3` en la lista
5. Seleccionar y hacer click en `Configure`

---

## ⚙️ Configuración de Edcast DSP

### 1. Configuración Básica del Encoder

**Abrir configuración de Edcast:**
1. En Winamp: `Options > Preferences > Plug-ins > DSP/Effect`
2. Seleccionar `Edcast DSP v3`
3. Click en `Configure`

**Configurar Encoder:**
```
Encoder Type: MP3 Lame
Bitrate: 128 kbps (recomendado para inicio)
Sample Rate: 44100 Hz
Channels: Stereo
Quality: High
```

### 2. Configuración del Servidor

**En la pestaña "Server":**
```
Server Type: Icecast2
Server IP: localhost (o 127.0.0.1)
Server Port: 8000
Password: myradio2024
Mount Point: /stream
```

**Configuración adicional:**
```
Reconnect: Enabled
Reconnect Interval: 5 seconds
Max Reconnect Attempts: 10
Public: Yes (para aparecer en directorios)
```

### 3. Metadatos y Información

**En la pestaña "Metadata":**
```
Stream Name: MyRadio Live Stream
Stream Description: Tu estación de radio favorita
Stream Genre: Various
Stream URL: http://localhost:3000
```

**Configuración de metadatos:**
```
☑ Send Song Titles
☑ Update Metadata
☑ Use UTF-8 Encoding
Format: %artist% - %title%
```

### 4. Configuración de Audio

**En la pestaña "Audio":**
```
Input Device: Default (Winamp)
Input Gain: 0 dB (ajustar según necesidad)
Limiter: Enabled
Limiter Threshold: -3 dB
AGC (Auto Gain Control): Enabled
```

---

## 🎮 Iniciar el Streaming

### 1. Preparar Winamp

1. **Cargar playlist** con música
2. **Configurar crossfade** (opcional):
   - `Options > Preferences > Plug-ins > Output`
   - Configurar `Crossfading` para transiciones suaves

3. **Ajustar volumen** al 70-80%

### 2. Conectar al Servidor

1. **Abrir Edcast DSP** configuration
2. **Click en "Connect"**
3. **Verificar estado**: Debe mostrar "Connected"
4. **Iniciar reproducción** en Winamp

### 3. Verificar Conexión

**En el navegador:**
1. Ir a `http://localhost:8000`
2. Verificar que aparezca `/stream` en mount points
3. Click en `/stream` para escuchar
4. Verificar metadatos actualizándose

---

## 🔧 Configuración Avanzada

### Múltiples Calidades

**Configurar stream de alta calidad:**
1. Duplicar configuración en Edcast
2. Cambiar mount point a `/stream-hq`
3. Configurar bitrate a 320 kbps
4. Conectar ambos streams simultáneamente

### Procesamiento de Audio

**Compressor/Limiter:**
```
Threshold: -12 dB
Ratio: 4:1
Attack: 3 ms
Release: 100 ms
Makeup Gain: 6 dB
```

**EQ Settings (opcional):**
```
60 Hz: +2 dB
170 Hz: +1 dB
310 Hz: 0 dB
600 Hz: +1 dB
1 kHz: +2 dB
3 kHz: +1 dB
6 kHz: +2 dB
12 kHz: +1 dB
14 kHz: +3 dB
16 kHz: +2 dB
```

### Automatización

**Playlist automática:**
1. Crear playlist larga (8+ horas)
2. Habilitar `Repeat` en Winamp
3. Configurar `Shuffle` si se desea
4. Usar plugin `Playlist Generator` para variedad

---

## 🛠 Solución de Problemas

### No se puede conectar al servidor

**Verificar:**
- [ ] Icecast está ejecutándose
- [ ] Puerto 8000 está abierto
- [ ] Credenciales correctas
- [ ] Mount point existe

**Logs a revisar:**
- Edcast DSP log (en configuración)
- Icecast error.log
- Windows Event Viewer

### Audio se corta o tiene problemas

**Soluciones:**
1. **Aumentar buffer** en Winamp:
   - `Options > Preferences > Plug-ins > Output`
   - Aumentar buffer size

2. **Reducir bitrate** temporalmente
3. **Verificar CPU usage**
4. **Cerrar aplicaciones innecesarias**

### Metadatos no se actualizan

**Verificar:**
- [ ] "Send Song Titles" habilitado
- [ ] Formato de metadatos correcto
- [ ] UTF-8 encoding habilitado
- [ ] Archivos tienen tags ID3

### Calidad de audio pobre

**Mejorar:**
1. Aumentar bitrate (192 o 320 kbps)
2. Verificar calidad de archivos fuente
3. Ajustar configuración de encoder
4. Usar archivos FLAC/WAV como fuente

---

## 📊 Monitoreo del Stream

### Estadísticas en Tiempo Real

**Icecast Admin Panel:**
```
http://localhost:8000/admin/
Usuario: admin
Contraseña: admin2024
```

**Información disponible:**
- Oyentes conectados
- Bitrate actual
- Tiempo de conexión
- Metadatos actuales

### Logs de Edcast

**Ubicación:** Configuración de Edcast > Log tab
**Información útil:**
- Estado de conexión
- Errores de encoding
- Estadísticas de transmisión

---

## 🎵 Alternativas a Winamp

### AIMP (Limitado)

**Configuración:**
- Instalar AIMP
- Buscar plugin compatible con Icecast
- Configuración similar a Winamp

**Nota:** AIMP tiene soporte limitado para streaming plugins.

### BUTT (Broadcast Using This Tool)

**Ventajas:**
- Aplicación dedicada para broadcasting
- Multiplataforma
- Interfaz moderna
- Mejor estabilidad

**Configuración:**
```
Server: localhost
Port: 8000
Password: myradio2024
Mount: stream
Format: MP3
Bitrate: 128
```

### OBS Studio + Plugin

**Para streaming avanzado:**
- OBS Studio con plugin de audio
- Múltiples fuentes de audio
- Efectos avanzados
- Grabación simultánea

---

## ✅ Checklist de Verificación

- [ ] Winamp instalado y funcionando
- [ ] Edcast DSP plugin instalado
- [ ] Configuración de servidor correcta
- [ ] Encoder configurado (MP3, 128kbps)
- [ ] Metadatos habilitados
- [ ] Conexión exitosa a Icecast
- [ ] Audio streaming sin cortes
- [ ] Metadatos actualizándose
- [ ] Stream audible en navegador
- [ ] Calidad de audio aceptable

---

## 🚀 Próximo Paso

Una vez que Winamp esté streaming correctamente:
**[Implementar APIs Reales](../app/api/radio/README.md)**

---

## 📝 Configuración de Ejemplo

### Archivo de configuración Edcast (edcast.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<edcast>
    <server>
        <type>icecast2</type>
        <hostname>localhost</hostname>
        <port>8000</port>
        <password>myradio2024</password>
        <mount>/stream</mount>
        <public>1</public>
        <name>MyRadio Live Stream</name>
        <description>Tu estación de radio favorita</description>
        <genre>Various</genre>
        <url>http://localhost:3000</url>
    </server>
    <encoder>
        <type>mp3</type>
        <bitrate>128</bitrate>
        <samplerate>44100</samplerate>
        <channels>2</channels>
        <quality>high</quality>
    </encoder>
</edcast>
```

---

*Última actualización: $(date)*
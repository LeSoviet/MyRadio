# 🎵 Guía de Instalación y Configuración de Icecast2

## 📋 Requisitos Previos

- Windows 10/11 o Linux/macOS
- Conexión a internet estable
- Puerto 8000 disponible
- Permisos de administrador

---

## 🚀 Instalación de Icecast2

### Windows

1. **Descargar Icecast2**
   ```
   https://icecast.org/download/
   ```
   - Descargar la versión más reciente para Windows
   - Ejecutar el instalador como administrador

2. **Instalación**
   - Seguir el asistente de instalación
   - Instalar en: `C:\Program Files\Icecast2\`
   - Crear acceso directo en el escritorio

3. **Configuración inicial**
   - Copiar nuestro archivo `config/icecast.xml` a `C:\Program Files\Icecast2\conf\`
   - Crear carpetas necesarias:
     ```cmd
     mkdir "C:\Program Files\Icecast2\logs"
     mkdir "C:\Program Files\Icecast2\web"
     mkdir "C:\Program Files\Icecast2\admin"
     ```

### Linux (Ubuntu/Debian)

```bash
# Actualizar repositorios
sudo apt update

# Instalar Icecast2
sudo apt install icecast2

# Durante la instalación configurar:
# - Hostname: localhost
# - Source password: myradio2024
# - Relay password: myradio2024
# - Admin password: admin2024
```

### macOS

```bash
# Instalar Homebrew si no está instalado
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Icecast
brew install icecast

# Copiar configuración
cp config/icecast.xml /usr/local/etc/icecast.xml
```

---

## ⚙️ Configuración del Servidor

### 1. Archivo de Configuración

Nuestro archivo `config/icecast.xml` incluye:

- **Puerto**: 8000 (http://localhost:8000)
- **Mount Points**: 
  - `/stream` (128kbps) - Calidad estándar
  - `/stream-hq` (320kbps) - Alta calidad
- **Credenciales**:
  - Source password: `myradio2024`
  - Admin user: `admin`
  - Admin password: `admin2024`

### 2. Configuración de Red

**Firewall Windows:**
```cmd
# Abrir puerto 8000
netsh advfirewall firewall add rule name="Icecast" dir=in action=allow protocol=TCP localport=8000
```

**Firewall Linux:**
```bash
# UFW
sudo ufw allow 8000/tcp

# iptables
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
```

### 3. Variables de Entorno (Opcional)

Crear archivo `.env.local` en el proyecto:
```env
ICECAST_HOST=localhost
ICECAST_PORT=8000
ICECAST_ADMIN_USER=admin
ICECAST_ADMIN_PASSWORD=admin2024
ICECAST_MOUNT_POINT=/stream
ICECAST_STATUS_URL=http://localhost:8000/status-json.xsl
```

---

## 🎮 Iniciar el Servidor

### Windows

**Método 1: Interfaz Gráfica**
- Ejecutar `Icecast2 Win32` desde el menú inicio
- Cargar configuración: `File > Load Config > icecast.xml`
- Click en `Start Server`

**Método 2: Línea de Comandos**
```cmd
cd "C:\Program Files\Icecast2\bin"
icecast.exe -c ..\conf\icecast.xml
```

### Linux/macOS

```bash
# Iniciar Icecast
sudo icecast2 -c /path/to/icecast.xml

# O como servicio (Linux)
sudo systemctl start icecast2
sudo systemctl enable icecast2
```

---

## 🔍 Verificar Instalación

### 1. Acceder a la Interfaz Web

Abrir navegador y ir a: `http://localhost:8000`

Deberías ver:
- Página principal de Icecast
- Lista de mount points disponibles
- Estadísticas del servidor

### 2. Panel de Administración

Ir a: `http://localhost:8000/admin/`
- Usuario: `admin`
- Contraseña: `admin2024`

### 3. Status JSON (Para nuestra API)

Verificar: `http://localhost:8000/status-json.xsl`

Debería devolver JSON con información del servidor:
```json
{
  "icestats": {
    "admin": "admin@myradio.local",
    "host": "localhost",
    "location": "MyRadio Station",
    "server_id": "Icecast 2.4.4",
    "server_start": "...",
    "server_start_iso8601": "...",
    "source": []
  }
}
```

---

## 🛠 Solución de Problemas

### Error: Puerto 8000 en uso

```bash
# Windows
netstat -ano | findstr :8000

# Linux/macOS
lsof -i :8000
```

**Solución**: Cambiar puerto en `icecast.xml` o terminar proceso que usa el puerto.

### Error: Permisos insuficientes

**Windows**: Ejecutar como administrador
**Linux**: Usar `sudo` o cambiar propietario de archivos

### Error: No se puede conectar desde Winamp

1. Verificar que Icecast esté ejecutándose
2. Comprobar credenciales en Winamp
3. Verificar mount point `/stream`
4. Revisar logs: `icecast/logs/error.log`

### Mount point no aparece

- Verificar que la fuente (Winamp) esté conectada
- Revisar configuración del encoder
- Comprobar contraseña de source

---

## 📊 Monitoreo y Logs

### Ubicación de Logs

**Windows**: `C:\Program Files\Icecast2\logs\`
**Linux**: `/var/log/icecast2/`
**macOS**: `/usr/local/var/log/icecast/`

### Logs Importantes

- `access.log`: Conexiones de clientes
- `error.log`: Errores del servidor
- `icecast.log`: Log general del servidor

### Comandos Útiles

```bash
# Ver logs en tiempo real (Linux/macOS)
tail -f /var/log/icecast2/error.log

# Windows PowerShell
Get-Content "C:\Program Files\Icecast2\logs\error.log" -Wait
```

---

## 🔧 Configuración Avanzada

### Múltiples Mount Points

Agregar en `icecast.xml`:
```xml
<mount type="normal">
    <mount-name>/jazz</mount-name>
    <password>myradio2024</password>
    <stream-name>MyRadio Jazz</stream-name>
    <genre>Jazz</genre>
</mount>
```

### Fallback Stream

```xml
<mount type="normal">
    <mount-name>/stream</mount-name>
    <fallback-mount>/silence.mp3</fallback-mount>
    <fallback-override>1</fallback-override>
</mount>
```

### Relay Configuration

```xml
<relay>
    <server>remote-server.com</server>
    <port>8000</port>
    <mount>/remote-stream</mount>
    <local-mount>/relay</local-mount>
</relay>
```

---

## ✅ Checklist de Verificación

- [ ] Icecast2 instalado correctamente
- [ ] Archivo `icecast.xml` configurado
- [ ] Puerto 8000 abierto en firewall
- [ ] Servidor iniciado sin errores
- [ ] Interfaz web accesible en `http://localhost:8000`
- [ ] Panel admin funcional
- [ ] Status JSON disponible
- [ ] Logs generándose correctamente
- [ ] Mount points configurados

---

## 🚀 Próximo Paso

Una vez que Icecast esté funcionando, continúa con:
**[Configuración de Winamp](./WINAMP_SETUP.md)**

---

*Última actualización: $(date)*
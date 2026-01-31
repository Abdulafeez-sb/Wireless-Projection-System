# Wireless Projection System
**Secure WebRTC-Based Screen Sharing for Raspberry Pi**

A cost-effective wireless projection interface that lets users share their laptop screens to a projector without cables. Built with WebRTC technology for peer-to-peer screen sharing directly from a web browser.



## Features

- **No Cable Required**: Wireless screen sharing over local WiFi
- **Browser-Based**: No software installation needed on client devices
- **Secure Access**: PIN-protected with rate limiting (6 attempts/20s, 24hr lockout)
- **Low Latency**: WebRTC peer-to-peer connection optimized for LAN
- **HTTPS Enabled**: Self-signed SSL certificates for secure connections
- **Raspberry Pi Optimized**: Lightweight Node.js server with H.264 video codec support



## Prerequisites

### Hardware
- Raspberry Pi (3B+, 4, or 5 recommended)
- MicroSD card (16GB+ recommended)
- microHDMI to HDMI cable to connect Pi to projector
- WiFi network (or Pi configured as access point, this may encounter issue with ICE candidate unsuccessful exchange due to spike in CPU usage at the point of initial handshake)

### Software
- Raspberry Pi OS (Bullseye or later)
- Node.js 16+ and npm
- OpenSSL (for certificate generation)

⚠️ Prerequisites: Fresh Raspberry Pi Setup
If you're setting up a brand new Raspberry Pi or need to reflash your microSD card, please complete the OS installation first:
Follow this complete guide from downloading the OS to getting your Pi ready for the Wireless Projection System. [Raspberry Pi OS Installation Guide](https://github.com/Abdulafeez-sb/Wireless-Projection-System/blob/main/OSInstallation.md)

Once your Pi is booted and configured, return here and continue with Step 1 below.

## Installation & Setup
### Open the terminal on the Raspberry Pi

### Step 1: Install Node.js and Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v16 or higher
npm --version
```

### Step 2: Clone or Download Project Files

```bash
# Create project directory
mkdir -p ~/wireless-projection
cd ~/wireless-projection

# If using git
git clone https://github.com/Abdulafeez-sb/Wireless-Projection-System.git .

# Or manually copy these files to ~/wireless-projection/:
# - server.js
# - static/client/index.html
# - static/host/mainindex.html
# - static/js/socket.io.min.js
```

### Step 3: Install Node Modules

```bash
# Navigate to project directory
cd ~/wireless-projection

# Install required packages
npm install express socket.io
```

This will create:
- `node_modules/` folder with all dependencies
- `package.json` (if it doesn't exist)
- `package-lock.json` with exact dependency versions

### Step 4: Generate SSL Certificates

WebRTC requires HTTPS. Generate self-signed certificates:

```bash
# Navigate to project directory
cd ~/wireless-projection

# Generate private key (key.pem)
openssl genrsa -out key.pem 2048

# Generate self-signed certificate (cert.pem) - valid for 365 days
openssl req -new -x509 -key key.pem -out cert.pem -days 365

# When prompted, fill in certificate details:
# Country Name: NG (or your country)
# State: Your State
# Locality: Your Town
# Organization Name: Your School/Organization
# Organizational Unit: IT Department
# Common Name: 192.168.1.xxx (YOUR PI'S IP ADDRESS - IMPORTANT!)
# Email: your-email@example.com
```

**Important**: For `Common Name`, use your Pi's actual IP address. This reduces browser certificate warnings.

To find your Pi's IP:
```bash
hostname -I
```

### Step 5: Configure Your Network

#### Option A: Connect Pi to Existing WiFi (Recommended)
You can also create a client connection through the GUI
```bash
# Configure WiFi credentials
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf

# Add your network:
network={
    ssid="YourWiFiName"
    psk="YourWiFiPassword"
}

# Save and reboot
sudo reboot
```

#### Option B: Set Pi as WiFi Access Point
Follow official Raspberry Pi docs or use tools like `RaspAP`.

### Step 6: Update Server Configuration

Edit `server.js` to match your setup:

```bash
nano server.js
```

Key configurations:
- **PORT**: Default is `3000`
- **ACCESS_CODE**: Change `"T0-PiProjector"` to your preferred PIN
- **ROOM**: Change `"lab"` if needed

### Step 7: Update Client URLs

Edit `static/host/mainindex.html`:

```bash
nano static/host/mainindex.html
```

Update "Airtel_7581" with your WiFi name:
```html
<h5>"YourWiFiName"</h5>
```

The system will auto-detect and display the Pi's IP address.



## Running the System

### Start the Server

```bash
cd ~/wireless-projection
node server.js
```

You should see:
```
[SERVER] Secure signaling server running on port 3000
[INFO] Client URL: https://192.168.1.xxx:3000
[INFO] Host/Receiver URL: https://localhost:3000/youwi11nevergetme
[INFO] Using HTTPS with SSL/TLS certificates
[INFO] Access Code: "what you set it to be"
[SECURITY] Rate limiting: 6 attempts / 20s
```

### Auto-Start on Boot (Recommended)

#### Step 1: Create Systemd Service for Server

```bash
# Create service file
sudo nano /lib/systemd/system/serverjs.service
```

Add the following configuration:
```ini
[Unit]
Description=To start server.js on startup
After=multi-user.target

[Service]
# To find node path: which node
# To find server.js path: cd ~/wireless-projection && pwd
ExecStart=/usr/bin/node /home/pi/wireless-projection/server.js
User=pi

[Install]
WantedBy=multi-user.target
```

**Finding the correct paths**:
```bash
# Find your node executable path
which node
# Output example: /usr/bin/node

# Find your server.js full path
cd ~/wireless-projection
pwd
# Output example: /home/pi/wireless-projection
# So full path is: /home/pi/wireless-projection/server.js
```

**Note**: Update the `User=` field if your username is different from `pi`:
- If using different username: Replace `pi` with your actual username (e.g., `hp`, `ubuntu`, etc.)
- If installed in different location: Update `/home/pi/wireless-projection/server.js` path accordingly

Save and exit: `Ctrl + X`, then `Y`, then `Enter`

#### Step 2: Enable and Start the Service

```bash
# Reload systemd to recognize new service
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable serverjs.service

# Start the service now
sudo systemctl start serverjs.service

# Verify service is running
sudo systemctl status serverjs.service
```

You should see: `Active: active (running)`

**Useful service commands**:
```bash
# Stop the service
sudo systemctl stop serverjs.service

# Restart the service
sudo systemctl restart serverjs.service

# View service logs
sudo journalctl -u serverjs.service -f
```

#### Step 3: Auto-Launch Host Page in Kiosk Mode (labwc)

For Raspberry Pi using **labwc** window manager:

```bash
# Create autostart directory if it doesn't exist
mkdir -p ~/.config/labwc

# Edit autostart file
nano ~/.config/labwc/autostart
```

Add this line to launch Firefox in kiosk mode:
```bash
firefox --kiosk --insecure-content-test --ignore-certificate-errors --url https://localhost:3000/youwi11nevergetme
```

**Alternative browsers**:
```bash
# Brave Browser (RECOMMENDED )
brave-browser --kiosk --ignore-certificate-errors --disable-infobars https://localhost:3000/youwi11nevergetme

# Chromium
chromium-browser --kiosk --ignore-certificate-errors --disable-infobars https://localhost:3000/youwi11nevergetme

# For X11/LXDE desktop, add @ prefix:
@brave-browser --kiosk --ignore-certificate-errors https://localhost:3000/youwi11nevergetme
```


Save and exit: `Ctrl + X`, then `Y`, then `Enter`

Make the autostart file executable:
```bash
chmod +x ~/.config/labwc/autostart
```

#### Step 4: Test Auto-Start

```bash
# Reboot to test everything
sudo reboot
```

After reboot:
1. ✅ Server should start automatically
2. ✅ Browser should open in kiosk mode showing host page
3. ✅ Projector displays connection instructions


## 📁 Project Structure

```
wireless-projection/
├── server.js                          # Main server file
├── key.pem                            # SSL private key (generated)
├── cert.pem                           # SSL certificate (generated)
├── package.json                       # Node dependencies (created by npm)
├── package-lock.json                  # Dependency versions (created by npm)
├── node_modules/                      # Installed packages (created by npm)
│   ├── express/
│   ├── socket.io/
│   └── ...
└── static/
    ├── client/
    │   └── index.html                 # Client screen sharing page
    ├── host/
    │   └── mainindex.html             # Projector display page
    └── js/
        └── socket.io.min.js           # Socket.IO client library
```


## Accessing Raspberry Pi via SSH

**For advanced troubleshooting or configuration changes:**

1. **Install SSH client** (if not already installed):
   - Windows: Download PuTTY from https://putty.org/
   - Mac/Linux: Use built-in Terminal

2. **Connect to same network** as the Raspberry Pi

3. **SSH into Pi**:
   
   **Using PuTTY (Windows)**:
   - Open PuTTY
   - Hostname: `192.168.1.xxx` (your Pi's IP, you can check this on the details of devices connected to the device serving as AP)
   - Port: `22`
   - Connection type: `SSH`
   - Click "Open"
   
   **Using Terminal (Mac/Linux)**:

   ```bash
   ssh pi@192.168.1.xxx
   #(your Pi's IP, you can check this on the details of devices connected to the device serving as AP)
   ```

5. **Login credentials**:
   - Username: `pi` (or your configured username)
   - Password: *[Provided by system administrator]*

6. **Useful SSH commands**:
   ```bash
   # Check if server is running
   sudo systemctl status serverjs.service
   
   # Restart server
   sudo systemctl restart serverjs.service
   
   # View server logs
   sudo journalctl -u serverjs.service -f
   
   # Reboot Pi
   sudo reboot
   ```

### Finding Raspberry Pi IP Address

If the IP shown on projector doesn't work:

```bash
# Method 1: On the Pi itself
hostname -I

# Method 2: Network scan from another computer
# Windows
arp -a

```

## HOW TO USE

### System Initialization

1. **Power on the Raspberry Pi** using recommended power adapter or a USB-A to USB-C cable plugged into the projector's port
   - Red LED will turn solid
   - Green LED will flicker indicating boot activity
   
2. **Power on the Mifi Router/Network Infrastructure being used** 
   - Pi is pre-configured to auto-connect to this network (as mentioned under the hardware prerequisites)

3. **Wait for "Ready" screen** on projector (1-2.5 minutes)
   - Displays connection URL (e.g., `https://192.168.1.132:3000`)
   - Shows access code:  (e.g., `Ultimat3p4ssword`)

### For Clients (Users Sharing Screens):

#### Step 1: Connect to WiFi
- **Network Name (SSID)**: Check projector screen or router label
- **Password**: Provided by system administrator
- Ensure you're within 20-35 meters of the Mifi Router for optimal signal

#### Step 2: Open Browser and Navigate to URL
- Open a modern browser: **Chrome 87+**, **Edge 87+**, or **Firefox 88+**
- Type the URL shown on projector screen (e.g., `https://192.168.1.132:3000`)

#### Step 3: Bypass Security Warning
The system uses a self-signed certificate, so you'll see a warning:
- **Chrome/Edge**: Click "Advanced" → "Proceed to [IP address] (unsafe)"
- **Firefox**: Click "Advanced" → "Accept the Risk and Continue"
- **Safari**: Click "Show Details" → "visit this website"

#### Step 4: Authenticate
- An authentication overlay appears
- Enter the access code displayed on projector: (e.g., `Ultimat3p4ssword`)
- Click **"Unlock & Continue"**

#### Step 5: Share Your Screen
- Click **"Share Screen"** button
- Select what to share from the browser prompt:
  - **Entire Screen** - shares everything on your display
  - **Application Window** - shares only a specific program
  - **Browser Tab** - shares only a browser tab
- Click **"Share"** in the browser prompt
- Your screen immediately appears on the projector

#### Step 6: Stop Sharing
- Click **"Stop Sharing"** button in the browser
- Or simply close the browser tab
- System automatically resets to "Ready" screen for next user


##  Customization

### Change Access Code
Edit `server.js`
```javascript
const ACCESS_CODE = "YOUR-NEW-CODE";
```
### Change Port
Edit `server.js` and `static/host/mainindex.html`
```javascript
const PORT = 3000; // Change to 8080, 443, etc.
```
### Modify UI Theme
Edit CSS in `static/client/index.html` and `static/host/mainindex.html`


## 📚 Technology Stack

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: Vanilla JavaScript, WebRTC APIs
- **Security**: HTTPS (OpenSSL), rate limiting, access code authentication
- **Signaling**: WebSocket (Socket.IO)
- **Video**: WebRTC peer-to-peer, H.264/VP8 codec


## 👨‍💻 Author
**Abdulafeez S.B**  
GitHub: [@Abdulafeez-sb](https://github.com/Abdulafeez-sb)  
LinkedIn: [Abdulafeez Sikirullahi](https://ng.linkedin.com/in/abdulafeez-sikirullahi)


##  Acknowledgments

- WebRTC API documentation
- Socket.IO team
- Raspberry Pi Foundation
- Open source community

---

**Last Updated**: January 2026  
**Version**: 1.0.0

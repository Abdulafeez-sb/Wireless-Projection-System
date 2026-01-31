# Raspberry Pi OS Installation Guide
**Fresh Setup for Wireless Projection System**

This guide walks you through installing Raspberry Pi OS on a fresh microSD card and configuring it for the Wireless Projection System. Follow these steps if you're setting up a new Pi or need to reflash your existing card.

---

## 📋 What You'll Need

### Hardware
- Raspberry Pi (3B+, 4, or 5 recommended)
- MicroSD card (16GB minimum, 32GB+ recommended, Class 10 or UHS-I)
- MicroSD card reader (USB adapter for your computer)
- Computer (Windows, Mac, or Linux)
- Power supply for Raspberry Pi (5V/3A USB-C for Pi 4/5)
- HDMI cable and monitor (for initial setup)
- USB keyboard and mouse (for initial setup)

### Optional but Recommended
- Ethernet cable (for faster initial setup)
- Case with cooling (fan and heatsinks)

---

## 🚀 Step-by-Step Installation

### Step 1: Download Raspberry Pi Imager

1. **Visit the official Raspberry Pi website**:
   - Go to: https://www.raspberrypi.com/software/

2. **Download Raspberry Pi Imager** for your operating system:
   - **Windows**: Click "Download for Windows"
   - **macOS**: Click "Download for macOS"
   - **Linux**: Click "Download for Ubuntu" (or use command below)

3. **Install Raspberry Pi Imager**:
   - **Windows**: Run the `.exe` file and follow installation wizard
   - **macOS**: Open the `.dmg` file and drag to Applications folder
   - **Linux (Ubuntu/Debian)**:
     ```bash
     sudo apt update
     sudo apt install rpi-imager
     ```

---

### Step 2: Prepare the MicroSD Card

1. **Insert microSD card** into your card reader
2. **Connect card reader** to your computer
3. **Backup any existing data** (the card will be completely erased!)

---

### Step 3: Flash Raspberry Pi OS

1. **Launch Raspberry Pi Imager**

2. **Choose Device**:
   - Click "Choose Device"
   - Select your Raspberry Pi model (e.g., "Raspberry Pi 4")

3. **Choose Operating System**:
   - Click "Choose OS"
   - Select: **"Raspberry Pi OS (64-bit)"** (recommended)
   - Or select: **"Raspberry Pi OS (Legacy, 64-bit)"** if using older Pi models
   
   **Note**: Choose the full desktop version, not "Lite" (we need the GUI for kiosk mode)

4. **Choose Storage**:
   - Click "Choose Storage"
   - Select your microSD card
   - ⚠️ **Double-check** you selected the correct drive!

5. **Configure OS Settings** (IMPORTANT):
   - Click the **gear icon** ⚙️ (or "Edit Settings" button)
   - **General Tab**:
     - ✅ Set hostname: `raspberrypi` (or custom name)
     - ✅ Set username: `pi` (recommended for compatibility)
     - ✅ Set password: Choose a strong password
     - ✅ Configure wireless LAN:
       - SSID: Your WiFi network name
       - Password: Your WiFi password
       - Wireless LAN country: Select your country (e.g., `NG` for Nigeria)
     - ✅ Set locale settings:
       - Time zone: Your timezone (e.g., `Africa/Lagos`)
       - Keyboard layout: Your keyboard layout (e.g., `us`)
   
   - **Services Tab**:
     - ✅ Enable SSH
     - Select: "Use password authentication"

   - Click **"Save"**

6. **Write to SD Card**:
   - Click **"Write"** or **"Yes"**
   - Confirm warning: "All existing data will be erased"
   - Wait for process to complete (5-15 minutes depending on card speed)
   - You'll see:
     - "Writing..." with progress bar
     - "Verifying..." when writing completes
     - "Write Successful" when done

7. **Eject the microSD card safely** from your computer

---

### Step 4: First Boot Setup

1. **Insert microSD card** into Raspberry Pi slot (bottom of the board)

2. **Connect peripherals**:
   - HDMI cable to monitor
   - USB keyboard
   - USB mouse
   - Ethernet cable (optional but recommended for first boot)

3. **Power on the Pi**:
   - Connect USB-C power supply
   - Red LED: Power indicator (solid)
   - Green LED: Activity indicator (flashing)

4. **Wait for boot** (first boot takes 2-3 minutes):
   - You'll see rainbow screen briefly
   - Boot messages scroll by
   - Desktop environment loads

---

### Step 5: Initial Configuration (If Not Done in Imager)

If you skipped OS settings in Step 3, you'll see a setup wizard:

1. **Welcome Screen**: Click "Next"

2. **Set Country**: 
   - Country: Your country
   - Language: English (UK) or your preference
   - Timezone: Your timezone
   - Click "Next"

3. **Change Password**:
   - Enter new password twice
   - Click "Next"

4. **Set Up Screen**:
   - Check if there's a black border
   - Click "Next"

5. **Select WiFi Network**:
   - Choose your WiFi network
   - Enter password
   - Click "Next"

6. **Update Software**:
   - Click "Next" to update (recommended)
   - Or "Skip" to update later
   - Wait for updates to complete (10-20 minutes)

7. **Restart**:
   - Click "Restart" when prompted
   - Wait for Pi to reboot

---

### Step 6: Update System (If Not Done in Setup)

Open Terminal (black icon on top menu bar) and run:

```bash
# Update package lists
sudo apt update

# Upgrade all packages
sudo apt upgrade -y

# Clean up
sudo apt autoremove -y

# Reboot
sudo reboot
```

This may take 15-30 minutes depending on your internet speed.

---

### Step 7: Configure SSH Access (For Remote Setup)

If you need to access the Pi remotely:

1. **Enable SSH** (if not enabled during imaging):
   ```bash
   sudo raspi-config
   ```
   - Navigate to: `Interface Options` → `SSH` → `Yes`
   - Select `Finish`

2. **Find your Pi's IP address**:
   ```bash
   hostname -I
   ```
   Example output: `192.168.1.102`

3. **Test SSH connection from another computer**:
   
   **Windows (using PuTTY)**:
   - Open PuTTY
   - Hostname: `192.168.1.102` (your Pi's IP)
   - Port: `22`
   - Click "Open"
   
   **Mac/Linux (using Terminal)**:
   ```bash
   ssh pi@192.168.1.102
   ```

4. **Login**:
   - Username: `pi`
   - Password: Your Pi password

---

### Step 8: Install Essential Tools

```bash
# Install useful utilities
sudo apt install -y git vim nano htop

# Install network tools (useful for troubleshooting)
sudo apt install -y net-tools arp-scan

# Verify Node.js installation (should already be included)
node --version
npm --version

# If Node.js is not installed or outdated, install it:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

---

### Step 9: Configure Display Settings (For Projector Use)

Set optimal display settings for projector output:

```bash
sudo raspi-config
```

Navigate to:
1. **Display Options** → **Resolution**:
   - Select: `DMT Mode 82 1920x1080 60Hz 16:9` (Full HD)
   - Or match your projector's native resolution

2. **Display Options** → **Screen Blanking**:
   - Select: `No` (prevent screen from going black)

3. **System Options** → **Boot / Auto Login**:
   - Select: `Desktop Autologin` (boots directly to desktop)

4. **Select Finish** → **Reboot**: `Yes`

---

### Step 10: Install Browser for Kiosk Mode

Install Brave Browser (recommended - no session restore prompts):

```bash
# Add Brave repository
sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list

# Update package list
sudo apt update

# Install Brave
sudo apt install -y brave-browser

# Verify installation
brave-browser --version
```

**Alternative: Use pre-installed Chromium**:
```bash
# Chromium is usually pre-installed, but you can update it:
sudo apt install -y chromium-browser
```

---

### Step 11: Optimize for Performance

Apply optimizations for better projection performance:

```bash
# Increase GPU memory (for better video performance)
sudo raspi-config
```
- Navigate to: `Performance Options` → `GPU Memory`
- Set to: `256` MB
- Select `Finish` → `Reboot`

**Optional: Overclock (Pi 4 only - use with adequate cooling)**:
```bash
sudo nano /boot/config.txt
```
Add at the end:
```
# Mild overclock for Pi 4
over_voltage=2
arm_freq=1750
```
Save: `Ctrl+X` → `Y` → `Enter`

⚠️ **Warning**: Only overclock if you have proper cooling (fan + heatsinks)

---

### Step 12: Configure Static IP (Recommended)

Set a static IP so the projector URL doesn't change:

```bash
# Find your current network details
ip route | grep default
# Note your gateway (e.g., 192.168.1.1)

# Edit dhcpcd configuration
sudo nano /etc/dhcpcd.conf
```

Add at the end (adjust for your network):
```bash
# Static IP configuration for wireless projection
interface wlan0
static ip_address=192.168.1.102/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

**For Ethernet (if using)**:
```bash
interface eth0
static ip_address=192.168.1.102/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

Save: `Ctrl+X` → `Y` → `Enter`

**Reboot to apply**:
```bash
sudo reboot
```

**Verify static IP**:
```bash
hostname -I
# Should show: 192.168.1.102
```

---

### Step 13: Verify System is Ready

Run these checks before proceeding:

```bash
# Check Node.js
node --version
npm --version

# Check network connectivity
ping -c 3 google.com

# Check SSH access (from another device)
# ssh pi@192.168.1.102

# Check display output
tvservice -s
# Should show: HDMI mode with resolution

# Check available disk space
df -h
# /dev/root should have 10GB+ available
```

---

## ✅ System Ready!

Your Raspberry Pi is now fully configured with:
- ✅ Raspberry Pi OS installed and updated
- ✅ SSH enabled for remote access
- ✅ Static IP configured
- ✅ Browser installed (Brave or Chromium)
- ✅ Display optimized for projector
- ✅ Node.js ready for server installation

---

## 🔗 Next Steps

**You're now ready to install the Wireless Projection System!**

Continue with the main setup guide:

👉 **[Go to Main Installation Guide (Step 1)](README.md#step-1-install-nodejs-and-dependencies)**

Or if viewing on GitHub:

👉 **[Main README - Installation Steps](https://github.com/Abdulafeez-sb/Wireless-Projection-System#installation--setup)**

---

## 🔧 Troubleshooting

### Cannot Boot / No Display

**Problem**: Pi won't boot or monitor shows no signal

**Solution**:
1. **Check power supply**: Must provide 5V/3A (15W) minimum
2. **Re-flash SD card**: Card may be corrupted
3. **Try different HDMI cable/port**: Some monitors are picky
4. **Check SD card is fully inserted**: Should click into place
5. **Try safe mode**: Hold SHIFT during boot

---

### WiFi Not Connecting

**Problem**: Pi can't connect to WiFi

**Solution**:
1. **Check WiFi credentials** in Imager settings or setup wizard
2. **Verify WiFi country** is set correctly:
   ```bash
   sudo raspi-config
   # Localisation Options → WLAN Country
   ```
3. **Check router compatibility**: Pi 3/4 support 2.4GHz and 5GHz
4. **Use Ethernet temporarily** to troubleshoot

---

### "Failed to Start X Server" Error

**Problem**: Desktop won't load

**Solution**:
```bash
# Reconfigure display
sudo raspi-config
# System Options → Boot / Auto Login → Desktop Autologin

# Or boot to command line and fix:
sudo systemctl restart lightdm
```

---

### Slow Performance

**Problem**: Pi is laggy or slow

**Solution**:
1. **Increase GPU memory** (Step 11)
2. **Close unnecessary programs**
3. **Use lighter desktop**: Consider Raspberry Pi OS Lite + manual GUI install
4. **Check SD card speed**: Use Class 10 or UHS-I minimum
5. **Monitor temperature**:
   ```bash
   vcgencmd measure_temp
   # Should be below 80°C
   ```

---

### SSH Connection Refused

**Problem**: Cannot SSH into Pi

**Solution**:
1. **Verify SSH is enabled**:
   ```bash
   sudo systemctl status ssh
   # Should show: active (running)
   ```
2. **Enable SSH if disabled**:
   ```bash
   sudo systemctl enable ssh
   sudo systemctl start ssh
   ```
3. **Check firewall** (if configured):
   ```bash
   sudo ufw allow 22/tcp
   ```
4. **Verify IP address**: May have changed if not static

---

## 📚 Useful Commands Reference

```bash
# System Information
uname -a                    # Kernel version
cat /etc/os-release        # OS version
vcgencmd get_mem arm       # ARM memory
vcgencmd get_mem gpu       # GPU memory
vcgencmd measure_temp      # CPU temperature

# Network
hostname -I                # Show IP address
ip addr show              # Detailed network info
sudo iwlist wlan0 scan    # Scan WiFi networks
ping 8.8.8.8              # Test internet connectivity

# Services
sudo systemctl status ssh              # Check SSH status
sudo systemctl restart networking      # Restart network
sudo systemctl list-units --type=service  # List all services

# Disk & Memory
df -h                     # Disk space
free -h                   # Memory usage
du -sh ~/*                # Home directory usage

# Updates
sudo apt update           # Update package lists
sudo apt upgrade -y       # Install updates
sudo apt autoremove -y    # Remove unused packages
sudo rpi-update           # Update firmware (use carefully)
```

---

## 📖 Additional Resources

- **Official Raspberry Pi Documentation**: https://www.raspberrypi.com/documentation/
- **Raspberry Pi Forums**: https://forums.raspberrypi.com/
- **Raspberry Pi OS Guide**: https://www.raspberrypi.com/documentation/computers/os.html
- **Troubleshooting**: https://www.raspberrypi.com/documentation/computers/configuration.html

---

## 🆘 Need More Help?

If you encounter issues not covered here:
1. Check the [Main README Troubleshooting](README.md#-troubleshooting) section
2. Search Raspberry Pi Forums for your specific error
3. Verify your SD card is genuine and not corrupted
4. Try re-flashing with a different SD card

---

**Document Version**: 1.0.0  
**Last Updated**: January 2026  
**Tested On**: Raspberry Pi 4 Model B, Raspberry Pi OS (64-bit)

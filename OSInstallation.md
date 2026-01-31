# Raspberry Pi OS Installation Guide
**Fresh Setup for Wireless Projection System**

This guide walks you through installing Raspberry Pi OS on a fresh microSD card and configuring it for the Wireless Projection System. Follow these steps if you're setting up a new Pi or need to reflash your existing card.

---

##  What You'll Need

### Hardware
- Raspberry Pi (3B+, 4, or 5 recommended)
- MicroSD card (16GB minimum, 32GB+ recommended, Class 10 or UHS-I)
- MicroSD card reader (USB adapter for your computer)
- Computer (Windows, Mac, or Linux)
- Power supply for Raspberry Pi (5V/3A USB-C for Pi 4/5)
- HDMI cable and monitor (for initial setup) or USB-C cable connected to Laptop

### Optional but Recommended
- Case with cooling (fan and heatsinks)

---

##  Step-by-Step Installation

### Step 1: Download Raspberry Pi Imager

1. **Visit the official Raspberry Pi website**:
   - Go to: https://www.raspberrypi.com/software/

2. **Download Raspberry Pi Imager** for your operating system:
   - **Windows**: Click "Download for Windows"
   - **macOS**: Click "Download for macOS"
   - **Linux**: Click "Download for Ubuntu"

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
   - microHDMI to HDMI cable to monitor
   
3. **Power on the Pi**:
   - Connect USB-C power supply
   - Red LED: Power indicator (solid)
   - Green LED: Activity indicator (flashing)

4. **Wait for boot** (first boot takes 2-3 minutes):
   - You'll see rainbow screen briefly
   - Boot messages scroll by
   - Desktop environment loads

---

### Step 5: Initial Configuration (IF NOT DONE IN IMAGER !!!)

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
   - Wait for updates to complete (5-15 minutes)

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

### Step 7: Configure Display Settings (For Projector Use)

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

### Step 8: Install Browser for Kiosk Mode

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

### Step 9: Optimize for Performance

Apply optimizations for better projection performance:

```bash
# Increase GPU memory (for better video performance)
sudo raspi-config
```
- Navigate to: `Performance Options` → `GPU Memory`
- Set to: `256` MB
- Select `Finish` → `Reboot`

---

## 🔗 Next Steps

**You're now ready to install the Wireless Projection System!**

Continue with the main setup guide:

**[Go to Main Installation Guide (Step 1)](README.md#step-1-install-nodejs-and-dependencies)**

Or if viewing on GitHub:

**[Main README - Installation Steps](https://github.com/Abdulafeez-sb/Wireless-Projection-System#installation--setup)**

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

##  Additional Resources

- **Official Raspberry Pi Documentation**: https://www.raspberrypi.com/documentation/
- **Raspberry Pi Forums**: https://forums.raspberrypi.com/
- **Raspberry Pi OS Guide**: https://www.raspberrypi.com/documentation/computers/os.html
- **Troubleshooting**: https://www.raspberrypi.com/documentation/computers/configuration.html

---

##  Need More Help?

If you encounter issues not covered here:
1. Check the [Main README](README.md#-troubleshooting) section
2. Search Raspberry Pi Forums for your specific error
3. Verify your SD card is genuine and not corrupted
4. Try re-flashing with a different SD card

---

**Document Version**: 1.0.0  
**Last Updated**: January 2026  
**Tested On**: Raspberry Pi 4 Model B, Raspberry Pi OS (64-bit)

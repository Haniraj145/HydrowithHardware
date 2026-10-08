# 🌿 HydroNova - IoT & AI-Powered Hydroponics Monitoring System

HydroNova is a modern, full-stack IoT and AI-driven hydroponic monitoring platform. It combines real-time hardware sensor telemetry (pH, EC, water temperature, turbidity, water level, humidity) with machine-learning plant disease diagnostics to enable smart, automated precision farming.

---

## 🚀 System Architecture

HydroNova consists of three core microservices working seamlessly together:

```
                  ┌─────────────────────────────────────┐
                  │        Hardware Sensors & IoT       │
                  │   (ESP32 / Arduino Telemetry)       │
                  └──────────────────┬──────────────────┘
                                     │ (HTTP / Telemetry API)
                                     ▼
┌──────────────────────┐   ┌───────────────────┐   ┌──────────────────────┐
│  React 19 Frontend   │───│  Express Backend  │───│  Python ML Service   │
│  (TanStack Start)    │   │ (Node.js/Prisma)  │   │   (FastAPI/PyTorch)  │
│  Port: 3000          │   │  Port: 8000       │   │   Port: 8001         │
└──────────────────────┘   └─────────┬─────────┘   └──────────────────────┘
                                     │
                                     ▼
                           ┌───────────────────┐
                           │ PostgreSQL Database│
                           └───────────────────┘
```

1. **Frontend Client (`port: 3000`)**: Built with React 19, TanStack Start, Vite, Tailwind CSS, Framer Motion, and Recharts. Provides live data visualization, farm control panels, and AI image analysis tools.
2. **Backend API (`port: 8000`)**: Powered by Express.js, TypeScript, and Prisma ORM with PostgreSQL. Handles auth (JWT, Google OAuth 2.0), sensor data streams, email verification (Nodemailer), and farm management logic.
3. **ML Service (`port: 8001`)**: High-performance FastAPI service running PyTorch / TensorFlow MobileNet models for real-time plant disease detection from leaf photos.

---

## ⚡ Key Features

- **📡 Real-Time IoT Telemetry**: Monitor key water parameters continuously:
  - **pH Level** & **Electrical Conductivity (EC / TDS)**
  - **Water Temperature** & **Water Level / Flow**
  - **Turbidity** & **Ambient Temperature / Humidity**
- **🔬 AI Plant Disease Diagnosis**: Upload photos of plant leaves for instant disease detection, severity ratings, and organic/chemical treatment suggestions.
- **📊 Interactive Analytics & Charts**: Multi-farm dashboard with live charts, threshold alerts, and historical data logging.
- **🔐 Secure Authentication & Verification**: JWT-based session handling, Google OAuth 2.0, password reset, and automated email verification workflows.
- **📱 Responsive UI**: Sleek dark/light theme, built using Radix UI primitives and dynamic micro-animations.

---

## 🛠️ Tech Stack

| Domain | Technologies Used |
|---|---|
| **Frontend** | React 19, TanStack Start, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons, Radix UI |
| **Backend API** | Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, Nodemailer, Bcrypt, Pino |
| **Machine Learning** | Python 3.10+, FastAPI, PyTorch, TensorFlow, MobileNetV2, OpenCV, Uvicorn |
| **Hardware / IoT** | ESP32, Arduino, Wi-Fi Telemetry, Analog/Digital Water & Climate Sensors |

---

## 📂 Project Directory Structure

```text
hydronova-app/
├── backend/                  # Node.js Express & Prisma API Server
│   ├── prisma/               # Database Schema & Migrations
│   ├── src/
│   │   ├── modules/          # Auth, Sensors, Farms Controllers & Services
│   │   ├── shared/           # Email templates & Utility helpers
│   │   └── server.ts         # Server entry point
│   └── package.json
├── ml-service/               # Python ML API for Plant Health Diagnosis
│   ├── app.py                # FastAPI Application
│   ├── models/               # Pre-trained ML weights (.pth / .onnx)
│   └── requirements.txt      # Python dependencies
├── src/                      # React Frontend Source Code
│   ├── components/           # Reusable UI components
│   ├── routes/               # Page routes (Dashboard, Live Monitor, Farms, ML Diagnosis)
│   └── services/             # API client services & state context
├── scripts/                  # Development automation scripts
│   └── start-dev.ps1         # Multi-service dev launcher for Windows
├── vite.config.ts            # Vite build configuration
└── package.json              # Frontend dependencies & scripts
```

---

## 💻 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.x or v20.x
- **Python**: v3.10 or higher
- **PostgreSQL**: Local instance or remote database URL
- **PowerShell** (for Windows automated startup)

---

## ⚙️ Quick Start Guide

### 1. Clone the Repository

```bash
git clone https://github.com/Haniraj145/HydrowithHardware.git
cd HydrowithHardware
```

### 2. Configure Environment Variables

#### Backend (`backend/.env`)
Create a `.env` file inside the `backend` directory:

```env
PORT=8000
DATABASE_URL="postgresql://user:password@localhost:5432/hydronova?schema=public"
JWT_SECRET="your_jwt_secret_key"
FRONTEND_URL="http://localhost:3000"

# Email Verification (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
```

#### ML Service (`ml-service/.env`)
Create a `.env` file inside the `ml-service` directory (optional):

```env
PORT=8001
HOST=127.0.0.1
```

### 3. Install Dependencies & Setup Database

#### Install Frontend Dependencies
```bash
npm install
```

#### Install Backend Dependencies & Run Migrations
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate
cd ..
```

#### Install ML Service Dependencies
```bash
cd ml-service
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

---

## 🚀 Running the Platform

### Option A: One-Command Startup (Windows PowerShell)

Run the automated dev launcher to start all three services simultaneously:

```powershell
npm run dev:full
```

### Option B: Manual Startup

Open three terminal windows:

1. **Terminal 1 - Express Backend API**:
   ```bash
   cd backend
   npm run dev
   # Server running on http://127.0.0.1:8000
   ```

2. **Terminal 2 - Python ML Service**:
   ```bash
   cd ml-service
   uvicorn app:app --host 127.0.0.1 --port 8001 --reload
   # ML service running on http://127.0.0.1:8001
   ```

3. **Terminal 3 - React Frontend**:
   ```bash
   npm run dev
   # App running on http://localhost:3000
   ```

---

## 🔌 Hardware Sensor Setup (ESP32 / Arduino)

To stream hardware telemetry to the HydroNova backend:
1. Connect your sensors (pH meter, EC sensor, DS18B20 temperature probe, ultrasonic distance sensor) to your microcontroller.
2. Program your ESP32 to publish sensor payloads via POST request to the backend telemetry endpoint:

```http
POST http://<SERVER_IP>:8000/api/sensors/readings
Content-Type: application/json

{
  "farmId": "your-farm-id",
  "ph": 6.2,
  "ec": 1.4,
  "waterTemp": 22.5,
  "humidity": 65,
  "airTemp": 24.1,
  "turbidity": 4.5,
  "waterLevel": 85
}
```

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

Developed by **[Haniraj Gupta](https://github.com/Haniraj145)**
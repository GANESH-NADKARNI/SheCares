# 🌸 SheCares — AI-Powered Women’s Healthcare Platform

SheCares is a full-stack healthcare platform designed to support women's health, safety, and wellness through AI-powered assistance and specialized healthcare modules. The platform integrates healthcare management, emergency support, mental wellness, nutrition analysis, and AI-driven diagnosis into a single user-friendly application.

## ✨ Features

### 🩺 Health & Wellness
- Pregnancy Care Module
- Period Care / Cycle Tracking
- Food Analyzer
- Mental Wellness Module
- Care Taker Support Module

### 🚨 Safety & Emergency
- SOS Emergency Reporting
- Incident Reporting System

### 🤖 AI-Powered Services
- AI Diagnosis Module
- AI Health Assistant Chatbot

### 🔐 Authentication
- Firebase Authentication
- Secure Login & Registration

---

## 🏗️ System Architecture

| Service | Port | Description |
|----------|----------|----------|
| combine:app | 8001 | Main AI & Combined Services |
| backend:app | 8002 | Core Backend APIs |
| chat_ai:app | 8003 | AI Chatbot Service |
| React Frontend | 5173 | User Interface |
| server.cjs | Custom | Node.js Support Service |

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- Tailwind CSS

### Backend
- FastAPI
- Python
- Node.js
- Uvicorn

### Authentication
- Firebase Authentication

### AI & Analytics
- AI Diagnosis Engine
- Conversational AI Chatbot
- Health Data Processing

---

## 📌 Core Modules

### 🤰 Pregnancy Care
Provides pregnancy-related information, monitoring, and guidance.

### 🩸 Period Care
Tracks menstrual cycles and provides cycle-related insights.

### 🥗 Food Analyzer
Analyzes food and nutrition information to promote healthy habits.

### 🧠 Mental Wellness
Supports emotional well-being through wellness-focused features.

### 👨‍👩‍👧 Care Taker Module
Helps caregivers manage and support women's healthcare needs.

### 🚨 SOS Module
Allows users to report emergencies and seek immediate assistance.

### 📋 Incident Reporting
Enables users to report safety-related incidents.

### 🤖 AI Diagnosis
Provides AI-powered preliminary health assessments and recommendations.

---

## 📂 Project Structure

```text
SheCares/
│
├── backend/
│   ├── backend.py
│   ├── combine.py
│   ├── chat_ai.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── server.cjs
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/GANESH-NADKARNI/SheCares.git
cd SheCares
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd ../frontend
npm install
```

---

## ▶️ Running the Project

### Terminal 1 — AI Combined Service

```bash
cd backend
uvicorn combine:app --port 8001 --reload
```

### Terminal 2 — AI Chat Service

```bash
cd backend
uvicorn chat_ai:app --host 0.0.0.0 --port 8003 --reload
```

### Terminal 3 — Main Backend API

```bash
cd backend
uvicorn backend:app --host 0.0.0.0 --port 8002 --reload
```

### Terminal 4 — React Frontend

```bash
cd frontend
npm run dev
```

### Terminal 5 — Node.js Support Server

```bash
cd frontend
node server.cjs
```

---

## 🚀 Startup Order

1. Start Backend Services (8001, 8002, 8003)
2. Start React Frontend
3. Start Node.js Support Server

---

## 🔒 Authentication

SheCares uses Firebase Authentication for:

- User Registration
- User Login
- Secure Session Management
- Protected Routes

---

## 🎯 Future Enhancements

- Real-time emergency notifications
- Telemedicine integration
- AI-powered personalized healthcare recommendations
- Wearable device integration
- Multilingual support
- Cloud deployment with Docker & Kubernetes

---

## 👨‍💻 Developer

**Ganesh Nadkarni**

B.E. Computer Science Engineering (AI & ML)  
KLS Gogte Institute of Technology

GitHub: https://github.com/GANESH-NADKARNI

Project Repository: https://github.com/GANESH-NADKARNI/SheCares

---

## ⭐ Support

If you found this project useful, consider giving it a star ⭐ on GitHub.

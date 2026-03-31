# 🌐 Uruthunai: Hyperlocal Resource Network Documentation

## 📌 Executive Summary (The What, Why, How, When)

### **What is Uruthunai?**
Uruthunai (meaning "Supporting Aide" in Tamil) is a community-driven, hyperlocal disaster resilience platform. It facilitates rapid mutual aid by connecting residents in real-time during crises like floods, cyclones, or medical emergencies. It transforms passive neighborhoods into active, self-sustaining safety networks.

### **Why was it built?**
Traditional disaster response often suffers from "last-mile" delays. In major events (like the 2015 Chennai Floods or Cyclone Gaja), the first responders are almost always **neighbors**. Uruthunai was built to:
- **Formalize Mutual Aid**: Move beyond chaotic WhatsApp groups into a structured, verified system.
- **Solve Resource Matching**: Connect those who *have* (extinguishers, water, boats) with those who *need*.
- **Empower Local Response**: Give local admins the tools to manage their own street-level emergencies.

### **How does it work?**
The system operates on three layers:
1.  **Visibility**: A real-time OpenStreetMap interface showing nearby resources and urgent needs.
2.  **Verification**: A trust-score system and admin verification to prevent misinformation.
3.  **Action**: Direct request-response loops and a "Global Emergency Mode" that streamlines the UI for high-stress situations.

### **When is it used?**
- **Blue Skies (Normal Ops)**: Everyday resource sharing, volunteer registration, and community building.
- **Grey Skies (Pre-disaster)**: Broadcasting alerts, supply hoarding notifications, and evacuation prep.
- **Red Skies (Crisis)**: Rapid search and rescue, medical assistance requests, and real-time flood monitoring.

---

## 🏗️ System Architecture & Modules

The platform is structured into five core modules designed for maximum reliability and ease of use.

### 1. **Resource Discovery Module (The Map)**
- **Feature**: Interactive OpenStreetMap integration.
- **Function**: Users post "Offers" (e.g., "I have a power bank") or "Needs" (e.g., "Need clean water").
- **Privacy**: Location markers use obfuscated boundaries to protect resident privacy while remaining useful for navigation.

### 2. **Emergency Governance Module (Admin)**
- **Control Center**: A centralized dashboard for area administrators.
- **Verification System**: Vetting users, volunteers, and organizations to ensure platform safety.
- **Moderation Queue**: Rapidly handling flagged reports to stop rumors during crises.

### 3. **Hyperlocal Alert System**
- **Global Alerts**: Admins can push critical updates (e.g., "Reservoir discharge at 4 PM") to all users.
- **Urgency Levels**: Color-coded alerts (Info, Warning, Critical, Resolved) for immediate visual recognition.

### 4. **Volunteer & Identity Module**
- **Trust Scores**: Dynamic reliability ratings based on successful help interactions and community feedback.
- **Role-Based Access**: Specialized roles for Medical Professionals, Heavy Vehicle Drivers, and General Volunteers.

### 5. **Emergency Mode (Systems Override)**
- **Function**: Can be toggled platform-wide by lead admins.
- **Impact**: Simplifies the UI to highlight only critical life-saving resources and emergency contacts, reducing cognitive load for stressed users.

---

## 🛠️ Technical Implementation

- **Frontend**: React 19 + Tailwind CSS for a premium, responsive "Control Center" aesthetic.
- **Backend**: Node.js + Express with a structured Route-Controller-Model architecture.
- **Database**: MySQL for robust, relational tracking of users, incidents, and audit logs.
- **Real-time**: Leverages Socket.io hooks for instant updates on the map and alert feeds.

---
*Uruthunai: Because in times of crisis, the person next door is your first line of defense.*

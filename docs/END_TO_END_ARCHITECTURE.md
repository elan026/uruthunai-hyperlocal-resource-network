# 🌐 Uruthunai: End-to-End System Architecture

This document describes the current end-to-end architecture, core modules, user roles, and data flow of the Uruthunai (Namma Thunai) Hyperlocal Resource Network.

---

## 1. 🏗️ End-To-End System Architecture

The Uruthunai platform leverages a modern, decoupled **MERN stack** (MySQL replacing MongoDB for relational robustness) connected dynamically via WebSockets to enable real-time tracking, mutual aid discovery, and disaster communications.

### 1.1 Structural Tiers
1.  **Frontend (Client Presentation Layer)**
    -   **Tech**: React (JS) + Vite + TailwindCSS.
    -   **Function**: A responsive Progressive Web App (PWA) style interface optimized for mobile usage out in the field. Implements geolocation parsing and map markers (via Leaflet/OpenStreetMap).
    -   **Context API**: Global state management to preserve real-time updates and emergency mode status.

2.  **Backend (API & Business Logic Layer)**
    -   **Tech**: Node.js + Express.
    -   **Architecture**: Modular Route-Controller-Service-Model architecture ensuring separation of concerns.
    -   **Real-time engine**: Socket.io middleware is integrated to broadcast updates regarding live events (incidents/requests).
    -   **Security**: Implementations for JWT-based auth and bcrypt/cryptographic data hashing.

3.  **Database (Persistence Layer)**
    -   **Tech**: MySQL.
    -   **Function**: Manages relational and transactional schemas mapping User identities, geo-located Resources, community Requests, admin Roles, and OTP verifications strictly via robust references.

---

## 2. 🧩 Core Modules

The system is logically decoupled into scalable functional modules, each handling a specific domain of operations.

### 2.1 Resource Discovery & Mapping Module
-   **Description**: This is the heart of the "hyperlocal" application. It maps real-time data onto an interactive OpenStreetMap.
-   **Functions**: 
    -   Users can pinpoint active requests or offer vital resources (Medical, Food, Evacuation, Equipments).
    -   Filters allow toggling to distinguish between Requests (Needs) vs. Offerings (Resources).

### 2.2 Volunteer & Identity Verification Module (Auth & Profile)
-   **Description**: Combats misinformation by securely identifying contributors and vetting their reliability.
-   **Functions**: 
    -   OTP-based Mobile Authentication.
    -   Trust-scoring metric assigned to verification levels (identifying professional doctors vs. general civilian volunteers).
    -   Tracks historical mutual aid actions to compute reliability.

### 2.3 Hyperlocal Alert & Feed Module
-   **Description**: A feed-based ecosystem ensuring immediate communication of warnings regarding a specific geographical proximity.
-   **Functions**:
    -   Aggregates live community updates, requests, and verified authority broadcasts.
    -   Color-coded tiering ensures severe emergency information eclipses generic aid requests.

### 2.4 Emergency Governance Module (Admin Control)
-   **Description**: Dashboard for centralized civic administrators, enabling supervision and intervention across the ecosystem.
-   **Functions**: 
    -   Approves high-stake volunteer profiles.
    -   Handles the centralized moderation queues for reviewing flagged posts containing potential misinformation or abuse.

### 2.5 Systems Override (Emergency Mode) Module
-   **Description**: A global or area-level toggle restricted exclusively to Administration.
-   **Functions**: 
    -   Instantly disables regular/passive platform capabilities across the frontend and displays highly simplified, critical UI for users responding to maximum-panic "Red Skies" scenarios.
    -   Blocks non-urgent uploads/clutter from saving to the system.

---

## 3. 👤 User Roles and Capabilities

Access Control is strictly managed using distinct Role-Based Access Controls (RBAC).

### **1. Civilian User (Community Member)**
-   **Capabilities**: 
    -   View the hyperlocal map and discover nearby resources.
    -   Post and claim "Needs" (Requests) or "Offers" (Resources).
    -   Report community incidents.
    -   Update their locality settings and profile data.
-   **Focus**: Passive to active contribution during normal conditions, strictly survival operations during emergencies.

### **2. Verified Volunteer**
-   **Capabilities**: 
    -   Inherits all functions of the Civilian User.
    -   Higher credibility tag visible on all mutual aid posts.
    -   Depending on their specialty (Medical, Logistics, Heavy Equipment), their resources are prioritized on search results during incidents.

### **3. Area Administrator (Admin)**
-   **Capabilities**: 
    -   Bypass regular login rules into the centralized `/admin/dashboard`.
    -   Verifies user IDs and dictates platform capability limits for bad actors.
    -   Toggle **Emergency Mode** application-wide.
    -   Broadcast official "Red" alerts that overrule regular user feeds.
-   **Focus**: Curation, crisis escalation controls, and platform hygiene.

---

## 4. 📁 Screenshot Directory Layout

To fulfill visualization requirements, a `screenshots/` directory has been generated at the root of the project to cleanly host application walkthrough imagery. 

*   `screenshots/authentication/`: Contains flow for Mobile Entry, OTP Validation, and Profile Setup.
*   `screenshots/user_app/`: Visuals portraying the Resource Map, Creation Modals, the Alerts Feed, and Post Details.
*   `screenshots/admin_panel/`: Dashboard overviews, Moderation queues, and the active Emergency Trigger mechanism.

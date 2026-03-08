# 🏗️ Uruthunai Server Setup Documentation

This document provides step-by-step instructions to set up and run the **Uruthunai** backend server.

## 📋 Prerequisites

Before starting, ensure you have the following installed on your system:
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MySQL Server** (v8.0 or higher)

## 🚀 Getting Started

### 1. Repository Setup
Navigate to the server directory:
```bash
cd uruthunai-hyperlocal-resource-network/server
```

### 2. Install Dependencies
Install all required Node.js packages:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server/` root directory and configure your MySQL credentials:

```env
DB_USER=your_mysql_username
DB_PASS=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=uruthunai
JWT_SECRET=your_super_secret_key
```

### 4. Database Initialization
Run the initialization script to create the database and required tables:
```bash
node initDb.js
```

### 5. Seeding Data (Optional)
To populate the database with realistic mock data (users, resources, requests, and alerts):
```bash
node seedDatabase.js
```
For specific map-based listing data:
```bash
node seedMapData.js
```

## 🛠️ Running the Server

### Development Mode
Runs the server with `nodemon`, which automatically restarts when file changes are detected:
```bash
npm run dev
```
The server will start on **http://localhost:5000**.

### Production Mode
```bash
node server.js
```

## 📂 Project Structure

- `server.js`: Main entry point and Express configuration.
- `routes/`: API endpoint definitions.
- `controllers/`: Request handling logic.
- `models/`: Database schema and interaction logic.
- `middleware/`: Authentication and safety filters.
- `config/`: Database connection setup.
- `uploads/`: Directory for stored media/images.

## 🔒 Security
- **JWT**: Token-based authentication for user sessions.
- **Bcrypt**: Password hashing (where applicable).
- **Admin Verification**: Administrative routes are protected by a specific `adminToken`.

---
*Built for the Uruthunai Hyperlocal Resource Network.*

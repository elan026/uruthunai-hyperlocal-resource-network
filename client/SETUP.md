# Uruthunai Client Setup Documentation

This document provides step-by-step instructions to set up and run the **Uruthunai** frontend application.

## 📋 Prerequisites

Before starting, ensure you have the following installed on your system:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)

## 🚀 Getting Started

### 1. Repository Setup

Navigate to the client directory:

```bash
cd uruthunai-hyperlocal-resource-network/client
```

### 2. Install Dependencies

Install all required Node.js packages:

```bash
npm install
```

### 3. API Configuration

The client connects to the backend at `http://localhost:5000/api` by default. This is configured in `src/services/api.js`.

To update the backend URL for production or different environments, modify the `API_BASE` constant in that file.

## 🛠️ Running the Application

### Development Mode

Starts a local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be accessible at **http://localhost:5173**.

### Production Build

Generates a highly optimized production bundle in the `dist/` directory:

```bash
npm run build
```

### Preview Build

To test the production build locally:

```bash
npm run preview
```

## 🏗️ Tech Stack

- **Framework**: React 19 (JS)
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Maps**: React-Leaflet (OpenStreetMap)
- **State Management**: Context API + Hooks

## 📂 Project Structure

- `src/components/`: Reusable UI components (Navbar, Sidebar, Layouts).
- `src/pages/`: Main application views (Landing, Dashboard, Map).
- `src/context/`: Authentication and Global state providers.
- `src/hooks/`: Custom React hooks.
- `src/services/`: API communication layer (Axios).
- `src/index.css`: Global styles and Tailwind directives.

---

*Built for the Uruthunai Hyperlocal Resource Network.*

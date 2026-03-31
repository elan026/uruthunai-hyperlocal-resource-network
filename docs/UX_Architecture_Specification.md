# Namma Thunai (Uruthunai) – UX Architecture Specification

## 1. Information Architecture (IA)

### 1.1 Sitemap
**1. Onboarding & Authentication**
- `/login` (Mobile Number Entry)
- `/verify-otp` (OTP Entry)
- `/setup-profile` (Name, Locality, Avatar)

**2. Main Application (Community Member)**
- `/home` (Default)
  - Map View (Default)
  - Feed View (Toggle from Map)
  - Filter Sheets (Requests, Resources, Incidents)
- `/create` (Action Sheet / Modal)
  - New Request
  - New Resource
  - Report Incident
- `/alerts`
  - Active Emergency Alerts
  - Community Updates
- `/profile`
  - My Posts
  - Verification Status / Upload ID
  - Settings (Notifications, Privacy)
  - Help & Support

**3. Admin Control Center**
- `/admin/dashboard` (Overview & Metrics)
- `/admin/verification` (User Verification Queue)
- `/admin/moderation` (Flagged Content Queue)
- `/admin/emergencies` (Trigger Sitewide Emergency Modes)

### 1.2 Navigation Structure Recommendation
- **Primary Navigation Structure:** Bottom Navigation Bar (for standard users).
  - *Why:* The target audience favors mobile usage (many likely operating on the street or in an emergency). A bottom app bar ensures primary sections (Home, Create, Alerts, Profile) are immediately reachable by the thumb.
- **Admin Navigation Structure:** Persistent Left Sidebar (Desktop/Tablet optimized).
  - *Why:* Administrators need expansive horizontal space for tables (queues) and maps.

---

## 2. User Flows

### 2.1 Onboarding & Account Creation
1. **Screen 1: Login** - User enters mobile number -> Taps "Send OTP" -> Proceed to Screen 2.
2. **Screen 2: OTP Verification** - User enters 6-digit OTP -> Success? -> Proceed to Screen 3. (If Error: Show "Invalid OTP" inline).
3. **Screen 3: Profile Setup** - User enters Name and Primary Neighborhood -> Taps "Complete" -> Landing on Home Map View.

### 2.2 Core Action Flow: Pinning a Request on the Map
1. **Screen 1: Home (Map)** - User taps the prominent "+" (Create) button on the Floating Action Button (FAB) or bottom nav.
2. **Screen 2: Creation Type Selector (Bottom Sheet)** - User selects "Request Help".
3. **Screen 3: Create Request Form** - User enters:
   - What they need (Category: Food, Medical, Water, etc.)
   - Description (Text)
   - Location (Uses current GPS or drag pin on mini-map)
   - Taps "Post Request".
4. **Screen 4: Loading State** - Spinner with "Pinning to the community map..."
5. **Screen 5: Success Toast & Map Refresh** - Returns to Home (Map), panning to the newly dropped pin with a success toast at the top indicating "Request posted successfully".

### 2.3 Settings & Profile Management
1. **Screen 1: Profile Tab** - User navigates to Profile from Bottom Nav.
2. **Screen 2: Verification Section** - Taps "Get Verified".
3. **Screen 3: ID Upload** - Uploads valid ID -> Taps "Submit for Verification".
4. **Screen 4: Success** - State changes to "Pending Verification".

### 2.4 Error Recovery Flow (Failed Action)
1. **Step**: User attempts to post an Incident Report without granting Location Permissions.
2. **Decision/Error Point**: App fails to fetch GPS.
3. **Recovery State**: Trigger modal "Location Required". User is given two options: "Open Settings" or "Type Address Manually".
4. **Resumption**: User types address or grants permission, flow resumes from the submission step.

---

## 3. Full Screen-by-Screen Breakdown

### 3.1 Login Screen
- **Purpose**: Authenticate user via mobile.
- **Key UI Elements**: App Logo, Phone Number Input Field, Submit Button, Terms & Conditions text.
- **Primary Action**: "Continue via SMS" (Button)
- **Secondary Action**: None.
- **Navigation Options**: None.

### 3.2 Home Dashboard (Map View)
- **Purpose**: Real-time awareness of immediate surroundings.
- **Key UI Elements**: Interactive full-screen map, Map Pins (color-coded), Search/Filter Bar (Top), "List View" toggle, Bottom Navigation.
- **Primary Action**: Add new pin ("+" FAB).
- **Secondary Actions**: Tap a pin to view details, filter map by tag.
- **Navigation Options**: Alerts, Profile, Create.

### 3.3 Create Post (Form)
- **Purpose**: Capture structured data for community needs or alerts.
- **Key UI Elements**: Top App Bar ("Cancel" left, "Post" right), Category Selector chips, Text Area, Location Picker block, Optional Image upload.
- **Primary Action**: "Post to Neighborhood"
- **Secondary Actions**: "Cancel" / "Add Photo"
- **Navigation Options**: Goes back to Home.

### 3.4 Alerts & Notifications
- **Purpose**: Show verified civic/community updates.
- **Key UI Elements**: List of cards, segmented control (Urgent vs Community).
- **Primary Action**: Tap alert to expand.
- **Secondary Actions**: Mark as read.
- **Navigation Options**: Bottom Nav.

### 3.5 Admin Control Center (Dashboard)
- **Purpose**: High-level overview to triage situations.
- **Key UI Elements**: KPI blocks (New Users, Active Incidents, Pending Verifications), System Status indicator, Navigation Sidebar.
- **Primary Action**: Trigger "Emergency Mode".
- **Secondary Actions**: Navigate to specific moderation queues.
- **Navigation Options**: Sidebar (Dashboard, Verification, Moderation, Emergencies).

---

## 4. Microcopy Specification

| Screen / Component | Element | Microcopy |
|--------------------|------------------------|-------------------------------------------------------|
| Login | Screen Title | Welcome to Namma Thunai |
| Login | Subheading | Enter your phone number to connect with your community. |
| Login | Input Placeholder | +91 98765 43210 |
| Login | Primary CTA | Get OTP |
| OTP | Screen Title | Verify your number |
| OTP | Subheading | We sent a 6-digit code to [Number] |
| OTP | CTA / Helper | Resend code in 0:30s |
| Home Map | Top Search | Search for resources or areas... |
| Home Map | Filter Helper | Filter by: 🔴 Incidents, 🟢 Resources, 🟠 Requests |
| Create Post | Title | What's happening? |
| Create Post | Description Placeholder| e.g., "Need 5 liters of drinking water for elderly neighbor."|
| Create Post | Primary CTA | Drop Pin & Post |
| Create Post | Add Photo Tooltip | Adding a photo helps responders act faster. |
| Admin Dashboard | Emergency Mode CTA | ⚠️ Trigger Emergency Protocol |

---

## 5. Error States

**1. Form Validation Error (Empty Description)**
- *Scenario*: User tries to post a request without text.
- *Headline*: Description required
- *Body*: Please add a short description so neighbors know exactly how to help.
- *CTA*: "Dismiss" / Focus moves to input.

**2. Network / Connection Error**
- *Scenario*: App loses internet connection during map load.
- *Headline*: You are offline
- *Body*: Namma Thunai needs an active connection to show real-time updates.
- *CTA*: "Retry Connection"

**3. Permission Denied (Location)**
- *Scenario*: User denied location access but wants to post an incident.
- *Headline*: Location needed
- *Body*: We need to know where this is happening to alert nearby community members.
- *CTA*: "Enable Location" (Goes to device settings) or "Search Manually".

**4. Admin Action Failed (Session Expired)**
- *Scenario*: Admin tries to verify a user, but JWT expired.
- *Headline*: Session Expired
- *Body*: Your admin session has timed out for security reasons. Please log in again.
- *CTA*: "Return to Login"

---

## 6. Empty States

**1. Home Map (No Activity Nearby)**
- *Visual*: A stylized, non-intimidating illustration of an empty street with a friendly neighborhood cat or dog.
- *Headline*: It's quiet around here.
- *Body*: There are no active requests or incidents in your immediate vicinity.
- *CTA*: "Offer a Resource"

**2. Alerts Tab (No Alerts)**
- *Visual*: Illustration of a peaceful, clear sky or a calm bell icon.
- *Headline*: All clear!
- *Body*: No active emergencies or alerts in your verified areas. Safe and sound.
- *CTA*: None required (passive state).

**3. Admin Moderation Queue (Inbox Zero)**
- *Visual*: A clean checklist with a checkmark.
- *Headline*: Queue Empty
- *Body*: No flagged content requiring review at this time.
- *CTA*: "Refresh Queue"

---

## 7. Loading & Transition States

**1. Initial App Load**
- *Look*: Branded splash screen scaling down seamlessly into a map skeleton (showing grayed out roads), before pins populate.
- *Copy*: None.

**2. Submitting a Post**
- *Look*: The "Post" button transforms into a spinner. A slight dark overlay covers the screen to block double-taps.
- *Copy*: "Pinning your update..."
- *Transition*: Modal slides down, success toast appears from the top (green background): "✅ Update shared with the immediate area."

**3. Admin Verifying a User**
- *Look*: Inline spinner on the "Approve" button.
- *Transition*: Row highlights green, then slides out to the left to indicate removal from the queue.

---

## 8. Structural Recommendations

1. **Navigation Pattern**: 
   - Strongly recommend a **fixed bottom navigation bar** for mobile web. It supports one-handed use which is critical for an emergency/civic tech app where users might be walking, carrying items, or multi-tasking.
2. **Progressive Disclosure**:
   - Location input on the Create Post state should default to "Current Location" with a mini map. If the user wants to adjust, they tap it to expand to full screen. Do not overwhelm them with coordinates or address lines right away.
3. **Confusing Drop-off Points**: 
   - **Verification flows** are notorious for drop-offs. Make ID verification *optional* for reading/browsing, but *required* for posting sensitive incidents or offering high-trust resources (like sheltering). Clearly explain *why* an ID is needed (trust & safety).
4. **Accessibility (A11y) Considerations**:
   - **Color Contrast**: Map pins (Red/Orange/Green) must also use distinct shapes (e.g., Triangle for Crisis, Circle for Resource, Square for Request) so colorblind users can distinguish them instantly.
   - **Touch Targets**: All CTAs and map pins must be a minimum of `44x44px`.
   - **Screen Readers**: Ensure dynamic map updates trigger ARIA live regions so visually impaired users hear "New incident reported 2 blocks away" rather than missing silent map updates.

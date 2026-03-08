# 🗺️ Resource Discovery Module (The Map)

The **Resource Discovery Module** is the core interactive layer of Uruthunai, designed to provide instant visual context to community needs and offerings.

### Key Features
- **Interactive OpenStreetMap**: A full-screen Map interface integrated with OpenStreetMap using `react-leaflet`.
- **Hyperlocal Markers**: Dynamic, category-specific icons on the map representing verified resources.
- **Geographic Filtering**: Allows users to filter "Offers" (Supply) vs "Needs" (Requests) within a specific kilometer radius.
- **Smart Distance Tracking**: Calculates the distance from the user's current location to each resource in real-time.
- **Privacy Protection**: Implements geographic obfuscation—markers are placed near locations, but exact residential addresses are hidden to protect privacy until a request is accepted.

### Workflow
1. **Explore**: Users pan and zoom to see whats available nearby.
2. **Filter**: Narrow down by Category: Medical, Water, Power, Food, or Shelter.
3. **Inspect**: Click a marker to view the abbreviated detail snapshot.
4. **Action**: Transition to the Resource Detail page to request the item.

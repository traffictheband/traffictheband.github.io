# TRAFFIC - The Band Website

Welcome to the repository for the official website of **TRAFFIC**, a Bengal-based rock/blues/alternative/funk/indie band.

## Tech Stack & Design System
- **Technologies**: Pure HTML5, CSS3, and Vanilla JavaScript.
- **Design Aesthetic**: Glassmorphism with monospace typography (`Space Mono` from Google Fonts) and warm amber highlights, evoking concrete streets and raw analog amplifiers.
- **Responsiveness**: Optimized for mobile, tablet, desktop, and large TV displays.

---

## Directory Structure

The files in this project are organized as follows:
```text
traffictheband.github.io/
├── index.html                       # Homepage
├── css/
│   └── style.css                    # Monospace design system styles
├── js/
│   ├── components.js                # Centralized configurations & dynamic layout builders
│   └── app.js                       # Interactive scripts (hamburger toggle, image animations, lightbox)
├── images/
│   ├── logo.png                     # Band logo
│   ├── members/                     # Member portraits folder
│   └── gallery/                     # Visual showcase photos folder
├── members/
│   └── {member-name}/index.html     # Clean folder URL member profile pages
└── gallery/
    └── index.html                   # Standalone visual gallery page
```

---

## How It Works

### 1. Centralized Component Rendering
To make updates simple and prevent copy-pasting code across multiple files, all external links, headers, and footers are centralized in [js/components.js](file:///h:/02%20HDD%20Mirror%20[PC]/GitHub/traffictheband.github.io/js/components.js). 

On load, this script:
- Dynamically detects the page's relative path depth (e.g. `../../` or `../`).
- Replaces `<header>` and `<footer>` elements on each page with uniform navigation and contact blocks.
- Populates member-specific Instagram button URLs and embed frame sources at runtime based on the page's ID.

### 2. Updating Social Links & Handles
To change the band's official links or update a member's Instagram profile, open `js/components.js` and modify the `TRAFFIC_LINKS` constant:
```javascript
const TRAFFIC_LINKS = {
  band: {
    instagram: "https://www.instagram.com/traffic.theband/",
    twitter: "https://x.com/traffic_theband",
    youtube: "https://www.youtube.com/@traffic.theband",
    facebook: "https://www.facebook.com/traffic.theband",
    email: "traffic.music.contact@gmail.com"
  },
  members: {
    "shoumik-biswas": {
      instagram: "https://www.instagram.com/_shoumik.biswas_/",
      handle: "@_shoumik.biswas_"
    },
    ...
  }
};
```

### 3. Last Updated Tracker
The homepage footer features a live update tracker linked to the latest Git commit:
- The script checks the `production` branch for the latest commit details.
- If no branch named `production` is active, it falls back to checking the default branch (`main`).
- It extracts the commit time and short SHA and renders it dynamically in the visitor's local timezone.
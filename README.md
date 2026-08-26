# Descriptor Selection Tool

An interactive decision tree application with physics-based visualization for selecting descriptors.

## Features

- **Decision Tree Navigation**: Interactive multi-parent, multi-child node graph
- **Physics Engine**: Matter.js integration for dynamic visual interactions
- **Responsive Design**: Adapts to different screen sizes
- **Local Storage**: Saves state for persistence across sessions

## Project Structure

```
├── index.html          # Main HTML entry point
├── css/               # Stylesheets
│   ├── animate.css    # Animation styles
│   ├── dashboard.css  # Main dashboard styles
│   ├── fonts.css      # Font definitions
│   └── title.css      # Title styling
├── lib/               # JavaScript modules
│   ├── data.json      # Decision tree data structure
│   ├── decisionTree.js # Core decision tree logic
│   ├── physics.js     # Matter.js physics implementation
│   └── showHide.js    # UI show/hide utilities
└── site.webmanifest   # Web app manifest

```

## Technologies

- **jQuery 3.6.0** - DOM manipulation and utilities
- **Matter.js 0.19.0** - 2D physics engine
- **ES6 Modules** - Modern JavaScript module system

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build process required - runs directly in the browser

## Usage

The application loads decision tree data from `lib/data.json` and presents an interactive interface for navigating through choices.

## Development

- Edit `lib/data.json` to modify the decision tree structure
- Modify styles in the `css/` directory
- Core logic is in `lib/decisionTree.js`

## Browser Support

Requires a modern browser with support for:
- ES6 Modules
- Local Storage
- Fetch API

## License

Proprietary - Certify Client Project

---

*Developed by ddelcourt, 2025*

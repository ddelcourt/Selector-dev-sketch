# Quick Reference Guide

**Fast onboarding for AI assistants and developers working with this codebase.**

---

## 🎯 What Is This?

Interactive decision tree where user choices appear as bouncing balls. Think: "Choose Your Own Adventure" meets physics simulation.

---

## 🚀 Getting Started (30 seconds)

1. Open `index.html` in browser
2. Click Start, make choices, watch balls appear
3. Click Back to see sin-hole animation
4. Try physics mode toggle (top-right)

**No build process. No npm install. Just open the file.**

---

## 📁 Key Files (Where to Look First)

| File | Purpose | Lines |
|------|---------|-------|
| `lib/decisionTree.js` | Core logic, navigation, state | ~500 |
| `lib/physics.js` | Matter.js wrapper, ball rendering | ~800 |
| `lib/data.json` | Tree structure (easy to edit) | ~200 |
| `index.html` | Entry point, loads everything | ~100 |
| `lib/physicsControls.js` | UI controls for physics tweaking | ~300 |

**Start with:** Read `decisionTree.js` first, then `physics.js`.

---

## 🔧 Common Tasks

### Change the Decision Tree
Edit `lib/data.json`:
```json
{
  "choices": {
    "myChoice": {
      "choice": "Display Text",
      "stepTitle": "Question to ask",
      "children": ["nextChoice1", "nextChoice2"],
      "result": "final-descriptor"  // Only for leaf nodes
    }
  }
}
```

### Add a New Physics Mode
In `lib/physics.js`, add to `MODES` object:
```javascript
MODES.myMode = {
  name: 'My Mode',
  gravity: 0.5,
  friction: 0.02,
  frictionAir: 0.01,
  bounciness: 0.9,
  velocityThreshold: 0.01,
  enableThreshold: true
};
```

### Change Ball Colors
In `lib/physics.js`, modify `ballColors` array (RGB strings).

### Adjust Ball Size
In `lib/physics.js`, change `config.ballSizePercent` (default: 0.06 = 6% of screen).

---

## 🚨 Critical Requirements

### ⚠️ SVG Export (User Priority #1)
**From user memory:** SVG export is NON-NEGOTIABLE. Must preserve in any architecture change.

**Status:** Not implemented yet. When adding:
1. Capture ball positions/sizes
2. Convert to SVG circles with text
3. Preserve colors and layout
4. Export as downloadable file

---

**Last Updated:** August 28, 2026  
**Read Time:** 5 minutes

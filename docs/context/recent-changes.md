# Recent Changes & Implementation Details

**Date:** August 28, 2026  
**Session Summary:** Navigation history fixes and visual polish for back button functionality

---

## Key Changes

### Navigation History System
- Added `navigationHistory` array to track complete user path
- Implemented `hadBall` flag for reliable back button behavior
- Fixed navigation issues in multi-parent graphs

### Sin-Hole Falling Effect
- Balls fall through floor when backing up (normal/reversed gravity)
- Added `fallingBalls` array for animation tracking
- Zero gravity maintains instant removal

### Text Label Rendering Fix
- Text labels stay with falling balls throughout animation
- Combined `balls` and `fallingBalls` for rendering

---

**Files Modified:** `lib/decisionTree.js`, `lib/physics.js`  
**Session Duration:** ~2 hours  
**Bugs Fixed:** 3 (back button, instant removal, disappearing text)  
**Features Added:** 1 (sin-hole animation)

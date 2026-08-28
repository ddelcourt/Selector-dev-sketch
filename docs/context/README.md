# Project Documentation

**Descriptor Selection Tool - Documentation Index**

---

## Primary Documentation

### **[TECHNICAL_DOCUMENTATION.md](../TECHNICAL_DOCUMENTATION.md)**

**The complete technical reference for this project** - Start here for comprehensive understanding.

This is the main documentation file covering:

- **System Architecture** - Component diagram, file structure, technology stack
- **Core Modules** - DecisionTree, PhysicsEngine, PhysicsControls (with full API reference)
- **Data Structures** - JSON schema, graph properties, navigation history
- **Physics Engine Deep Dive** - Matter.js integration, collision resolution, energy management, physics modes
- **Event Flow & State Management** - Application lifecycle, state synchronization, event handlers
- **API Reference** - Complete method documentation for all modules
- **Configuration & Customization** - Physics parameters, ball colors, modes, styling
- **Design Patterns & Best Practices** - Module pattern, event-driven architecture, error handling

**Read time**: 30-45 minutes for complete understanding

### **[Changelog](changelog.md)**

Version history and recent changes - Perfect format, chronological record of all updates.

---

## Quick Start

### New to the Project?

1. **Read [README.md](../../README.md)** (5 min) - Overview, features, quick start
2. **Read [TECHNICAL_DOCUMENTATION.md](../TECHNICAL_DOCUMENTATION.md)** (30 min) - Complete technical reference
3. **Review [changelog.md](changelog.md)** (5 min) - Recent changes and version history

### Need Something Specific?

| Task | Documentation Section |
|------|----------------------|
| Understand architecture | TECHNICAL_DOCUMENTATION.md → System Architecture |
| Learn API methods | TECHNICAL_DOCUMENTATION.md → API Reference |
| Modify decision tree | TECHNICAL_DOCUMENTATION.md → Data Structures |
| Customize physics | TECHNICAL_DOCUMENTATION.md → Configuration & Customization |
| Debug issues | TECHNICAL_DOCUMENTATION.md → Design Patterns (Error Handling) |
| Add new features | TECHNICAL_DOCUMENTATION.md → Core Modules + API Reference |
| Review recent work | changelog.md |

---

## File Organization

**Documentation has been consolidated for clarity:**

```
/
├── README.md                      ← Project overview, quick start
└── docs/
    ├── TECHNICAL_DOCUMENTATION.md ← Complete technical reference (NEW)
    └── context/
        ├── README.md              ← This file (documentation index)
        └── changelog.md           ← Version history
```

**Previous multiple documentation files have been merged into a single comprehensive technical reference.**

---

## For AI Assistants

When starting work on this project:

1. **Load [TECHNICAL_DOCUMENTATION.md](../TECHNICAL_DOCUMENTATION.md) first** - Contains complete codebase reference
2. **Check [changelog.md](changelog.md)** - Understand recent changes and current version
3. **Follow design patterns** - Documented in TECHNICAL_DOCUMENTATION.md
4. **Preserve state invariants** - `selectList.length === balls.length === triggeredBalls.size`

---

## External Resources

- **Matter.js Documentation**: https://brm.io/matter-js/docs/
- **jQuery API**: https://api.jquery.com/
- **Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

---

**Last Updated**: August 28, 2026  
**Documentation Structure**: Consolidated single-file reference


```
Need to...
├── Get started quickly? 
│   └─→ quick-reference.md
│
├── Understand the whole project?
│   └─→ project-context.md
│
├── See what changed recently?
│   └─→ recent-changes.md
│
├── Debug complex issue?
│   └─→ architecture.md (data flow)
│
└── Track project history?
    └─→ changelog.md
```

---

## Critical Information

### SVG Export Requirement
**From user memory:** SVG export is NON-NEGOTIABLE. Must preserve in any architecture change.

### Key Patterns to Preserve
1. Navigation history system (v2.0)
2. hadBall flag for back button
3. Sin-hole falling effect
4. Three physics modes
5. State synchronization rules

---

**Last Updated:** August 28, 2026  
**Created For:** Workspace move context preservation  
**Project Version:** 2.0

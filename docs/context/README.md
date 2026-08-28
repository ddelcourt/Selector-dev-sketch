# Repository Context Documentation

**Context preservation for the Descriptor Selection Tool project**

---

## What Is This?

This folder contains comprehensive documentation created to preserve project context when moving the workspace to a new location. These files allow AI assistants and developers to quickly understand the project without access to previous chat history.

---

## How to Use These Files

### When Opening Project in New Location

1. **Start here:** Read `quick-reference.md` (5 minutes)
2. **For full context:** Read `project-context.md` (15 minutes)
3. **For recent work:** Read `recent-changes.md` (10 minutes)

### When Working on the Project

- **Making changes?** Check `architecture.md` for data flow
- **Debugging?** Use diagnostic tips in `quick-reference.md`
- **Adding features?** Review patterns in `project-context.md`
- **Tracking history?** Update `changelog.md`

---

## File Guide

### 📘 quick-reference.md (5 min read)
Fast onboarding guide with common tasks, debugging tips, and critical requirements.

### 📗 project-context.md (15 min read)
Comprehensive project documentation including architecture, recent work, and implementation patterns.

### 📙 recent-changes.md (10 min read)
Detailed implementation notes from August 2026 sessions with problem/solution pairs.

### 📕 architecture.md (Reference)
Technical diagrams, data flow, state synchronization rules, and component dependencies.

### 📔 changelog.md (Reference)
Version history, feature evolution, performance improvements, and development timeline.

---

## Quick Decision Tree

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

### ⚠️ SVG Export Requirement
**From user memory:** SVG export is NON-NEGOTIABLE. Must preserve in any architecture change.

### 🎯 Key Patterns to Preserve
1. Navigation history system (v2.0)
2. hadBall flag for back button
3. Sin-hole falling effect
4. Three physics modes
5. State synchronization rules

---

**Last Updated:** August 28, 2026  
**Created For:** Workspace move context preservation  
**Project Version:** 2.0

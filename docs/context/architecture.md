# Technical Architecture & Data Flow

## System Overview

Interactive decision tree application with Matter.js physics visualization.

### Key Components

1. **Decision Tree Controller** (`lib/decisionTree.js`)
   - State management: currentNode, selectList, navigationHistory
   - Methods: init(), step(), back(), restart()

2. **Physics Engine** (`lib/physics.js`)
   - Matter.js integration
   - Three physics modes (Normal, Reversed, Zero Gravity)
   - Ball rendering with text labels

3. **Physics Controls** (`lib/physicsControls.js`)
   - Real-time parameter adjustment
   - Mode switching interface

4. **Data Structure** (`lib/data.json`)
   - JSON-based tree definition
   - Multi-parent, multi-child nodes

## Data Flow

### User Makes Choice
1. Click choice button
2. DecisionTree.step(choiceId)
3. Update navigationHistory with hadBall flag
4. PhysicsEngine.addBall(text)
5. Matter.js simulation + text rendering

### User Clicks Back
1. Pop from navigationHistory
2. Check hadBall flag
3. If true: remove ball (sin-hole effect or instant)
4. Navigate to previousNodeId

## State Synchronization

Critical invariant: `selectList.length === balls.length === triggeredBalls.size`

---

**Architecture Version:** 2.0  
**Last Major Change:** Navigation history system

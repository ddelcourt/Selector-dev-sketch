////////////////////////
//
//  Physics Engine for Bouncing Balls
//  Using Matter.js
//  ddelcourt 8.2026
//
////////////////////////

var PhysicsEngine = (function () {
  "use strict";

  // Matter.js modules
  var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events,
    Body = Matter.Body;

  // Engine state
  var engine = null;
  var render = null;
  var runner = null;
  var balls = [];
  var walls = [];
  var isActive = false;
  var canvas = null;
  var renderEventAttached = false; // Track if event is attached
  var currentMode = 'normal'; // Track current physics mode

  // Ball colors (matching your current design)
  var ballColors = [
    "rgb(242, 255, 99)", // Yellow (hidden in original)
    "rgb(99, 211, 255)", // Blue
    "rgb(229, 128, 240)", // Purple
    "rgb(255, 180, 99)", // Orange
    "rgb(99, 255, 187)", // Green
    "rgb(243, 118, 155)", // Pink
    "rgb(211, 255, 99)", // Lime
    "rgb(180, 150, 255)", // Lavender
  ];

  // Configurable physics parameters
  var config = {
    ballSizePercent: 0.06,       // 6% of screen area (aligned with defaults)
    velocityX: { min: -20, max: 20 },
    velocityY: { min: 8.5, max: 10 },
    bounciness: 1,               // Perfect elasticity by default
    friction: 0.05,
    gravity: 1.0,
    textSizeFactor: 0.22,        // Font size as proportion of ball radius
    allCaps: true,               // Whether to show text in all caps
    velocityThreshold: 0.01      // Minimum velocity before ball stops (prevents infinite micro-bouncing)
  };

  // Physics modes configuration
  var MODES = {
    normal: {
      name: 'Normal Gravity',
      gravity: 1.0,
      friction: 0.05,
      frictionAir: 0.01,
      bounciness: 0.95,
      velocityThreshold: 0.01,
      enableThreshold: true
    },
    reversed: {
      name: 'Reversed Gravity (Damped)',
      gravity: -0.04,              // Gentle upward float
      friction: 0.05,
      frictionAir: 0.01,
      bounciness: 0.95,
      velocityThreshold: 0.01,
      enableThreshold: true
    },
    zeroGravity: {
      name: 'Zero Gravity (Perpetual Motion)',
      gravity: 0,
      friction: 0,                 // No surface friction
      frictionAir: 0,              // No air resistance
      bounciness: 1.0,             // Perfect elasticity
      velocityThreshold: 0,        // Not used (threshold disabled)
      enableThreshold: false       // Never stop balls
    }
  };

  // Initialize the physics engine
  function init() {
    canvas = document.getElementById("physicsCanvas");
    if (!canvas) {
      console.error("Physics canvas not found");
      return false;
    }

    // Set canvas size to window size
    resizeCanvas();

    // Create engine with optimized settings for accurate collisions
    engine = Engine.create({
      gravity: { x: 0, y: config.gravity }, // Configurable gravity
      enableSleeping: false, // Disable automatic sleeping globally
      constraintIterations: 2,
      positionIterations: 12, // High iteration count for accurate collision resolution
      velocityIterations: 8   // High iteration count for accurate velocity resolution
    });
    
    // Further optimize for perfect elastic collisions
    engine.timing.timeScale = 1.0; // Normal time scale
    // Note: positionIterations already set above to 12
    
    
    console.log("Engine created with optimized collision settings:", engine);

    // Create renderer
    render = Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: canvas.width,
        height: canvas.height,
        wireframes: false,
        background: "transparent",
        showSleeping: false, // Keep original colors for sleeping bodies
      },
    });

    // Create walls (floor, left wall, right wall)
    createWalls();

    // Run the engine with fixed timestep for consistent physics
    runner = Runner.create({
      isFixed: true,  // Use fixed timestep
      delta: 1000 / 60  // 60 FPS (16.667ms per frame)
    });

    // Velocity management: cap max speed and apply threshold to stop slow balls
    Events.on(engine, "afterUpdate", function () {
      var mode = MODES[currentMode];
      
      balls.forEach(function (ball) {
        if (!ball || ball.isStatic) return;
        
        var velocity = ball.velocity;
        var speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        // Cap maximum velocity to prevent wall tunneling (all modes)
        var maxSpeed = 20; // Increased from 5 for better dynamics
        if (speed > maxSpeed) {
          var scale = maxSpeed / speed;
          Body.setVelocity(ball, { 
            x: velocity.x * scale, 
            y: velocity.y * scale 
          });
        }
        
        // Apply velocity threshold if enabled in current mode
        if (mode.enableThreshold && speed < mode.velocityThreshold && speed > 0) {
          Body.setVelocity(ball, { x: 0, y: 0 });
          Body.setAngularVelocity(ball, 0);
        }
      });
    });

    // Set up custom rendering for text labels (only once)
    if (!renderEventAttached) {
      Events.on(render, "afterRender", function () {
        var context = render.context;
        
        // Ensure balls array exists and has valid items
        if (!balls || balls.length === 0) return;
        
        balls.forEach(function (ball) {
          // Skip if ball doesn't have required properties
          if (!ball || !ball.label || !ball.position || !ball.ballRadius) return;

          var pos = ball.position;
          var radius = ball.ballRadius;

          // Calculate proportional font size
          var fontSize = Math.max(10, Math.round(radius * config.textSizeFactor));
          var lineHeight = fontSize * 1.2;

          // Draw text centered in ball
          context.save();
          context.translate(pos.x, pos.y);
          context.rotate(ball.angle);

          context.fillStyle = "#000";
          context.font = "bold " + fontSize + "px Arial, sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";

          // Convert label to string and word wrap
          var labelText = String(ball.label);
          
          // Apply all caps if enabled
          if (config.allCaps) {
            labelText = labelText.toUpperCase();
          }
          
          var words = labelText.split(" ");
          var lines = [];
          var currentLine = words[0] || "";

          for (var i = 1; i < words.length; i++) {
            var testLine = currentLine + " " + words[i];
            var metrics = context.measureText(testLine);
            if (metrics.width > radius * 1.5) {
              lines.push(currentLine);
              currentLine = words[i];
            } else {
              currentLine = testLine;
            }
          }
          lines.push(currentLine);

          // Draw lines
          var totalHeight = lines.length * lineHeight;
          var startY = -totalHeight / 2 + lineHeight / 2;

          lines.forEach(function (line, idx) {
            context.fillText(line, 0, startY + idx * lineHeight);
          });

          context.restore();
        });
      });
      renderEventAttached = true;
      console.log("Render event handler attached");
    }

    console.log("Physics engine initialized");
    return true;
  }

  // Resize canvas to match window size
  function resizeCanvas() {
    if (!canvas) return;
    
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;
    
    // Get the actual rendered canvas dimensions from CSS
    var rect = canvas.getBoundingClientRect();
    var width = rect.width;
    var height = rect.height;
    
    // If dimensions are 0, fall back to viewport dimensions
    if (width === 0 || height === 0) {
      width = document.documentElement.clientWidth || window.innerWidth;
      height = document.documentElement.clientHeight || window.innerHeight;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    console.log("Canvas resized from:", oldWidth, "x", oldHeight, "to:", width, "x", height);
    
    if (render) {
      render.options.width = canvas.width;
      render.options.height = canvas.height;
      render.canvas.width = canvas.width;
      render.canvas.height = canvas.height;
      
      // Adjust ball positions if they're outside new boundaries
      adjustBallPositions(oldWidth, oldHeight, width, height);
      
      // Recreate walls with new dimensions
      removeWalls();
      createWalls();
    }
  }
  
  // Adjust ball positions when canvas is resized
  function adjustBallPositions(oldWidth, oldHeight, newWidth, newHeight) {
    if (!balls || balls.length === 0) return;
    
    var wallThickness = 50;
    var minX = wallThickness + 10;
    var maxX = newWidth - wallThickness - 10;
    var minY = wallThickness + 10;
    var maxY = newHeight - wallThickness - 10;
    
    console.log("Adjusting ball positions for new canvas size");
    
    balls.forEach(function(ball) {
      if (!ball || !ball.ballRadius) return;
      
      var radius = ball.ballRadius;
      var pos = ball.position;
      var newX = pos.x;
      var newY = pos.y;
      var adjusted = false;
      
      // Check if ball is outside new boundaries and constrain position
      if (pos.x - radius < minX) {
        newX = minX + radius;
        adjusted = true;
      } else if (pos.x + radius > maxX) {
        newX = maxX - radius;
        adjusted = true;
      }
      
      if (pos.y - radius < minY) {
        newY = minY + radius;
        adjusted = true;
      } else if (pos.y + radius > maxY) {
        newY = maxY - radius;
        adjusted = true;
      }
      
      // If ball needed adjustment, set new position
      if (adjusted) {
        Body.setPosition(ball, { x: newX, y: newY });
        // Dampen velocity when repositioning to prevent extreme bouncing
        Body.setVelocity(ball, { 
          x: ball.velocity.x * 0.5, 
          y: ball.velocity.y * 0.5 
        });
        console.log("Adjusted ball position from", pos.x.toFixed(0), ",", pos.y.toFixed(0), "to", newX.toFixed(0), ",", newY.toFixed(0));
      }
    });
  }

  // Create boundary walls
  function createWalls() {
    var wallThickness = 50;
    var w = canvas.width;
    var h = canvas.height;

    // Floor - positioned so inner surface is at canvas bottom (y = h)
    var floor = Bodies.rectangle(w / 2, h + wallThickness / 2, w, wallThickness, {
      isStatic: true,
      restitution: config.bounciness, // Use configurable bounciness
      friction: config.friction,
      render: { fillStyle: "transparent" },
    });

    // Left wall - positioned so inner surface is at canvas left edge (x = 0)
    var leftWall = Bodies.rectangle(-wallThickness / 2, h / 2, wallThickness, h, {
      isStatic: true,
      restitution: config.bounciness,
      friction: config.friction,
      render: { fillStyle: "transparent" },
    });

    // Right wall - positioned so inner surface is at canvas right edge (x = w)
    var rightWall = Bodies.rectangle(w + wallThickness / 2, h / 2, wallThickness, h, {
      isStatic: true,
      restitution: config.bounciness,
      friction: config.friction,
      render: { fillStyle: "transparent" },
    });

    // Ceiling - positioned so inner surface is at canvas top (y = 0)
    var ceiling = Bodies.rectangle(w / 2, -wallThickness / 2, w, wallThickness, {
      isStatic: true,
      restitution: config.bounciness,
      friction: config.friction,
      render: { fillStyle: "transparent" },
    });

    walls = [floor, leftWall, rightWall, ceiling];
    Composite.add(engine.world, walls);
    
    console.log("Walls created: floor y=" + floor.position.y + ", ceiling y=" + ceiling.position.y + 
                ", left x=" + leftWall.position.x + ", right x=" + rightWall.position.x);
  }

  // Remove walls from the world
  function removeWalls() {
    walls.forEach(function (wall) {
      Composite.remove(engine.world, wall);
    });
    walls = [];
  }

  // Calculate ball radius based on screen area
  function calculateBallRadius(percentage) {
    // Use config value if no percentage provided
    var pct = percentage !== undefined ? percentage : config.ballSizePercent;
    

    
    // Calculate screen area
    var screenArea = window.innerWidth * window.innerHeight;
    
    // Calculate base radius from screen area
    // radius = sqrt(area * percentage / PI) to get radius from area
    var baseRadius = Math.sqrt((screenArea * pct) / Math.PI);
    
    // Add some randomness (±20%)
    var randomFactor = 0.8 + Math.random() * 0.4;
    var radius = baseRadius * randomFactor;
    
    // Clamp between reasonable values (increased max for larger balls)
    var minRadius = 30;
    var maxRadius = 800;
    radius = Math.max(minRadius, Math.min(maxRadius, radius));
    

    
    return radius;
  }

  // Add a new ball to the simulation
  function addBall(text, colorIndex) {
    if (!engine || !isActive) {
      console.warn("Cannot add ball: engine not active");
      return null;
    }

    // Convert text to string to ensure it's valid
    var labelText = text ? String(text) : "?";


    var radius = calculateBallRadius(); // Calculate size based on screen area
    var x = Math.random() * (canvas.width - 200) + 100; // Random X position
    var y = 100; // Start near top (CHANGED from -100 to be visible)

    // Random initial velocity using config values
    var vx = config.velocityX.min + Math.random() * (config.velocityX.max - config.velocityX.min);
    var vy = config.velocityY.min + Math.random() * (config.velocityY.max - config.velocityY.min);

    // Get color for this ball
    var colorIdx = (colorIndex !== undefined ? colorIndex : balls.length) % ballColors.length;
    var color = ballColors[colorIdx];



    // Create ball body with consistent density for uniform mass distribution
    var ball = Bodies.circle(x, y, radius, {
      restitution: config.bounciness, // Use configurable bounciness
      friction: config.friction,
      frictionAir: 0.01, // Air resistance (will be set to 0 in zero-gravity mode)
      frictionStatic: config.friction,
      density: 0.001, // Consistent density for all balls (mass = density * area)
      sleepThreshold: Infinity, // Never sleep automatically
      render: {
        fillStyle: color,
      },
    });
    
    // Note: Matter.js does not have an 'angularFriction' property
    // Angular velocity damping is controlled through the world's timing properties

    // Store custom data
    ball.label = labelText;
    ball.ballColor = color;
    ball.ballRadius = radius;

    // Set initial velocity
    Body.setVelocity(ball, { x: vx, y: vy });

    // Add to world
    Composite.add(engine.world, ball);
    balls.push(ball);

    return ball;
  }

  // Clear all balls
  function clearBalls() {
    console.log("Clearing", balls.length, "balls");
    balls.forEach(function (ball) {
      Composite.remove(engine.world, ball);
    });
    balls = [];
  }

  // Remove the last ball added
  function removeLastBall() {
    if (balls.length === 0) {
      console.warn("No balls to remove");
      return null;
    }
    
    var lastBall = balls.pop();
    Composite.remove(engine.world, lastBall);
    console.log("Removed last ball. Remaining balls:", balls.length);
    return lastBall;
  }

  // Start the physics simulation
  function start() {
    if (!engine) {
      if (!init()) {
        console.error("Failed to initialize engine");
        return false;
      }
    }

    isActive = true;
    canvas.style.display = "block";

    Render.run(render);
    Runner.run(runner, engine);

    return true;
  }

  // Stop the physics simulation
  function stop() {
    isActive = false;
    if (canvas) {
      canvas.style.display = "none";
    }

    if (render) {
      Render.stop(render);
    }

    if (runner && engine) {
      Runner.stop(runner);
    }
  }

  // Set gravity dynamically
  function setGravity(gravityValue) {
    if (!engine) {
      console.warn("Cannot set gravity: engine not initialized");
      return false;
    }
    
    config.gravity = gravityValue;
    engine.gravity.y = gravityValue;
    return true;
  }

  // Set friction dynamically on all balls and walls
  function setFriction(frictionValue, frictionAirValue) {
    if (!engine) {
      console.warn("Cannot set friction: engine not initialized");
      return false;
    }
    
    // Allow setting even if no balls yet (will apply to future balls)
    config.friction = frictionValue;
    
    // If no balls yet, just update config and return
    if (balls.length === 0) {
      return true;
    }
    
    // Update friction on all existing balls using Body.set for proper updates
    var ballCount = 0;
    balls.forEach(function(ball) {
      Body.set(ball, {
        friction: frictionValue,
        frictionStatic: frictionValue,
        frictionAir: frictionAirValue !== undefined ? frictionAirValue : ball.frictionAir
      });
      ballCount++;
    });
    
    // Update friction on all walls using Body.set
    var wallCount = 0;
    walls.forEach(function(wall) {
      Body.set(wall, {
        friction: frictionValue,
        frictionStatic: frictionValue
      });
      wallCount++;
    });
    
    return true;
  }

  // Set bounciness (restitution) dynamically on all balls and walls
  function setBounciness(bouncinessValue) {
    if (!engine) {
      console.warn("Cannot set bounciness: engine not initialized");
      return false;
    }
    
    config.bounciness = bouncinessValue;
    
    // Update bounciness on all existing balls using Body.set
    balls.forEach(function(ball) {
      Body.set(ball, {
        restitution: bouncinessValue
      });
    });
    
    // Update bounciness on all walls using Body.set
    if (walls && walls.length > 0) {
      walls.forEach(function(wall) {
        Body.set(wall, {
          restitution: bouncinessValue
        });
      });
      console.log("Bounciness set to:", bouncinessValue, "on", balls.length, "balls and", walls.length, "walls");
    } else {
      console.warn("No walls found - only updated balls. Walls array:", walls);
      console.log("Bounciness set to:", bouncinessValue, "on", balls.length, "balls only");
    }
    
    return true;
  }

  // Set random velocities on all balls (for zero-gravity scatter effect)
  function setRandomVelocities(velocityRange) {
    if (!engine || balls.length === 0) {
      console.warn("Cannot set random velocities: engine not initialized or no balls");
      return false;
    }
    
    // Default velocity range if not provided
    var vRange = velocityRange || { min: -3, max: 3 };
    
    balls.forEach(function(ball) {
      var vx = vRange.min + Math.random() * (vRange.max - vRange.min);
      var vy = vRange.min + Math.random() * (vRange.max - vRange.min);
      Body.setVelocity(ball, { x: vx, y: vy });
    });
    
    console.log("Random velocities applied to", balls.length, "balls");
    return true;
  }

  // Set physics mode (normal, reversed, zeroGravity)
  function setMode(modeName, options) {
    if (!MODES[modeName]) {
      console.error("Unknown physics mode:", modeName);
      return false;
    }
    
    if (!engine) {
      console.warn("Cannot set mode: engine not initialized");
      return false;
    }
    
    var mode = MODES[modeName];
    currentMode = modeName;
    
    console.log("Setting physics mode to:", mode.name);
    
    // Apply mode settings
    setGravity(mode.gravity);
    setFriction(mode.friction, mode.frictionAir);
    setBounciness(mode.bounciness);
    
    // Update config for new balls
    config.gravity = mode.gravity;
    config.friction = mode.friction;
    config.bounciness = mode.bounciness;
    config.velocityThreshold = mode.velocityThreshold;
    
    // Handle sleeping/threshold based on mode
    balls.forEach(function(ball) {
      Body.set(ball, { 
        isSleeping: false,
        sleepThreshold: mode.enableThreshold ? 60 : Infinity,
        timeScale: 1.0
      });
      
      // Give tiny nudge in zero-gravity mode if ball is stationary
      if (!mode.enableThreshold && ball.velocity.x === 0 && ball.velocity.y === 0) {
        Body.setVelocity(ball, { x: 0.01, y: 0.01 });
      }
    });
    
    // Configure engine sleeping
    if (engine) {
      engine.enableSleeping = mode.enableThreshold;
    }
    
    // Apply random velocities if options provided
    if (options && options.randomVelocities) {
      setRandomVelocities(options.randomVelocities);
    }
    
    console.log("Physics mode set to:", modeName, "- Gravity:", mode.gravity, "Friction:", mode.friction, "Bounciness:", mode.bounciness);
    return true;
  }

  // Get current mode name
  function getMode() {
    return currentMode;
  }

  // Enable/disable velocity threshold (deprecated - use setMode instead)
  function setVelocityThreshold(enabled) {
    console.warn("setVelocityThreshold is deprecated. Use setMode() instead.");
    // For backward compatibility, switch to appropriate mode
    if (enabled) {
      setMode('normal');
    } else {
      setMode('zeroGravity');
    }
    return true;
  }

  // Diagnostic: Print all physics properties of first ball and wall
  function diagnosticCheck() {
    if (balls.length === 0 || walls.length === 0) {
      console.log("DIAGNOSTIC: No balls or walls to check");
      console.log("  - balls.length:", balls.length);
      console.log("  - walls.length:", walls.length);
      console.log("  - engine.world.bodies:", engine ? engine.world.bodies.length : "no engine");
      return;
    }
    
    var ball = balls[0];
    var wall = walls[0];
    
    console.log("=== DIAGNOSTIC CHECK ===");
    console.log("Ball properties:");
    console.log("  - friction:", ball.friction);
    console.log("  - frictionStatic:", ball.frictionStatic);
    console.log("  - frictionAir:", ball.frictionAir);
    console.log("  - restitution:", ball.restitution);
    console.log("  - sleepThreshold:", ball.sleepThreshold);
    console.log("  - isSleeping:", ball.isSleeping);
    console.log("  - density:", ball.density);
    console.log("  - mass:", ball.mass);
    console.log("  - inertia:", ball.inertia);
    console.log("  - velocity:", "x=" + ball.velocity.x.toFixed(3), "y=" + ball.velocity.y.toFixed(3));
    console.log("  - speed:", Math.sqrt(ball.velocity.x**2 + ball.velocity.y**2).toFixed(3));
    console.log("  - angularVelocity:", ball.angularVelocity.toFixed(3));
    console.log("  - angle:", (ball.angle * 180 / Math.PI).toFixed(1), "degrees");
    
    console.log("Wall properties:");
    console.log("  - friction:", wall.friction);
    console.log("  - frictionStatic:", wall.frictionStatic);
    console.log("  - restitution:", wall.restitution);
    console.log("  - isStatic:", wall.isStatic);
    
    console.log("Engine properties:");
    console.log("  - gravity.y:", engine.gravity.y);
    console.log("  - enableSleeping:", engine.enableSleeping);
    console.log("  - positionIterations:", engine.positionIterations);
    console.log("  - velocityIterations:", engine.velocityIterations);
    console.log("  - constraintIterations:", engine.constraintIterations);
    console.log("  - timing.timeScale:", engine.timing.timeScale);
    
    console.log("State:");
    console.log("  - currentMode:", currentMode);
    console.log("  - Total bodies in world:", engine.world.bodies.length);
    console.log("  - Walls in world:", walls.filter(function(w) { 
        return engine.world.bodies.indexOf(w) !== -1; 
      }).length);
    
    // Calculate total energy in system
    var totalKE = 0;
    var totalAngularKE = 0;
    balls.forEach(function(b) {
      var speed = Math.sqrt(b.velocity.x**2 + b.velocity.y**2);
      totalKE += b.mass * speed * speed / 2;
      totalAngularKE += b.inertia * b.angularVelocity * b.angularVelocity / 2;
    });
    console.log("Total kinetic energy:", totalKE.toFixed(3));
    console.log("Total angular energy:", totalAngularKE.toFixed(3));
    console.log("======================");
  }

  // Monitor energy levels over time
  function monitorEnergy(intervalMs) {
    var monitoringInterval = setInterval(function() {
      if (!isActive || balls.length === 0) {
        clearInterval(monitoringInterval);
        return;
      }
      
      var totalKE = 0;
      var totalAngularKE = 0;
      balls.forEach(function(b) {
        var speed = Math.sqrt(b.velocity.x**2 + b.velocity.y**2);
        totalKE += b.mass * speed * speed / 2;
        totalAngularKE += b.inertia * b.angularVelocity * b.angularVelocity / 2;
      });
      

    }, intervalMs || 2000);
    
    return monitoringInterval;
  }

  // Public API
  return {
    init: init,
    start: start,
    stop: stop,
    addBall: addBall,
    clearBalls: clearBalls,
    removeLastBall: removeLastBall,
    resizeCanvas: resizeCanvas,
    
    // Mode management (recommended API)
    setMode: setMode,
    getMode: getMode,
    
    // Direct property setters (for advanced use)
    setGravity: setGravity,
    setFriction: setFriction,
    setBounciness: setBounciness,
    setRandomVelocities: setRandomVelocities,
    setVelocityThreshold: setVelocityThreshold, // Deprecated, kept for compatibility
    
    // Debug utilities
    diagnosticCheck: diagnosticCheck,
    monitorEnergy: monitorEnergy,
    
    isActive: function () {
      return isActive;
    },
    getBalls: function () {
      return balls; // Return reference for debugging
    },
    // Config getters and setters
    getConfig: function () {
      return Object.assign({}, config); // Return a copy
    },
    setConfig: function (newConfig) {
      // Store old values for comparison
      var oldBallSize = config.ballSizePercent;
      var oldBounciness = config.bounciness;
      var oldFriction = config.friction;
      
      console.log("setConfig called with:", newConfig);
      console.log("Current config before update:", config);
      
      // Update config values
      if (newConfig.ballSizePercent !== undefined) config.ballSizePercent = newConfig.ballSizePercent;
      if (newConfig.velocityX !== undefined) config.velocityX = newConfig.velocityX;
      if (newConfig.velocityY !== undefined) config.velocityY = newConfig.velocityY;
      if (newConfig.bounciness !== undefined) config.bounciness = newConfig.bounciness;
      if (newConfig.friction !== undefined) config.friction = newConfig.friction;
      if (newConfig.textSizeFactor !== undefined) config.textSizeFactor = newConfig.textSizeFactor;
      if (newConfig.allCaps !== undefined) config.allCaps = newConfig.allCaps;
      if (newConfig.velocityThreshold !== undefined) config.velocityThreshold = newConfig.velocityThreshold;
      if (newConfig.gravity !== undefined) {
        config.gravity = newConfig.gravity;
        // Update engine gravity if it exists
        if (engine) {
          engine.gravity.y = config.gravity;
        }
      }
      
      console.log("Config after update:", config);
      console.log("Specifically, config.ballSizePercent is now:", config.ballSizePercent);
      console.log("Old ball size:", oldBallSize, "New ball size:", config.ballSizePercent);
      console.log("Active:", isActive, "Balls count:", balls.length);
      
      // Update existing balls with new properties
      if (isActive && balls.length > 0) {
        // Update ball size if changed
        if (newConfig.ballSizePercent !== undefined && oldBallSize !== config.ballSizePercent) {
          var scaleFactor = Math.sqrt(config.ballSizePercent / oldBallSize);
          console.log("Scaling balls by factor:", scaleFactor, "from", oldBallSize, "to", config.ballSizePercent);
          balls.forEach(function(ball) {
            var oldRadius = ball.ballRadius;
            Body.scale(ball, scaleFactor, scaleFactor);
            // Update stored radius to match scaled size
            ball.ballRadius = ball.ballRadius * scaleFactor;
            console.log("Scaled ball from radius", oldRadius, "to", ball.ballRadius, "actual body vertices:", ball.vertices.length);
          });
          console.log("Scaled existing balls by factor:", scaleFactor);
        }
        
        // Update bounciness and friction on existing balls
        if (newConfig.bounciness !== undefined || newConfig.friction !== undefined) {
          balls.forEach(function(ball) {
            if (newConfig.bounciness !== undefined) {
              ball.restitution = config.bounciness;
            }
            if (newConfig.friction !== undefined) {
              ball.friction = config.friction;
            }
          });
          console.log("Updated existing balls physics properties");
        }
      }
      
      // If engine is active, recreate walls with new friction/bounciness
      if (isActive && engine) {
        removeWalls();
        createWalls();
      }
      
      console.log("Config updated:", config);
    }
  };
})();

// Handle window resize
window.addEventListener("resize", function () {
  // Always resize canvas, even if physics isn't active
  // This ensures the canvas is ready when physics starts
  if (PhysicsEngine && typeof PhysicsEngine.resizeCanvas === 'function') {
    console.log("Window resized, resizing canvas and adjusting physics");
    PhysicsEngine.resizeCanvas();
  }
});

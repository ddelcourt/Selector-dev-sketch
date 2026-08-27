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
    ballSizePercent: 0.002,      // 0.2% of screen area
    velocityX: { min: -5, max: 5 },
    velocityY: { min: 1, max: 3 },
    bounciness: 0.95,
    friction: 0.05,
    gravity: 1.0,
    textSizeFactor: 0.22,        // Font size as proportion of ball radius
    allCaps: false,              // Whether to show text in all caps
    velocityThreshold: 0.03      // Minimum velocity before ball stops (prevents infinite micro-bouncing)
  };

  // Initialize the physics engine
  function init() {
    console.log("Initializing physics engine...");
    canvas = document.getElementById("physicsCanvas");
    if (!canvas) {
      console.error("Physics canvas not found");
      return false;
    }
    console.log("Canvas found:", canvas);

    // Set canvas size to window size
    resizeCanvas();
    console.log("Canvas resized to:", canvas.width, "x", canvas.height);

    // Create engine
    engine = Engine.create({
      gravity: { x: 0, y: config.gravity } // Configurable gravity
    });
    console.log("Engine created:", engine);

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

    // Run the engine
    runner = Runner.create();

    // Add velocity threshold check to prevent infinite micro-bouncing
    Events.on(engine, "afterUpdate", function () {
      balls.forEach(function (ball) {
        if (!ball || ball.isStatic) return;
        
        var velocity = ball.velocity;
        var speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        // If ball is moving very slowly, stop it completely
        if (speed < config.velocityThreshold && speed > 0) {
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
    
    console.log("calculateBallRadius: percentage param=" + percentage + ", using pct=" + pct + " (from config.ballSizePercent=" + config.ballSizePercent + ")");
    
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
    
    console.log("Ball radius calc: screenArea=" + screenArea + ", pct=" + (pct*100).toFixed(4) + "%, baseRadius=" + baseRadius.toFixed(1) + ", final=" + radius.toFixed(1));
    
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
    console.log("Adding ball with label:", labelText, "colorIndex:", colorIndex);
    console.log("Current config at ball creation:", JSON.stringify(config));

    var radius = calculateBallRadius(); // Calculate size based on screen area
    var x = Math.random() * (canvas.width - 200) + 100; // Random X position
    var y = 100; // Start near top (CHANGED from -100 to be visible)

    // Random initial velocity using config values
    var vx = config.velocityX.min + Math.random() * (config.velocityX.max - config.velocityX.min);
    var vy = config.velocityY.min + Math.random() * (config.velocityY.max - config.velocityY.min);

    // Get color for this ball
    var colorIdx = (colorIndex !== undefined ? colorIndex : balls.length) % ballColors.length;
    var color = ballColors[colorIdx];

    console.log("Creating ball at:", x, y, "radius:", radius.toFixed(1), "velocity: vx=" + vx.toFixed(1) + ", vy=" + vy.toFixed(1), "color:", color);

    // Create ball body
    var ball = Bodies.circle(x, y, radius, {
      restitution: config.bounciness, // Use configurable bounciness
      friction: config.friction,
      frictionAir: 0.01, // Air resistance
      density: 0.001,
      sleepThreshold: 60, // Matter.js sleep threshold (higher = easier to sleep)
      render: {
        fillStyle: color,
      },
    });

    // Store custom data
    ball.label = labelText;
    ball.ballColor = color;
    ball.ballRadius = radius;

    // Set initial velocity
    Body.setVelocity(ball, { x: vx, y: vy });

    // Add to world
    Composite.add(engine.world, ball);
    balls.push(ball);

    console.log("Ball added to world. Total balls:", balls.length, "World bodies:", engine.world.bodies.length);
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
    console.log("Starting physics engine...");
    if (!engine) {
      console.log("Engine not initialized, initializing now...");
      if (!init()) {
        console.error("Failed to initialize engine");
        return false;
      }
    }

    isActive = true;
    canvas.style.display = "block";
    console.log("Canvas display set to block");
    console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
    console.log("Canvas style.display:", canvas.style.display);
    console.log("Canvas offsetWidth/Height:", canvas.offsetWidth, canvas.offsetHeight);
    console.log("Canvas position:", canvas.style.position, "z-index:", canvas.style.zIndex);

    Render.run(render);
    Runner.run(runner, engine);
    console.log("Render and Runner started, balls count:", balls.length);
    console.log("World bodies count:", engine.world.bodies.length);

    console.log("Physics engine started");
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

    console.log("Physics engine stopped");
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
      if (newConfig.enableSleeping !== undefined) {
        config.enablty = newConfig.gravity;
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

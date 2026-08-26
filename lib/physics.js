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
      gravity: { x: 0, y: 1 }, // Standard gravity
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
      },
    });

    // Create walls (floor, left wall, right wall)
    createWalls();

    // Run the engine
    runner = Runner.create();

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

          // Draw text centered in ball
          context.save();
          context.translate(pos.x, pos.y);
          context.rotate(ball.angle);

          context.fillStyle = "#000";
          context.font = "bold 14px Arial, sans-serif";
          context.textAlign = "center";
          context.textBaseline = "middle";

          // Convert label to string and word wrap
          var labelText = String(ball.label);
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
          var lineHeight = 16;
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
    
    var width = window.innerWidth;
    var height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    // Also set the CSS size to match
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    
    console.log("Canvas resized to:", width, "x", height);
    
    if (render) {
      render.options.width = canvas.width;
      render.options.height = canvas.height;
      render.canvas.width = canvas.width;
      render.canvas.height = canvas.height;
      
      // Recreate walls with new dimensions
      removeWalls();
      createWalls();
    }
  }

  // Create boundary walls
  function createWalls() {
    var wallThickness = 50;
    var w = canvas.width;
    var h = canvas.height;

    // Floor
    var floor = Bodies.rectangle(w / 2, h - wallThickness / 2, w, wallThickness, {
      isStatic: true,
      restitution: 0.8, // Bounciness
      friction: 0.1,
      render: { fillStyle: "transparent" },
    });

    // Left wall
    var leftWall = Bodies.rectangle(wallThickness / 2, h / 2, wallThickness, h, {
      isStatic: true,
      restitution: 0.8,
      friction: 0.1,
      render: { fillStyle: "transparent" },
    });

    // Right wall
    var rightWall = Bodies.rectangle(w - wallThickness / 2, h / 2, wallThickness, h, {
      isStatic: true,
      restitution: 0.8,
      friction: 0.1,
      render: { fillStyle: "transparent" },
    });

    // Ceiling (invisible, allows balls to spawn above)
    var ceiling = Bodies.rectangle(w / 2, -wallThickness / 2, w, wallThickness, {
      isStatic: true,
      restitution: 0.8,
      friction: 0.1,
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

  // Add a new ball to the simulation
  function addBall(text, colorIndex) {
    if (!engine || !isActive) {
      console.warn("Cannot add ball: engine not active");
      return null;
    }

    // Convert text to string to ensure it's valid
    var labelText = text ? String(text) : "?";
    console.log("Adding ball with label:", labelText, "colorIndex:", colorIndex);

    var radius = 60 + Math.random() * 20; // Random size between 60-80
    var x = Math.random() * (canvas.width - 200) + 100; // Random X position
    var y = 100; // Start near top (CHANGED from -100 to be visible)

    // Random initial velocity
    var vx = (Math.random() - 0.5) * 10; // Random horizontal velocity
    var vy = Math.random() * 2 + 1; // Slight downward velocity

    // Get color for this ball
    var colorIdx = (colorIndex !== undefined ? colorIndex : balls.length) % ballColors.length;
    var color = ballColors[colorIdx];

    console.log("Creating ball at:", x, y, "radius:", radius, "color:", color);

    // Create ball body
    var ball = Bodies.circle(x, y, radius, {
      restitution: 0.7, // Bounciness
      friction: 0.05,
      frictionAir: 0.01, // Air resistance
      density: 0.001,
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
    
    // Add a test ball in the center for debugging
    var testBall = Bodies.circle(canvas.width / 2, canvas.height / 2, 50, {
      restitution: 0.9,
      render: { fillStyle: "red" }
    });
    Composite.add(engine.world, testBall);
    console.log("Test red ball added at center:", canvas.width / 2, canvas.height / 2);
    
    // Debug: Log world contents
    setTimeout(function() {
      console.log("After 1 second - World bodies:", engine.world.bodies.length, "Balls array:", balls.length);
      if (balls.length > 0) {
        console.log("First ball position:", balls[0].position);
      }
      if (testBall) {
        console.log("Test ball position:", testBall.position);
      }
    }, 1000);

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
    isActive: function () {
      return isActive;
    },
  };
})();

// Handle window resize
window.addEventListener("resize", function () {
  if (PhysicsEngine.isActive()) {
    // Get current balls data before resize
    var ballsData = [];
    if (engine && balls.length > 0) {
      balls.forEach(function(ball) {
        ballsData.push({
          label: ball.label,
          color: ball.ballColor,
          position: { x: ball.position.x, y: ball.position.y },
          velocity: ball.velocity
        });
      });
    }
    
    // Resize canvas
    var canvas = document.getElementById("physicsCanvas");
    if (canvas && render) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render.options.width = canvas.width;
      render.options.height = canvas.height;
      render.canvas.width = canvas.width;
      render.canvas.height = canvas.height;
      
      // Recreate walls with new dimensions
      removeWalls();
      createWalls();
    }
  }
});

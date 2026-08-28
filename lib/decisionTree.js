
////////////////////////
//
//  Decision Tree sketch. 
//  Node graph with multiple children, 
//  multiple parents.
//  ddelcourt 6.2025
//
////////////////////////


// Define DecisionTree class
var DecisionTree = function (data) {
  // Input validation
  if (!data || typeof data !== "object") {
    throw new Error("DecisionTree: Invalid data structure provided");
  }

  // Initialize properties
  this.initial = data.initial;
  this.choices = data.choices;
  this.data = data;

  // Add stepTitle to each choice node
  Object.keys(this.choices).forEach((id) => {
    if (!this.choices[id].stepTitle) {
      this.choices[id].stepTitle = this.choices[id].choice;
    }
  });

  // Build parent relationships dynamically
  this._buildParentRelationships();

  // Initialize the tree
  this.init();
};

// Core methods
DecisionTree.prototype._buildParentRelationships = function () {
  // Clear any existing parent references
  Object.keys(this.choices).forEach((id) => {
    if (Array.isArray(this.choices[id].parents)) {
      delete this.choices[id].parents;
    }
  });

  // Build parent relationships from children references
  const parentMap = {};

  Object.keys(this.choices).forEach((id) => {
    const choice = this.choices[id];
    if (choice.children && Array.isArray(choice.children)) {
      choice.children.forEach((childId) => {
        if (!parentMap[childId]) {
          parentMap[childId] = new Set();
        }
        parentMap[childId].add(id);
      });
    }
  });

  // Apply the parent relationships
  Object.entries(parentMap).forEach(([childId, parents]) => {
    this.choices[childId].parents = Array.from(parents);
  });
};

DecisionTree.prototype.init = function () {
  // Validate and initialize the tree structure
  const idList = [];

  Object.keys(this.choices).forEach((k) => {
    if (idList.indexOf(k) !== -1) {
      throw new Error(`DecisionTree: Duplicate ID "${k}" in choice set`);
    }

    const choice = this.getChoice(k);
    choice.id = k;

    const children = this.getChildren(k);
    children.forEach((child) => {
      if (child.parent) {
        throw new Error(
          `DecisionTree: Node "${k}" has conflicting parent relationships`
        );
      }
    });

    idList.push(k);
  });

  console.log("Tree initialized successfully");
};

DecisionTree.prototype.getChoice = function (id) {
  if (!(id in this.choices)) {
    throw new Error(`DecisionTree: Choice "${id}" not found`);
  }
  return this.choices[id];
};

DecisionTree.prototype.getChildren = function (parentId) {
  if (!(parentId in this.choices)) {
    throw new Error(`DecisionTree: Parent "${parentId}" not found`);
  }

  const choice = this.choices[parentId];
  if (!("children" in choice) || !Array.isArray(choice.children)) {
    return [];
  }

  return choice.children.map((childId) => this.getChoice(childId));
};

DecisionTree.prototype.getParents = function (id) {
  const choice = this.getChoice(id);
  if (!choice || !Array.isArray(choice.parents)) {
    return [];
  }

  return choice.parents.map((parentId) => this.getChoice(parentId));
};

DecisionTree.prototype.getParentIds = function (id) {
  const parents = this.getParents(id);
  return parents.map((parent) => parent.id);
};

DecisionTree.prototype.getParentName = function (id) {
  const parents = this.getParents(id);
  return parents.length > 0 ? parents[0].stepTitle || parents[0].choice : false;
};

DecisionTree.prototype.getInitial = function () {
  if (!this.initial || !Array.isArray(this.initial)) {
    throw new Error("DecisionTree: No initial choices specified");
  }
  return this.initial.map((id) => this.getChoice(id));
};

DecisionTree.prototype.getChildCount = function (parentId) {
  const children = this.getChildren(parentId);
  return children.length;
};

// Display results
function displaySelectList(selectList, physicsMode, triggeredBalls) {
  // Validate inputs
  if (!Array.isArray(selectList)) {
    console.warn("Invalid selectList provided:", selectList);
    return;
  }

  if (physicsMode === undefined) {
    physicsMode = false;
  }

  const selectListElement = $("#selectList");
  // Check if element exists
  if (!selectListElement.length) {
    console.warn("Could not find #selectList element");
    return;
  }

  if (physicsMode) {
    // Physics mode: hide static list, manage balls in physics engine
    selectListElement.empty();
    if (typeof PhysicsEngine !== "undefined") {
      console.log("Physics mode: updating balls. SelectList:", selectList);
      // Only add NEW balls that haven't been triggered yet
      selectList.forEach(function(choiceId, index) {
        if (!triggeredBalls.has(choiceId)) {
          console.log("Adding NEW ball for:", choiceId, "at index:", index);
          PhysicsEngine.addBall(choiceId, index);
          triggeredBalls.add(choiceId); // Mark as triggered
        } else {
          console.log("Ball already triggered, skipping:", choiceId);
        }
      });
    } else {
      console.error("PhysicsEngine is not available!");
    }
  } else {
    // Static mode: display as list items
    selectListElement.empty();
    selectList.forEach((choiceId) => {
      selectListElement.append(`<li>${choiceId}</li>`);
    });
  }
}

// Export DecisionTree
export { DecisionTree };

// Selection code
$(function () {
  console.log('Document ready, loading JSON...');
  
  // Load JSON data inline (no separate loadJSON function needed)
  async function initializeTree() {
    try {
      // Try to load from localStorage first
      const cachedData = localStorage.getItem('decisionTreeData');
      let data;
      
      if (cachedData) {
        console.log('Loading data from localStorage');
        data = JSON.parse(cachedData);
      } else {
        // Fallback to fetching from file
        console.log('Fetching data from file');
        const response = await fetch("./lib/data.json");
        data = await response.json();
        
        // Save to localStorage for future use
        try {
          localStorage.setItem('decisionTreeData', JSON.stringify(data));
          console.log('Data saved to localStorage');
        } catch (e) {
          console.warn('Could not save to localStorage:', e);
        }
      }
      
      // Create tree instance
      const tree = new DecisionTree(data);
      console.log('Tree loaded successfully:', tree);
      
      // Initialize the UI with the tree
      initializeUI(tree);
      
    } catch (error) {
      console.error('Failed to load decision tree:', error);
      alert('Error loading decision tree. Please check the console for details.');
    }
  }
  
  // Initialize UI with the loaded tree
  function initializeUI(tree) {
    var $list = $("#choices");
    var $title = $("h2");
    var current_id = null;
    var step = 0;
    var selectList = [];
    var navigationHistory = []; // NEW: Track full navigation path (which nodes were visited)
    var triggeredBalls = new Set(); // Track which balls have been added to physics
    var physicsMode = true; // Toggle state for physics mode - ENABLED BY DEFAULT
    var gravitySequenceTimers = []; // Track setTimeout IDs for gravity sequence
    console.log("Step (init)", step);

    // Initialize Physics Engine
    if (typeof PhysicsEngine !== "undefined") {
      PhysicsEngine.init();
      console.log("Physics engine available");
      
      // Hide panel by default and auto-enable physics mode on startup
      setTimeout(function() {
        $("#physicsControls").addClass("panel-hidden");
        $("#physicsToggle").addClass("active");
        PhysicsEngine.start();
        
        // Start in normal mode
        PhysicsEngine.setMode('normal');
        console.log("Physics initialized in normal mode");
        
        $(".results").hide();
        console.log("Physics mode auto-enabled on startup, panel hidden");
      }, 100);
    }

    // Toggle button handler
    $("#physicsToggle").on("click", function (e) {
      e.preventDefault();
      physicsMode = !physicsMode;
      var $button = $(this);

      if (physicsMode) {
        // Enable physics mode
        $button.addClass("active");
        PhysicsEngine.start();
        PhysicsEngine.clearBalls();
        
        // Clear any pending gravity sequence timers
        gravitySequenceTimers.forEach(function(timer) {
          clearTimeout(timer);
        });
        gravitySequenceTimers = [];
        
        // Reset to normal gravity mode
        PhysicsEngine.setMode('normal');
        
        triggeredBalls.clear(); // Clear tracking when enabling physics
        
        // Add all current balls
        selectList.forEach(function(choiceId, index) {
          PhysicsEngine.addBall(choiceId, index);
          triggeredBalls.add(choiceId); // Track this ball
        });
        
        // Hide static results
        $(".results").hide();
        
        console.log("Physics mode enabled in normal gravity");
      } else {
        // Disable physics mode
        $button.removeClass("active");
        PhysicsEngine.stop();
        PhysicsEngine.clearBalls();
        triggeredBalls.clear(); // Clear tracking when disabling physics
        
        // Show static results
        $(".results").show();
        displaySelectList(selectList, false, triggeredBalls);
        
        console.log("Physics mode disabled");
      }
    });

    // Keyboard shortcut: Tab key to toggle both control panels visibility
    $(document).on("keydown", function(e) {
      console.log("Key pressed:", e.key, "Code:", e.code, "KeyCode:", e.keyCode);
      if (e.key === "Tab" || e.code === "Tab" || e.keyCode === 9) {
        e.preventDefault(); // Prevent default tab behavior
        e.stopPropagation();
        
        // Toggle physics controls panel (right)
        var $physicsPanel = $("#physicsControls");
        console.log("Physics panel has panel-hidden class:", $physicsPanel.hasClass("panel-hidden"));
        
        if ($physicsPanel.hasClass("panel-hidden")) {
          $physicsPanel.removeClass("panel-hidden");
          console.log("Physics controls panel shown - class removed");
        } else {
          $physicsPanel.addClass("panel-hidden");
          console.log("Physics controls panel hidden - class added");
        }
        
        // Toggle documentation panel (left)
        var $docsPanel = $("#docsPanel");
        if ($docsPanel.length) {
          if ($docsPanel.hasClass("panel-hidden")) {
            $docsPanel.removeClass("panel-hidden");
            console.log("Documentation panel shown - class removed");
          } else {
            $docsPanel.addClass("panel-hidden");
            console.log("Documentation panel hidden - class added");
          }
        }
      }
    });

    var renderList = function (items) {
      console.log('Rendering list with items:', items);
      // Check if items array is empty
      if (!Array.isArray(items) || items.length === 0) {
        $title.text("Thank You!");
        $list.empty();
        console.warn('No items to render');
        return;
      }

      // Get title from first item
      var title = items[0].stepTitle || items[0].choice;
      if (title) {
        $title.text(title);
      } else {
        $title.text("Descripteurs");
      }

      $list.empty();
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        // Calculate staggered delay (100ms per item)
        var delay = i * 0.1; // 100ms increments
        $list.append(
          '<li class="button choice animate__animated animate__fadeInUp" style="animation-delay: ' + delay + 's;"><a href="#" data-choice="' +
            item.id +
            '">' +
            item.choice +
            "</a></li>"
        );
      }
      console.log('Rendered', items.length, 'choice(s)');
    };

    var _doInitial = function () {
      console.log('Initializing tree view...');
      var initData = tree.getInitial();
      console.log('Initial data:', initData);
      current_id = null;
      navigationHistory = []; // NEW: Clear navigation history on init
      renderList(initData);
      step = 0;
      $("#back").hide(); // Hide the back button at init
      $("#finalChoice").hide(); // Hide validation buttons at init
      $("#choices").show(); // Make sure choices are visible at init
      $("#navControl").removeClass("final-state"); // Remove final state positioning
      console.log('Tree view initialized, Start button should be visible');
      
      // Debug: Check if buttons exist
      setTimeout(() => {
        const buttons = $("#choices a");
        console.log(`Found ${buttons.length} button(s) in #choices`);
        buttons.each(function() {
          console.log('Button:', $(this).text(), 'data-choice:', $(this).data('choice'));
        });
      }, 100);
    };

    console.log('Setting up click event handler...');
    
    // Handle clicks on both li and a elements
    $(document).on("click", "#choices li, #choices a", function (e) {
      console.log("Click event fired on choice element");
      e.preventDefault();
      e.stopPropagation();
      
      // Find the link element (either this or child)
      var $link = $(this).is('a') ? $(this) : $(this).find('a');
      var choiceId = $link.attr("data-choice");
      console.log("Raw data-choice attribute:", choiceId);
      
      if (!choiceId) {
        console.error("No choice ID found on clicked element", $link);
        return;
      }
      
      $("#back").show(); // Show the back button
      step++;
      
      // NEW: Add to navigation history BEFORE processing
      navigationHistory.push({
        nodeId: choiceId,
        previousNodeId: current_id,
        step: step,
        hadBall: false // Will be set to true if a ball is added
      });
      
      console.log("Step ", step, ": Clicked", choiceId, "physicsMode:", physicsMode);
      console.log("Navigation history:", navigationHistory);
      
      // Get and log child count for selected node
      try {
        var kids = tree.getChildren(choiceId);
        console.log(`Children found for ${choiceId}:`, kids);
        
        // Check if this node only has "end" as a child - if so, treat as final node
        var hasOnlyEndChild = kids.length === 1 && kids[0].id === "end";
        
        if (kids.length > 0 && !hasOnlyEndChild) {
          // Has children (not just "end") - add to selectList and trigger ball (except for Start button)
          if (step > 1) {
            selectList.push(choiceId);
            // Mark in history that this choice got a ball
            navigationHistory[navigationHistory.length - 1].hadBall = true;
            console.log("List : ", selectList);
            displaySelectList(selectList, physicsMode, triggeredBalls);
          } else {
            console.log("Skipping ball trigger for Start button");
          }
          
          current_id = choiceId;
          console.log(
            `Selected node ${choiceId} has ${kids.length} children !!!`
          );
          renderList(kids);
        } else {
          // No children OR only has "end" child - treat as final node
          if (hasOnlyEndChild) {
            console.log(`Node ${choiceId} only has "end" child - skipping to final state`);
            // Add this choice to selectList since it's the actual final choice
            selectList.push(choiceId);
            // Mark in history that this choice got a ball
            navigationHistory[navigationHistory.length - 1].hadBall = true;
            displaySelectList(selectList, physicsMode, triggeredBalls);
            // Set title to "Thank you!" from the end node
            var endNode = tree.getChoice("end");
            $title.text(endNode.choice || "Thank you!");
          } else {
            console.log(`Node ${choiceId} has no children (end of branch) - skipping ball trigger`);
          }
          $("#choices").hide(); // Hide the choices list when reaching end of branch
          $("#finalChoice").show(); // Show Validation or restart button when reaching end of branch
          
          // Animate nav control to bottom of screen
          setTimeout(function() {
            $("#navControl").addClass("final-state");
          }, 50); // Small delay to ensure smooth animation
          
          // Trigger gravity sequence (only in physics mode)
          if (physicsMode && typeof PhysicsEngine !== "undefined") {
            console.log("Starting gravity sequence...");
            
            // Clear any existing timers first
            gravitySequenceTimers.forEach(function(timer) {
              clearTimeout(timer);
            });
            gravitySequenceTimers = [];
            
            // After 3 seconds: Switch to reversed (damped) gravity mode
            var timer1 = setTimeout(function() {
              PhysicsEngine.setMode('reversed', { randomVelocities: { min: -2, max: 2 } });
              console.log("Mode changed to: Reversed Gravity (gentle upward float)");
            }, 3000);
            gravitySequenceTimers.push(timer1);
            
            // After 5 seconds: Switch to zero gravity (perpetual motion) mode
            var timer2 = setTimeout(function() {
              PhysicsEngine.setMode('zeroGravity', { randomVelocities: { min: -1.5, max: 1.5 } });
              console.log("Mode changed to: Zero Gravity (perpetual motion)");
              
              // Run diagnostic check to verify all settings
              var timer3 = setTimeout(function() {
                PhysicsEngine.diagnosticCheck();
                // Start energy monitoring every 3 seconds
                PhysicsEngine.monitorEnergy(3000);
              }, 100);
              gravitySequenceTimers.push(timer3);
            }, 5000);
            gravitySequenceTimers.push(timer2);
          }
        }
      } catch (error) {
        console.error("Error getting children:", error);
      }
    });

    $("#back").on("click", function (e) {
      e.preventDefault();
      if (!current_id) return false;
      
      // NEW: Pop from navigation history
      var lastNav = navigationHistory.pop();
      if (!lastNav) {
        console.warn("No navigation history to go back to");
        return false;
      }
      
      console.log("Going back from:", lastNav);
      
      const hasChildren = tree.getChildren(current_id).length > 0;
      console.log("Children : ", hasChildren);
      step--;
      console.log("Back button clicked. Going back to step ", step);
      
      // NEW: Only remove from selectList and ball if this navigation entry had a ball
      if (lastNav.hadBall) {
        var removedChoice = selectList.pop();
        console.log("Removed from selectList:", removedChoice);
        
        // Remove the last ball if in physics mode
        if (physicsMode && removedChoice && typeof PhysicsEngine !== "undefined") {
          PhysicsEngine.removeLastBall();
          triggeredBalls.delete(removedChoice);
          console.log("Removed ball for choice:", removedChoice);
        }
      } else {
        console.log("This navigation entry had no ball, skipping ball removal");
      }
      
      console.log("List : ", selectList);
      console.log("Navigation history:", navigationHistory);
      
      displaySelectList(selectList, physicsMode, triggeredBalls);
      $("#choices").show(); // Show the choices list when navigating back
      $("#navControl").removeClass("final-state"); // Remove final state positioning when going back
      
      // Clear any pending gravity sequence timers
      gravitySequenceTimers.forEach(function(timer) {
        clearTimeout(timer);
      });
      gravitySequenceTimers = [];
      
      // Reset to normal mode if in physics mode
      if (physicsMode && typeof PhysicsEngine !== "undefined") {
        PhysicsEngine.setMode('normal');
        console.log("Physics reset to normal mode");
      }
      
      // Navigate back to the previous node
      if (lastNav.previousNodeId) {
        current_id = lastNav.previousNodeId;
        const children = tree.getChildren(current_id);
        if (children && children.length > 0) {
          console.log(
            `Navigated back to node ${current_id} which has ${children.length} children`
          );
          renderList(children);
          $("#finalChoice").hide();
        } else {
          console.log(
            `Navigated back to node ${current_id} which has no children (end of branch)`
          );
        }
      } else {
        // No previous node means we're going back to initial state
        _doInitial();
      }
    });

    $("#restart").on("click", function (e) {
      e.preventDefault();
      console.log('Restarting decision tree...');
      selectList = [];
      navigationHistory = []; // NEW: Clear navigation history
      triggeredBalls.clear(); // Clear tracking on restart
      displaySelectList(selectList, physicsMode, triggeredBalls);
      
      // Clear any pending gravity sequence timers
      gravitySequenceTimers.forEach(function(timer) {
        clearTimeout(timer);
      });
      gravitySequenceTimers = [];
      
      // Clear physics balls if in physics mode
      if (physicsMode && typeof PhysicsEngine !== "undefined") {
        PhysicsEngine.clearBalls();
        // Reset to normal mode
        PhysicsEngine.setMode('normal');
        console.log("Physics reset to normal mode");
      }
      
      // Remove final state class before restarting
      $("#navControl").removeClass("final-state");
      _doInitial();
    });

    _doInitial();
  }
  
  // Start the initialization process
  initializeTree();
});

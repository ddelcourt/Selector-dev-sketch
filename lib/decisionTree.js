
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
    var triggeredBalls = new Set(); // Track which balls have been added to physics
    var physicsMode = true; // Toggle state for physics mode - ENABLED BY DEFAULT
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
        triggeredBalls.clear(); // Clear tracking when enabling physics
        
        // Add all current balls
        selectList.forEach(function(choiceId, index) {
          PhysicsEngine.addBall(choiceId, index);
          triggeredBalls.add(choiceId); // Track this ball
        });
        
        // Hide static results
        $(".results").hide();
        
        console.log("Physics mode enabled");
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

    // Keyboard shortcut: Tab key to toggle physics controls panel visibility
    $(document).on("keydown", function(e) {
      console.log("Key pressed:", e.key, "Code:", e.code, "KeyCode:", e.keyCode);
      if (e.key === "Tab" || e.code === "Tab" || e.keyCode === 9) {
        e.preventDefault(); // Prevent default tab behavior
        e.stopPropagation();
        var $panel = $("#physicsControls");
        console.log("Panel has panel-hidden class:", $panel.hasClass("panel-hidden"));
        
        if ($panel.hasClass("panel-hidden")) {
          $panel.removeClass("panel-hidden");
          console.log("Physics controls panel shown - class removed");
        } else {
          $panel.addClass("panel-hidden");
          console.log("Physics controls panel hidden - class added");
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
        $list.append(
          '<li class="button choice animate__animated animate__fadeInUp"><a href="#" data-choice="' +
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
      renderList(initData);
      step = 0;
      $("#back").hide(); // Hide the back button at init
      $("#finalChoice").hide(); // Hide validation buttons at init
      $("#choices").show(); // Make sure choices are visible at init
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
      var choiceId = $link.data("choice");
      console.log("Raw data-choice attribute:", choiceId);
      
      if (!choiceId) {
        console.error("No choice ID found on clicked element", $link);
        return;
      }
      
      $("#back").show(); // Show the back button
      step++;
      console.log("Step ", step, ": Clicked", choiceId, "physicsMode:", physicsMode);
      
      // Get and log child count for selected node
      try {
        var kids = tree.getChildren(choiceId);
        console.log(`Children found for ${choiceId}:`, kids);
        
        if (kids.length > 0) {
          // Has children - add to selectList and trigger ball (except for Start button)
          if (step > 1) {
            selectList.push(choiceId);
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
          // No children (end node) - don't add to selectList or trigger ball
          console.log(`Node ${choiceId} has no children (end of branch) - skipping ball trigger`);
          $("#choices").hide(); // Hide the choices list when reaching end of branch
          $("#finalChoice").show(); // Show Validation or restart button when reaching end of branch
        }
      } catch (error) {
        console.error("Error getting children:", error);
      }
    });

    $("#back").on("click", function (e) {
      e.preventDefault();
      if (!current_id) return false;
      const hasChildren = tree.getChildren(current_id).length > 0;
      console.log("Children : ", hasChildren);
      step--;
      console.log("Back button clicked. Going back to step ", step);
      var removedChoice = selectList.pop();
      console.log("List : ", selectList);
      
      // Remove the last ball if in physics mode
      if (physicsMode && removedChoice && typeof PhysicsEngine !== "undefined") {
        PhysicsEngine.removeLastBall();
        triggeredBalls.delete(removedChoice); // Remove from tracking
        console.log("Removed ball for choice:", removedChoice);
      }
      
      displaySelectList(selectList, physicsMode, triggeredBalls);
      $("#choices").show(); // Show the choices list when navigating back
      var parents = tree.getParents(current_id);
      if (parents.length > 0) {
        var prev_node = parents.pop();
        console.log("popping");
        current_id = prev_node.id;
        const children = tree.getChildren(prev_node.id);
        if (children) {
          console.log(
            `Navigated to node ${prev_node.id} which has ${children.length} children`
          );
          renderList(children);
          $("#finalChoice").hide(); // Show Validation or restart button when reaching end of branch
        } else {
          console.log(
            `Navigated to node ${prev_node.id} which has no children (end of branch)`
          );
        }
      } else {
        _doInitial();
      }
    });

    $("#restart").on("click", function (e) {
      e.preventDefault();
      console.log('Restarting decision tree...');
      selectList = [];
      triggeredBalls.clear(); // Clear tracking on restart
      displaySelectList(selectList, physicsMode, triggeredBalls);
      
      // Clear physics balls if in physics mode
      if (physicsMode && typeof PhysicsEngine !== "undefined") {
        PhysicsEngine.clearBalls();
      }
      _doInitial();
    });

    _doInitial();
  }
  
  // Start the initialization process
  initializeTree();
});

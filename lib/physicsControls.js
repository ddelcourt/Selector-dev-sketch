////////////////////////
//
//  Physics Controls UI Handler
//  Manages the control panel for physics parameters
//  ddelcourt 8.2026
//
////////////////////////

(function() {
  'use strict';

  // Default configuration values
  const defaults = {
    ballSizePercent: 0.06,
    velocityX: { min: -20, max: 20 },
    velocityY: { min: 8.5, max: 10 },
    bounciness: 1,
    friction: 0.05,
    gravity: 1,
    textSizeFactor: 0.22,
    allCaps: true,
    velocityThreshold: 0.01
  };

  const STORAGE_KEY = 'physicsConfig';

  // Load configuration from localStorage
  function loadConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        console.log('Loaded physics config from localStorage:', config);
        return config;
      }
    } catch (e) {
      console.warn('Could not load physics config from localStorage:', e);
    }
    return defaults;
  }

  // Save configuration to localStorage
  function saveConfig(config) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      console.log('Saved physics config to localStorage:', config);
    } catch (e) {
      console.warn('Could not save physics config to localStorage:', e);
    }
  }

  // Initialize controls when DOM is ready
  function initControls() {
    const controlsPanel = document.getElementById('physicsControls');
    const physicsToggle = document.getElementById('physicsToggle');
    
    if (!controlsPanel || !physicsToggle) {
      console.warn('Physics controls elements not found');
      return;
    }

    // Show/hide parameter controls when physics mode is toggled
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
          const isActive = physicsToggle.classList.contains('active');
          controlsPanel.classList.toggle('physics-active', isActive);
        }
      });
    });

    observer.observe(physicsToggle, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Load saved configuration
    const savedConfig = loadConfig();
    
    // Apply saved config to sliders
    document.getElementById('ballSize').value = savedConfig.ballSizePercent;
    document.getElementById('velocityXMin').value = savedConfig.velocityX.min;
    document.getElementById('velocityXMax').value = savedConfig.velocityX.max;
    document.getElementById('velocityYMin').value = savedConfig.velocityY.min;
    document.getElementById('velocityYMax').value = savedConfig.velocityY.max;
    document.getElementById('bounciness').value = savedConfig.bounciness;
    document.getElementById('friction').value = savedConfig.friction;
    document.getElementById('gravity').value = savedConfig.gravity;
    document.getElementById('textSize').value = savedConfig.textSizeFactor || defaults.textSizeFactor;
    document.getElementById('allCaps').checked = savedConfig.allCaps !== undefined ? savedConfig.allCaps : defaults.allCaps;
    document.getElementById('velocityThreshold').value = savedConfig.velocityThreshold !== undefined ? savedConfig.velocityThreshold : defaults.velocityThreshold;

    // Update displays with saved values
    const ballSizePercent = (savedConfig.ballSizePercent * 100).toFixed(2);
    document.getElementById('ballSizeValue').textContent = ballSizePercent + '%';
    document.getElementById('velocityXMinValue').textContent = savedConfig.velocityX.min.toFixed(1);
    document.getElementById('velocityXMaxValue').textContent = savedConfig.velocityX.max.toFixed(1);
    document.getElementById('velocityYMinValue').textContent = savedConfig.velocityY.min.toFixed(1);
    document.getElementById('velocityYMaxValue').textContent = savedConfig.velocityY.max.toFixed(1);
    document.getElementById('bouncinessValue').textContent = savedConfig.bounciness.toFixed(2);
    document.getElementById('frictionValue').textContent = savedConfig.friction.toFixed(2);
    document.getElementById('gravityValue').textContent = savedConfig.gravity.toFixed(1);
    document.getElementById('textSizeValue').textContent = (savedConfig.textSizeFactor || defaults.textSizeFactor).toFixed(2);
    document.getElementById('velocityThresholdValue').textContent = (savedConfig.velocityThreshold !== undefined ? savedConfig.velocityThreshold : defaults.velocityThreshold).toFixed(2);

    // Apply to physics engine (if it exists)
    if (typeof PhysicsEngine !== 'undefined') {
      console.log('Applying saved config to PhysicsEngine:', savedConfig);
      PhysicsEngine.setConfig(savedConfig);
    } else {
      console.warn('PhysicsEngine not yet defined, config will be applied when engine starts');
    }

    // Ball Size slider
    setupSlider('ballSize', 'ballSizeValue', function(value) {
      const percent = (parseFloat(value) * 100).toFixed(2);
      return percent + '%';
    }, function(value) {
      console.log("Ball size slider changed to:", value, "(" + (parseFloat(value) * 100).toFixed(2) + "%)");
      PhysicsEngine.setConfig({ ballSizePercent: parseFloat(value) });
      saveConfig(PhysicsEngine.getConfig());
    });

    // Velocity X Min/Max sliders
    setupRangeSlider('velocityXMin', 'velocityXMinValue', 'velocityXMax', 'velocityXMaxValue', 
      function(min, max) {
        PhysicsEngine.setConfig({ 
          velocityX: { min: parseFloat(min), max: parseFloat(max) } 
        });
        saveConfig(PhysicsEngine.getConfig());
      }
    );

    // Velocity Y Min/Max sliders
    setupRangeSlider('velocityYMin', 'velocityYMinValue', 'velocityYMax', 'velocityYMaxValue', 
      function(min, max) {
        PhysicsEngine.setConfig({ 
          velocityY: { min: parseFloat(min), max: parseFloat(max) } 
        });
        saveConfig(PhysicsEngine.getConfig());
      }
    );

    // Bounciness slider
    setupSlider('bounciness', 'bouncinessValue', function(value) {
      return parseFloat(value).toFixed(2);
    }, function(value) {
      PhysicsEngine.setConfig({ bounciness: parseFloat(value) });
      saveConfig(PhysicsEngine.getConfig());
    });

    // Friction slider
    setupSlider('friction', 'frictionValue', function(value) {
      return parseFloat(value).toFixed(2);
    }, function(value) {
      PhysicsEngine.setConfig({ friction: parseFloat(value) });
      saveConfig(PhysicsEngine.getConfig());
    });

    // Velocity Threshold slider
    setupSlider('velocityThreshold', 'velocityThresholdValue', function(value) {
      return parseFloat(value).toFixed(2);
    }, function(value) {
      PhysicsEngine.setConfig({ velocityThreshold: parseFloat(value) });
      saveConfig(PhysicsEngine.getConfig());
    });

    // Gravity slider
    setupSlider('gravity', 'gravityValue', function(value) {
      return parseFloat(value).toFixed(1);
    }, function(value) {
      PhysicsEngine.setConfig({ gravity: parseFloat(value) });
      saveConfig(PhysicsEngine.getConfig());
    });

    // Text Size slider
    setupSlider('textSize', 'textSizeValue', function(value) {
      return parseFloat(value).toFixed(2);
    }, function(value) {
      PhysicsEngine.setConfig({ textSizeFactor: parseFloat(value) });
      saveConfig(PhysicsEngine.getConfig());
    });

    // All Caps checkbox
    const allCapsCheckbox = document.getElementById('allCaps');
    if (allCapsCheckbox) {
      allCapsCheckbox.addEventListener('change', function() {
        PhysicsEngine.setConfig({ allCaps: allCapsCheckbox.checked });
        saveConfig(PhysicsEngine.getConfig());
      });
    }

    // Reset button
    const resetButton = document.getElementById('resetControls');
    if (resetButton) {
      resetButton.addEventListener('click', resetToDefaults);
    }

    // Export button
    const exportButton = document.getElementById('exportSettings');
    if (exportButton) {
      exportButton.addEventListener('click', exportSettings);
    }

    console.log('Physics controls initialized');
  }

  // Setup a single slider with value display and callback
  function setupSlider(sliderId, valueId, formatFn, changeFn) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    
    if (!slider || !valueDisplay) {
      console.warn('Slider elements not found:', sliderId);
      return;
    }

    // Update display and call callback
    function updateValue() {
      const value = slider.value;
      valueDisplay.textContent = formatFn(value);
      changeFn(value);
    }

    // Update on input (real-time) - both display AND callback
    slider.addEventListener('input', function() {
      valueDisplay.textContent = formatFn(slider.value);
      changeFn(slider.value); // Call callback in real-time
    });
    
    // Also call on change (when slider is released)
    slider.addEventListener('change', updateValue);
  }

  // Setup a pair of min/max sliders
  function setupRangeSlider(minId, minValueId, maxId, maxValueId, changeFn) {
    const minSlider = document.getElementById(minId);
    const minValueDisplay = document.getElementById(minValueId);
    const maxSlider = document.getElementById(maxId);
    const maxValueDisplay = document.getElementById(maxValueId);
    
    if (!minSlider || !maxSlider || !minValueDisplay || !maxValueDisplay) {
      console.warn('Range slider elements not found:', minId, maxId);
      return;
    }

    function updateValues() {
      const minValue = parseFloat(minSlider.value);
      const maxValue = parseFloat(maxSlider.value);
      
      minValueDisplay.textContent = minValue.toFixed(1);
      maxValueDisplay.textContent = maxValue.toFixed(1);
      
      changeFn(minValue, maxValue);
    }

    // Update displays and call callback in real-time
    minSlider.addEventListener('input', function() {
      const minValue = parseFloat(minSlider.value);
      minValueDisplay.textContent = minValue.toFixed(1);
      updateValues(); // Call callback in real-time
    });
    
    maxSlider.addEventListener('input', function() {
      const maxValue = parseFloat(maxSlider.value);
      maxValueDisplay.textContent = maxValue.toFixed(1);
      updateValues(); // Call callback in real-time
    });

    // Also update on change (when slider is released)
    minSlider.addEventListener('change', updateValues);
    maxSlider.addEventListener('change', updateValues);
  }

  // Reset all controls to default values
  function resetToDefaults() {
    // Update slider values
    document.getElementById('ballSize').value = defaults.ballSizePercent;
    document.getElementById('velocityXMin').value = defaults.velocityX.min;
    document.getElementById('velocityXMax').value = defaults.velocityX.max;
    document.getElementById('velocityYMin').value = defaults.velocityY.min;
    document.getElementById('velocityYMax').value = defaults.velocityY.max;
    document.getElementById('bounciness').value = defaults.bounciness;
    document.getElementById('friction').value = defaults.friction;
    document.getElementById('gravity').value = defaults.gravity;
    document.getElementById('textSize').value = defaults.textSizeFactor;
    document.getElementById('allCaps').checked = defaults.allCaps;

    // Update displays
    const ballSizePercent = (defaults.ballSizePercent * 100).toFixed(2);
    document.getElementById('ballSizeValue').textContent = ballSizePercent + '%';
    document.getElementById('velocityXMinValue').textContent = defaults.velocityX.min.toFixed(1);
    document.getElementById('velocityXMaxValue').textContent = defaults.velocityX.max.toFixed(1);
    document.getElementById('velocityYMinValue').textContent = defaults.velocityY.min.toFixed(1);
    document.getElementById('velocityYMaxValue').textContent = defaults.velocityY.max.toFixed(1);
    document.getElementById('bouncinessValue').textContent = defaults.bounciness.toFixed(2);
    document.getElementById('frictionValue').textContent = defaults.friction.toFixed(2);
    document.getElementById('gravityValue').textContent = defaults.gravity.toFixed(1);
    document.getElementById('textSizeValue').textContent = defaults.textSizeFactor.toFixed(2);

    // Update physics engine
    PhysicsEngine.setConfig(defaults);

    // Save to localStorage
    saveConfig(defaults);

    console.log('Controls reset to defaults');
  }

  // Export current settings to JSON file
  function exportSettings() {
    // Get current configuration from physics engine or collect from UI
    let currentConfig;
    if (typeof PhysicsEngine !== 'undefined' && PhysicsEngine.getConfig) {
      currentConfig = PhysicsEngine.getConfig();
    } else {
      // Fallback: collect from UI elements
      currentConfig = {
        ballSizePercent: parseFloat(document.getElementById('ballSize').value),
        velocityX: {
          min: parseFloat(document.getElementById('velocityXMin').value),
          max: parseFloat(document.getElementById('velocityXMax').value)
        },
        velocityY: {
          min: parseFloat(document.getElementById('velocityYMin').value),
          max: parseFloat(document.getElementById('velocityYMax').value)
        },
        bounciness: parseFloat(document.getElementById('bounciness').value),
        friction: parseFloat(document.getElementById('friction').value),
        gravity: parseFloat(document.getElementById('gravity').value),
        textSizeFactor: parseFloat(document.getElementById('textSize').value),
        allCaps: document.getElementById('allCaps').checked,
        velocityThreshold: parseFloat(document.getElementById('velocityThreshold').value)
      };
    }

    // Create JSON string with pretty formatting
    const jsonString = JSON.stringify(currentConfig, null, 2);

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `physics-settings-${timestamp}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Exported settings:', currentConfig);
  }

  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initControls);
  } else {
    initControls();
  }
})();

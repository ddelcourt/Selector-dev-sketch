# Physics Presets

This folder contains pre-configured physics settings that can be loaded via the control panel.

## Available Presets

### Default
Standard balanced physics settings - the baseline configuration.
- Medium ball size (6% of screen)
- Balanced velocities
- Perfect elasticity
- All effects enabled

### Calm
Gentle, slower physics with reduced effects.
- Smaller balls (4% of screen)
- Reduced velocities
- Less bouncy (60% restitution)
- Window shake disabled
- Balls only spawn from top

### Chaotic
High energy, extreme bouncing and large balls.
- Larger balls (10% of screen)
- High velocities
- Extra bouncy (150% restitution)
- All effects enabled
- Random top/bottom spawning

### Minimal
Tiny balls, subtle effects, minimal visual noise.
- Very small balls (2% of screen)
- Mixed case text
- White text enabled
- All effects disabled
- Balls only spawn from top

## Creating Custom Presets

To create a custom preset:

1. Use the control panel to adjust settings to your preference
2. Click "Export Settings" to download your configuration
3. Save the JSON file in this `presets/` folder
4. Add an option to the preset dropdown in `index.html`:
   ```html
   <option value="your-preset-name">Your Preset Name</option>
   ```

## Configuration Properties

All presets should include these properties:

```json
{
  "name": "Preset Display Name",
  "description": "Brief description of this preset",
  "ballSizePercent": 0.06,
  "velocityX": { "min": -20, "max": 20 },
  "velocityY": { "min": 8.5, "max": 10 },
  "bounciness": 1,
  "friction": 0.05,
  "gravity": 1,
  "textSizeFactor": 0.22,
  "allCaps": true,
  "whiteText": false,
  "velocityThreshold": 0.01,
  "enableWindowShake": true,
  "enablePulseEffect": true,
  "randomTopBottom": true
}
```

### Property Ranges

- `ballSizePercent`: 0.001 - 0.12 (0.1% - 12% of screen area)
- `velocityX.min/max`: -30 to 30
- `velocityY.min/max`: 0 to 20
- `bounciness`: 0 - 2 (0 = no bounce, 1 = perfect elasticity, >1 = adds energy)
- `friction`: 0 - 0.2
- `gravity`: 0 - 3
- `textSizeFactor`: 0.1 - 0.5
- `velocityThreshold`: 0 - 0.1

## Usage

### Via Control Panel
1. Open the physics controls (Tab key)
2. Select a preset from the dropdown
3. Settings are applied immediately

### Via Upload
1. Open the physics controls (Tab key)
2. Click "Upload Settings"
3. Select a JSON file
4. Settings are validated and applied

All loaded settings are automatically saved to localStorage and will persist across sessions.

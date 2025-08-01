# @unickq/wdio-adb-video-reporter

A WebDriverIO reporter for recording Android device screens using ADB during test execution.

## Features

- 🎯 **Smart Saving** - Save videos only on test failures or when explicitly configured
- ⏰ **Timestamp Support** - Add timestamps to video filenames for unique identification
- 🚫 **Disable Option** - Completely disable video recording when needed
- 📱 **Android ADB Integration** - Uses native ADB commands for reliable screen recording

## Installation

```bash
npm install @unickq/wdio-adb-video-reporter --save-dev
```

## Prerequisites

- Android Debug Bridge (ADB) must be installed and accessible in PATH
- Android device connected and authorized for ADB
- WebDriverIO v8+ project

## Usage

### Basic Configuration

Add the reporter to your `wdio.conf.js`:

```javascript
// wdio.conf.js

export const config = {
  // ... other config
  reporters: [
    // ... other reporters
    [
      "@unickq/wdio-adb-video-reporter",
      {
        outputDir: "./videos",
        saveAllVideos: false,
        timestamp: true,
        disabled: false,
        logs: true,
      },
    ],
  ],
};
```

### TypeScript Configuration

```typescript
// wdio.conf.ts
import WdioAdbVideoReporter from "@unickq/wdio-adb-video-reporter";

export const config: WebdriverIO.Config = {
  // ... other config
  reporters: [
    // ... other reporters
    [
      "@unickq/wdio-adb-video-reporter",
      {
        outputDir: "./videos",
        saveAllVideos: false,
        timestamp: true,
        disabled: false,
      } as Parameters<typeof WdioAdbVideoReporter>[0],
    ] as [
      typeof WdioAdbVideoReporter,
      Parameters<typeof WdioAdbVideoReporter>[0]
    ],
  ],
};
```

## Configuration Options

| Option          | Type      | Default      | Description                                |
| --------------- | --------- | ------------ | ------------------------------------------ |
| `outputDir`     | `string`  | `"./videos"` | Directory where videos will be saved       |
| `saveAllVideos` | `boolean` | `false`      | Save all videos regardless of test results |
| `timestamp`     | `boolean` | `true`       | Add timestamp to video filenames           |
| `disabled`      | `boolean` | `false`      | Completely disable video recording         |
| `logs`          | `boolean` | `false`      | Enable logging output                      |

## How It Works

1. **Recording Start**: Recording starts at the beginning of each test runner
2. **Smart Saving**: Videos are saved only when:
   - Tests fail, OR
   - `saveAllVideos=true` option is set
3. **Cleanup**: Temporary files are automatically cleaned up after processing

## File Naming

Videos are saved with the following naming patterns:

**With timestamp (default):**

```
2025-08-01T13-45-21_spec-name.mp4
```

**Without timestamp:**

```
spec-name.mp4
```

## Running Tests with Video Recording

```bash
# Enable video recording
npm run test

```

## Troubleshooting

### ADB Not Found

```bash
# Install Android SDK and add to PATH
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Device Not Authorized

```bash
# Check device authorization
adb devices

# If unauthorized, accept the prompt on device
adb kill-server
adb start-server
```

### Permission Issues

```bash
# Grant storage permissions to shell
adb shell pm grant android.permission.WRITE_EXTERNAL_STORAGE
```

## Requirements

- WebDriverIO >= 9.0.0
- Android device/emulator with developer options enabled
- ADB (Android Debug Bridge) installed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**unickq**

## Related

- [WebDriverIO](https://webdriver.io/)
- [Android Debug Bridge (ADB)](https://developer.android.com/studio/command-line/adb)
- [@wdio/reporter](https://www.npmjs.com/package/@wdio/reporter)

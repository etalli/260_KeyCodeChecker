# Key Code Checker

[日本語](./README.md) | [English](./README.en.md)

An Electron app for inspecting keyboard input events.  
It helps you view `event.key` / `event.code`, modifier states, history, combo detection, and test features in one place.

## Features

- Key event display: `event.key`, `event.code`, `event.keyCode`, `event.which`, `event.location`
- Modifier keys: `Shift`, `Alt`, `Ctrl`, `Meta (Command)`, `CapsLock`, `NumLock`, `Fn`
- Chord display: currently pressed keys shown in real time
- History: latest 100 key inputs
- Language switching: auto switches between Japanese and English based on client locale
- Key combo detection: detects predefined combos
- Electron global shortcut status display
- Test modes:
  - Sequence test (PASS/MISS for predefined combos in order)
  - All-key coverage test (`event.code`-based coverage)

## Using `index.html` directly

You can open `index.html` in a browser without Electron.

1. Open `index.html` in your browser
2. Focus the page
3. Press keys and check event values, history, and WPM

Notes:

- Keep the `js/` folder structure intact (`i18n.js`, `constants.js`, `app.js`, `wpm.js`, `test.js`, `combo.js`, `init.js`)
- In browser mode, Electron global shortcut features are unavailable (`window.electronAPI` is not present)
- OS-reserved shortcuts (for example, `Command+Shift+3`) may not be capturable in browser mode

## Setup

Prerequisite:

- Node.js and npm installed

Install:

```bash
cd KeyCodeChecker
npm install
```

Run:

```bash
npm start
```

## Usage

1. Launch the app and keep its window focused
2. Press keys to inspect event values
3. Check combo results in `Detected combo`
4. Run sequence checks in `Test mode`
5. Use `All-key coverage test` to fill missing keys

## About global shortcuts

- Shows registration status for `CommandOrControl+Shift+3` and `CommandOrControl+Shift+4`
- `OK` means registered in Electron, `NG` may indicate OS reservation or conflict
- Behavior depends on OS and other running apps; verify on your actual machine

## File structure

- `index.html`: UI
- `styles.css`: styles
- `js/i18n.js`: localization dictionary
- `js/constants.js`: key/combination constants
- `js/app.js`: shared frontend logic and initialization function
- `js/wpm.js`: WPM logic
- `js/combo.js`: combo detection logic
- `js/test.js`: test mode logic
- `js/init.js`: startup entry (`initializeApp()`)
- `js/main.js`: Electron main process
- `js/preload.js`: secure IPC bridge for renderer
- `package.json`: scripts and dependencies

## Notes

- `Fn` and some system-reserved shortcuts may not be detectable depending on environment
- `event.code` and key availability can differ by keyboard layout (JIS/US, etc.)

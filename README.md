# ansi-color-logger README

This extension adds support for ANSI escape sequences in VS Code, allowing you to view and log colored text in your code and logs that contain ANSI color codes.

## Features

- Colorize ANSI Logs: This extension recognizes and colorizes ANSI escape sequences in your logs or code (e.g., \x1b[33m for yellow text).

- Automatic Parsing: It automatically detects and highlights any text enclosed in ANSI escape codes.

- Custom Color Support: Extend the functionality to support different colors and escape sequences.

- Cross-Platform: Works on all platforms where VS Code runs, including Windows, macOS, and Linux.

# Feature

Before:
![feature X](https://github.com/bradenacurtis801/vscode-ansi-color-formatter/raw/4c7d3e39481deb6b3c3b4f7f799bfdb723229322/demos/pre-format.png)

After:
![feature X](https://github.com/bradenacurtis801/vscode-ansi-color-formatter/raw/4c7d3e39481deb6b3c3b4f7f799bfdb723229322/demos/formatted.png)

> Tip: You can add highlighting for specific log levels like DEBUG, ERROR, etc., by modifying the ANSI code mappings. Here's an example of a custom color configuration.

## Requirements

- VS Code: Make sure you have Visual Studio Code installed.

- Node.js: Ensure you have Node.js installed if you plan to contribute to this extension or modify it locally.

## Extension Settings

- This extension doesn’t add any specific settings, but you can control the colors and behavior by modifying the code directly in the colorMap section of the extension.ts file.

Example Color Settings (in code):

```ts
const colorMap: { [code: string]: vscode.TextEditorDecorationType } = {
  "\x1b[30m": vscode.window.createTextEditorDecorationType({ color: "black" }),
  "\x1b[31m": vscode.window.createTextEditorDecorationType({ color: "#d15e71" }), // red
  "\x1b[32m": vscode.window.createTextEditorDecorationType({ color: "green" }),
  "\x1b[33m": vscode.window.createTextEditorDecorationType({ color: "yellow" }),
  "\x1b[34m": vscode.window.createTextEditorDecorationType({ color: "#4e8ed3" }), // blue
  "\x1b[35m": vscode.window.createTextEditorDecorationType({ color: "magenta" }),
  "\x1b[36m": vscode.window.createTextEditorDecorationType({ color: "cyan" }),
  "\x1b[37m": vscode.window.createTextEditorDecorationType({ color: "white" }),
};
```

This extension contributes the following settings:


## Known Issues

- Escape Sequences Handling: Certain complex escape sequences (e.g., bold or underlined text) may not be perfectly parsed.

- Performance: Processing large logs with multiple ANSI escape sequences may slightly slow down performance.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

- Initial Release: Adds basic support for deteEnsure that you've read through the VS Code extension guidelines to ensure your extension follows best practices.kcting and colorizing ANSI escape codes in logs.

---
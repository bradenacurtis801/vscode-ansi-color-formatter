"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    function renderAnsiColors(editor) {
        if (!editor) {
            return;
        }
        const doc = editor.document;
        const text = doc.getText();
        // ANSI color code to VSCode color map (only using color codes here)
        const colorMap = {
            "30": vscode.window.createTextEditorDecorationType({ color: "black" }),
            "31": vscode.window.createTextEditorDecorationType({ color: "#d15e71" }), // red
            "32": vscode.window.createTextEditorDecorationType({ color: "green" }),
            "33": vscode.window.createTextEditorDecorationType({ color: "yellow" }),
            "34": vscode.window.createTextEditorDecorationType({ color: "#4e8ed3" }), // blue
            "35": vscode.window.createTextEditorDecorationType({ color: "magenta" }),
            "36": vscode.window.createTextEditorDecorationType({ color: "cyan" }),
            "37": vscode.window.createTextEditorDecorationType({ color: "white" }),
        };
        const decorations = {};
        const escapeSequence = "\\x1b\\["; // Matches the escape sequence start \x1b[
        const colorCode = "(\\d+)?"; // Matches the optional numeric color code (e.g., 33, 31)
        const mChar = "m"; // Matches the literal 'm' that marks the end of the escape sequence
        const visibleText = "([^\x1b]*)"; // Matches the visible text between escape sequences
        const lookahead = "(?=\\x1b\\[(\\d+)?m|$)"; // Lookahead that matches the next escape sequence or the end of the string
        // Combine the components into a single regex
        const ansiTokenRegex = new RegExp(escapeSequence + colorCode + mChar + visibleText + lookahead, "g" // Global flag
        );
        let match;
        let previousMatchEnd = 0;
        while ((match = ansiTokenRegex.exec(text)) !== null) {
            if (match[0] === "\x1b[0m") {
                continue;
            } // Skip reset escape sequence
            const colorCode = match[1]; // Capture the color code (e.g., 33 for yellow)
            // The visible text comes after the ANSI escape sequence, so start after the `m` in `\x1b[33m`
            const start = doc.positionAt(match.index + match[0].indexOf("m") + 1); // Skip past the "m" at the end of the escape code
            // Calculate the visible text between escape sequences
            const visibleText = match[2]; // This is the visible text after the escape sequence
            // The end is determined by the start of the next match, or the end of the text if it's the last match
            const end = ansiTokenRegex.lastIndex === text.length
                ? doc.positionAt(text.length) // If it's the last match, set end to the text's end
                : doc.positionAt(ansiTokenRegex.lastIndex); // Otherwise, set the end to the next match's index
            // Store the decoration by color code (using the color code as the key)
            if (!decorations[colorCode]) {
                decorations[colorCode] = [];
            }
            // Push the decoration range for the current color
            decorations[colorCode].push({
                range: new vscode.Range(start, end),
                hoverMessage: `ANSI ${colorCode}: ${visibleText}`, // Show the color code and the visible text
            });
            // Update the previous match end for the next iteration
            previousMatchEnd = match.index + match[0].length;
        }
        // Now apply the decorations
        for (const colorCode in decorations) {
            const decorationType = colorMap[colorCode]; // Use the color code as the key
            if (decorationType) {
                editor.setDecorations(decorationType, decorations[colorCode]);
            }
        }
        // Match and hide all escape codes (for proper display)
        const hideDecoration = vscode.window.createTextEditorDecorationType({
            textDecoration: "none; opacity: 0; font-size: 0;",
        });
        const hiddenRanges = [];
        const escapeRegex = /\x1b\[[0-9;]*m/g;
        let escapeMatch;
        while ((escapeMatch = escapeRegex.exec(text)) !== null) {
            const start = doc.positionAt(escapeMatch.index);
            const end = doc.positionAt(escapeMatch.index + escapeMatch[0].length);
            hiddenRanges.push(new vscode.Range(start, end));
        }
        editor.setDecorations(hideDecoration, hiddenRanges);
    }
    // Manual command
    const disposable = vscode.commands.registerCommand("ansiColor.renderColors", () => {
        renderAnsiColors(vscode.window.activeTextEditor);
    });
    // Auto-trigger on `.log` open or tab switch
    const autoRunEvents = [
        vscode.workspace.onDidOpenTextDocument((doc) => {
            const editor = vscode.window.visibleTextEditors.find((e) => e.document === doc);
            renderAnsiColors(editor);
        }),
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            renderAnsiColors(editor);
        }),
    ];
    context.subscriptions.push(disposable, ...autoRunEvents);
}
//# sourceMappingURL=extension.js.map
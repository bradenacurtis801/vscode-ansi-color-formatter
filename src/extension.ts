import * as vscode from "vscode";

let previousDecorations: { [key: string]: vscode.DecorationOptions[] } = {};
let previousBufferStartOffset = 0;
let previousBufferEndOffset = 0;

const bufferSize = 5;

const escapeSequence = "\\x1b\\[";
const colorCode = "(\\d+)?";
const mChar = "m";
const visibleText = "([^\x1b]*)";
const lookahead = "(?=\\x1b\\[(\\d+)?m|$)";
const ansiTokenRegex = new RegExp(
  escapeSequence + colorCode + mChar + visibleText + lookahead,
  "g"
);
const escapeRegex = /\x1b\[[0-9;]*m/g;

// Decorations
const hideDecoration = vscode.window.createTextEditorDecorationType({
  textDecoration: "none; opacity: 0; font-size: 0;",
});

const colorMap: { [code: string]: vscode.TextEditorDecorationType } = {
  "30": vscode.window.createTextEditorDecorationType({ color: "black" }),
  "31": vscode.window.createTextEditorDecorationType({ color: "#d15e71" }),
  "32": vscode.window.createTextEditorDecorationType({ color: "green" }),
  "33": vscode.window.createTextEditorDecorationType({ color: "yellow" }),
  "34": vscode.window.createTextEditorDecorationType({ color: "#4e8ed3" }),
  "35": vscode.window.createTextEditorDecorationType({ color: "magenta" }),
  "36": vscode.window.createTextEditorDecorationType({ color: "cyan" }),
  "37": vscode.window.createTextEditorDecorationType({ color: "white" }),
};

// Compare and apply new decorations
function compareAndUpdateDecorations(editor: vscode.TextEditor, text: string, offset: number) {
  const doc = editor.document;
  const decorations: { [key: string]: vscode.DecorationOptions[] } = {};
  let match;

  while ((match = ansiTokenRegex.exec(text)) !== null) {
    const [fullMatch, colorCode, visible] = match;
    if (!colorCode || fullMatch === "\x1b[0m") {continue;};

    const start = doc.positionAt(offset + match.index + fullMatch.indexOf("m") + 1);
    const end = doc.positionAt(offset + ansiTokenRegex.lastIndex);

    if (!decorations[colorCode]) {decorations[colorCode] = [];};
    decorations[colorCode].push({ range: new vscode.Range(start, end), hoverMessage: `ANSI ${colorCode}: ${visible}` });
  }

  // Remove decorations that are no longer in range
  for (const code in previousDecorations) {
    const old = previousDecorations[code];
    const current = decorations[code] || [];

    const stale = old.filter(
      o => !current.some(n => n.range.isEqual(o.range))
    );

    if (stale.length) {
      const type = colorMap[code];
      if (type) {editor.setDecorations(type, current);};
    }
  }

  // Apply new decorations
  for (const code in decorations) {
    const type = colorMap[code];
    if (type) {editor.setDecorations(type, decorations[code]);};
  }

  previousDecorations = decorations;
}

// Hide ANSI escape codes
function hideAnsiDecoration(editor: vscode.TextEditor, text: string, offset: number) {
  const doc = editor.document;
  const hidden: vscode.Range[] = [];
  let match;

  while ((match = escapeRegex.exec(text)) !== null) {
    const start = doc.positionAt(offset + match.index);
    const end = doc.positionAt(offset + match.index + match[0].length);
    hidden.push(new vscode.Range(start, end));
  }

  editor.setDecorations(hideDecoration, hidden);
}

// Clear decorations within a specific offset range
function clearDecorationsInRange(editor: vscode.TextEditor, startOffset: number, endOffset: number) {
  const doc = editor.document;

  for (const [code, type] of Object.entries(colorMap)) {
    const prev = previousDecorations[code];
    if (!prev) {continue;};

    const keep: vscode.DecorationOptions[] = [];
    const discard: vscode.DecorationOptions[] = [];

    for (const d of prev) {
      const dStart = doc.offsetAt(d.range.start);
      const dEnd = doc.offsetAt(d.range.end);
      (dEnd <= startOffset || dStart >= endOffset) ? keep.push(d) : discard.push(d);
    }

    editor.setDecorations(type, keep);
    previousDecorations[code] = keep;
  }

  // Also hide escape codes in that range
  const escapeText = doc.getText(new vscode.Range(doc.positionAt(startOffset), doc.positionAt(endOffset)));
  hideAnsiDecoration(editor, escapeText, startOffset);
}

// Main rendering function
function renderAnsiColors(editor: vscode.TextEditor | undefined) {
  if (!editor) {return;};

  const doc = editor.document;
  const visible = editor.visibleRanges[0];
  const startLine = visible.start.line;
  const endLine = visible.end.line;

  const bufferStart = Math.max(0, startLine - bufferSize);
  const bufferEnd = Math.min(doc.lineCount, endLine + bufferSize);
  const bufferStartOffset = doc.offsetAt(new vscode.Position(bufferStart, 0));
  const bufferEndOffset = doc.offsetAt(new vscode.Position(bufferEnd, 0));

  const bufferedText = doc.getText(new vscode.Range(bufferStart, 0, bufferEnd, 0));

  if (bufferStartOffset !== previousBufferStartOffset || bufferEndOffset !== previousBufferEndOffset) {
    clearDecorationsInRange(editor, previousBufferStartOffset, previousBufferEndOffset);
    compareAndUpdateDecorations(editor, bufferedText, bufferStartOffset);
    hideAnsiDecoration(editor, bufferedText, bufferStartOffset);

    previousBufferStartOffset = bufferStartOffset;
    previousBufferEndOffset = bufferEndOffset;
  }
}

// Activation
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("ansiColor.renderColors", () => {
    renderAnsiColors(vscode.window.activeTextEditor);
  });

  context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      const editor = vscode.window.visibleTextEditors.find(e => e.document === doc);
      renderAnsiColors(editor);
    }),

    vscode.window.onDidChangeActiveTextEditor(editor => renderAnsiColors(editor)),
    vscode.window.onDidChangeTextEditorVisibleRanges(e => renderAnsiColors(e.textEditor))
  );
}
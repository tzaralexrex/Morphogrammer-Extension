console.log("Morphogrammer: content script загружен");

let transformMap = {};
let lastEditable = null;
let lastRange = null;

// ===== ОБРАБОТКА ИВРИТА (LRM) =====

function isHebrewChar(ch) {
  if (!ch) return false;
  const code = ch.codePointAt(0);
  return code >= 0x0590 && code <= 0x05FF;
}

function isHebrewOrDigit(ch) {
  if (!ch) return false;
  const code = ch.codePointAt(0);
  return (code >= 0x0590 && code <= 0x05FF) || (code >= 0x0030 && code <= 0x0039);
}

function addLrmToHebrewRuns(text) {
  const LRM = "\u200E";
  let result = "";
  let inRun = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const isHD = isHebrewOrDigit(ch);
    const isSpace = ch === " " || ch === "\t" || ch === "\n";

    if (isHD) {
      result += LRM + ch;
      inRun = true;
    } else if (isSpace && inRun) {
      // Пробел внутри run — добавляем LRM
      result += LRM + ch;
    } else {
      result += ch;
      inRun = false;
    }
  }

  return result;
}

// ===== ТРАНСФОРМАЦИЯ ТЕКСТА =====

function transformText(text) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const repl = transformMap[ch] || "";
    if (repl) {
      out += repl;
    } else {
      out += ch;
    }
  }
  out = addLrmToHebrewRuns(out);
  return out;
}

// ===== ОБРАБОТЧИК СООБЩЕНИЙ =====

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkSelection") {
    const selection = window.getSelection();
    const hasSelection = selection && selection.rangeCount > 0 && selection.toString().length > 0;
    sendResponse({ hasSelection });
    return;
  }

  if (message.action !== "transformEditableSelection") {
    return;
  }

  if (message.transformMap) {
    transformMap = message.transformMap;
  }

  try {
    const editable = getTargetEditable();

    if (!editable) {
      const result = {
        ok: false,
        reason: "Выделение находится не в текстовом поле или редакторе."
      };
      console.warn("Morphogrammer:", result.reason);
      sendResponse(result);
      return;
    }

    let result;

    if (editable instanceof HTMLTextAreaElement || isTextInput(editable)) {
      result = replaceInInput(editable);
    } else {
      result = replaceInContentEditable(editable);
    }

    sendResponse(result);
  } catch (error) {
    const result = {
      ok: false,
      reason: error && error.message ? error.message : String(error)
    };
    console.error("Morphogrammer: ошибка замены:", error);
    sendResponse(result);
  }
});

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

function isTextInput(element) {
  if (!(element instanceof HTMLInputElement)) {
    return false;
  }
  const type = (element.type || "text").toLowerCase();
  return ["text", "search", "url", "tel", "email", "password"].includes(type);
}

function isEditableElement(element) {
  if (!(element instanceof Element)) {
    return false;
  }

  let parent = element;
  while (parent && parent !== document && parent.parentElement) {
    const ce = parent.getAttribute("contenteditable");
    if (ce === "false") {
      return false;
    }
    if (ce === "true" || ce === "plaintext-only") {
      break;
    }
    parent = parent.parentElement;
  }

  return (
    element instanceof HTMLTextAreaElement ||
    isTextInput(element) ||
    element.isContentEditable ||
    element.getAttribute("role") === "textbox"
  );
}

function getEditableFromNode(node) {
  if (!node) {
    return null;
  }

  let element = null;

  if (node.nodeType === Node.TEXT_NODE) {
    element = node.parentElement;
  } else if (node instanceof Element) {
    element = node;
  }

  if (!element) {
    return null;
  }

  let parent = element;
  
  while (parent && parent !== document && parent.parentElement) {
    const ce = parent.getAttribute("contenteditable");
    
    if (ce === "false") {
      return null;
    }
    
    if (ce === "true" || ce === "plaintext-only") {
      let checkParent = parent.parentElement;
      while (checkParent && checkParent !== document) {
        const ce2 = checkParent.getAttribute("contenteditable");
        if (ce2 === "false") {
          return null;
        }
        if (ce2 === "true" || ce2 === "plaintext-only") {
          break;
        }
        checkParent = checkParent.parentElement;
      }
      
      return parent;
    }
    
    parent = parent.parentElement;
  }

  const candidate = element.closest("textarea, input");
  if (candidate && isEditableElement(candidate)) {
    return candidate;
  }

  return null;
}

function rangeBelongsToElement(range, element) {
  const ancestor = range.commonAncestorContainer;

  if (ancestor === element) {
    return true;
  }

  let ancestorElement = null;

  if (ancestor.nodeType === Node.TEXT_NODE) {
    ancestorElement = ancestor.parentElement;
  } else if (ancestor instanceof Element) {
    ancestorElement = ancestor;
  }

  return ancestorElement instanceof Element && element.contains(ancestorElement);
}

function rememberCurrentEditableSelection() {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLTextAreaElement || isTextInput(activeElement)) {
    lastEditable = activeElement;
    lastRange = null;
    return;
  }

  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  const editable = getEditableFromNode(selection.anchorNode);

  if (!editable || !rangeBelongsToElement(range, editable)) {
    return;
  }

  lastEditable = editable;
  lastRange = range.cloneRange();
}

document.addEventListener("focusin", rememberCurrentEditableSelection, true);
document.addEventListener("selectionchange", rememberCurrentEditableSelection, true);
document.addEventListener("mouseup", rememberCurrentEditableSelection, true);
document.addEventListener("keyup", rememberCurrentEditableSelection, true);

function setNativeInputValue(element, value) {
  const prototype = element instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;

  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

  if (descriptor && descriptor.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }
}

function dispatchInputEvent(element, insertedText) {
  let event;

  try {
    event = new InputEvent("input", {
      bubbles: true,
      cancelable: false,
      inputType: "insertText",
      data: insertedText
    });
  } catch (error) {
    event = new Event("input", { bubbles: true });
  }

  element.dispatchEvent(event);
}

function replaceInInput(element) {
  const start = element.selectionStart;
  const end = element.selectionEnd;

  if (start === null || end === null || start === end) {
    return {
      ok: false,
      reason: "В текстовом поле нет выделенного фрагмента."
    };
  }

  const source = element.value.slice(start, end);
  const transformed = transformText(source);

  const newValue =
    element.value.slice(0, start) +
    transformed +
    element.value.slice(end);

  element.focus();
  setNativeInputValue(element, newValue);

  const cursorPosition = start + transformed.length;
  element.setSelectionRange(cursorPosition, cursorPosition);

  dispatchInputEvent(element, transformed);

  return {
    ok: true,
    mode: "input",
    source,
    transformed
  };
}

function restoreRangeInEditable(element, range) {
  if (!range || !rangeBelongsToElement(range, element)) {
    return false;
  }

  const selection = window.getSelection();

  if (!selection) {
    return false;
  }

  selection.removeAllRanges();
  selection.addRange(range);

  return true;
}

function replaceInContentEditable(element) {
  element.focus();

  let selection = window.getSelection();
  let range = selection && selection.rangeCount > 0
    ? selection.getRangeAt(0)
    : null;

  if (!range || !rangeBelongsToElement(range, element) || range.collapsed) {
    const restored = restoreRangeInEditable(element, lastRange);

    if (!restored) {
      return {
        ok: false,
        reason: "В редактируемом поле нет выделенного фрагмента."
      };
    }

    selection = window.getSelection();
    range = selection.getRangeAt(0);
  }

  const source = selection.toString();

  if (!source) {
    return {
      ok: false,
      reason: "Выделенный фрагмент пуст."
    };
  }

  const transformed = transformText(source);

  const replaced = document.execCommand("insertText", false, transformed);

  if (replaced) {
    return {
      ok: true,
      mode: "contenteditable",
      source,
      transformed,
      via: "execCommand"
    };
  }

  selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return {
      ok: false,
      reason: "Не удалось восстановить выделение в редакторе."
    };
  }

  range = selection.getRangeAt(0);

  if (!rangeBelongsToElement(range, element)) {
    return {
      ok: false,
      reason: "Выделение вышло за пределы редактора."
    };
  }

  range.deleteContents();

  const textNode = document.createTextNode(transformed);
  range.insertNode(textNode);

  const caret = document.createRange();
  caret.setStartAfter(textNode);
  caret.collapse(true);

  selection.removeAllRanges();
  selection.addRange(caret);

  dispatchInputEvent(element, transformed);

  return {
    ok: true,
    mode: "contenteditable",
    source,
    transformed,
    via: "fallback"
  };
}

function getTargetEditable() {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLTextAreaElement || isTextInput(activeElement)) {
    return activeElement;
  }

  if (lastEditable && document.contains(lastEditable)) {
    return lastEditable;
  }

  const selection = window.getSelection();

  if (selection && selection.rangeCount > 0) {
    return getEditableFromNode(selection.anchorNode);
  }

  return null;
}
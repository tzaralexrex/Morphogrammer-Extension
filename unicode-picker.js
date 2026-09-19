// unicode-picker.js — Модальное окно выбора символов Unicode

// Список основных блоков Unicode
const unicodeBlocks = [
  { name: "Basic Latin", start: 0x0020, end: 0x007F },
  { name: "Latin-1 Supplement", start: 0x0080, end: 0x00FF },
  { name: "Latin Extended-A", start: 0x0100, end: 0x017F },
  { name: "Latin Extended-B", start: 0x0180, end: 0x024F },
  { name: "IPA Extensions", start: 0x0250, end: 0x02AF },
  { name: "Spacing Modifier Letters", start: 0x02B0, end: 0x02FF },
  { name: "Combining Diacritical Marks", start: 0x0300, end: 0x036F },
  { name: "Greek and Coptic", start: 0x0370, end: 0x03FF },
  { name: "Cyrillic", start: 0x0400, end: 0x04FF },
  { name: "Cyrillic Supplement", start: 0x0500, end: 0x052F },
  { name: "Armenian", start: 0x0530, end: 0x058F },
  { name: "Hebrew", start: 0x0590, end: 0x05FF },
  { name: "Arabic", start: 0x0600, end: 0x06FF },
  { name: "Syriac", start: 0x0700, end: 0x074F },
  { name: "Arabic Supplement", start: 0x0750, end: 0x077F },
  { name: "Thaana", start: 0x0780, end: 0x07BF },
  { name: "NKo", start: 0x07C0, end: 0x07FF },
  { name: "Samaritan", start: 0x0800, end: 0x083F },
  { name: "Mandaic", start: 0x0840, end: 0x085F },
  { name: "Devanagari", start: 0x0900, end: 0x097F },
  { name: "Bengali", start: 0x0980, end: 0x09FF },
  { name: "Gurmukhi", start: 0x0A00, end: 0x0A7F },
  { name: "Gujarati", start: 0x0A80, end: 0x0AFF },
  { name: "Oriya", start: 0x0B00, end: 0x0B7F },
  { name: "Tamil", start: 0x0B80, end: 0x0BFF },
  { name: "Telugu", start: 0x0C00, end: 0x0C7F },
  { name: "Kannada", start: 0x0C80, end: 0x0CFF },
  { name: "Malayalam", start: 0x0D00, end: 0x0D7F },
  { name: "Sinhala", start: 0x0D80, end: 0x0DFF },
  { name: "Thai", start: 0x0E00, end: 0x0E7F },
  { name: "Lao", start: 0x0E80, end: 0x0EFF },
  { name: "Tibetan", start: 0x0F00, end: 0x0FFF },
  { name: "Myanmar", start: 0x1000, end: 0x109F },
  { name: "Georgian", start: 0x10A0, end: 0x10FF },
  { name: "Hangul Jamo", start: 0x1100, end: 0x11FF },
  { name: "Latin Extended Additional", start: 0x1E00, end: 0x1EFF },
  { name: "Greek Extended", start: 0x1F00, end: 0x1FFF },
  { name: "General Punctuation", start: 0x2000, end: 0x206F },
  { name: "Superscripts and Subscripts", start: 0x2070, end: 0x209F },
  { name: "Currency Symbols", start: 0x20A0, end: 0x20CF },
  { name: "Combining Diacritical Marks for Symbols", start: 0x20D0, end: 0x20FF },
  { name: "Letterlike Symbols", start: 0x2100, end: 0x214F },
  { name: "Number Forms", start: 0x2150, end: 0x218F },
  { name: "Arrows", start: 0x2190, end: 0x21FF },
  { name: "Mathematical Operators", start: 0x2200, end: 0x22FF },
  { name: "Miscellaneous Technical", start: 0x2300, end: 0x23FF },
  { name: "Control Pictures", start: 0x2400, end: 0x243F },
  { name: "Optical Character Recognition", start: 0x2440, end: 0x245F },
  { name: "Enclosed Alphanumerics", start: 0x2460, end: 0x24FF },
  { name: "Box Drawing", start: 0x2500, end: 0x257F },
  { name: "Block Elements", start: 0x2580, end: 0x259F },
  { name: "Geometric Shapes", start: 0x25A0, end: 0x25FF },
  { name: "Miscellaneous Symbols", start: 0x2600, end: 0x26FF },
  { name: "Dingbats", start: 0x2700, end: 0x27BF },
  { name: "Miscellaneous Mathematical Symbols-A", start: 0x27C0, end: 0x27EF },
  { name: "Supplemental Arrows-A", start: 0x27F0, end: 0x27FF },
  { name: "Braille Patterns", start: 0x2800, end: 0x28FF },
  { name: "Supplemental Arrows-B", start: 0x2900, end: 0x297F },
  { name: "Miscellaneous Mathematical Symbols-B", start: 0x2980, end: 0x29FF },
  { name: "Supplemental Mathematical Operators", start: 0x2A00, end: 0x2AFF },
  { name: "Miscellaneous Symbols and Arrows", start: 0x2B00, end: 0x2BFF },
  { name: "Glagolitic", start: 0x2C00, end: 0x2C5F },
  { name: "Latin Extended-C", start: 0x2C60, end: 0x2C7F },
  { name: "Coptic", start: 0x2C80, end: 0x2CFF },
  { name: "Georgian Supplement", start: 0x2D00, end: 0x2D2F },
  { name: "Tifinagh", start: 0x2D30, end: 0x2D7F },
  { name: "Ethiopic", start: 0x2D80, end: 0x2DDF },
  { name: "Cyrillic Extended-A", start: 0x2DE0, end: 0x2DFF },
  { name: "Supplemental Punctuation", start: 0x2E00, end: 0x2E7F },
  { name: "CJK Radicals Supplement", start: 0x2E80, end: 0x2EFF },
  { name: "Kangxi Radicals", start: 0x2F00, end: 0x2FDF },
  { name: "Ideographic Description Characters", start: 0x2FF0, end: 0x2FFF },
  { name: "CJK Symbols and Punctuation", start: 0x3000, end: 0x303F },
  { name: "Hiragana", start: 0x3040, end: 0x309F },
  { name: "Katakana", start: 0x30A0, end: 0x30FF },
  { name: "Bopomofo", start: 0x3100, end: 0x312F },
  { name: "Hangul Compatibility Jamo", start: 0x3130, end: 0x318F },
  { name: "Kanbun", start: 0x3190, end: 0x319F },
  { name: "Bopomofo Extended", start: 0x31A0, end: 0x31BF },
  { name: "CJK Strokes", start: 0x31C0, end: 0x31EF },
  { name: "Katakana Phonetic Extensions", start: 0x31F0, end: 0x31FF },
  { name: "Enclosed CJK Letters and Months", start: 0x3200, end: 0x32FF },
  { name: "CJK Compatibility", start: 0x3300, end: 0x33FF },
  { name: "CJK Unified Ideographs Extension A", start: 0x3400, end: 0x4DBF },
  { name: "Yijing Hexagram Symbols", start: 0x4DC0, end: 0x4DFF },
  { name: "CJK Unified Ideographs", start: 0x4E00, end: 0x9FFF },
  { name: "Yi Syllables", start: 0xA000, end: 0xA48F },
  { name: "Yi Radicals", start: 0xA490, end: 0xA4CF },
  { name: "Lisu", start: 0xA4D0, end: 0xA4FF },
  { name: "Vai", start: 0xA500, end: 0xA63F },
  { name: "Cyrillic Extended-B", start: 0xA640, end: 0xA69F },
  { name: "Bamum", start: 0xA6A0, end: 0xA6FF },
  { name: "Modifier Tone Letters", start: 0xA700, end: 0xA71F },
  { name: "Latin Extended-D", start: 0xA720, end: 0xA7FF },
  { name: "Syloti Nagri", start: 0xA800, end: 0xA82F },
  { name: "Common Indic Number Forms", start: 0xA830, end: 0xA83F },
  { name: "Phags-pa", start: 0xA840, end: 0xA87F },
  { name: "Saurashtra", start: 0xA880, end: 0xA8DF },
  { name: "Devanagari Extended", start: 0xA8E0, end: 0xA8FF },
  { name: "Kayah Li", start: 0xA900, end: 0xA92F },
  { name: "Rejang", start: 0xA930, end: 0xA95F },
  { name: "Hangul Jamo Extended-A", start: 0xA960, end: 0xA97F },
  { name: "Javanese", start: 0xA980, end: 0xA9DF },
  { name: "Myanmar Extended-B", start: 0xA9E0, end: 0xA9FF },
  { name: "Cham", start: 0xAA00, end: 0xAA5F },
  { name: "Myanmar Extended-A", start: 0xAA60, end: 0xAA7F },
  { name: "Tai Viet", start: 0xAA80, end: 0xAADF },
  { name: "Meetei Mayek Extensions", start: 0xAAE0, end: 0xAAFF },
  { name: "Ethiopic Extended-A", start: 0xAB00, end: 0xAB2F },
  { name: "Latin Extended-E", start: 0xAB30, end: 0xAB6F },
  { name: "Cherokee Supplement", start: 0xAB70, end: 0xABBF },
  { name: "Meetei Mayek", start: 0xABC0, end: 0xABFF },
  { name: "Hangul Syllables", start: 0xAC00, end: 0xD7AF },
  { name: "Hangul Jamo Extended-B", start: 0xD7B0, end: 0xD7FF },
  { name: "High Surrogates", start: 0xD800, end: 0xDB7F },
  { name: "High Private Use Surrogates", start: 0xDB80, end: 0xDBFF },
  { name: "Low Surrogates", start: 0xDC00, end: 0xDFFF },
  { name: "Private Use Area", start: 0xE000, end: 0xF8FF },
  { name: "CJK Compatibility Ideographs", start: 0xF900, end: 0xFAFF },
  { name: "Alphabetic Presentation Forms", start: 0xFB00, end: 0xFB4F },
  { name: "Arabic Presentation Forms-A", start: 0xFB50, end: 0xFDFF },
  { name: "Variation Selectors", start: 0xFE00, end: 0xFE0F },
  { name: "Vertical Forms", start: 0xFE10, end: 0xFE1F },
  { name: "Combining Half Marks", start: 0xFE20, end: 0xFE2F },
  { name: "CJK Compatibility Forms", start: 0xFE30, end: 0xFE4F },
  { name: "Small Form Variants", start: 0xFE50, end: 0xFE6F },
  { name: "Arabic Presentation Forms-B", start: 0xFE70, end: 0xFEFF },
  { name: "Halfwidth and Fullwidth Forms", start: 0xFF00, end: 0xFFEF },
  { name: "Specials", start: 0xFFF0, end: 0xFFFF },
];

// Константы
const GRID_SIZE = 16; // 16x16 = 256 символов на страницу
const PAGE_SIZE = GRID_SIZE * GRID_SIZE;

// Состояние
let currentInput = null;        // input element, который открыл picker
let currentBlockIndex = 0;      // индекс текущего блока
let currentPage = 0;            // текущая страница внутри блока
let selectedChar = null;        // выбранный символ
let currentChar = null;         // текущий символ в input

// Поиск блока по символу
function findBlockByChar(char) {
  if (!char) return 0;
  const code = char.codePointAt(0);
  for (let i = 0; i < unicodeBlocks.length; i++) {
    const block = unicodeBlocks[i];
    if (code >= block.start && code <= block.end) {
      return i;
    }
  }
  // Если не найдено, возвращаем Cyrillic
  const cyrillicIndex = unicodeBlocks.findIndex(b => b.name === "Cyrillic");
  return cyrillicIndex >= 0 ? cyrillicIndex : 0;
}

// Поиск блока по коду (U+03B1 или 03B1)
function findBlockByCode(codeStr) {
  let code = parseInt(codeStr.replace(/^U\+/i, ""), 16);
  if (isNaN(code)) return 0;
  for (let i = 0; i < unicodeBlocks.length; i++) {
    const block = unicodeBlocks[i];
    if (code >= block.start && code <= block.end) {
      return i;
    }
  }
  return 0;
}

// Получение символов для текущей страницы
function getPageChars(blockIndex, page) {
  const block = unicodeBlocks[blockIndex];
  const start = block.start + page * PAGE_SIZE;
  const chars = [];
  for (let i = 0; i < PAGE_SIZE; i++) {
    const code = start + i;
    if (code > block.end) break;
    try {
      chars.push(String.fromCodePoint(code));
    } catch (e) {
      chars.push("");
    }
  }
  return chars;
}

// Отрисовка сетки
function renderGrid() {
  const grid = document.querySelector(".unicode-picker-grid");
  if (!grid) return;

  grid.innerHTML = "";
  const chars = getPageChars(currentBlockIndex, currentPage);

  chars.forEach((char, index) => {
    const cell = document.createElement("div");
    cell.className = "unicode-picker-cell";
    cell.textContent = char || " ";
    cell.style.cursor = char ? "pointer" : "default";
    cell.style.opacity = char ? "1" : "0.3";

    // Подсветка текущего символа
    if (char === currentChar) {
      cell.classList.add("current");
    }

    // Подсветка выбранного символа
    if (char === selectedChar) {
      cell.classList.add("selected");
    }

    cell.onclick = () => {
      if (char) {
        selectedChar = char;
        renderGrid();
        updateInfo();
      }
    };

    grid.appendChild(cell);
  });
}

// Обновление информации
function updateInfo() {
  const info = document.querySelector(".unicode-picker-info");
  if (!info) return;

  const block = unicodeBlocks[currentBlockIndex];
  const code = selectedChar ? selectedChar.codePointAt(0).toString(16).toUpperCase().padStart(4, "0") : "—";
  const charDisplay = selectedChar || "—";

  info.innerHTML = `
    <span>Блок: <strong>${block.name}</strong></span>
    <span>Символ: <kbd>${charDisplay}</kbd> Код: <kbd>U+${code}</kbd></span>
  `;
}

// Отрисовка выпадающего списка блоков
function renderBlockSelect() {
  const select = document.querySelector(".unicode-picker-block-select");
  if (!select) return;

  select.innerHTML = "";
  unicodeBlocks.forEach((block, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = block.name;
    select.appendChild(opt);
  });

  select.value = currentBlockIndex;
  select.onchange = () => {
    currentBlockIndex = parseInt(select.value);
    currentPage = 0;
    selectedChar = null;
    renderGrid();
    updateInfo();
  };
}

// Обработка поиска
function handleSearch(input) {
  const value = input.value.trim();
  if (!value) return;

  // Если это один символ
  if (value.length === 1) {
    const blockIndex = findBlockByChar(value);
    currentBlockIndex = blockIndex;
    currentPage = 0;
    selectedChar = value;
    renderBlockSelect();
    renderGrid();
    updateInfo();
    return;
  }

  // Если это код (U+03B1 или 03B1)
  const codeMatch = value.match(/^U\+([0-9A-Fa-f]+)$/i) || value.match(/^([0-9A-Fa-f]+)$/);
  if (codeMatch) {
    const blockIndex = findBlockByCode(value);
    currentBlockIndex = blockIndex;
    currentPage = 0;
    const code = parseInt(codeMatch[1], 16);
    try {
      selectedChar = String.fromCodePoint(code);
    } catch (e) {
      selectedChar = null;
    }
    renderBlockSelect();
    renderGrid();
    updateInfo();
    return;
  }
}

// Открытие модалки
export function openUnicodePicker(inputElement, callback) {
  currentInput = inputElement;
  currentChar = inputElement.value || "";
  currentBlockIndex = findBlockByChar(currentChar);
  currentPage = 0;
  selectedChar = currentChar || null;

  const overlay = document.querySelector(".unicode-picker-overlay");
  if (!overlay) return;

  overlay.style.display = "flex";
  renderBlockSelect();
  renderGrid();
  updateInfo();

  // Фокус на поиск
  const searchInput = overlay.querySelector(".unicode-picker-search input");
  if (searchInput) {
    searchInput.value = currentChar || "";
    searchInput.focus();
    searchInput.select();
  }

  // Обработка Enter в поиске
  const handleKeydown = (e) => {
    if (e.key === "Enter" && searchInput) {
      handleSearch(searchInput);
      e.preventDefault();
    }
    if (e.key === "Escape") {
      closeUnicodePicker();
    }
  };

  overlay.addEventListener("keydown", handleKeydown);
  overlay._keydownHandler = handleKeydown;

  // Кнопка "Вставить"
  const insertBtn = overlay.querySelector(".unicode-picker-footer button.primary");
  if (insertBtn) {
    insertBtn.onclick = () => {
      if (selectedChar && currentInput) {
        currentInput.value = selectedChar;
        currentInput.dispatchEvent(new Event("input", { bubbles: true }));
        currentInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
      closeUnicodePicker();
      if (callback) callback(selectedChar);
    };
  }

  // Кнопка "Отмена"
  const cancelBtn = overlay.querySelector(".unicode-picker-footer button.secondary");
  if (cancelBtn) {
    cancelBtn.onclick = closeUnicodePicker;
  }

  // Кнопка закрытия
  const closeBtn = overlay.querySelector(".unicode-picker-close");
  if (closeBtn) {
    closeBtn.onclick = closeUnicodePicker;
  }

  // Клик по overlay
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeUnicodePicker();
    }
  };
}

// Закрытие модалки
export function closeUnicodePicker() {
  const overlay = document.querySelector(".unicode-picker-overlay");
  if (!overlay) return;

  overlay.style.display = "none";

  // Удаляем обработчик
  if (overlay._keydownHandler) {
    overlay.removeEventListener("keydown", overlay._keydownHandler);
    overlay._keydownHandler = null;
  }

  currentInput = null;
  currentChar = null;
  selectedChar = null;
}

// Инициализация (вызывается из settings.js)
export function initUnicodePicker() {
  // Ничего особенного, всё делается в openUnicodePicker
}

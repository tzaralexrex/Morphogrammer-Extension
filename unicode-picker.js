// unicode-picker.js — Модальное окно выбора символов Unicode

// Список основных блоков Unicode
const unicodeBlocks = [
  // === Basic Latin и дополнения ===
  { name: "Basic Latin", start: 0x0020, end: 0x007F },
  { name: "Latin-1 Supplement", start: 0x0080, end: 0x00FF },
  { name: "Latin Extended-A", start: 0x0100, end: 0x017F },
  { name: "Latin Extended-B", start: 0x0180, end: 0x024F },
  { name: "IPA Extensions", start: 0x0250, end: 0x02AF },
  { name: "Spacing Modifier Letters", start: 0x02B0, end: 0x02FF },
  { name: "Combining Diacritical Marks", start: 0x0300, end: 0x036F },
  
  // === Европейские письменности ===
  { name: "Greek and Coptic", start: 0x0370, end: 0x03FF },
  { name: "Cyrillic", start: 0x0400, end: 0x04FF },
  { name: "Cyrillic Supplement", start: 0x0500, end: 0x052F },
  { name: "Cyrillic Extended-A", start: 0x2DE0, end: 0x2DFF },
  { name: "Cyrillic Extended-B", start: 0xA640, end: 0xA69F },
  { name: "Cyrillic Extended-C", start: 0x1C80, end: 0x1C8F },
  { name: "Armenian", start: 0x0530, end: 0x058F },
  { name: "Hebrew", start: 0x0590, end: 0x05FF },
  { name: "Arabic", start: 0x0600, end: 0x06FF },
  { name: "Arabic Supplement", start: 0x0750, end: 0x077F },
  { name: "Arabic Extended-A", start: 0x08A0, end: 0x08FF },
  { name: "Arabic Presentation Forms-A", start: 0xFB50, end: 0xFDFF },
  { name: "Arabic Presentation Forms-B", start: 0xFE70, end: 0xFEFF },
  { name: "Syriac", start: 0x0700, end: 0x074F },
  { name: "Thaana", start: 0x0780, end: 0x07BF },
  { name: "NKo", start: 0x07C0, end: 0x07FF },
  { name: "Samaritan", start: 0x0800, end: 0x083F },
  { name: "Mandaic", start: 0x0840, end: 0x085F },
  
  // === Индийские письменности ===
  { name: "Devanagari", start: 0x0900, end: 0x097F },
  { name: "Devanagari Extended", start: 0xA8E0, end: 0xA8FF },
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
  { name: "Myanmar Extended-A", start: 0xAA60, end: 0xAA7F },
  { name: "Myanmar Extended-B", start: 0xA9E0, end: 0xA9FF },
  
  // === Грузинский и другие ===
  { name: "Georgian", start: 0x10A0, end: 0x10FF },
  { name: "Georgian Supplement", start: 0x2D00, end: 0x2D2F },
  { name: "Hangul Jamo", start: 0x1100, end: 0x11FF },
  { name: "Hangul Jamo Extended-A", start: 0xA960, end: 0xA97F },
  { name: "Hangul Jamo Extended-B", start: 0xD7B0, end: 0xD7FF },
  { name: "Hangul Compatibility Jamo", start: 0x3130, end: 0x318F },
  { name: "Hangul Syllables", start: 0xAC00, end: 0xD7AF },
  
  // === Расширенная латиница ===
  { name: "Latin Extended Additional", start: 0x1E00, end: 0x1EFF },
  { name: "Latin Extended-C", start: 0x2C60, end: 0x2C7F },
  { name: "Latin Extended-D", start: 0xA720, end: 0xA7FF },
  { name: "Latin Extended-E", start: 0xAB30, end: 0xAB6F },
  { name: "Greek Extended", start: 0x1F00, end: 0x1FFF },
  
  // === Символы и знаки ===
  { name: "General Punctuation", start: 0x2000, end: 0x206F },
  { name: "Supplemental Punctuation", start: 0x2E00, end: 0x2E7F },
  { name: "Superscripts and Subscripts", start: 0x2070, end: 0x209F },
  { name: "Currency Symbols", start: 0x20A0, end: 0x20CF },
  { name: "Combining Diacritical Marks for Symbols", start: 0x20D0, end: 0x20FF },
  { name: "Letterlike Symbols", start: 0x2100, end: 0x214F },
  { name: "Number Forms", start: 0x2150, end: 0x218F },
  { name: "Arrows", start: 0x2190, end: 0x21FF },
  { name: "Supplemental Arrows-A", start: 0x27F0, end: 0x27FF },
  { name: "Supplemental Arrows-B", start: 0x2900, end: 0x297F },
  { name: "Mathematical Operators", start: 0x2200, end: 0x22FF },
  { name: "Miscellaneous Mathematical Symbols-A", start: 0x27C0, end: 0x27EF },
  { name: "Miscellaneous Mathematical Symbols-B", start: 0x2980, end: 0x29FF },
  { name: "Supplemental Mathematical Operators", start: 0x2A00, end: 0x2AFF },
  { name: "Miscellaneous Technical", start: 0x2300, end: 0x23FF },
  { name: "Control Pictures", start: 0x2400, end: 0x243F },
  { name: "Optical Character Recognition", start: 0x2440, end: 0x245F },
  { name: "Enclosed Alphanumerics", start: 0x2460, end: 0x24FF },
  { name: "Box Drawing", start: 0x2500, end: 0x257F },
  { name: "Block Elements", start: 0x2580, end: 0x259F },
  { name: "Geometric Shapes", start: 0x25A0, end: 0x25FF },
  { name: "Miscellaneous Symbols", start: 0x2600, end: 0x26FF },
  { name: "Dingbats", start: 0x2700, end: 0x27BF },
  { name: "Braille Patterns", start: 0x2800, end: 0x28FF },
  { name: "Miscellaneous Symbols and Arrows", start: 0x2B00, end: 0x2BFF },
  
  // === CJK (китайский, японский, корейский) ===
  { name: "CJK Radicals Supplement", start: 0x2E80, end: 0x2EFF },
  { name: "Kangxi Radicals", start: 0x2F00, end: 0x2FDF },
  { name: "Ideographic Description Characters", start: 0x2FF0, end: 0x2FFF },
  { name: "CJK Symbols and Punctuation", start: 0x3000, end: 0x303F },
  { name: "Hiragana", start: 0x3040, end: 0x309F },
  { name: "Katakana", start: 0x30A0, end: 0x30FF },
  { name: "Katakana Phonetic Extensions", start: 0x31F0, end: 0x31FF },
  { name: "Bopomofo", start: 0x3100, end: 0x312F },
  { name: "Bopomofo Extended", start: 0x31A0, end: 0x31BF },
  { name: "Hangul Compatibility Jamo", start: 0x3130, end: 0x318F },
  { name: "Kanbun", start: 0x3190, end: 0x319F },
  { name: "CJK Strokes", start: 0x31C0, end: 0x31EF },
  { name: "Enclosed CJK Letters and Months", start: 0x3200, end: 0x32FF },
  { name: "CJK Compatibility", start: 0x3300, end: 0x33FF },
  { name: "CJK Unified Ideographs Extension A", start: 0x3400, end: 0x4DBF },
  { name: "CJK Unified Ideographs", start: 0x4E00, end: 0x9FFF },
  { name: "CJK Unified Ideographs Extension B", start: 0x20000, end: 0x2A6DF },
  { name: "CJK Unified Ideographs Extension C", start: 0x2A700, end: 0x2B73F },
  { name: "CJK Unified Ideographs Extension D", start: 0x2B740, end: 0x2B81F },
  { name: "CJK Unified Ideographs Extension E", start: 0x2B820, end: 0x2CEAF },
  { name: "CJK Unified Ideographs Extension F", start: 0x2CEB0, end: 0x2EBEF },
  { name: "CJK Unified Ideographs Extension G", start: 0x30000, end: 0x3134F },
  { name: "CJK Unified Ideographs Extension H", start: 0x31350, end: 0x323AF },
  { name: "CJK Compatibility Ideographs", start: 0xF900, end: 0xFAFF },
  { name: "CJK Compatibility Forms", start: 0xFE30, end: 0xFE4F },
  { name: "Small Form Variants", start: 0xFE50, end: 0xFE6F },
  { name: "Halfwidth and Fullwidth Forms", start: 0xFF00, end: 0xFFEF },
  { name: "Vertical Forms", start: 0xFE10, end: 0xFE1F },
  
  // === Yi (И) ===
  { name: "Yi Syllables", start: 0xA000, end: 0xA48F },
  { name: "Yi Radicals", start: 0xA490, end: 0xA4CF },
  
  // === Другие азиатские письменности ===
  { name: "Lisu", start: 0xA4D0, end: 0xA4FF },
  { name: "Vai", start: 0xA500, end: 0xA63F },
  { name: "Bamum", start: 0xA6A0, end: 0xA6FF },
  { name: "Syloti Nagri", start: 0xA800, end: 0xA82F },
  { name: "Common Indic Number Forms", start: 0xA830, end: 0xA83F },
  { name: "Phags-pa", start: 0xA840, end: 0xA87F },
  { name: "Saurashtra", start: 0xA880, end: 0xA8DF },
  { name: "Kayah Li", start: 0xA900, end: 0xA92F },
  { name: "Rejang", start: 0xA930, end: 0xA95F },
  { name: "Javanese", start: 0xA980, end: 0xA9DF },
  { name: "Cham", start: 0xAA00, end: 0xAA5F },
  { name: "Tai Viet", start: 0xAA80, end: 0xAADF },
  { name: "Meetei Mayek", start: 0xABC0, end: 0xABFF },
  { name: "Meetei Mayek Extensions", start: 0xAAE0, end: 0xAAFF },
  { name: "Tai Tham", start: 0x1A20, end: 0x1AAF },
  { name: "Tai Le", start: 0x1950, end: 0x197F },
  { name: "New Tai Lue", start: 0x1980, end: 0x19DF },
  { name: "Buginese", start: 0x1A00, end: 0x1A1F },
  { name: "Balinese", start: 0x1B00, end: 0x1B7F },
  { name: "Sundanese", start: 0x1B80, end: 0x1BBF },
  { name: "Batak", start: 0x1BC0, end: 0x1BFF },
  { name: "Lepcha", start: 0x1C00, end: 0x1C4F },
  { name: "Ol Chiki", start: 0x1C50, end: 0x1C7F },
  { name: "Sora Sompeng", start: 0x110D0, end: 0x110FF },
  { name: "Chakma", start: 0x11100, end: 0x1114F },
  { name: "Sharada", start: 0x11180, end: 0x111DF },
  { name: "Takri", start: 0x11680, end: 0x116CF },
  { name: "Khojki", start: 0x11200, end: 0x1124F },
  { name: "Multani", start: 0x11280, end: 0x112AF },
  { name: "Khudawadi", start: 0x112B0, end: 0x112FF },
  { name: "Grantha", start: 0x11300, end: 0x1137F },
  { name: "Tirhuta", start: 0x11480, end: 0x114DF },
  { name: "Mahajani", start: 0x11150, end: 0x111AF },
  { name: "Siddham", start: 0x11580, end: 0x115FF },
  { name: "Modi", start: 0x11600, end: 0x1165F },
  { name: "Mongolian", start: 0x1800, end: 0x18AF },
  { name: "Phags-pa", start: 0xA840, end: 0xA87F },
  
  // === Африканские письменности ===
  { name: "Ethiopic", start: 0x2D80, end: 0x2DDF },
  { name: "Ethiopic Supplement", start: 0x1380, end: 0x139F },
  { name: "Ethiopic Extended", start: 0x2D00, end: 0x2D2F },
  { name: "Ethiopic Extended-A", start: 0xAB00, end: 0xAB2F },
  { name: "Tifinagh", start: 0x2D30, end: 0x2D7F },
  { name: "Vai", start: 0xA500, end: 0xA63F },
  { name: "Bamum", start: 0xA6A0, end: 0xA6FF },
  { name: "Bassa Vah", start: 0x16AD0, end: 0x16AFF },
  { name: "Caucasian Albanian", start: 0x10530, end: 0x1056F },
  
  // === Древние и исторические письменности ===
  { name: "Glagolitic", start: 0x2C00, end: 0x2C5F },
  { name: "Coptic", start: 0x2C80, end: 0x2CFF },
  { name: "Gothic", start: 0x10330, end: 0x1034F },
  { name: "Old Permic", start: 0x10350, end: 0x1037F },
  { name: "Old Hungarian", start: 0x10C80, end: 0x10CFF },
  { name: "Runic", start: 0x16A0, end: 0x16FF },
  { name: "Ogham", start: 0x1680, end: 0x169F },
  { name: "Old Turkic", start: 0x10C00, end: 0x10C4F },
  { name: "Old South Arabian", start: 0x10A60, end: 0x10A7F },
  { name: "Old North Arabian", start: 0x10A80, end: 0x10A9F },
  { name: "Manichaean", start: 0x10AC0, end: 0x10AFF },
  { name: "Avestan", start: 0x10B00, end: 0x10B3F },
  { name: "Inscriptional Parthian", start: 0x10B40, end: 0x10B5F },
  { name: "Inscriptional Pahlavi", start: 0x10B60, end: 0x10B7F },
  { name: "Psalter Pahlavi", start: 0x10B80, end: 0x10BAF },
  { name: "Lydian", start: 0x10920, end: 0x1093F },
  { name: "Meroitic Hieroglyphs", start: 0x10980, end: 0x1099F },
  { name: "Meroitic Cursive", start: 0x109A0, end: 0x109FF },
  { name: "Kharoshthi", start: 0x10A00, end: 0x10A5F },
  { name: "Brahmi", start: 0x11000, end: 0x1107F },
  { name: "Kaithi", start: 0x11080, end: 0x110CF },
  { name: "Sora Sompeng", start: 0x110D0, end: 0x110FF },
  { name: "Chakma", start: 0x11100, end: 0x1114F },
  { name: "Mahajani", start: 0x11150, end: 0x111AF },
  { name: "Sharada", start: 0x11180, end: 0x111DF },
  { name: "Siddham", start: 0x11580, end: 0x115FF },
  { name: "Khudawadi", start: 0x112B0, end: 0x112FF },
  { name: "Grantha", start: 0x11300, end: 0x1137F },
  { name: "Newa", start: 0x11400, end: 0x1147F },
  { name: "Tirhuta", start: 0x11480, end: 0x114DF },
  { name: "Modi", start: 0x11600, end: 0x1165F },
  { name: "Mongolian Supplement", start: 0x11660, end: 0x1167F },
  { name: "Takri", start: 0x11680, end: 0x116CF },
  { name: "Ahom", start: 0x11700, end: 0x1173F },
  { name: "Dogra", start: 0x11800, end: 0x1184F },
  { name: "Warang Citi", start: 0x118A0, end: 0x118FF },
  { name: "Dives Akuru", start: 0x11900, end: 0x1195F },
  { name: "Nandinagari", start: 0x119A0, end: 0x119FF },
  { name: "Zanabazar Square", start: 0x11A00, end: 0x11A4F },
  { name: "Soyombo", start: 0x11A50, end: 0x11A7F },
  { name: "Pau Cin Hau", start: 0x11AC0, end: 0x11AFF },
  { name: "Bhaiksuki", start: 0x11C00, end: 0x11C6F },
  { name: "Marchen", start: 0x11C70, end: 0x11CBF },
  { name: "Masaram Gondi", start: 0x11D00, end: 0x11D5F },
  { name: "Gunjala Gondi", start: 0x11D60, end: 0x11DAF },
  { name: "Makasar", start: 0x11EE0, end: 0x11EFF },
  { name: "Lisu Supplement", start: 0x11FB0, end: 0x11FBF },
  { name: "Tamil Supplement", start: 0x11FC0, end: 0x11FFF },
  
  // === Клинопись и иероглифы ===
  { name: "Cuneiform", start: 0x12000, end: 0x123FF },
  { name: "Cuneiform Numbers and Punctuation", start: 0x12400, end: 0x1247F },
  { name: "Egyptian Hieroglyphs", start: 0x13000, end: 0x1342F },
  { name: "Egyptian Hieroglyph Format Controls", start: 0x13430, end: 0x1343F },
  { name: "Anatolian Hieroglyphs", start: 0x14400, end: 0x1467F },
  
  // === Линейные письменности ===
  { name: "Linear B Syllabary", start: 0x10000, end: 0x1007F },
  { name: "Linear B Ideograms", start: 0x10080, end: 0x100FF },
  { name: "Linear A", start: 0x10600, end: 0x1077F },
  { name: "Cypro-Minoan", start: 0x12F90, end: 0x12FFF },
  { name: "Ugaritic", start: 0x10380, end: 0x1039F },
  { name: "Old Persian", start: 0x103A0, end: 0x103DF },
  { name: "Deseret", start: 0x10400, end: 0x1044F },
  { name: "Shavian", start: 0x10450, end: 0x1047F },
  { name: "Osmanya", start: 0x10480, end: 0x104AF },
  { name: "Osage", start: 0x104B0, end: 0x104FF },
  { name: "Elbasan", start: 0x10500, end: 0x1052F },
  { name: "Caucasian Albanian", start: 0x10530, end: 0x1056F },
  { name: "Vithkuqi", start: 0x10570, end: 0x105BF },
  { name: "Linear B Syllabary", start: 0x10000, end: 0x1007F },
  
  // === Музыкальные и игровые символы ===
  { name: "Musical Symbols", start: 0x1D100, end: 0x1D1FF },
  { name: "Ancient Greek Musical Notation", start: 0x1D200, end: 0x1D24F },
  { name: "Byzantine Musical Symbols", start: 0x1D000, end: 0x1D0FF },
  { name: "Mahjong Tiles", start: 0x1F000, end: 0x1F02F },
  { name: "Domino Tiles", start: 0x1F030, end: 0x1F09F },
  { name: "Playing Cards", start: 0x1F0A0, end: 0x1F0FF },
  { name: "Chess Symbols", start: 0x1FA00, end: 0x1FA6F },
  { name: "Game Symbols", start: 0x1FABA, end: 0x1FACF },
  
  // === Эмодзи и пиктограммы ===
  { name: "Enclosed Alphanumeric Supplement", start: 0x1F100, end: 0x1F1FF },
  { name: "Enclosed Ideographic Supplement", start: 0x1F200, end: 0x1F2FF },
  { name: "Miscellaneous Symbols and Pictographs", start: 0x1F300, end: 0x1F5FF },
  { name: "Emoticons", start: 0x1F600, end: 0x1F64F },
  { name: "Transport and Map Symbols", start: 0x1F680, end: 0x1F6FF },
  { name: "Alchemical Symbols", start: 0x1F700, end: 0x1F77F },
  { name: "Geometric Shapes Extended", start: 0x1F780, end: 0x1F7FF },
  { name: "Supplemental Arrows-C", start: 0x1F800, end: 0x1F8FF },
  { name: "Supplemental Symbols and Pictographs", start: 0x1F900, end: 0x1F9FF },
  { name: "Symbols and Pictographs Extended-A", start: 0x1FA00, end: 0x1FA6F },
  { name: "Symbols for Legacy Computing", start: 0x1FB00, end: 0x1FBFF },
  
  // === Вариации и прочее ===
  { name: "Variation Selectors", start: 0xFE00, end: 0xFE0F },
  { name: "Variation Selectors Supplement", start: 0xE0100, end: 0xE01EF },
  { name: "Tags", start: 0xE0000, end: 0xE007F },
  
  // === Private Use (опционально, можно убрать) ===
  // { name: "Private Use Area", start: 0xE000, end: 0xF8FF },
  // { name: "Private Use Area Supplement", start: 0xF0000, end: 0xFFFFD },
  // { name: "Private Use Area Supplement 2", start: 0x100000, end: 0x10FFFD },
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

// Вставка выбранного символа
function insertSelectedChar() {
  if (selectedChar && currentInput) {
    currentInput.value = selectedChar;
    currentInput.dispatchEvent(new Event("input", { bubbles: true }));
    currentInput.dispatchEvent(new Event("change", { bubbles: true }));
  }
  closeUnicodePicker();
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

    // Одиночный клик — выделение
    cell.onclick = () => {
      if (char) {
        selectedChar = char;
        renderGrid();
        updateInfo();
      }
    };

    // Двойной клик — сразу вставка
    cell.ondblclick = () => {
      if (char) {
        selectedChar = char;
        insertSelectedChar();
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
  
    // Стрелки вверх/вниз — переключение блоков
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const delta = e.key === "ArrowUp" ? -1 : 1;
      const newIndex = currentBlockIndex + delta;
    
      // Проверяем границы
      if (newIndex >= 0 && newIndex < unicodeBlocks.length) {
        currentBlockIndex = newIndex;
        currentPage = 0;
        selectedChar = null;
        renderBlockSelect();
        renderGrid();
        updateInfo();
      }
    }  
  };

  overlay.addEventListener("keydown", handleKeydown);
  overlay._keydownHandler = handleKeydown;

  // Кнопка "Вставить"
  const insertBtn = overlay.querySelector(".unicode-picker-footer button.primary");
  if (insertBtn) {
    insertBtn.onclick = () => {
      insertSelectedChar();
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
import { openUnicodePicker as openUnicodePickerModal } from "./unicode-picker.js";
const tbody = document.querySelector("#mapTable tbody");
let currentReferenceMap = {};
let checkboxes = {
  lat: true,
  gr: false,
  he: false,
  digit: false,
  unicode: false
};

// Полный список кириллических символов
const alphabetCyr = [
  "",
  "А","Б","В","Г","Д","Е","Ё","Ж","З","И","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ъ","Ы","Ь","Э","Ю","Я",
  "а","б","в","г","д","е","ё","ж","з","и","й","к","л","м","н","о","п","р","с","т","у","ф","х","ц","ч","ш","щ","ъ","ы","ь","э","ю","я"
];

// Алфавиты для выпадающих списков
const alphabetLat = [
  "", "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
  "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"
];

const alphabetGr = [
  "",
  "Α","Β","Γ","Δ","Ε","Ζ","Η","Θ","Ι","Κ","Λ","Μ","Ν","Ξ","Ο","Π","Ρ","Σ","Τ","Υ","Φ","Χ","Ψ","Ω",
  "α","β","γ","δ","ε","ζ","η","θ","ι","κ","λ","μ","ν","ξ","ο","π","ρ","σ","ς","τ","υ","φ","χ","ψ","ω"
];

const alphabetHe = [
  "",
  "א","ב","ג","ד","ה","ו","ז","ח","ט","י","כ","ל","מ","נ","ס","ע","פ","צ","ק","ר","ש","ת"
];

const digitsList = [
  "", "0","1","2","3","4","5","6","7","8","9"
];

// referenceMap по умолчанию (из оригинального кода + unicode)
const defaultReferenceMap = (function() {
  const m = Object.create(null);
  const set = (cyr, lat, gr, he, digit) => {
    m[cyr] = { lat: lat || "", gr: gr || "", he: he || "", digit: digit || "", unicode: cyr };
  };

  // Заглавные
  set("А","A","Α","", "");
  set("Б","","","", "6");
  set("В","B","Β", "", "8");
  set("Г","","Γ","", "");
  set("Д","","Δ","", "");
  set("Е","E","Ε","", "");
  set("Ё","E","Ε","", "");
  set("Ж","","","", "");
  set("З","","","", "3");
  set("И","","","ט", "");
  set("Й","","","", "");
  set("К","K","Κ","", "");
  set("Л","","Λ","", "");
  set("М","M","Μ","", "");
  set("Н","H","Η","א", "");
  set("О","O","Ο","ס", "0");
  set("П","","Π","ח", "");
  set("Р","P","Ρ","ק", "");
  set("С","C","","", "");
  set("Т","T","Τ","", "");
  set("У","Y","Υ","", "");
  set("Ф","","Φ","", "");
  set("Х","X","Χ","", "");
  set("Ц","","","", "");
  set("Ч","","","", "4");
  set("Ш","","","ש", "");
  set("Щ","","","", "");
  set("Ъ","","","", "");
  set("Ы","","","", "");
  set("Ь","","","", "");
  set("Э","","","", "");
  set("Ю","","","", "");
  set("Я","","","", "");

  // Строчные
  set("а","a","α","", "");
  set("б","","δ","", "6");
  set("в","","β","", "8");
  set("г","","","", "");
  set("д","","","", "");
  set("е","e","ε","", "");
  set("ё","e","ε","", "");
  set("ж","","","", "");
  set("з","","","", "3");
  set("и","u","υ","ט", "");
  set("й","","","", "");
  set("к","k","κ","", "");
  set("л","","λ","ג", "");
  set("м","","μ","", "");
  set("н","","","א", "");
  set("о","o","ο","ס", "0");
  set("п","n","π","ח", "");
  set("р","p","ρ","ק", "");
  set("с","c","ς","", "");
  set("т","m","τ","", "");
  set("у","y","γ","ע", "");
  set("ф","","φ","", "");
  set("х","x","χ","", "");
  set("ц","","","", "");
  set("ч","","","", "4");
  set("ш","","ω","ש", "");
  set("щ","","","", "");
  set("ъ","","","", "");
  set("ы","","","", "");
  set("ь","","","", "");
  set("э","","","", "");
  set("ю","","","", "");
  set("я","","","", "");

  return m;
})();

// Функция для клонирования referenceMap
function cloneReferenceMap(src) {
  const out = Object.create(null);
  for (const k in src) {
    if (!Object.prototype.hasOwnProperty.call(src, k)) continue;
    const v = src[k];
    out[k] = {
      lat:   v.lat   || "",
      gr:    v.gr    || "",
      he:    v.he    || "",
      digit: v.digit || "",
      unicode: v.unicode || k
    };
  }
  return out;
}

// Детекция Firefox
function isFirefox() {
  return navigator.userAgent.includes("Firefox");
}

// Открытие страницы настройки горячих клавиш
async function openShortcutsPage() {
  if (chrome.commands && chrome.commands.openShortcutSettings) {
    try {
      await chrome.commands.openShortcutSettings();
      return;
    } catch (error) {
      console.warn("Morphogrammer (settings): не удалось открыть настройки хоткеев через API:", error);
    }
  }

  const url = isFirefox()
    ? "about:addons"
    : "chrome://extensions/shortcuts";

  await chrome.tabs.create({ url });
}

// Построение transformMap на основе referenceMap и checkboxes
function rebuildTransformMap() {
  const transformMap = Object.create(null);

  for (const cyr of alphabetCyr) {
    if (!cyr) continue;

    const ref = currentReferenceMap[cyr] || { lat:"", gr:"", he:"", digit:"", unicode:"" };
    let target = "";

    // Проверяем приоритеты
    if (checkboxes.unicode && ref.unicode) {
      // Если юникодовый символ совпадает с исходным — пропускаем
      if (ref.unicode !== cyr) {
        target = ref.unicode;
      }
    }

    // Если target ещё пуст, проверяем остальные приоритеты
    if (!target) {
      if (checkboxes.digit && ref.digit) {
        target = ref.digit;
      } else if (checkboxes.he && ref.he) {
        target = ref.he;
      } else if (checkboxes.gr && ref.gr) {
        target = ref.gr;
      } else if (checkboxes.lat && ref.lat) {
        target = ref.lat;
      }
    }

    transformMap[cyr] = target;
  }

  return transformMap;
}

// Обработка иврита (LRM)
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
      result += LRM + ch;
    } else {
      result += ch;
      inRun = false;
    }
  }

  return result;
}

// Преобразование текста (для предпросмотра)
function transformText(text, transformMap) {
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

// Создание выпадающего списка
function createSelect(alphabet, value) {
  const select = document.createElement("select");
  select.className = "map-select";
  
  alphabet.forEach(ch => {
    const opt = document.createElement("option");
    opt.value = ch;
    opt.textContent = ch === "" ? "—" : ch;
    select.appendChild(opt);
  });
  
  select.value = value || "";
  return select;
}

// Создание ячейки скрипта (select + input)
function createScriptCell(cyr, currentValue, script, alphabet, isUnicode = false) {
  const td = document.createElement("td");
  td.style.verticalAlign = "top";
  td.style.minWidth = "120px";
  td.style.textAlign = "center";
  
  const innerDiv = document.createElement("div");
  innerDiv.style.display = "flex";
  innerDiv.style.flexDirection = "row";
  innerDiv.style.gap = "0.25rem";
  innerDiv.style.alignItems = "center";
  innerDiv.style.justifyContent = "center";

  if (isUnicode) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.gap = "0.25rem";
    container.style.alignItems = "center";

    const input = document.createElement("input");
    input.type = "text";
    input.value = currentValue || "";
    input.style.width = "80px";
    input.className = "unicode";
    input.oninput = () => {
      saveCell(cyr, "unicode", input.value);
    };
    
    const btn = document.createElement("button");
    btn.textContent = "⋯";
    btn.title = "Выбрать символ из таблицы Unicode";
    btn.onclick = () => {
      openUnicodePicker(input);
    };

    container.appendChild(input);
    container.appendChild(btn);
    innerDiv.appendChild(container);
  } else {
    const select = createSelect(alphabet, currentValue);
    select.className = "map-select";
    select.style.width = "80px";
    select.onchange = () => {
      saveCell(cyr, script, select.value);
      if (input) input.value = select.value;
    };
    innerDiv.appendChild(select);

    const input = document.createElement("input");
    input.type = "text";
    input.value = currentValue || "";
    input.style.width = "80px";
    input.className = script;
    input.oninput = () => {
      saveCell(cyr, script, input.value);
    };
    innerDiv.appendChild(input);
  }

  td.appendChild(innerDiv);
  return td;
}

function openUnicodePicker(inputElement) {
  openUnicodePickerModal(inputElement);
}

// Сохранение ячейки
function saveCell(cyr, script, value) {
  if (!currentReferenceMap[cyr]) {
    currentReferenceMap[cyr] = { lat:"", gr:"", he:"", digit:"", unicode:cyr };
  }
  currentReferenceMap[cyr][script] = value;
  updatePreview();
  autoSave();
  
  // Обновляем только стиль строки, не перерисовывая всю таблицу
  updateRowStyle(cyr);
}

// Обновление стиля конкретной строки
function updateRowStyle(cyr) {
  const row = Array.from(tbody.querySelectorAll("tr")).find(tr => 
    tr.cells[0].textContent === cyr
  );
  
  if (!row) return;
  
  const ref = currentReferenceMap[cyr] || { lat:"", gr:"", he:"", digit:"", unicode:cyr };
  
  // Проверка: есть ли хоть одна замена
  const hasReplacement = 
    ref.lat || 
    ref.gr || 
    ref.he || 
    ref.digit || 
    (ref.unicode && ref.unicode !== cyr);
  
  const index = alphabetCyr.indexOf(cyr);
  
  if (!hasReplacement) {
    row.style.backgroundColor = "#e5e7eb"; // Тёмно-серый
    row.title = "Нет замен для этого символа";
  } else {
    // Возвращаем исходный цвет (белый или светло-серый)
    row.style.backgroundColor = index % 2 === 1 ? "#f9fafb" : "#ffffff";
    row.title = "";
  }
}


// Сброс строки к умолчаниям
function resetRowToDefault(cyr) {
  const defaultRef = defaultReferenceMap[cyr] || { lat:"", gr:"", he:"", digit:"", unicode:cyr };
  
  if (!currentReferenceMap[cyr]) {
    currentReferenceMap[cyr] = { lat:"", gr:"", he:"", digit:"", unicode:cyr };
  }
  
  currentReferenceMap[cyr].lat = defaultRef.lat || "";
  currentReferenceMap[cyr].gr = defaultRef.gr || "";
  currentReferenceMap[cyr].he = defaultRef.he || "";
  currentReferenceMap[cyr].digit = defaultRef.digit || "";
  currentReferenceMap[cyr].unicode = defaultRef.unicode || cyr;
  
  renderTable();
  updatePreview();
  autoSave();
}

// Отрисовка чекбоксов
function renderCheckboxes() {
  const checkboxesContainer = document.querySelector("#checkboxes");
  if (!checkboxesContainer) return;

  checkboxesContainer.innerHTML = `
    <label><input type="checkbox" id="cb-lat" ${checkboxes.lat ? "checked" : ""}> Латиница</label>
    <label><input type="checkbox" id="cb-gr" ${checkboxes.gr ? "checked" : ""}> Греческий</label>
    <label><input type="checkbox" id="cb-he" ${checkboxes.he ? "checked" : ""}> Иврит</label>
    <label><input type="checkbox" id="cb-digit" ${checkboxes.digit ? "checked" : ""}> Цифры</label>
    <label><input type="checkbox" id="cb-unicode" ${checkboxes.unicode ? "checked" : ""}> Unicode</label>
  `;

  document.getElementById("cb-lat").onchange = (e) => {
    checkboxes.lat = e.target.checked;
    saveSettings();
  };
  document.getElementById("cb-gr").onchange = (e) => {
    checkboxes.gr = e.target.checked;
    saveSettings();
  };
  document.getElementById("cb-he").onchange = (e) => {
    checkboxes.he = e.target.checked;
    saveSettings();
  };
  document.getElementById("cb-digit").onchange = (e) => {
    checkboxes.digit = e.target.checked;
    saveSettings();
  };
  document.getElementById("cb-unicode").onchange = (e) => {
    checkboxes.unicode = e.target.checked;
    saveSettings();
  };
}

// Предпросмотр
function updatePreview() {
  const previewSource = document.querySelector("#preview-source");
  const previewResult = document.querySelector("#preview-result");

  if (!previewResult || !previewSource) return;

  const transformMap = rebuildTransformMap();
  const sourceText = previewSource.value || "В чащах юга жил бы цитрус? Да, но фальшивый экземпляръ!";
  previewResult.value = transformText(sourceText, transformMap);
}

// Авто-обновление при вводе текста в исходное поле
function initPreviewAutoUpdate() {
  const previewSource = document.querySelector("#preview-source");
  if (!previewSource) return;

  previewSource.addEventListener("input", () => {
    updatePreview();
  });
}

// Отрисовка таблицы
function renderTable() {
  tbody.innerHTML = "";

  for (const cyr of alphabetCyr) {
    if (!cyr) continue;

    const tr = document.createElement("tr");
    
    const index = alphabetCyr.indexOf(cyr);
    if (index % 2 === 1) {
      tr.style.backgroundColor = "#f9fafb";
    }

    const ref = currentReferenceMap[cyr] || { lat:"", gr:"", he:"", digit:"", unicode:cyr };

    // Проверка: есть ли хоть одна замена
    const hasReplacement = 
      ref.lat || 
      ref.gr || 
      ref.he || 
      ref.digit || 
      (ref.unicode && ref.unicode !== cyr);

    if (!hasReplacement) {
      tr.style.backgroundColor = "#e5e7eb"; // Тёмно-серый для строк без замен
      tr.title = "Нет замен для этого символа";
    }

    const tdCyr = document.createElement("td");
    tdCyr.textContent = cyr;
    tdCyr.style.fontWeight = "600";
    tdCyr.style.textAlign = "center";
    tr.appendChild(tdCyr);

    const tdLat = createScriptCell(cyr, ref.lat, "lat", alphabetLat);
    tr.appendChild(tdLat);

    const tdGr = createScriptCell(cyr, ref.gr, "gr", alphabetGr);
    tr.appendChild(tdGr);

    const tdHe = createScriptCell(cyr, ref.he, "he", alphabetHe);
    tr.appendChild(tdHe);

    const tdDigit = createScriptCell(cyr, ref.digit, "digit", digitsList);
    tr.appendChild(tdDigit);

    const tdUnicode = createScriptCell(cyr, ref.unicode || cyr, "unicode", alphabetCyr, true);
    tr.appendChild(tdUnicode);

    const tdReset = document.createElement("td");
    tdReset.style.textAlign = "center";
    const btnReset = document.createElement("button");
    btnReset.textContent = "×";
    btnReset.className = "danger";
    btnReset.title = "Сбросить эту строку к умолчаниям";
    btnReset.onclick = () => {
      resetRowToDefault(cyr);
    };
    tdReset.appendChild(btnReset);
    tr.appendChild(tdReset);

    tbody.appendChild(tr);
  }
}

// Сохранение настроек
async function autoSave() {
  try {
    const newMap = {};
    const cyrillic = alphabetCyr.filter(c => c);

    cyrillic.forEach((cyr) => {
      const row = Array.from(tbody.querySelectorAll("tr")).find(tr => 
        tr.cells[0].textContent === cyr
      );
      if (!row) return;

      const latinSelect = row.querySelector(".lat");
      const greekSelect = row.querySelector(".gr");
      const hebrewSelect = row.querySelector(".he");
      const digitSelect = row.querySelector(".digit");
      const unicodeInput = row.querySelector(".unicode");

      newMap[cyr] = {
        lat: latinSelect ? latinSelect.value : "",
        gr: greekSelect ? greekSelect.value : "",
        he: hebrewSelect ? hebrewSelect.value : "",
        digit: digitSelect ? digitSelect.value : "",
        unicode: unicodeInput ? unicodeInput.value : cyr,
      };
    });

    await chrome.storage.local.set({ referenceMap: newMap, checkboxes });
  } catch (error) {
    console.warn("Morphogrammer (settings): не удалось сохранить настройки:", error);
  }
}

// Сброс к дефолту
document.getElementById("resetDefault").onclick = async () => {
  if (!confirm("Сбросить всю таблицу соответствий к значениям по умолчанию?")) return;
  currentReferenceMap = cloneReferenceMap(defaultReferenceMap);
  renderTable();
  updatePreview();
  await autoSave();
};

// Экспорт
document.getElementById("export").onclick = () => {
  const dataStr = JSON.stringify(currentReferenceMap, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "morphogrammer-reference-map.json";
  a.click();
  URL.revokeObjectURL(url);
};

// Импорт
const importFile = document.getElementById("importFile");
document.getElementById("importBtn").onclick = () => importFile.click();

importFile.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      if (typeof obj !== "object" || obj === null) throw new Error("Неверный формат JSON");
      currentReferenceMap = obj;
      renderTable();
      updatePreview();
      autoSave();
    } catch (err) {
      alert("Ошибка импорта: " + err.message);
    }
  };
  reader.readAsText(file);
};

async function saveSettings() {
  try {
    await chrome.storage.local.set({ referenceMap: currentReferenceMap, checkboxes });
    updatePreview();
  } catch (error) {
    console.warn("Morphogrammer (settings): не удалось сохранить настройки:", error);
  }
}

async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(["referenceMap", "checkboxes"]);

    if (result.referenceMap) {
      currentReferenceMap = result.referenceMap;
    } else {
      currentReferenceMap = cloneReferenceMap(defaultReferenceMap);
    }

    if (result.checkboxes) {
      checkboxes = result.checkboxes;
    }

    renderCheckboxes();
    renderTable();
    updatePreview();
    
    const commands = await chrome.commands.getAll();
    const transformCommand = commands.find(cmd => cmd.name === "transform-selection");
    
    if (transformCommand && transformCommand.shortcut) {
      const hotkeyElement = document.getElementById("hotkeyValue");
      if (hotkeyElement) {
        hotkeyElement.textContent = transformCommand.shortcut;
      }
    }
  } catch (error) {
    console.warn("Morphogrammer (settings): не удалось загрузить настройки:", error);
    currentReferenceMap = cloneReferenceMap(defaultReferenceMap);
    renderCheckboxes();
    renderTable();
    updatePreview();
  }
}

// Открытие страницы настройки горячих клавиш
document.getElementById("shortcutsLink").onclick = (event) => {
  event.preventDefault();
  event.stopPropagation();
  openShortcutsPage();
  return false;
};

loadSettings();
initPreviewAutoUpdate();
let checkboxes = {
  lat: true,
  gr: false,
  he: false,
  digit: false,
  unicode: false
};

let hasSelection = false;

// Отрисовка чекбоксов
function renderCheckboxes() {
  const container = document.getElementById("checkboxes");
  container.innerHTML = `
    <label><input type="checkbox" id="cb-lat" ${checkboxes.lat ? "checked" : ""}> Латиница</label>
    <label><input type="checkbox" id="cb-gr" ${checkboxes.gr ? "checked" : ""}> Греческий</label>
    <label><input type="checkbox" id="cb-he" ${checkboxes.he ? "checked" : ""}> Иврит</label>
    <label><input type="checkbox" id="cb-digit" ${checkboxes.digit ? "checked" : ""}> Цифры</label>
    <label><input type="checkbox" id="cb-unicode" ${checkboxes.unicode ? "checked" : ""}> Unicode</label>
  `;

  // Обработчики
  document.getElementById("cb-lat").onchange = (e) => {
    checkboxes.lat = e.target.checked;
    saveCheckboxes();
  };
  document.getElementById("cb-gr").onchange = (e) => {
    checkboxes.gr = e.target.checked;
    saveCheckboxes();
  };
  document.getElementById("cb-he").onchange = (e) => {
    checkboxes.he = e.target.checked;
    saveCheckboxes();
  };
  document.getElementById("cb-digit").onchange = (e) => {
    checkboxes.digit = e.target.checked;
    saveCheckboxes();
  };
  document.getElementById("cb-unicode").onchange = (e) => {
    checkboxes.unicode = e.target.checked;
    saveCheckboxes();
  };
}

// Сохранение чекбоксов
function saveCheckboxes() {
  chrome.storage.sync.set({ checkboxes });
}

// Загрузка чекбоксов
function loadCheckboxes() {
  chrome.storage.sync.get(["checkboxes"], (result) => {
    if (result.checkboxes) {
      checkboxes = result.checkboxes;
    }
    renderCheckboxes();
  });
}

// Проверка наличия выделения
async function checkSelection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      hasSelection = false;
      updateButton();
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "checkSelection"
    });

    hasSelection = response?.hasSelection || false;
    updateButton();
  } catch (err) {
    hasSelection = false;
    updateButton();
  }
}

// Обновление кнопки
function updateButton() {
  const btn = document.getElementById("transformBtn");
  const hint = document.getElementById("hint");

  if (hasSelection) {
    btn.disabled = false;
    btn.textContent = "Преобразовать";
    hint.style.display = "none";
  } else {
    btn.disabled = true;
    btn.textContent = "Преобразовать";
    hint.style.display = "block";
  }
}

// Преобразование
document.getElementById("transformBtn").onclick = async () => {
  if (!hasSelection) {
    return;
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      return;
    }

    const storageData = await new Promise((resolve) => {
      chrome.storage.sync.get(["referenceMap", "checkboxes"], resolve);
    });

    const referenceMap = storageData.referenceMap || {};
    const checkboxesStorage = storageData.checkboxes || checkboxes;

    const transformMap = buildTransformMap(referenceMap, checkboxesStorage);

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "transformEditableSelection",
      transformMap
    });
  } catch (err) {
    console.warn("Morphogrammer (popup): ошибка:", err);
  }
};

// Построение transformMap
function buildTransformMap(referenceMap, checkboxes) {
  const alphabetCyr = [
    "",
    "А","Б","В","Г","Д","Е","Ё","Ж","З","И","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ъ","Ы","Ь","Э","Ю","Я",
    "а","б","в","г","д","е","ё","ж","з","и","й","к","л","м","н","о","п","р","с","т","у","ф","х","ц","ч","ш","щ","ъ","ы","ь","э","ю","я"
  ];

  const transformMap = Object.create(null);

  for (const cyr of alphabetCyr) {
    if (!cyr) continue;

    const ref = referenceMap[cyr] || { lat:"", gr:"", he:"", digit:"", unicode:"" };
    let target = "";

    if (checkboxes.unicode && ref.unicode) {
      target = ref.unicode;
    } else if (checkboxes.digit && ref.digit) {
      target = ref.digit;
    } else if (checkboxes.he && ref.he) {
      target = ref.he;
    } else if (checkboxes.gr && ref.gr) {
      target = ref.gr;
    } else if (checkboxes.lat && ref.lat) {
      target = ref.lat;
    }

    transformMap[cyr] = target;
  }

  return transformMap;
}

// Инициализация
loadCheckboxes();
checkSelection();

// Обновляем проверку выделения при фокусе на popup
window.addEventListener("focus", checkSelection);

// получение актуальных горячих клавиш
chrome.commands.getAll((commands) => {
  const transformCommand = commands.find(cmd => cmd.name === "transform-selection");
  
  if (transformCommand && transformCommand.shortcut) {
    document.getElementById("hotkeyValue").textContent = transformCommand.shortcut;
  }
});

// Открытие страницы горячих клавиш
document.getElementById("shortcutsLink").onclick = (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
};
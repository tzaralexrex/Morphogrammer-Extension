let checkboxes = {
  lat: true,
  gr: false,
  he: false,
  digit: false,
  unicode: false
};

let hasSelection = false;

function isFirefox() {
  return navigator.userAgent.includes("Firefox");
}

function openShortcutsPage() {
  if (chrome.commands && chrome.commands.openShortcutSettings) {
    chrome.commands.openShortcutSettings();
    return;
  }

  const url = isFirefox()
    ? "about:addons"
    : "chrome://extensions/shortcuts";

  chrome.tabs.create({ url });
}

function renderCheckboxes() {
  const container = document.getElementById("checkboxes");

  container.innerHTML = `
    <label><input type="checkbox" id="cb-lat" ${checkboxes.lat ? "checked" : ""}> Латиница</label>
    <label><input type="checkbox" id="cb-gr" ${checkboxes.gr ? "checked" : ""}> Греческий</label>
    <label><input type="checkbox" id="cb-he" ${checkboxes.he ? "checked" : ""}> Иврит</label>
    <label><input type="checkbox" id="cb-digit" ${checkboxes.digit ? "checked" : ""}> Цифры</label>
    <label><input type="checkbox" id="cb-unicode" ${checkboxes.unicode ? "checked" : ""}> Unicode</label>
  `;

  document.getElementById("cb-lat").onchange = (event) => {
    checkboxes.lat = event.target.checked;
    saveCheckboxes();
  };

  document.getElementById("cb-gr").onchange = (event) => {
    checkboxes.gr = event.target.checked;
    saveCheckboxes();
  };

  document.getElementById("cb-he").onchange = (event) => {
    checkboxes.he = event.target.checked;
    saveCheckboxes();
  };

  document.getElementById("cb-digit").onchange = (event) => {
    checkboxes.digit = event.target.checked;
    saveCheckboxes();
  };

  document.getElementById("cb-unicode").onchange = (event) => {
    checkboxes.unicode = event.target.checked;
    saveCheckboxes();
  };
}

function saveCheckboxes() {
  chrome.storage.local.set({ checkboxes });
}

function loadCheckboxes() {
  chrome.storage.local.get(["checkboxes"], (result) => {
    if (result.checkboxes) {
      checkboxes = result.checkboxes;
    }
    renderCheckboxes();
  });
}

// для Firefox используем background как посредника
async function checkSelection() {
  try {
    // Пытаемся через background (Firefox-совместимый способ)
    const response = await chrome.runtime.sendMessage({
      action: "checkSelectionViaBackground"
    });

    hasSelection = response?.hasSelection || false;
    updateButton();
  } catch (error) {
    console.warn("Morphogrammer popup: checkSelection error:", error);
    hasSelection = false;
    updateButton();
  }
}

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

// для Firefox используем background как посредника
document.getElementById("transformBtn").onclick = async () => {
  if (!hasSelection) {
    return;
  }

  try {
    const storageData = await chrome.storage.local.get([
      "referenceMap",
      "checkboxes"
    ]);

    const referenceMap = storageData.referenceMap || {};
    const checkboxesStorage = storageData.checkboxes || checkboxes;
    const transformMap = buildTransformMap(referenceMap, checkboxesStorage);

    // Отправляем через background (Firefox-совместимый способ)
    await chrome.runtime.sendMessage({
      action: "transformViaBackground",
      transformMap
    });
  } catch (error) {
    console.warn("Morphogrammer (popup): ошибка:", error);
  }
};

function buildTransformMap(referenceMap, selectedCheckboxes) {
  const alphabetCyr = [
    "",
    "А","Б","В","Г","Д","Е","Ё","Ж","З","И","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ъ","Ы","Ь","Э","Ю","Я",
    "а","б","в","г","д","е","ё","ж","з","и","й","к","л","м","н","о","п","р","с","т","у","ф","х","ц","ч","ш","щ","ъ","ы","ь","э","ю","я"
  ];

  const transformMap = Object.create(null);

  for (const cyr of alphabetCyr) {
    if (!cyr) {
      continue;
    }

    const ref = referenceMap[cyr] || {
      lat: "",
      gr: "",
      he: "",
      digit: "",
      unicode: ""
    };

    let target = "";

    if (selectedCheckboxes.unicode && ref.unicode) {
      target = ref.unicode;
    } else if (selectedCheckboxes.digit && ref.digit) {
      target = ref.digit;
    } else if (selectedCheckboxes.he && ref.he) {
      target = ref.he;
    } else if (selectedCheckboxes.gr && ref.gr) {
      target = ref.gr;
    } else if (selectedCheckboxes.lat && ref.lat) {
      target = ref.lat;
    }

    transformMap[cyr] = target;
  }

  return transformMap;
}

loadCheckboxes();
checkSelection();

window.addEventListener("focus", checkSelection);

chrome.commands.getAll((commands) => {
  const transformCommand = commands.find(
    (command) => command.name === "transform-selection"
  );

  if (transformCommand && transformCommand.shortcut) {
    document.getElementById("hotkeyValue").textContent =
      transformCommand.shortcut;
  }
});

document.getElementById("shortcutsLink").onclick = (event) => {
  event.preventDefault();
  event.stopPropagation();
  openShortcutsPage();
  return false;
};
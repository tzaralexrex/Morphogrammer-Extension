const MENU_ID = "morphogrammer-transform";

// referenceMap по умолчанию (из оригинального кода + unicode)
const defaultReferenceMap = (function() {
  const m = Object.create(null);
  const set = (cyr, lat, gr, he, digit) => {
    m[cyr] = { lat: lat || "", gr: gr || "", he: he || "", digit: digit || "", unicode: cyr };
  };

  // Заглавные
  set("А","A","Α","", "");
  set("Б","","","", "6");
  set("В","B","", "", "8");
  set("Г","","Γ","", "");
  set("Д","","Δ","", "");
  set("Е","E","Ε","", "");
  set("Ё","E","Ε","", "");
  set("Ж","","","", "");
  set("З","","","", "3");
  set("И","","","", "");
  set("Й","","","", "");
  set("К","K","Κ","", "");
  set("Л","","Λ","", "");
  set("М","M","Μ","", "");
  set("Н","H","","", "");
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
  set("и","u","υ","υ", "");
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

// чекбоксы по умолчанию
const defaultCheckboxes = {
  lat: true,
  gr: false,
  he: false,
  digit: false,
  unicode: false
};

// полный список кириллических символов
const alphabetCyr = [
  "",
  "А","Б","В","Г","Д","Е","Ё","Ж","З","И","Й","К","Л","М","Н","О","П","Р","С","Т","У","Ф","Х","Ц","Ч","Ш","Щ","Ъ","Ы","Ь","Э","Ю","Я",
  "а","б","в","г","д","е","ё","ж","з","и","й","к","л","м","н","о","п","р","с","т","у","ф","х","ц","ч","ш","щ","ъ","ы","ь","э","ю","я"
];

// построение transformMap из referenceMap и checkboxes
function rebuildTransformMap(referenceMap, checkboxes) {
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

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Преобразовать выделенное (Morphogrammer)",
      contexts: ["selection"]
    });
  });

  // инициализируем referenceMap и checkboxes, если их нет
  chrome.storage.sync.get(["referenceMap", "checkboxes"], (result) => {
    if (!result.referenceMap) {
      chrome.storage.sync.set({ referenceMap: defaultReferenceMap });
    }
    if (!result.checkboxes) {
      chrome.storage.sync.set({ checkboxes: defaultCheckboxes });
    }
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) {
    return;
  }

  try {
    const storageData = await new Promise((resolve) => {
      chrome.storage.sync.get(["referenceMap", "checkboxes"], resolve);
    });

    const referenceMap = storageData.referenceMap || defaultReferenceMap;
    const checkboxes = storageData.checkboxes || defaultCheckboxes;
    const transformMap = rebuildTransformMap(referenceMap, checkboxes);

    const response = await chrome.tabs.sendMessage(
      tab.id,
      {
        action: "transformEditableSelection",
        selectionText: info.selectionText || "",
        transformMap
      },
      {
        frameId: info.frameId || 0
      }
    );
  } catch (err) {
    console.warn(
      "Morphogrammer: content script недоступен на этой странице.",
      err.message
    );
  }
});

// обработка горячей клавиши
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "transform-selection") {
    return;
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      console.warn("Morphogrammer: активная вкладка не найдена");
      return;
    }

    // Загружаем referenceMap и checkboxes
    const storageData = await new Promise((resolve) => {
      chrome.storage.sync.get(["referenceMap", "checkboxes"], resolve);
    });

    const referenceMap = storageData.referenceMap || defaultReferenceMap;
    const checkboxes = storageData.checkboxes || defaultCheckboxes;
    const transformMap = rebuildTransformMap(referenceMap, checkboxes);

    // Отправляем команду в content script
    const response = await chrome.tabs.sendMessage(
      tab.id,
      {
        action: "transformEditableSelection",
        transformMap
      },
      {
        frameId: 0
      }
    );
  } catch (err) {
    console.warn(
      "Morphogrammer: content script недоступен на этой странице.",
      err.message
    );
  }
});
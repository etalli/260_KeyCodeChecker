const autoLocale = (navigator.language || "en").toLowerCase().startsWith("ja") ? "ja" : "en";
const i18n = window.KEY_CHECKER_I18N;
let currentLocale = autoLocale;
let t = i18n[currentLocale];
const historyLimit = 100;
const keyHistory = [];
const pressedKeys = new Map();
let lastGlobalShortcutStatuses = null;
let wpmTimerId = null;
const coverageCodes = window.KEY_COVERAGE_CODES;
const coveredCodes = new Set();
const comboDefinitions = window.KEY_COMBO_DEFINITIONS_RAW.map((combo) => ({
  ...combo,
  keySet: new Set(combo.keys),
}));
const testSequence = window.KEY_TEST_SEQUENCE;
const testState = {
  running: false,
  index: 0,
  logs: [],
  lastMatchedSignature: "",
};
const wpmState = {
  running: false,
  startMs: null,
  typedChars: 0,
};
const fields = {
  appTitle: document.getElementById("appTitle"),
  languageToggle: document.getElementById("languageToggle"),
  description: document.getElementById("description"),
  metaKeyLabel: document.getElementById("metaKeyLabel"),
  pressedKeysLabel: document.getElementById("pressedKeysLabel"),
  historyTitle: document.getElementById("historyTitle"),
  comboListLabel: document.getElementById("comboListLabel"),
  comboMatchLabel: document.getElementById("comboMatchLabel"),
  comboList: document.getElementById("comboList"),
  comboMatch: document.getElementById("comboMatch"),
  globalShortcutLabel: document.getElementById("globalShortcutLabel"),
  globalShortcutStatus: document.getElementById("globalShortcutStatus"),
  wpmTitle: document.getElementById("wpmTitle"),
  wpmStartButton: document.getElementById("wpmStartButton"),
  wpmResetButton: document.getElementById("wpmResetButton"),
  wpmValueLabel: document.getElementById("wpmValueLabel"),
  wpmCharsLabel: document.getElementById("wpmCharsLabel"),
  wpmElapsedLabel: document.getElementById("wpmElapsedLabel"),
  wpmValue: document.getElementById("wpmValue"),
  wpmChars: document.getElementById("wpmChars"),
  wpmElapsed: document.getElementById("wpmElapsed"),
  testTitle: document.getElementById("testTitle"),
  testStartButton: document.getElementById("testStartButton"),
  testResetButton: document.getElementById("testResetButton"),
  testTargetLabel: document.getElementById("testTargetLabel"),
  testTarget: document.getElementById("testTarget"),
  testProgressLabel: document.getElementById("testProgressLabel"),
  testProgress: document.getElementById("testProgress"),
  testLog: document.getElementById("testLog"),
  coverageTitle: document.getElementById("coverageTitle"),
  coverageResetButton: document.getElementById("coverageResetButton"),
  coverageProgressLabel: document.getElementById("coverageProgressLabel"),
  coverageProgress: document.getElementById("coverageProgress"),
  coverageMissing: document.getElementById("coverageMissing"),
  key: document.getElementById("key"),
  code: document.getElementById("code"),
  keyCode: document.getElementById("keyCode"),
  which: document.getElementById("which"),
  location: document.getElementById("location"),
  shiftKey: document.getElementById("shiftKey"),
  altKey: document.getElementById("altKey"),
  ctrlKey: document.getElementById("ctrlKey"),
  metaKey: document.getElementById("metaKey"),
  capsLock: document.getElementById("capsLock"),
  numLock: document.getElementById("numLock"),
  fnKey: document.getElementById("fnKey"),
  pressedKeys: document.getElementById("pressedKeys"),
  status: document.getElementById("status"),
  historyList: document.getElementById("historyList"),
};

function applyLanguage() {
  t = i18n[currentLocale];
  document.documentElement.lang = t.htmlLang;
  document.title = t.documentTitle;
  fields.appTitle.textContent = t.appTitle;
  fields.languageToggle.textContent = t.languageToggle;
  fields.description.textContent = t.description;
  fields.metaKeyLabel.textContent = t.metaKeyLabel;
  fields.pressedKeysLabel.textContent = t.pressedKeysLabel;
  fields.historyTitle.textContent = t.historyTitle;
  fields.comboListLabel.textContent = t.comboListLabel;
  fields.comboMatchLabel.textContent = t.comboMatchLabel;
  fields.comboList.textContent = t.combos.join(" / ");
  fields.globalShortcutLabel.textContent = t.globalShortcutLabel;
  fields.globalShortcutStatus.textContent = t.globalShortcutWaiting;
  fields.wpmTitle.textContent = t.wpmTitle;
  fields.wpmStartButton.textContent = t.wpmStart;
  fields.wpmResetButton.textContent = t.wpmReset;
  fields.wpmValueLabel.textContent = t.wpmValueLabel;
  fields.wpmCharsLabel.textContent = t.wpmCharsLabel;
  fields.wpmElapsedLabel.textContent = t.wpmElapsedLabel;
  fields.testTitle.textContent = t.testTitle;
  fields.testStartButton.textContent = t.testStart;
  fields.testResetButton.textContent = t.testReset;
  fields.testTargetLabel.textContent = t.testTargetLabel;
  fields.testProgressLabel.textContent = t.testProgressLabel;
  fields.coverageTitle.textContent = t.coverageTitle;
  fields.coverageResetButton.textContent = t.coverageReset;
  fields.coverageProgressLabel.textContent = t.coverageProgressLabel;
  fields.status.textContent = t.statusInitial;
  if (lastGlobalShortcutStatuses) {
    renderGlobalShortcutStatus(lastGlobalShortcutStatuses);
  }
}

function renderGlobalShortcutStatus(statuses) {
  lastGlobalShortcutStatuses = statuses;
  const entries = Object.entries(statuses).map(([accelerator, ok]) => {
    return `${accelerator}: ${ok ? "OK" : `NG (${t.globalShortcutUnavailable})`}`;
  });
  fields.globalShortcutStatus.textContent = entries.join(" / ");
}

function updateFields(event) {
  fields.key.textContent = event.key;
  fields.code.textContent = event.code;
  fields.keyCode.textContent = String(event.keyCode);
  fields.which.textContent = String(event.which);
  fields.location.textContent = `${event.location} (${t.locationNames[event.location] ?? t.locationNames.unknown})`;
  fields.shiftKey.textContent = String(event.shiftKey);
  fields.altKey.textContent = String(event.altKey);
  fields.ctrlKey.textContent = String(event.ctrlKey);
  fields.metaKey.textContent = String(event.metaKey);
  fields.capsLock.textContent = String(event.getModifierState("CapsLock"));
  fields.numLock.textContent = String(event.getModifierState("NumLock"));
  fields.fnKey.textContent = String(event.getModifierState("Fn"));
  fields.status.textContent = `${t.statusLastInputPrefix}: ${new Date().toLocaleTimeString(
    currentLocale === "ja" ? "ja-JP" : "en-US"
  )}`;

  // 画面上で連続して確認しやすいよう、スクロールやフォーカス移動の既定動作を抑止しない。
}

function renderPressedKeys() {
  const values = [...pressedKeys.values()];
  fields.pressedKeys.textContent = values.length > 0 ? values.join(" + ") : t.pressedKeysNone;
}

function renderCoverage() {
  const total = coverageCodes.length;
  const done = coveredCodes.size;
  const percent = Math.floor((done / total) * 100);
  fields.coverageProgress.textContent = `${done}/${total} (${percent}%)`;
  fields.coverageMissing.innerHTML = "";

  const missing = coverageCodes.filter((code) => !coveredCodes.has(code));
  if (missing.length === 0) {
    const li = document.createElement("li");
    li.textContent = t.coverageMissingEmpty;
    fields.coverageMissing.appendChild(li);
    return;
  }
  for (const code of missing) {
    const li = document.createElement("li");
    li.textContent = `${t.coverageMissingPrefix}: ${code}`;
    fields.coverageMissing.appendChild(li);
  }
}

function resetCoverage() {
  coveredCodes.clear();
  renderCoverage();
}

function updateCoverageByEvent(event) {
  if (coverageCodes.includes(event.code)) {
    coveredCodes.add(event.code);
    renderCoverage();
  }
}

function renderHistory() {
  fields.historyList.innerHTML = "";
  if (keyHistory.length === 0) {
    const li = document.createElement("li");
    li.textContent = t.historyEmpty;
    fields.historyList.appendChild(li);
    return;
  }
  for (const item of keyHistory) {
    const li = document.createElement("li");
    li.textContent = item;
    fields.historyList.appendChild(li);
  }
}

function pushHistory(event) {
  const time = new Date().toLocaleTimeString(currentLocale === "ja" ? "ja-JP" : "en-US");
  const modifiers = [
    event.shiftKey ? t.modifiers.Shift : null,
    event.altKey ? t.modifiers.Alt : null,
    event.ctrlKey ? t.modifiers.Ctrl : null,
    event.metaKey ? t.modifiers.Meta : null,
  ].filter(Boolean);
  const modifierText = modifiers.length > 0 ? ` [${modifiers.join("+")}]` : "";
  const entry = `${t.historyEntryPrefix}=${time} | key="${event.key}" code=${event.code}${modifierText}`;
  keyHistory.unshift(entry);
  if (keyHistory.length > historyLimit) {
    keyHistory.length = historyLimit;
  }
  renderHistory();
}

function initializeApp() {
  window.addEventListener("keydown", (event) => {
    event.preventDefault();
    updateWpmByEvent(event);
    updateCoverageByEvent(event);
    pressedKeys.set(event.code, `${event.key} (${event.code})`);
    renderPressedKeys();
    renderComboMatch();
    updateFields(event);
    pushHistory(event);
  });

  window.addEventListener("keyup", (event) => {
    pressedKeys.delete(event.code);
    testState.lastMatchedSignature = "";
    renderPressedKeys();
    renderComboMatch();
    updateFields(event);
  });

  window.addEventListener("blur", () => {
    pressedKeys.clear();
    renderPressedKeys();
    renderComboMatch();
  });

  if (window.electronAPI) {
    window.electronAPI.onGlobalShortcutStatus((statuses) => {
      renderGlobalShortcutStatus(statuses);
    });
    window.electronAPI.onGlobalShortcutTriggered((accelerator) => {
      fields.comboMatch.textContent = `${t.globalShortcutTriggeredPrefix}: ${accelerator}`;
      const globalMap = {
        "CommandOrControl+Shift+3": "cmd_shift_3",
        "CommandOrControl+Shift+4": "cmd_shift_4",
      };
      const comboId = globalMap[accelerator];
      if (comboId) {
        handleTestInput([comboId], "global");
      }
    });
  }

  fields.testStartButton.addEventListener("click", startTest);
  fields.testResetButton.addEventListener("click", resetTest);
  fields.coverageResetButton.addEventListener("click", resetCoverage);
  fields.wpmStartButton.addEventListener("click", startWpm);
  fields.wpmResetButton.addEventListener("click", resetWpm);
  fields.languageToggle.addEventListener("click", () => {
    currentLocale = currentLocale === "ja" ? "en" : "ja";
    applyLanguage();
    renderPressedKeys();
    renderComboMatch();
    renderWpm();
    renderTest();
    renderCoverage();
    renderHistory();
  });

  applyLanguage();
  renderPressedKeys();
  renderComboMatch();
  renderWpm();
  renderTest();
  renderCoverage();
  renderHistory();
}

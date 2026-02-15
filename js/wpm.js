function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function calculateWpm(nowMs) {
  if (!wpmState.running || !wpmState.startMs) {
    return 0;
  }
  const elapsedMs = Math.max(1, nowMs - wpmState.startMs);
  const minutes = elapsedMs / 60000;
  const words = wpmState.typedChars / 5;
  return words / minutes;
}

function renderWpm() {
  if (!wpmState.running || !wpmState.startMs) {
    fields.wpmValue.textContent = t.wpmNotStarted;
    fields.wpmChars.textContent = "0";
    fields.wpmElapsed.textContent = "00:00";
    return;
  }
  const nowMs = Date.now();
  const elapsedMs = nowMs - wpmState.startMs;
  fields.wpmValue.textContent = calculateWpm(nowMs).toFixed(1);
  fields.wpmChars.textContent = String(wpmState.typedChars);
  fields.wpmElapsed.textContent = formatElapsed(elapsedMs);
}

function stopWpmTimer() {
  if (wpmTimerId !== null) {
    clearInterval(wpmTimerId);
    wpmTimerId = null;
  }
}

function startWpm() {
  wpmState.running = true;
  wpmState.startMs = Date.now();
  wpmState.typedChars = 0;
  stopWpmTimer();
  wpmTimerId = setInterval(renderWpm, 1000);
  renderWpm();
}

function resetWpm() {
  wpmState.running = false;
  wpmState.startMs = null;
  wpmState.typedChars = 0;
  stopWpmTimer();
  renderWpm();
}

function updateWpmByEvent(event) {
  if (!wpmState.running) {
    return;
  }
  if (event.isComposing) {
    return;
  }
  if (event.key === "Backspace" || event.key === "Delete") {
    wpmState.typedChars = Math.max(0, wpmState.typedChars - 1);
    renderWpm();
    return;
  }
  if (event.key.length === 1) {
    wpmState.typedChars += 1;
    renderWpm();
  }
}

function renderTest() {
  if (!testState.running && testState.index === 0) {
    fields.testTarget.textContent = t.testNotRunning;
  } else if (testState.index >= testSequence.length) {
    fields.testTarget.textContent = t.testCompleted;
  } else {
    fields.testTarget.textContent = getComboLabelById(testSequence[testState.index]);
  }

  fields.testProgress.textContent = `${Math.min(testState.index, testSequence.length)}/${testSequence.length}`;
  fields.testLog.innerHTML = "";
  if (testState.logs.length === 0) {
    const li = document.createElement("li");
    li.textContent = t.testLogEmpty;
    fields.testLog.appendChild(li);
    return;
  }
  for (const log of testState.logs) {
    const li = document.createElement("li");
    li.textContent = log;
    fields.testLog.appendChild(li);
  }
}

function resetTest() {
  testState.running = false;
  testState.index = 0;
  testState.logs = [];
  testState.lastMatchedSignature = "";
  renderTest();
}

function startTest() {
  testState.running = true;
  testState.index = 0;
  testState.logs = [];
  testState.lastMatchedSignature = "";
  renderTest();
}

function appendTestLog(text) {
  testState.logs.unshift(text);
  if (testState.logs.length > 20) {
    testState.logs.length = 20;
  }
}

function handleTestInput(matchedIds, source) {
  if (!testState.running || testState.index >= testSequence.length) {
    return;
  }

  const signature = matchedIds.slice().sort().join("|");
  if (signature === testState.lastMatchedSignature) {
    return;
  }
  testState.lastMatchedSignature = signature;

  if (matchedIds.length === 0) {
    return;
  }

  const expectedId = testSequence[testState.index];
  const expectedLabel = getComboLabelById(expectedId);
  if (matchedIds.includes(expectedId)) {
    appendTestLog(`${t.testPass} [${source}] ${expectedLabel}`);
    testState.index += 1;
    if (testState.index >= testSequence.length) {
      testState.running = false;
    }
  } else {
    const actualLabel = getComboLabelById(matchedIds[0]) || matchedIds[0];
    appendTestLog(`${t.testMiss} [${source}] expected=${expectedLabel} actual=${actualLabel}`);
  }
  renderTest();
}

function getComboLabelById(comboId) {
  const combo = comboDefinitions.find((item) => item.id === comboId);
  if (!combo) return comboId;
  return t.combos[combo.labelIndex];
}

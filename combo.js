function normalizeCode(code) {
  if (code.startsWith("Shift")) return "Shift";
  if (code.startsWith("Control")) return "Control";
  if (code.startsWith("Alt")) return "Alt";
  if (code.startsWith("Meta")) return "Meta";
  if (code.startsWith("OS")) return "Meta";
  return code;
}

function renderComboMatch() {
  const currentCodes = new Set([...pressedKeys.keys()].map(normalizeCode));
  const matchedCombos = comboDefinitions
    .filter((combo) => {
      for (const code of combo.keySet) {
        if (!currentCodes.has(code)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => b.keySet.size - a.keySet.size);
  const matchedLabels = matchedCombos.map((combo) => t.combos[combo.labelIndex]);
  fields.comboMatch.textContent = matchedLabels.length > 0 ? matchedLabels.join(" / ") : t.comboNone;
  handleTestInput(matchedCombos.map((combo) => combo.id), "web");
}

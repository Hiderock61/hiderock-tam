const DRAFT_KEY = "hiderockTemplateDraftV1";
let lastGeneratedOutput = "";
let saveDraftTimer = null;

const FIELD_IDS = [
  "input-material",
  "step-pick",
  "step-name",
  "step-layer",
  "step-translate",
  "step-method",
  "crew-context",
  "crew-kufu",
  "crew-marx",
  "crew-merchant",
  "crew-reality",
  "crew-sleepy",
  "crew-fraud",
  "crew-competition",
  "crew-hiderock",
  "final-decision",
  "next-action",
  "not-do"
];

function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return "";
  return (el.value || "").trim();
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = value || "";
}

function getFormValues() {
  const crewItems = [
    ["✍️ 文脈翻訳者", getValue("crew-context")],
    ["👨🏻‍🔧 工夫さん", getValue("crew-kufu")],
    ["⚖️ マルクスAI", getValue("crew-marx")],
    ["💰 商人AI", getValue("crew-merchant")],
    ["🚧 現実君", getValue("crew-reality")],
    ["🐰 ねむうさ品質管理課", getValue("crew-sleepy")],
    ["👵🏻🔍 詐欺見抜き婆さん", getValue("crew-fraud")],
    ["🦅 競争手を見る鷹", getValue("crew-competition")],
    ["🎩 Hiderock Japan", getValue("crew-hiderock")]
  ];

  return {
    material: getValue("input-material"),
    stepPick: getValue("step-pick"),
    stepName: getValue("step-name"),
    stepLayer: getValue("step-layer"),
    stepTranslate: getValue("step-translate"),
    stepMethod: getValue("step-method"),
    crewItems,
    finalDecision: getValue("final-decision"),
    nextAction: getValue("next-action"),
    notDo: getValue("not-do")
  };
}

function addSection(lines, label, value, options = {}) {
  const { required = false, placeholder = "（未入力）", skipEmpty = false } = options;
  if (!required && skipEmpty && !value) return;

  lines.push(`【${label}】`);
  lines.push(value || placeholder);
  lines.push("");
}

function buildCrewText(crewItems, skipEmpty) {
  return crewItems
    .filter(([, value]) => !skipEmpty || value)
    .map(([name, value]) => `${name}：${value || "（未入力）"}`)
    .join("\n");
}

function buildOutput(mode = "quick") {
  const values = getFormValues();
  const skipEmpty = mode === "quick";
  const lines = [];

  if (mode === "quick") {
    lines.push("以下の素材を、ヒデロックテンプレ法©️で軽く処理してください。");
    lines.push("未入力部分は、断定せず、必要に応じて候補として補ってください。");
    lines.push("");
  }

  addSection(lines, "素材", values.material, {
    required: true,
    placeholder: "（素材未入力：まず一行だけ置いてください）",
    skipEmpty: false
  });

  addSection(lines, "拾う", values.stepPick, { skipEmpty });
  addSection(lines, "名前", values.stepName, { skipEmpty });
  addSection(lines, "レイヤー分解", values.stepLayer, { skipEmpty });
  addSection(lines, "地上語への翻訳", values.stepTranslate, { skipEmpty });
  addSection(lines, "方法©️化", values.stepMethod, { skipEmpty });

  const crewText = buildCrewText(values.crewItems, skipEmpty);
  addSection(lines, "劇団員チェック", crewText, { skipEmpty });

  addSection(lines, "最終判定", values.finalDecision, {
    skipEmpty,
    placeholder: mode === "full" ? "（未選択）" : ""
  });

  addSection(lines, "次の一手", values.nextAction, { skipEmpty });
  addSection(lines, "やらないこと", values.notDo, { skipEmpty });

  const outputText = lines.join("\n").trim();
  lastGeneratedOutput = outputText;

  const outputBox = document.getElementById("output-text");
  if (outputBox) outputBox.textContent = outputText;

  saveDraftNow();
  return outputText;
}

function canUseLocalStorage() {
  try {
    const testKey = "__hiderock_storage_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

function collectDraft() {
  const draft = {
    version: "v1",
    updatedAt: new Date().toISOString(),
    fields: {}
  };

  FIELD_IDS.forEach(id => {
    draft.fields[id] = getValue(id);
  });

  const outputBox = document.getElementById("output-text");
  draft.outputText = outputBox ? outputBox.textContent || "" : "";
  draft.lastGeneratedOutput = lastGeneratedOutput || "";

  return draft;
}

function saveDraftNow() {
  if (!canUseLocalStorage()) return;

  try {
    const draft = collectDraft();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.warn("Draft save failed:", e);
  }
}

function scheduleSaveDraft() {
  clearTimeout(saveDraftTimer);
  saveDraftTimer = setTimeout(saveDraftNow, 300);
}

function loadDraft() {
  if (!canUseLocalStorage()) return false;

  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return false;

    const draft = JSON.parse(raw);
    if (!draft || !draft.fields) return false;

    FIELD_IDS.forEach(id => {
      if (Object.prototype.hasOwnProperty.call(draft.fields, id)) {
        setValue(id, draft.fields[id]);
      }
    });

    const outputBox = document.getElementById("output-text");
    if (outputBox && draft.outputText) {
      outputBox.textContent = draft.outputText;
    }

    lastGeneratedOutput = draft.lastGeneratedOutput || draft.outputText || "";
    return true;
  } catch (e) {
    console.warn("Draft load failed:", e);
    return false;
  }
}

function clearDraft() {
  const ok = window.confirm("台帳を空にしますか？\nこの端末に保存された入力途中の内容も消えます。");
  if (!ok) return;

  FIELD_IDS.forEach(id => setValue(id, ""));

  const outputBox = document.getElementById("output-text");
  if (outputBox) outputBox.textContent = "";

  lastGeneratedOutput = "";

  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    console.warn("Draft clear failed:", e);
  }

  showToast("台帳を空にしました。");
}

function attachDraftListeners() {
  FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", scheduleSaveDraft);
    el.addEventListener("change", scheduleSaveDraft);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) saveDraftNow();
  });

  window.addEventListener("pagehide", saveDraftNow);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

document.addEventListener("DOMContentLoaded", () => {
  const outputBox = document.getElementById("output-text");
  const quickButton = document.getElementById("generate-quick-button");
  const fullButton = document.getElementById("generate-full-button");
  const copyButton = document.getElementById("copy-button");
  const clearDraftButton = document.getElementById("clear-draft-button");

  const restored = loadDraft();
  attachDraftListeners();

  if (restored) {
    showToast("前回の台帳を復元しました。");
  }

  if (quickButton) {
    quickButton.addEventListener("click", () => {
      buildOutput("quick");
      showToast("素材ワンパン生成しました。");
    });
  }

  if (fullButton) {
    fullButton.addEventListener("click", () => {
      buildOutput("full");
      showToast("全部入り生成しました。");
    });
  }

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const text = lastGeneratedOutput || (outputBox && outputBox.textContent.trim()) || buildOutput("quick");
      try {
        await navigator.clipboard.writeText(text);
        if (outputBox) outputBox.textContent = text;
        saveDraftNow();
        showToast("コピーしました。AIに貼り付けて使えます。");
      } catch (e) {
        if (outputBox) outputBox.textContent = text;
        saveDraftNow();
        showToast("コピーに失敗しました。手動で選択してコピーしてください。");
      }
    });
  }

  if (clearDraftButton) {
    clearDraftButton.addEventListener("click", clearDraft);
  }
});

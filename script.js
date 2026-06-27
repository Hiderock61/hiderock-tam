function buildOutput() {
  const material = document.getElementById('input-material').value.trim();
  const stepPick = document.getElementById('step-pick').value.trim();
  const stepName = document.getElementById('step-name').value.trim();
  const stepLayer = document.getElementById('step-layer').value.trim();
  const stepTranslate = document.getElementById('step-translate').value.trim();
  const stepMethod = document.getElementById('step-method').value.trim();

  const crewContext = document.getElementById('crew-context').value.trim();
  const crewKufu = document.getElementById('crew-kufu').value.trim();
  const crewMarx = document.getElementById('crew-marx').value.trim();
  const crewMerchant = document.getElementById('crew-merchant').value.trim();
  const crewReality = document.getElementById('crew-reality').value.trim();
  const crewSleepy = document.getElementById('crew-sleepy').value.trim();
  const crewFraud = document.getElementById('crew-fraud').value.trim();
  const crewCompetition = document.getElementById('crew-competition').value.trim();
  const crewHiderock = document.getElementById('crew-hiderock').value.trim();

  const finalDecision = document.getElementById('final-decision').value;
  const nextAction = document.getElementById('next-action').value.trim();
  const notDo = document.getElementById('not-do').value.trim();

  const crewText = [
    crewContext && `✍️ 文脈翻訳者：${crewContext}`,
    crewKufu && `👨🏻‍🔧 工夫さん：${crewKufu}`,
    crewMarx && `⚖️ マルクスAI：${crewMarx}`,
    crewMerchant && `💰 商人AI：${crewMerchant}`,
    crewReality && `🚧 現実君：${crewReality}`,
    crewSleepy && `🐰 ねむうさ品質管理課：${crewSleepy}`,
    crewFraud && `👵🏻🔍 詐欺見抜き婆さん：${crewFraud}`,
    crewCompetition && `🦅 競争手を見る鷹：${crewCompetition}`,
    crewHiderock && `🎩 Hiderock Japan：${crewHiderock}`
  ].filter(Boolean).join('\n');

  const lines = [
    '【素材】',
    material || '（未入力）',
    '',
    '【拾う】',
    stepPick || '（未入力）',
    '',
    '【名前】',
    stepName || '（未入力）',
    '',
    '【レイヤー分解】',
    stepLayer || '（未入力）',
    '',
    '【地上語への翻訳】',
    stepTranslate || '（未入力）',
    '',
    '【方法©️化】',
    stepMethod || '（未入力）',
    '',
    '【劇団員チェック】',
    crewText || '（未入力）',
    '',
    '【最終判定】',
    finalDecision || '（未選択）',
    '',
    '【次の一手】',
    nextAction || '（未入力）',
    '',
    '【やらないこと】',
    notDo || '（未入力）'
  ];

  return lines.join('\n');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

document.addEventListener('DOMContentLoaded', () => {
  const outputBox = document.getElementById('output-text');
  const generateButton = document.getElementById('generate-button');
  const copyButton = document.getElementById('copy-button');

  generateButton.addEventListener('click', () => {
    const text = buildOutput();
    outputBox.textContent = text;
    showToast('方法©️文を更新しました。');
  });

  copyButton.addEventListener('click', async () => {
    const text = outputBox.textContent.trim() || buildOutput();
    try {
      await navigator.clipboard.writeText(text);
      outputBox.textContent = text;
      showToast('コピーしました。AIに貼り付けて使えます。');
    } catch (e) {
      outputBox.textContent = text;
      showToast('コピーに失敗しました。手動で選択してコピーしてください。');
    }
  });
});

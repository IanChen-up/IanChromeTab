// popup.js

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['lang'], (res) => {
    setLanguage(res.lang || 'zh');
    updateDOMTranslations();
  });
});

document.getElementById('open-dashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://newtab/' });
});

document.getElementById('group-now').addEventListener('click', async () => {
  const btn = document.getElementById('group-now');
  btn.innerText = t('grouping');
  
  await chrome.runtime.sendMessage({ type: 'REGROUP_TABS' }).catch(() => {});

  btn.innerText = t('grouped');
  setTimeout(() => {
    window.close();
  }, 1000);
});

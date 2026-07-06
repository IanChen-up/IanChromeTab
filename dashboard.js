// dashboard.js

const DESIGN_VERSION = 4;
const CHROME_INTERNAL_PROTOCOLS = ["chrome:", "chrome-extension:", "edge:", "about:"];
const BACKGROUND_PRESETS = ["dopamine", "candy", "sunrise", "mint"];

const COLOR_META = {
  grey: { hex: "#8A96A8" },
  blue: { hex: "#3B82F6" },
  red: { hex: "#FF4D6D" },
  yellow: { hex: "#FFC857" },
  green: { hex: "#22C55E" },
  pink: { hex: "#FF4D8D" },
  purple: { hex: "#7C5CFF" },
  cyan: { hex: "#20D6D2" },
  orange: { hex: "#FF8A3D" }
};

const CARD_GRADIENTS = [
  ["#FF4D8D", "#7C5CFF"],
  ["#20D6B5", "#3B82F6"],
  ["#FF8A3D", "#FFC857"],
  ["#7C5CFF", "#20D6D2"],
  ["#FF4D6D", "#FF8A3D"],
  ["#22C55E", "#20D6D2"],
  ["#3B82F6", "#7C5CFF"],
  ["#FFC857", "#FF4D8D"]
];

const defaultShortcuts = [
  { id: "google", title: "Google", url: "https://google.com", icon: "🔍" },
  { id: "github", title: "GitHub", url: "https://github.com", icon: "🐙" },
  { id: "bytetech", title: "ByteTech", url: "https://bytetech.info", icon: "📰" },
  { id: "lark", title: "Lark Docs", url: "https://bytedance.larkoffice.com", icon: "📝" },
  { id: "bilibili", title: "Bilibili", url: "https://bilibili.com", icon: "📺" },
  { id: "zhihu", title: "Zhihu", url: "https://zhihu.com", icon: "📖" }
];

const defaultEmojis = {
  "google.com": "🔍",
  "github.com": "🐙",
  "youtube.com": "📺",
  "bilibili.com": "📺",
  "twitter.com": "🐦",
  "x.com": "🐦",
  "weibo.com": "🍉",
  "zhihu.com": "📖",
  "baidu.com": "🐾"
};

const fallbackEmojis = ["🌐", "📄", "🚀", "💡", "🌈", "🧩", "🎯", "✨", "⚡", "🌟", "💻", "🔮"];

let chartInstance = null;
let selectedBackgroundPreset = "dopamine";
let customBackgroundImage = "";
let currentStatsView = "day";
let latestGroups = [];
let tabSearchTerm = "";

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
  setupEventListeners();
});

async function initDashboard() {
  const settings = await chrome.storage.local.get([
    "theme",
    "lang",
    "backgroundPreset",
    "bgImage",
    "autoCollapseGroups",
    "designVersion"
  ]);

  if (settings.designVersion !== DESIGN_VERSION) {
    await chrome.storage.local.set({
      designVersion: DESIGN_VERSION,
      theme: "light",
      bgImage: "",
      backgroundPreset: "dopamine"
    });
    settings.theme = "light";
    settings.bgImage = "";
    settings.backgroundPreset = "dopamine";
  }

  customBackgroundImage = settings.bgImage || "";
  setLanguage(settings.lang || "zh");
  applyTheme(settings.theme || "light");
  applyBackground(settings.backgroundPreset || "dopamine", customBackgroundImage);
  updateDOMTranslations();

  await renderShortcuts();
  await renderTabs();
  await renderStats();

  chrome.tabs.onUpdated.addListener(renderTabs);
  chrome.tabs.onRemoved.addListener(renderTabs);
  chrome.tabs.onCreated.addListener(renderTabs);
  if (chrome.tabGroups && chrome.tabGroups.onUpdated) {
    chrome.tabGroups.onUpdated.addListener(renderTabs);
  }
}

function setupEventListeners() {
  document.getElementById("settings-btn").addEventListener("click", openSettings);
  document.getElementById("close-settings").addEventListener("click", closeSettings);
  document.getElementById("save-settings-btn").addEventListener("click", saveSettings);
  document.getElementById("add-shortcut-btn").addEventListener("click", () => openShortcutModal());
  document.getElementById("regroup-btn").addEventListener("click", regroupTabs);
  document.getElementById("dedupe-btn").addEventListener("click", dedupeTabs);
  document.getElementById("save-rule-btn").addEventListener("click", saveFriendlyRule);
  document.getElementById("reset-rules-btn").addEventListener("click", resetRules);
  document.getElementById("close-shortcut-modal").addEventListener("click", closeShortcutModal);
  document.getElementById("save-shortcut-btn").addEventListener("click", saveShortcut);
  document.getElementById("close-site-rule-modal").addEventListener("click", closeSiteRuleModal);
  document.getElementById("save-site-rule-btn").addEventListener("click", saveSiteRuleFromModal);

  document.getElementById("pick-bg-btn").addEventListener("click", () => {
    document.getElementById("bg-file-input").click();
  });
  document.getElementById("bg-file-input").addEventListener("change", handleBgFilePick);
  document.getElementById("clear-bg-btn").addEventListener("click", () => {
    customBackgroundImage = "";
    applyBackground(selectedBackgroundPreset, "");
  });

  const searchInput = document.getElementById("tab-search-input");
  searchInput.addEventListener("input", () => {
    tabSearchTerm = searchInput.value.trim().toLowerCase();
    renderTabGroups(latestGroups, {});
  });

  document.querySelectorAll("[data-bg-preset]").forEach(button => {
    button.addEventListener("click", () => {
      selectedBackgroundPreset = button.dataset.bgPreset;
      customBackgroundImage = "";
      updatePresetState();
      applyBackground(selectedBackgroundPreset, "");
    });
  });

  document.querySelectorAll("[data-stats-view]").forEach(button => {
    button.addEventListener("click", async () => {
      currentStatsView = button.dataset.statsView;
      document.querySelectorAll("[data-stats-view]").forEach(item => {
        item.classList.toggle("is-active", item === button);
      });
      await renderStats();
    });
  });
}

function applyTheme(theme) {
  const body = document.getElementById("body-bg");
  body.classList.remove("theme-dark", "theme-light");

  if (theme === "system") {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    body.classList.add(prefersDark ? "theme-dark" : "theme-light");
  } else {
    body.classList.add(`theme-${theme}`);
  }
}

function applyBackground(preset, customImage) {
  const body = document.getElementById("body-bg");
  selectedBackgroundPreset = BACKGROUND_PRESETS.includes(preset) ? preset : "dopamine";
  body.classList.remove(...BACKGROUND_PRESETS.map(item => `bg-${item}`));

  if (customImage) {
    body.style.backgroundImage = `linear-gradient(rgba(255,255,255,0.28), rgba(255,255,255,0.55)), url("${customImage}")`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.backgroundAttachment = "fixed";
  } else {
    body.style.backgroundImage = "";
    body.classList.add(`bg-${selectedBackgroundPreset}`);
  }

  updatePresetState();
}

// 读取本地图片为 dataURL 存储；过大给出提示，避免超出 storage 限制。
function handleBgFilePick(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) {
    alert(t("imageTooLarge"));
    event.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    customBackgroundImage = reader.result;
    applyBackground(selectedBackgroundPreset, customBackgroundImage);
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

function updatePresetState() {
  document.querySelectorAll("[data-bg-preset]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.bgPreset === selectedBackgroundPreset);
  });
}

async function openSettings() {
  const res = await chrome.storage.local.get([
    "theme",
    "customGroups",
    "lang",
    "backgroundPreset",
    "autoCollapseGroups",
    "autoOrganize",
    "dedupeTabs"
  ]);

  document.getElementById("theme-select").value = res.theme || "light";
  document.getElementById("lang-select").value = res.lang || "zh";
  document.getElementById("auto-collapse-toggle").checked = res.autoCollapseGroups !== false;
  document.getElementById("auto-organize-toggle").checked = res.autoOrganize !== false;
  document.getElementById("dedupe-toggle").checked = res.dedupeTabs !== false;
  document.getElementById("custom-rules-input").value = JSON.stringify(res.customGroups || {}, null, 2);
  selectedBackgroundPreset = res.backgroundPreset || "dopamine";
  updatePresetState();
  renderCustomRules(res.customGroups || {});

  document.getElementById("settings-modal").classList.add("is-open");
}

function closeSettings() {
  document.getElementById("settings-modal").classList.remove("is-open");
}

async function saveSettings() {
  const theme = document.getElementById("theme-select").value;
  const lang = document.getElementById("lang-select").value;
  const autoCollapseGroups = document.getElementById("auto-collapse-toggle").checked;
  const autoOrganize = document.getElementById("auto-organize-toggle").checked;
  const dedupeTabsSetting = document.getElementById("dedupe-toggle").checked;
  const rulesStr = document.getElementById("custom-rules-input").value;

  let customGroups = {};
  if (rulesStr.trim()) {
    try {
      customGroups = JSON.parse(rulesStr);
    } catch (e) {
      alert(t("jsonError"));
      return;
    }
  }

  await chrome.storage.local.set({
    theme,
    lang,
    customGroups,
    autoCollapseGroups,
    autoOrganize,
    dedupeTabs: dedupeTabsSetting,
    backgroundPreset: selectedBackgroundPreset,
    bgImage: customBackgroundImage,
    designVersion: DESIGN_VERSION
  });

  setLanguage(lang);
  updateDOMTranslations();
  applyTheme(theme);
  applyBackground(selectedBackgroundPreset, customBackgroundImage);
  await regroupTabs();
  await renderTabs();
  await renderStats();
  closeSettings();
}

async function saveFriendlyRule() {
  const key = document.getElementById("rule-domain-input").value.trim().toLowerCase();
  const emoji = document.getElementById("rule-emoji-input").value.trim() || "🌐";
  const name = document.getElementById("rule-name-input").value.trim();
  const color = document.getElementById("rule-color-select").value;

  if (!key || !name) {
    alert(t("ruleRequired"));
    return;
  }

  await saveSiteRule(key, emoji, name, color);
}

async function resetRules() {
  if (!confirm(t("resetConfirm"))) return;

  await chrome.storage.local.set({ customGroups: {} });
  document.getElementById("custom-rules-input").value = "{}";
  renderCustomRules({});
  await regroupTabs();
  await renderTabs();
}

function renderCustomRules(customGroups) {
  const container = document.getElementById("rule-list");
  container.innerHTML = "";

  Object.entries(customGroups).forEach(([key, config]) => {
    const pill = document.createElement("span");
    pill.className = "rule-pill";
    pill.innerHTML = `
      <span>${escapeHTML(config.title || key)}</span>
      <span>${escapeHTML(key)}</span>
      <button data-rule-key="${escapeHTML(key)}">×</button>
    `;
    container.appendChild(pill);
  });

  container.querySelectorAll("[data-rule-key]").forEach(button => {
    button.addEventListener("click", async () => {
      const res = await chrome.storage.local.get(["customGroups"]);
      const customGroups = res.customGroups || {};
      delete customGroups[button.dataset.ruleKey];
      await chrome.storage.local.set({ customGroups });
      document.getElementById("custom-rules-input").value = JSON.stringify(customGroups, null, 2);
      renderCustomRules(customGroups);
      await regroupTabs();
      await renderTabs();
    });
  });
}

async function saveSiteRule(key, emoji, name, color) {
  const res = await chrome.storage.local.get(["customGroups"]);
  const customGroups = res.customGroups || {};
  customGroups[key] = {
    title: `${emoji} ${name}`,
    color
  };

  await chrome.storage.local.set({ customGroups });
  document.getElementById("custom-rules-input").value = JSON.stringify(customGroups, null, 2);
  renderCustomRules(customGroups);
  await regroupTabs();
  await renderTabs();
}

async function regroupTabs() {
  const button = document.getElementById("regroup-btn");
  const oldText = button.textContent;
  button.textContent = t("grouping");

  await chrome.runtime.sendMessage({ type: "REGROUP_TABS" }).catch(() => {});
  await renderTabs();

  button.textContent = oldText || t("regroupTabs");
}

async function dedupeTabs() {
  const button = document.getElementById("dedupe-btn");
  const oldText = button.textContent;
  button.textContent = t("grouping");

  const response = await chrome.runtime.sendMessage({ type: "DEDUPE_TABS" }).catch(() => null);
  await renderTabs();

  button.textContent = oldText || t("dedupeTabs");
  const closed = response && response.ok ? response.closed : 0;
  alert(closed > 0 ? t("dedupeDone", closed) : t("dedupeNone"));
}

async function renderShortcuts() {
  const res = await chrome.storage.local.get(["customShortcuts"]);
  const shortcuts = res.customShortcuts || defaultShortcuts;
  const container = document.getElementById("shortcuts-container");
  container.innerHTML = "";

  shortcuts.forEach((shortcut, index) => {
    const [cardA, cardB] = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
    const card = document.createElement("div");
    card.className = "shortcut-card";
    card.style.setProperty("--card-a", cardA);
    card.style.setProperty("--card-b", cardB);
    card.innerHTML = `
      <div class="card-actions">
        <button class="tiny-btn edit-shortcut-btn" data-id="${escapeHTML(shortcut.id)}" type="button">✎</button>
        <button class="tiny-btn delete-shortcut-btn" data-id="${escapeHTML(shortcut.id)}" type="button">×</button>
      </div>
      <div class="shortcut-icon">${escapeHTML(shortcut.icon || "🌐")}</div>
      <div>
        <div class="shortcut-title">${escapeHTML(shortcut.title)}</div>
        <div class="shortcut-url">${escapeHTML(prettyUrl(shortcut.url))}</div>
      </div>
    `;
    card.addEventListener("click", event => {
      if (event.target.closest("button")) return;
      chrome.tabs.create({ url: shortcut.url });
    });
    container.appendChild(card);
  });

  container.querySelectorAll(".edit-shortcut-btn").forEach(button => {
    button.addEventListener("click", async event => {
      event.stopPropagation();
      const latest = await chrome.storage.local.get(["customShortcuts"]);
      const shortcuts = latest.customShortcuts || defaultShortcuts;
      openShortcutModal(shortcuts.find(item => item.id === button.dataset.id));
    });
  });

  container.querySelectorAll(".delete-shortcut-btn").forEach(button => {
    button.addEventListener("click", async event => {
      event.stopPropagation();
      if (!confirm(t("deleteConfirm"))) return;

      const latest = await chrome.storage.local.get(["customShortcuts"]);
      const shortcuts = latest.customShortcuts || defaultShortcuts;
      await chrome.storage.local.set({
        customShortcuts: shortcuts.filter(shortcut => shortcut.id !== button.dataset.id)
      });
      await renderShortcuts();
    });
  });
}

function openShortcutModal(shortcut = null) {
  document.getElementById("shortcut-id-input").value = shortcut?.id || "";
  document.getElementById("shortcut-emoji-input").value = shortcut?.icon || "🌐";
  document.getElementById("shortcut-title-input").value = shortcut?.title || "";
  document.getElementById("shortcut-url-input").value = shortcut?.url || "";
  document.getElementById("shortcut-modal").classList.add("is-open");
}

function closeShortcutModal() {
  document.getElementById("shortcut-modal").classList.remove("is-open");
}

async function saveShortcut() {
  const id = document.getElementById("shortcut-id-input").value || Date.now().toString();
  const icon = document.getElementById("shortcut-emoji-input").value.trim() || "🌐";
  const title = document.getElementById("shortcut-title-input").value.trim();
  const url = normalizeUrl(document.getElementById("shortcut-url-input").value.trim());

  if (!title || !url) {
    alert(t("shortcutRequired"));
    return;
  }

  const latest = await chrome.storage.local.get(["customShortcuts"]);
  const shortcuts = latest.customShortcuts || defaultShortcuts.slice();
  const nextShortcut = { id, icon, title, url };
  const index = shortcuts.findIndex(item => item.id === id);
  if (index >= 0) {
    shortcuts[index] = nextShortcut;
  } else {
    shortcuts.push(nextShortcut);
  }

  await chrome.storage.local.set({ customShortcuts: shortcuts });
  closeShortcutModal();
  await renderShortcuts();
}

function openSiteRuleModal(identity) {
  const parsed = parseDisplayTitle(identity.title);
  document.getElementById("site-rule-key-input").value = identity.key;
  document.getElementById("site-rule-emoji-input").value = parsed.emoji;
  document.getElementById("site-rule-name-input").value = parsed.name;
  document.getElementById("site-rule-color-select").value = identity.color || "blue";
  document.getElementById("site-rule-modal").classList.add("is-open");
}

function closeSiteRuleModal() {
  document.getElementById("site-rule-modal").classList.remove("is-open");
}

async function saveSiteRuleFromModal() {
  const key = document.getElementById("site-rule-key-input").value;
  const emoji = document.getElementById("site-rule-emoji-input").value.trim() || "🌐";
  const name = document.getElementById("site-rule-name-input").value.trim();
  const color = document.getElementById("site-rule-color-select").value;

  if (!key || !name) {
    alert(t("ruleRequired"));
    return;
  }

  await saveSiteRule(key, emoji, name, color);
  closeSiteRuleModal();
}

async function renderStats() {
  const data = await chrome.storage.local.get(["dailyStats", "hourlyStats"]);
  const dailyStats = data.dailyStats || {};
  const hourlyStats = data.hourlyStats || {};
  const today = new Date();
  let labels = [];
  let chartData = [];
  let primaryValue = 0;
  let secondaryValue = 0;
  let primaryLabel = "";
  let secondaryLabel = "";
  let subtitle = "";

  if (currentStatsView === "day") {
    const dayKey = getDateKey(today);
    const hourly = hourlyStats[dayKey] || Array(24).fill(0);
    labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    chartData = labels.map((_, i) => hourly[i] || 0);
    primaryValue = chartData.reduce((sum, value) => sum + value, 0);
    const peakHour = chartData.indexOf(Math.max(...chartData, 0));
    secondaryValue = primaryValue > 0
      ? `${String(peakHour).padStart(2, "0")}:00–${String((peakHour + 1) % 24).padStart(2, "0")}:00`
      : "--";
    primaryLabel = t("dailyOpened");
    secondaryLabel = t("peakHourOpened");
    subtitle = t("statsDaySubtitle");
  } else if (currentStatsView === "week") {
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(today.getDate() - i);
      labels.push(`${day.getMonth() + 1}/${day.getDate()}`);
      chartData.push(dailyStats[getDateKey(day)] || 0);
    }
    primaryValue = chartData.reduce((sum, value) => sum + value, 0);
    secondaryValue = Math.round(primaryValue / 7);
    primaryLabel = t("weeklyOpened");
    secondaryLabel = t("avgDailyOpened");
    subtitle = t("statsWeekSubtitle");
  } else {
    for (let i = 29; i >= 0; i--) {
      const day = new Date();
      day.setDate(today.getDate() - i);
      labels.push(`${day.getMonth() + 1}/${day.getDate()}`);
      chartData.push(dailyStats[getDateKey(day)] || 0);
    }
    primaryValue = chartData.reduce((sum, value) => sum + value, 0);
    secondaryValue = Math.round(primaryValue / 30);
    primaryLabel = t("monthlyOpened");
    secondaryLabel = t("avgDailyOpened");
    subtitle = t("statsMonthSubtitle");
  }

  document.getElementById("stats-subtitle").textContent = subtitle;
  document.getElementById("stat-primary").textContent = primaryValue;
  const secondaryEl = document.getElementById("stat-secondary");
  secondaryEl.textContent = secondaryValue;
  secondaryEl.classList.toggle("is-compact", currentStatsView === "day");
  document.getElementById("stat-primary-label").textContent = primaryLabel;
  document.getElementById("stat-secondary-label").textContent = secondaryLabel;

  const ctx = document.getElementById("tabsChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  const isTrend = currentStatsView !== "day";
  let fill = "rgba(124, 92, 255, 0.55)";
  if (isTrend) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, "rgba(255, 77, 141, 0.32)");
    gradient.addColorStop(1, "rgba(124, 92, 255, 0.02)");
    fill = gradient;
  }

  chartInstance = new Chart(ctx, {
    type: isTrend ? "line" : "bar",
    data: {
      labels,
      datasets: [{
        label: t("chartLabel"),
        data: chartData,
        backgroundColor: fill,
        borderColor: "#7c5cff",
        borderWidth: isTrend ? 2 : 0,
        borderRadius: 6,
        fill: isTrend,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: "#ff4d8d"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { intersect: false, mode: "index" } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#5B6475", precision: 0 },
          grid: { color: "rgba(23,32,51,0.06)" }
        },
        x: {
          ticks: {
            color: "#5B6475",
            maxRotation: currentStatsView === "month" ? 60 : 0,
            autoSkip: true,
            maxTicksLimit: currentStatsView === "day" ? 8 : 10
          },
          grid: { display: false }
        }
      }
    }
  });

  await renderTopSites();
}

// 当前打开的网页里，按“停留时长 + 访问次数”聚合到网站维度，取前几名。
async function renderTopSites() {
  const listEl = document.getElementById("top-sites-list");
  if (!listEl) return;

  const [tabs, storageData] = await Promise.all([
    chrome.tabs.query({}),
    chrome.storage.local.get(["tabStats", "customGroups"])
  ]);
  const tabStats = storageData.tabStats || {};
  const customGroups = storageData.customGroups || {};

  const bySite = new Map();
  tabs.forEach(tab => {
    const identity = getTabIdentity(tab.url);
    if (!identity) return;
    const config = customGroups[identity.key] || customGroups[identity.domain];
    const title = (config && config.title) || identity.title;
    const stat = tabStats[tab.id] || {};
    const entry = bySite.get(identity.key) || { key: identity.key, title, color: identity.color, seconds: 0, visits: 0, count: 0 };
    entry.seconds += stat.activeSeconds || 0;
    entry.visits += stat.visitCount || 0;
    entry.count += 1;
    bySite.set(identity.key, entry);
  });

  const ranked = Array.from(bySite.values())
    .sort((a, b) => b.seconds - a.seconds || b.visits - a.visits || b.count - a.count)
    .slice(0, 5);

  listEl.innerHTML = "";
  if (!ranked.length) {
    const empty = document.createElement("div");
    empty.className = "top-sites-empty";
    empty.textContent = t("topSitesEmpty");
    listEl.appendChild(empty);
    return;
  }

  const max = ranked[0].seconds || 1;
  ranked.forEach((site, index) => {
    const parsed = parseDisplayTitle(site.title);
    const pct = Math.max(6, Math.round((site.seconds / max) * 100));
    const row = document.createElement("div");
    row.className = "top-site-row";
    row.innerHTML = `
      <span class="top-site-rank">${index + 1}</span>
      <span class="top-site-emoji">${escapeHTML(parsed.emoji)}</span>
      <div class="top-site-main">
        <div class="top-site-name">${escapeHTML(parsed.name)}</div>
        <div class="top-site-bar"><span style="width:${pct}%; background:${getColor(site.color)}"></span></div>
      </div>
      <span class="top-site-value">${site.seconds >= 60 ? formatDuration(site.seconds) : t("topSitesTabs", site.count)}</span>
    `;
    listEl.appendChild(row);
  });
}

async function renderTabs() {
  const [tabs, groups, storageData] = await Promise.all([
    chrome.tabs.query({}),
    chrome.tabGroups.query({}),
    chrome.storage.local.get(["tabStats", "customGroups"])
  ]);

  const tabStats = storageData.tabStats || {};
  const customGroups = storageData.customGroups || {};
  const groupMap = new Map(groups.map(group => [group.id, group]));
  const grouped = new Map();

  tabs.forEach(tab => {
    const groupInfo = getDisplayGroupForTab(tab, groupMap, customGroups);
    if (!grouped.has(groupInfo.key)) {
      grouped.set(groupInfo.key, {
        ...groupInfo,
        tabs: [],
        firstTabId: tab.id,
        windowId: tab.windowId,
        chromeGroupId: tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE ? tab.groupId : null
      });
    }
    const bucket = grouped.get(groupInfo.key);
    bucket.tabs.push(tab);
    if (bucket.chromeGroupId === null && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
      bucket.chromeGroupId = tab.groupId;
    }
  });

  latestGroups = Array.from(grouped.values())
    .sort((a, b) => b.tabs.length - a.tabs.length || a.title.localeCompare(b.title));

  document.getElementById("tab-count").textContent = t("tabCount", tabs.length);
  renderTabGroups(latestGroups, tabStats);
}

async function renderTabGroups(groups, tabStats) {
  if (!Object.keys(tabStats).length) {
    const storageData = await chrome.storage.local.get(["tabStats"]);
    tabStats = storageData.tabStats || {};
  }

  const container = document.getElementById("tabs-container");
  container.innerHTML = "";

  let visibleGroups = groups;

  // 计算重复网址（同一归一化 URL 出现多次）用于打重复标记。
  const urlCounts = new Map();
  groups.forEach(group => {
    group.tabs.forEach(tab => {
      const key = normalizeUrlForDedupe(tab.url);
      if (key) urlCounts.set(key, (urlCounts.get(key) || 0) + 1);
    });
  });

  if (tabSearchTerm) {
    visibleGroups = visibleGroups
      .map(group => ({
        ...group,
        tabs: group.tabs.filter(tab => matchesSearch(tab, tabSearchTerm))
      }))
      .filter(group => group.tabs.length);
  }

  if (!visibleGroups.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = t("noSearchResult");
    container.appendChild(empty);
    return;
  }

  visibleGroups.forEach(group => {
    const card = document.createElement("section");
    card.className = "tab-group-card";
    card.style.setProperty("--accent", getColor(group.color));
    card.dataset.groupKey = group.key;

    // 拖放：把网页拖到这张分组卡片上，移入该分组
    card.addEventListener("dragover", event => {
      event.preventDefault();
      card.classList.add("drag-over");
    });
    card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
    card.addEventListener("drop", async event => {
      event.preventDefault();
      card.classList.remove("drag-over");
      const tabId = Number(event.dataTransfer.getData("text/plain"));
      if (tabId) await moveTabToGroup(tabId, group);
    });

    const header = document.createElement("div");
    header.className = "group-card-header";
    header.innerHTML = `
      <div class="group-card-title">
        <span class="group-color-block"></span>
        <span class="group-title-text">${escapeHTML(group.title)}</span>
        <span class="group-count">${group.tabs.length}</span>
      </div>
      <div class="group-actions">
        <button class="btn edit-group-rule-btn" data-key="${escapeHTML(group.key)}">${t("customizeCategory")}</button>
        <button class="btn focus-window-btn" data-tab="${group.firstTabId}" data-window="${group.windowId}">${t("focusBtn")}</button>
        <button class="btn close-group-btn" data-key="${escapeHTML(group.key)}">${t("closeGroup")}</button>
      </div>
    `;
    card.appendChild(header);

    const list = document.createElement("div");
    list.className = "tabs-list";
    group.tabs.forEach(tab => {
      const dupKey = normalizeUrlForDedupe(tab.url);
      const duplicateCount = dupKey ? urlCounts.get(dupKey) || 1 : 1;
      list.appendChild(createTabRow(tab, group, tabStats[tab.id], duplicateCount));
    });
    card.appendChild(list);
    container.appendChild(card);
  });

  container.querySelectorAll(".focus-window-btn").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      focusTab(Number(button.dataset.tab), Number(button.dataset.window));
    });
  });

  container.querySelectorAll(".edit-group-rule-btn").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      const group = latestGroups.find(item => item.key === button.dataset.key);
      if (group) openSiteRuleModal(group);
    });
  });

  container.querySelectorAll(".close-group-btn").forEach(button => {
    button.addEventListener("click", async event => {
      event.stopPropagation();
      const group = latestGroups.find(item => item.key === button.dataset.key);
      if (!group) return;
      if (!confirm(t("closeGroupConfirm", group.tabs.length))) return;
      await chrome.tabs.remove(group.tabs.map(tab => tab.id)).catch(() => {});
      await renderTabs();
    });
  });
}

function matchesSearch(tab, term) {
  return `${tab.title || ""} ${tab.url || ""}`.toLowerCase().includes(term);
}

function createTabRow(tab, group, stats = {}, duplicateCount = 1) {
  const row = document.createElement("div");
  row.className = "tab-row";
  row.draggable = true;
  if (duplicateCount > 1) row.classList.add("is-duplicate");

  row.addEventListener("dragstart", event => {
    event.dataTransfer.setData("text/plain", String(tab.id));
    event.dataTransfer.effectAllowed = "move";
    row.classList.add("dragging");
  });
  row.addEventListener("dragend", () => row.classList.remove("dragging"));

  const openDate = new Date(stats.openTime || Date.now());
  const timeStr = `${String(openDate.getHours()).padStart(2, "0")}:${String(openDate.getMinutes()).padStart(2, "0")}`;
  const activeStr = formatDuration(stats.activeSeconds || 0);
  const favicon = tab.favIconUrl || `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(tab.url)}&size=32`;
  const duplicateBadge = duplicateCount > 1
    ? `<span class="dup-badge" title="${t("closeDuplicates")}">${t("duplicateBadge", duplicateCount)}</span>`
    : "";

  row.innerHTML = `
    <div class="card-actions">
      <button class="tiny-btn save-tab-shortcut-btn" type="button" title="${t("saveAsShortcut")}">★</button>
      <button class="tiny-btn edit-tab-rule-btn" type="button" title="${t("customizeCategory")}">✎</button>
    </div>
    <img src="${favicon}" class="tab-favicon" alt="" draggable="false">
    <div class="tab-info">
      <div class="tab-title">${escapeHTML(tab.title || tab.url || "")} ${duplicateBadge}</div>
      <div class="tab-url">${escapeHTML(prettyUrl(tab.url || ""))}</div>
      <div class="tab-meta">
        <span>🕒 ${t("openedAt", timeStr)}</span>
        <span>⚡ ${t("activeTime", activeStr, stats.visitCount || 0)}</span>
      </div>
    </div>
    <button class="close-tab-btn" data-id="${tab.id}">×</button>
  `;

  row.addEventListener("click", event => {
    if (event.target.closest("button")) return;
    focusTab(tab.id, tab.windowId);
  });

  row.querySelector(".save-tab-shortcut-btn").addEventListener("click", event => {
    event.stopPropagation();
    const parsed = parseDisplayTitle(group.title);
    openShortcutModal({
      id: "",
      icon: parsed.emoji,
      title: tab.title || parsed.name,
      url: tab.url
    });
  });

  row.querySelector(".edit-tab-rule-btn").addEventListener("click", event => {
    event.stopPropagation();
    openSiteRuleModal(group);
  });

  const badge = row.querySelector(".dup-badge");
  if (badge) {
    badge.addEventListener("click", async event => {
      event.stopPropagation();
      await dedupeTabs();
    });
  }

  row.querySelector(".close-tab-btn").addEventListener("click", async event => {
    event.stopPropagation();
    await chrome.tabs.remove(Number(event.currentTarget.dataset.id));
  });

  return row;
}

// 归一化 URL，判定重复网页，与 background.js 保持一致。
function normalizeUrlForDedupe(url) {
  try {
    const urlObj = new URL(url);
    if (CHROME_INTERNAL_PROTOCOLS.includes(urlObj.protocol)) return null;
    if (!/^https?:$/.test(urlObj.protocol)) return null;
    const host = urlObj.hostname.replace(/^www\./, "").toLowerCase();
    const path = urlObj.pathname.replace(/\/+$/, "");
    return `${host}${path}${urlObj.search}`;
  } catch (e) {
    return null;
  }
}

function getDisplayGroupForTab(tab, groupMap, customGroups) {
  const identity = getTabIdentity(tab.url) || {
    key: "system-other",
    title: t("systemOther"),
    color: "grey",
    domain: t("systemOther")
  };

  const customConfig = customGroups[identity.key] || customGroups[identity.domain];
  const customized = customConfig
    ? { ...identity, title: customConfig.title || identity.title, color: customConfig.color || identity.color }
    : identity;

  if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE && groupMap.has(tab.groupId)) {
    const group = groupMap.get(tab.groupId);
    return {
      ...customized,
      title: customConfig?.title || group.title || customized.title,
      color: customConfig?.color || group.color || customized.color
    };
  }

  return customized;
}

function getTabIdentity(url) {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname || CHROME_INTERNAL_PROTOCOLS.includes(urlObj.protocol)) return null;

    const hostname = normalizeHostname(urlObj.hostname);
    const pathname = urlObj.pathname || "/";

    if (hostname === "bytetech.info" || hostname.endsWith(".bytetech.info")) {
      return { key: "bytetech.info", domain: "bytetech.info", title: "📰 ByteTech", color: "orange" };
    }

    if (hostname === "bytedance.larkoffice.com" || hostname.endsWith(".larkoffice.com")) {
      const product = getLarkProduct(pathname);
      return { ...product, domain: hostname };
    }

    if (hostname === "starling.bytedance.net" || hostname.endsWith(".starling.bytedance.net")) {
      return { key: "starling.bytedance.net", domain: "starling.bytedance.net", title: "🟣 Starling", color: "purple" };
    }

    const bytedanceSuffixes = ["bytedance.net", "byted.org", "byteintl.net"];
    const bytedanceSuffix = bytedanceSuffixes.find(suffix => hostname.endsWith(`.${suffix}`));
    if (bytedanceSuffix) {
      const firstLabel = hostname.split(".")[0];
      const key = `${firstLabel}.${bytedanceSuffix}`;
      return {
        key,
        domain: key,
        title: `${getHashEmoji(key)} ${getReadableName(firstLabel)}`,
        color: getHashColor(key)
      };
    }

    const domain = getBaseDomain(hostname);
    return {
      key: domain,
      domain,
      title: `${defaultEmojis[domain] || getHashEmoji(domain)} ${getReadableName(domain)}`,
      color: getHashColor(domain)
    };
  } catch (e) {
    return null;
  }
}

function getLarkProduct(pathname) {
  const firstSegment = pathname.split("/").filter(Boolean)[0] || "";
  const productMap = {
    docx: { key: "lark-docx", title: "📝 Lark Docs", color: "cyan" },
    docs: { key: "lark-docs", title: "📝 Lark Docs", color: "cyan" },
    wiki: { key: "lark-wiki", title: "📚 Lark Wiki", color: "purple" },
    base: { key: "lark-base", title: "🧮 Lark Base", color: "green" },
    sheets: { key: "lark-sheets", title: "📊 Lark Sheets", color: "green" },
    minutes: { key: "lark-minutes", title: "🎙️ Lark Minutes", color: "orange" },
    messenger: { key: "lark-im", title: "💬 Lark IM", color: "blue" }
  };
  return productMap[firstSegment] || { key: "lark-office", title: "🪽 Lark Office", color: "blue" };
}

function getHashColor(value) {
  return Object.keys(COLOR_META)[getStableHash(value) % Object.keys(COLOR_META).length];
}

function getHashEmoji(value) {
  return fallbackEmojis[getStableHash(value) % fallbackEmojis.length];
}

function getStableHash(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function normalizeHostname(hostname) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function getBaseDomain(hostname) {
  const parts = normalizeHostname(hostname).split(".");
  if (parts.length <= 2) return parts.join(".");

  const twoPartSuffixes = new Set(["com.cn", "net.cn", "org.cn", "co.uk", "com.au", "co.jp", "com.sg"]);
  const suffix = parts.slice(-2).join(".");
  return twoPartSuffixes.has(suffix) ? parts.slice(-3).join(".") : parts.slice(-2).join(".");
}

function getReadableName(value) {
  const first = value.split(".")[0] || value;
  return first.replace(/[-_]+/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}

function getColor(colorName) {
  return (COLOR_META[colorName] || COLOR_META.pink).hex;
}

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function focusTab(tabId, windowId) {
  chrome.windows.update(windowId, { focused: true }).catch(() => {});
  chrome.tabs.update(tabId, { active: true }).catch(() => {});
}

// 把一个标签拖入目标分组：优先并入已有原生组，否则按目标标题/颜色新建组。
async function moveTabToGroup(tabId, targetGroup) {
  try {
    if (targetGroup.key === "system-other") {
      await chrome.tabs.ungroup(tabId);
    } else if (targetGroup.chromeGroupId) {
      await chrome.tabs.group({ groupId: targetGroup.chromeGroupId, tabIds: tabId });
    } else {
      const parsed = parseDisplayTitle(targetGroup.title);
      await chrome.runtime.sendMessage({
        type: "CREATE_GROUP",
        tabIds: [tabId, targetGroup.firstTabId],
        title: `${parsed.emoji} ${parsed.name}`,
        color: targetGroup.color || "blue"
      });
    }
  } catch (e) {
    // 忽略跨窗口等异常
  }
  await renderTabs();
}

function prettyUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch (e) {
    return url;
  }
}

function normalizeUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function parseDisplayTitle(title) {
  const [first, ...rest] = String(title || "").trim().split(/\s+/);
  const emoji = first && first.length <= 4 ? first : "🌐";
  const name = rest.length ? rest.join(" ") : String(title || "").replace(emoji, "").trim() || "Website";
  return { emoji, name };
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

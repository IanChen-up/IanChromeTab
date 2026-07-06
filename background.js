// background.js

const AVAILABLE_COLORS = ["grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange"];
const CHROME_INTERNAL_PROTOCOLS = ["chrome:", "chrome-extension:", "edge:", "about:"];

// ==========================================
// 数据追踪 (Data Tracking)
// ==========================================
let activeTabId = null;
let lastActiveTime = Date.now();

// 辅助函数：获取今天的日期字符串 YYYY-MM-DD
function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// 记录标签打开和活跃数据
async function initTabStats(tabId) {
  const data = await chrome.storage.local.get(['tabStats', 'dailyStats', 'hourlyStats']);
  const tabStats = data.tabStats || {};
  const dailyStats = data.dailyStats || {};
  const hourlyStats = data.hourlyStats || {};
  
  const today = getTodayString();
  if (!dailyStats[today]) dailyStats[today] = 0;
  if (!hourlyStats[today]) hourlyStats[today] = Array(24).fill(0);
  
  if (!tabStats[tabId]) {
    const currentHour = new Date().getHours();
    tabStats[tabId] = {
      openTime: Date.now(),
      lastAccessed: Date.now(),
      activeSeconds: 0,
      visitCount: 0
    };
    dailyStats[today]++;
    hourlyStats[today][currentHour] = (hourlyStats[today][currentHour] || 0) + 1;
    await chrome.storage.local.set({ tabStats, dailyStats, hourlyStats });
  }
}

// 更新标签活跃时长
async function updateActiveTime() {
  if (activeTabId !== null) {
    const now = Date.now();
    const diffSeconds = Math.floor((now - lastActiveTime) / 1000);
    if (diffSeconds > 0) {
      const data = await chrome.storage.local.get(['tabStats']);
      const tabStats = data.tabStats || {};
      if (tabStats[activeTabId]) {
        tabStats[activeTabId].activeSeconds = (tabStats[activeTabId].activeSeconds || 0) + diffSeconds;
        await chrome.storage.local.set({ tabStats });
      }
    }
  }
  lastActiveTime = Date.now();
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateActiveTime();
  activeTabId = activeInfo.tabId;
  
  // 增加访问次数
  const data = await chrome.storage.local.get(['tabStats']);
  const tabStats = data.tabStats || {};
  if (tabStats[activeTabId]) {
    tabStats[activeTabId].visitCount = (tabStats[activeTabId].visitCount || 0) + 1;
    tabStats[activeTabId].lastAccessed = Date.now();
    await chrome.storage.local.set({ tabStats });
  }

  await syncAutoCollapse(activeInfo.windowId, activeInfo.tabId);
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await updateActiveTime();
    activeTabId = null; // 失去焦点时不计入活跃时间
  } else {
    const tabs = await chrome.tabs.query({ active: true, windowId: windowId });
    if (tabs.length > 0) {
      await updateActiveTime();
      activeTabId = tabs[0].id;
      await syncAutoCollapse(windowId, activeTabId);
    }
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (activeTabId === tabId) {
    await updateActiveTime();
    activeTabId = null;
  }
  // 清理关闭标签的统计数据，防止无限增长
  const data = await chrome.storage.local.get(['tabStats']);
  const tabStats = data.tabStats || {};
  if (tabStats[tabId]) {
    delete tabStats[tabId];
    await chrome.storage.local.set({ tabStats });
  }
});

async function captureMemorySnapshot() {
  if (!chrome.system || !chrome.system.memory || !chrome.system.memory.getInfo) {
    return;
  }

  const info = await chrome.system.memory.getInfo();
  const capacityGB = Number(info.capacity) / 1024 / 1024 / 1024;
  const availableGB = Number(info.availableCapacity) / 1024 / 1024 / 1024;
  const usedPercent = capacityGB > 0 ? Math.round(((capacityGB - availableGB) / capacityGB) * 100) : 0;
  const data = await chrome.storage.local.get(["memoryStats"]);
  const memoryStats = data.memoryStats || [];

  memoryStats.push({
    time: Date.now(),
    availableGB: Number(availableGB.toFixed(2)),
    usedPercent
  });

  await chrome.storage.local.set({ memoryStats: memoryStats.slice(-288) });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "memory-snapshot") {
    captureMemorySnapshot().catch(() => {});
  }
});

// ==========================================
// 标签分组逻辑
// ==========================================

// 获取字符串的稳定哈希，用于分配颜色和 emoji
function getStableHash(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getHashColor(value) {
  return AVAILABLE_COLORS[getStableHash(value) % AVAILABLE_COLORS.length];
}

function normalizeHostname(hostname) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function getBaseDomain(hostname) {
  const parts = normalizeHostname(hostname).split(".");
  if (parts.length <= 2) return parts.join(".");

  const twoPartSuffixes = new Set([
    "com.cn",
    "net.cn",
    "org.cn",
    "co.uk",
    "com.au",
    "co.jp",
    "com.sg"
  ]);
  const suffix = parts.slice(-2).join(".");
  return twoPartSuffixes.has(suffix) ? parts.slice(-3).join(".") : parts.slice(-2).join(".");
}

function getReadableNameFromDomain(domain) {
  const first = domain.split(".")[0] || domain;
  return first
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
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

function getTabIdentity(url) {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname || CHROME_INTERNAL_PROTOCOLS.includes(urlObj.protocol)) {
      return null;
    }

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
        title: `${getHashEmoji(key)} ${getReadableNameFromDomain(firstLabel)}`,
        color: getHashColor(key)
      };
    }

    const domain = getBaseDomain(hostname);
    const emoji = defaultEmojis[domain] || getHashEmoji(domain);
    return {
      key: domain,
      domain,
      title: `${emoji} ${getReadableNameFromDomain(domain)}`,
      color: getHashColor(domain)
    };
  } catch (e) {
    return null;
  }
}

// 兼容旧代码调用。真正分组请使用 getTabIdentity。
function extractDomain(url) {
  const identity = getTabIdentity(url);
  return identity ? identity.key : null;
}

// 默认的一些域名 emoji 映射
const defaultEmojis = {
  'google.com': '🔍',
  'github.com': '🐙',
  'youtube.com': '📺',
  'bilibili.com': '📺',
  'twitter.com': '🐦',
  'x.com': '🐦',
  'weibo.com': '🍉',
  'zhihu.com': '📖',
  'baidu.com': '🐾'
};

// 备用 emoji 列表，用于随机一致性分配
const fallbackEmojis = ['🌐', '📄', '🚀', '💡', '🌈', '🧩', '🎯', '✨', '⚡', '🌟', '💻', '🔮'];

// 根据域名一致性地获取 emoji
function getHashEmoji(domain) {
  return fallbackEmojis[getStableHash(domain) % fallbackEmojis.length];
}

async function getGroupConfig(identity) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['customGroups'], (result) => {
      const customGroups = result.customGroups || {};
      const customConfig = customGroups[identity.key] || customGroups[identity.domain];
      if (customConfig) {
        resolve({
          ...identity,
          title: customConfig.title || identity.title,
          color: customConfig.color || identity.color
        });
      } else {
        resolve(identity);
      }
    });
  });
}

// 归一化 URL，用于判断“同一个网页”。去掉尾部斜杠和 hash，忽略大小写主机名。
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

// 判断是否是“新标签页 / 中控台”页面（被本扩展接管的 New Tab）。
function isDashboardPage(tab) {
  const url = tab.url || tab.pendingUrl || "";
  if (!url) return false;
  if (url.startsWith("chrome://newtab") || url.startsWith("chrome://new-tab-page")) return true;
  if (url.startsWith(`chrome-extension://${chrome.runtime.id}/dashboard.html`)) return true;
  return false;
}

// 打开重复网址时，关闭同窗口里更早打开的相同网址标签，只保留当前这个。
async function closeDuplicatesFor(tab) {
  const setting = await chrome.storage.local.get(["dedupeTabs"]);
  if (setting.dedupeTabs === false) return 0;

  // 新标签页 / 中控台：同一窗口只保留最新打开的这一个，避免堆叠出很多个控制台。
  // 用“保留最大 tabId（最新）”的确定性规则，避免并发事件互相关闭导致全关。
  if (isDashboardPage(tab)) {
    const tabs = await chrome.tabs.query({ windowId: tab.windowId });
    const dashboards = tabs.filter(t => !t.pinned && isDashboardPage(t));
    if (dashboards.length <= 1) return 0;
    const keepId = Math.max(...dashboards.map(t => t.id));
    const staleDashboards = dashboards.filter(t => t.id !== keepId).map(t => t.id);
    if (staleDashboards.length) {
      await chrome.tabs.remove(staleDashboards).catch(() => {});
    }
    return staleDashboards.length;
  }

  const key = normalizeUrlForDedupe(tab.url);
  if (!key) return 0;

  const tabs = await chrome.tabs.query({ windowId: tab.windowId });
  const duplicateIds = tabs
    .filter(t => t.id !== tab.id && !t.pinned && normalizeUrlForDedupe(t.url) === key)
    .map(t => t.id);

  if (duplicateIds.length) {
    await chrome.tabs.remove(duplicateIds).catch(() => {});
  }
  return duplicateIds.length;
}

// 手动一键去重（无视自动开关，用户主动点才执行）：同一窗口内，同一归一化 URL 只保留最后一个。
// 新标签页 / 中控台也一并去重，每个窗口只留一个。
async function dedupeAllTabs() {
  const tabs = await chrome.tabs.query({});
  const seen = new Map();
  const toClose = [];

  tabs
    .filter(tab => !tab.pinned)
    .sort((a, b) => a.index - b.index)
    .forEach(tab => {
      let key = normalizeUrlForDedupe(tab.url);
      if (!key && isDashboardPage(tab)) key = "__dashboard__";
      if (!key) return;
      const scopedKey = `${tab.windowId}::${key}`;
      if (seen.has(scopedKey)) {
        toClose.push(seen.get(scopedKey));
      }
      seen.set(scopedKey, tab.id);
    });

  if (toClose.length) {
    await chrome.tabs.remove(toClose).catch(() => {});
  }
  return toClose.length;
}

// 关闭超过 N 天未使用的标签：以 lastAccessed 为准，缺失则用 openTime。
// 不关闭：置顶、当前激活、正在播放音频的标签。
async function closeStaleTabs(days) {
  const dayCount = Number(days);
  if (!dayCount || dayCount < 1) return 0;

  const threshold = Date.now() - dayCount * 24 * 60 * 60 * 1000;
  const [tabs, storage] = await Promise.all([
    chrome.tabs.query({}),
    chrome.storage.local.get(["tabStats"])
  ]);
  const tabStats = storage.tabStats || {};

  const toClose = tabs
    .filter(tab => {
      if (tab.pinned || tab.active || tab.audible) return false;
      if (!normalizeUrlForDedupe(tab.url)) return false; // 跳过系统页
      const stat = tabStats[tab.id];
      const lastSeen = stat ? (stat.lastAccessed || stat.openTime) : null;
      return lastSeen !== null && lastSeen < threshold;
    })
    .map(tab => tab.id);

  if (toClose.length) {
    await chrome.tabs.remove(toClose).catch(() => {});
  }
  return toClose.length;
}

// 新建自定义分组：把指定标签组成一个新组，并设置标题/颜色。
async function createCustomGroup(tabIds, title, color) {
  if (!Array.isArray(tabIds) || !tabIds.length) return null;
  const groupId = await chrome.tabs.group({ tabIds });
  await chrome.tabGroups.update(groupId, {
    title: title || "New Group",
    color: color || "blue"
  });
  return groupId;
}

// 监听标签页更新
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    await initTabStats(tabId);
    await closeDuplicatesFor(tab);
    await organizeTab(tab);
    if (tab.active) {
      await syncAutoCollapse(tab.windowId, tabId);
    }
  }
});

// 监听标签页创建
chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.id) {
    await initTabStats(tab.id);
  }
  if (tab.url && tab.status === 'complete') {
    await organizeTab(tab);
  }
});

// ==========================================
// 启动时自动整理已有标签页
// ==========================================
chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create("memory-snapshot", { periodInMinutes: 5 });
  await captureMemorySnapshot().catch(() => {});
  await dedupeAllTabs().catch(() => {});
  await autoGroupAllTabs();
});

// 浏览器启动时也执行一次整理
chrome.runtime.onStartup.addListener(async () => {
  chrome.alarms.create("memory-snapshot", { periodInMinutes: 5 });
  await captureMemorySnapshot().catch(() => {});
  await dedupeAllTabs().catch(() => {});
  await autoGroupAllTabs();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === "REGROUP_TABS") {
    dedupeAllTabs()
      .then(closed => autoGroupAllTabs().then(() => sendResponse({ ok: true, closed })))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message && message.type === "DEDUPE_TABS") {
    dedupeAllTabs()
      .then(closed => sendResponse({ ok: true, closed }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message && message.type === "CLOSE_STALE_TABS") {
    closeStaleTabs(message.days)
      .then(closed => sendResponse({ ok: true, closed }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message && message.type === "CREATE_GROUP") {
    createCustomGroup(message.tabIds, message.title, message.color)
      .then(groupId => sendResponse({ ok: true, groupId }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});

async function autoGroupAllTabs() {
  const tabs = await chrome.tabs.query({});
  const tabsByWindow = new Map();
  
  tabs.forEach(tab => {
    const identity = getTabIdentity(tab.url);
    if (!identity || !tab.id) return;

    if (!tabsByWindow.has(tab.windowId)) {
      tabsByWindow.set(tab.windowId, []);
    }
    tabsByWindow.get(tab.windowId).push({ tab, identity });
  });

  for (const [windowId, entries] of tabsByWindow.entries()) {
    const groupedTabIds = entries
      .filter(entry => entry.tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE)
      .map(entry => entry.tab.id);
      
    if (groupedTabIds.length) {
      await chrome.tabs.ungroup(groupedTabIds).catch(() => {});
    }

    const identityMap = new Map();
    entries.forEach(entry => {
      if (!identityMap.has(entry.identity.key)) {
        identityMap.set(entry.identity.key, { identity: entry.identity, tabs: [] });
      }
      identityMap.get(entry.identity.key).tabs.push(entry.tab);
    });

    // 只给 2 个以上标签的分类建组；标签多的分类优先拿到自己的首选颜色，
    // 保证颜色分配确定、稳定，大类不会被小类抢色。
    const candidates = Array.from(identityMap.values())
      .filter(group => group.tabs.length >= 2)
      .sort((a, b) => b.tabs.length - a.tabs.length || a.identity.key.localeCompare(b.identity.key));

    const usedColors = new Set();
    const groupsToCreate = [];
    for (const group of candidates) {
      const config = await getGroupConfig(group.identity);
      config.color = pickDistinctColor(config.color, usedColors);
      usedColors.add(config.color);
      groupsToCreate.push({ group, config });
    }

    for (const { group, config } of groupsToCreate) {
      const tabIds = group.tabs.map(tab => tab.id);
      const groupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupId, {
        title: config.title,
        color: config.color,
        collapsed: true
      });
    }

    const activeTab = entries.find(entry => entry.tab.active);
    await syncAutoCollapse(windowId, activeTab ? activeTab.tab.id : null);
  }
}

// 若首选颜色已被占用，则顺延到下一个未使用的颜色（灰色留给系统/其他，最后兜底）。
function pickDistinctColor(preferred, usedColors) {
  const palette = AVAILABLE_COLORS.filter(color => color !== "grey");
  if (preferred && !usedColors.has(preferred)) return preferred;

  const startIndex = Math.max(0, palette.indexOf(preferred));
  for (let i = 0; i < palette.length; i++) {
    const candidate = palette[(startIndex + i) % palette.length];
    if (!usedColors.has(candidate)) return candidate;
  }
  return preferred || "blue";
}

async function organizeTab(tab) {
  const autoSetting = await chrome.storage.local.get(["autoOrganize"]);
  if (autoSetting.autoOrganize === false) return; // 用户关闭了自动整理

  const identity = getTabIdentity(tab.url);
  if (!identity) return; // 忽略无效或系统页面

  const config = await getGroupConfig(identity);

  // 查找当前窗口内是否有同类标签。这里不复用旧 group，避免旧组混入不同平台。
  const tabs = await chrome.tabs.query({ windowId: tab.windowId });
  const sameIdentityTabs = tabs.filter(t => {
    const tabIdentity = getTabIdentity(t.url);
    return tabIdentity && tabIdentity.key === identity.key;
  });

  if (sameIdentityTabs.length > 1) {
    const groupId = await chrome.tabs.group({ tabIds: sameIdentityTabs.map(t => t.id) });
    await chrome.tabGroups.update(groupId, {
      title: config.title,
      color: config.color,
      collapsed: !sameIdentityTabs.some(t => t.active)
    });
  }
}

async function syncAutoCollapse(windowId, activeTabId = null) {
  if (!windowId) return;

  const result = await chrome.storage.local.get(["autoCollapseGroups"]);
  const autoCollapseGroups = result.autoCollapseGroups !== false;
  if (!autoCollapseGroups) return;

  let activeGroupId = chrome.tabGroups.TAB_GROUP_ID_NONE;
  if (activeTabId) {
    const activeTab = await chrome.tabs.get(activeTabId).catch(() => null);
    activeGroupId = activeTab ? activeTab.groupId : chrome.tabGroups.TAB_GROUP_ID_NONE;
  }

  const groups = await chrome.tabGroups.query({ windowId });
  await Promise.all(groups.map(group => {
    return chrome.tabGroups.update(group.id, {
      collapsed: group.id !== activeGroupId
    }).catch(() => {});
  }));
}

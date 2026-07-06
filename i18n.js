// i18n.js
const translations = {
  zh: {
    appTitle: "IanChromeTab",
    settings: "设置",
    regroupTabs: "一键整理",
    dedupeTabs: "清理重复",
    grouping: "整理中…",
    grouped: "整理完成 ✅",

    dedupeDone: "已关闭 {0} 个重复网页",
    dedupeNone: "没有发现重复网页",
    duplicateBadge: "重复 ×{0}",
    closeDuplicates: "关闭重复",

    searchPlaceholder: "搜索标题或网址…",
    webSearchPlaceholder: "搜索网页，或输入网址…",
    searchBtn: "搜索",
    noSearchResult: "没有匹配的网页",
    closeGroup: "关闭整组",
    closeGroupConfirm: "确定要关闭这一组的 {0} 个网页吗？",
    customizeCategory: "自定义分类",
    focusBtn: "定位到窗口",
    openedAt: "打开于 {0}",
    activeTime: "停留 {0} · 切换 {1} 次",
    saveAsShortcut: "收藏为常用网站",

    shortcuts: "常用网站",
    addShortcut: "添加网站",
    openedTabs: "已打开的网页",
    tabCount: "{0} 个标签页",

    settingsTitle: "设置",
    themeLabel: "主题模式",
    themeSystem: "跟随系统",
    themeDark: "深色模式",
    themeLight: "浅色模式",
    langLabel: "语言 (Language)",

    backgroundPresetLabel: "默认背景主题",
    presetDopamine: "多巴胺",
    presetCandy: "糖果",
    presetSunrise: "日出",
    presetMint: "薄荷",

    bgImageLabel: "自定义背景图（选择本地图片）",
    pickImage: "选择图片",
    clearImage: "恢复默认背景",
    imageTooLarge: "图片太大啦，请选择小于 4MB 的图片。",

    autoOrganizeLabel: "自动整理新打开的网页",
    autoOrganizeHint: "关闭后不会自动分组，只在你点“一键整理”时执行",
    autoCollapseLabel: "自动折叠非当前标签组",
    autoCollapseHint: "切换网页时，当前组展开，其他组自动收起",
    dedupeLabel: "自动关闭重复网页",
    dedupeHint: "当你打开一个已经开着的网址时，自动关掉旧的那个，只保留最新的",

    friendlyRuleTitle: "自定义标签规则（不用写代码）",
    saveRule: "保存规则",
    ruleRequired: "请至少填写规则关键词和显示名称",
    resetRules: "重置为默认",
    advancedJsonToggle: "高级：查看/编辑 JSON",
    jsonDesc: "可自定义域名对应的标题、Emoji 和颜色。",
    saveBtn: "保存设置并刷新",

    shortcutEditorTitle: "编辑网站",
    siteRuleEditorTitle: "自定义网站分类",
    emojiLabel: "Emoji",
    siteNameLabel: "网站名称",
    siteUrlLabel: "网站链接",
    colorLabel: "颜色",
    saveShortcut: "保存网站",
    shortcutRequired: "请填写网站名称和网站链接",

    statsTitle: "浏览习惯",
    statsDay: "今天",
    statsWeek: "本周",
    statsMonth: "本月",
    dailyOpened: "今天打开的网页",
    weeklyOpened: "本周打开的网页",
    monthlyOpened: "本月打开的网页",
    avgDailyOpened: "平均每天",
    peakHourOpened: "最活跃时段",
    statsDaySubtitle: "今天每个时段打开的网页数量",
    statsWeekSubtitle: "最近 7 天每天打开的网页数量",
    statsMonthSubtitle: "最近 30 天每天打开的网页数量",
    chartLabel: "打开的网页",
    topSitesTitle: "当前停留最久的网站",
    topSitesEmpty: "还没有足够的浏览数据",
    topSitesTabs: "{0} 个页面",

    popupDesc: "自动将相同域名的网页归类到标签组，保持浏览器整洁。",
    openDashboardBtn: "打开中控台 (New Tab)",
    groupNowBtn: "一键整理当前窗口标签",

    deleteConfirm: "确定要删除这个常用网站吗？",
    resetConfirm: "确定要重置所有自定义标签规则吗？",
    jsonError: "JSON 格式错误，请检查标签规则！",
    systemOther: "系统 / 其他"
  },
  en: {
    appTitle: "IanChromeTab",
    settings: "Settings",
    regroupTabs: "Organize Now",
    dedupeTabs: "Clean Duplicates",
    grouping: "Organizing…",
    grouped: "Done ✅",

    dedupeDone: "Closed {0} duplicate pages",
    dedupeNone: "No duplicate pages found",
    duplicateBadge: "Dup ×{0}",
    closeDuplicates: "Close Duplicates",

    searchPlaceholder: "Search title or URL…",
    webSearchPlaceholder: "Search the web, or enter a URL…",
    searchBtn: "Search",
    noSearchResult: "No matching pages",
    closeGroup: "Close Group",
    closeGroupConfirm: "Close all {0} pages in this group?",
    customizeCategory: "Customize",
    focusBtn: "Focus Window",
    openedAt: "Opened at {0}",
    activeTime: "Active {0} · Switched {1}x",
    saveAsShortcut: "Save as Shortcut",

    shortcuts: "Shortcuts",
    addShortcut: "Add Site",
    openedTabs: "Open Pages",
    tabCount: "{0} tabs",

    settingsTitle: "Settings",
    themeLabel: "Theme",
    themeSystem: "System",
    themeDark: "Dark",
    themeLight: "Light",
    langLabel: "Language (语言)",

    backgroundPresetLabel: "Background Theme",
    presetDopamine: "Dopamine",
    presetCandy: "Candy",
    presetSunrise: "Sunrise",
    presetMint: "Mint",

    bgImageLabel: "Custom Background (pick a local image)",
    pickImage: "Choose Image",
    clearImage: "Reset to Default",
    imageTooLarge: "Image is too large. Please pick one under 4MB.",

    autoOrganizeLabel: "Auto-organize newly opened pages",
    autoOrganizeHint: "When off, pages are grouped only when you click Organize Now.",
    autoCollapseLabel: "Auto-collapse inactive tab groups",
    autoCollapseHint: "The active group expands while other groups collapse automatically.",
    dedupeLabel: "Auto-close duplicate pages",
    dedupeHint: "When you open a URL that's already open, the old tab closes automatically, keeping only the latest.",

    friendlyRuleTitle: "Custom Tab Rules (No Code)",
    saveRule: "Save Rule",
    ruleRequired: "Please fill in both rule keyword and display name.",
    resetRules: "Reset to Default",
    advancedJsonToggle: "Advanced: View/Edit JSON",
    jsonDesc: "Customize title, Emoji and color for each domain.",
    saveBtn: "Save & Refresh",

    shortcutEditorTitle: "Edit Site",
    siteRuleEditorTitle: "Customize Category",
    emojiLabel: "Emoji",
    siteNameLabel: "Site Name",
    siteUrlLabel: "Site URL",
    colorLabel: "Color",
    saveShortcut: "Save Site",
    shortcutRequired: "Please fill in the site name and URL.",

    statsTitle: "Browsing Habits",
    statsDay: "Today",
    statsWeek: "This Week",
    statsMonth: "This Month",
    dailyOpened: "Opened Today",
    weeklyOpened: "Opened This Week",
    monthlyOpened: "Opened This Month",
    avgDailyOpened: "Daily Average",
    peakHourOpened: "Busiest Hour",
    statsDaySubtitle: "Pages opened by hour today",
    statsWeekSubtitle: "Pages opened each day over the last 7 days",
    statsMonthSubtitle: "Pages opened each day over the last 30 days",
    chartLabel: "Pages opened",
    topSitesTitle: "Where you're spending time now",
    topSitesEmpty: "Not enough browsing data yet",
    topSitesTabs: "{0} pages",

    popupDesc: "Automatically group pages by domain to keep your browser tidy.",
    openDashboardBtn: "Open Dashboard (New Tab)",
    groupNowBtn: "Group Current Window Now",

    deleteConfirm: "Delete this shortcut?",
    resetConfirm: "Reset all custom tab rules?",
    jsonError: "JSON format error, please check your rules!",
    systemOther: "System / Other"
  }
};

let currentLang = 'zh';

function setLanguage(lang) {
  currentLang = translations[lang] ? lang : 'zh';
}

function t(key, ...args) {
  let str = translations[currentLang][key] || key;
  args.forEach((arg, i) => {
    str = str.replace(`{${i}}`, arg);
  });
  return str;
}

function updateDOMTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.placeholder) el.placeholder = t(key);
    } else {
      el.innerHTML = t(key);
    }
  });
}

function formatDuration(seconds) {
  if (!seconds || seconds < 60) return `<1m`;
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

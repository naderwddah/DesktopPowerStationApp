// assets/js/common.js
// وظائف مشتركة عامة (مدمج: الإصدارات القديمة العاملة + تحديثات 2025-11-10)
// يتضمن: tailwind config (وقت التشغيل)، تحميل partials (sidebar/header)، تهيئات الـ UI المشتركة
// تم الدمج والتأكد من عدم تكرار التعاريف الأساسية.
// أنشئ/محدَّث: 2025-11-11

/* ---------- Tailwind runtime config (يمكن استخدامه بواسطة tailwind.js) ---------- */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#475569",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444"
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
        button: "8px",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
};

/* ---------- دوال مساعدة لتحميل HTML (partials) ---------- */
function loadHTML(elementId, filePath, callback) {
  fetch(filePath)
    .then(response => {
      if (!response.ok) throw new Error('Failed to load ' + filePath);
      return response.text();
    })
    .then(data => {
      const el = document.getElementById(elementId);
      if (el) el.innerHTML = data;
      if (typeof callback === 'function') callback();
    })
    .catch(error => console.error('Error loading HTML:', error));
}

/* ---------- استرجاع اسم الصفحة الحالي ---------- */
function getCurrentPage() {
  try {
    const path = window.location.pathname || '';
    const file = path.split('/').pop() || '';
    const page = file.replace('.html', '').trim();
    return page || '';
  } catch (e) {
    return '';
  }
}

/* ---------- setActiveSidebarLink و initSidebarClickHandler (مع pulse effect) ---------- */
function setActiveSidebarLink() {
  const currentPage = getCurrentPage();
  const sidebarLinks = document.querySelectorAll('#sidebar .sidebar-link');

  if (!sidebarLinks || sidebarLinks.length === 0) return;

  // إزالة الفئة النشطة من جميع الروابط
  sidebarLinks.forEach(link => {
    link.classList.remove('active', 'text-primary');
    // إزالة أي ستايل مؤقت
    link.style.animation = '';
  });

  // أولاً حاول مطابقه حسب data-page
  let matched = null;
  if (currentPage) {
    matched = Array.from(sidebarLinks).find(link => {
      const linkPage = (link.getAttribute('data-page') || '').trim();
      return linkPage && linkPage.toLowerCase() === currentPage.toLowerCase();
    });
  }

  // ثانياً: مطابقه حسب href filename
  if (!matched) {
    const currentFile = (window.location.pathname || '').split('/').pop();
    matched = Array.from(sidebarLinks).find(link => {
      const href = link.getAttribute('href') || '';
      return href.split('/').pop() === currentFile;
    });
  }

  // أخيراً: استخدم أول رابط إن لم نجد مطابقاً
  if (!matched && sidebarLinks.length) matched = sidebarLinks[0];

  if (matched) {
    matched.classList.add('active', 'text-primary');

    // تأثير نبض خفيف واحد عند التحميل لتحسين الـUX
    try {
      matched.style.animation = 'pulse 0.5s ease-in-out';
      setTimeout(() => { matched.style.animation = ''; }, 500);
    } catch (e) { /* ignore */ }
  }
}

function initSidebarClickHandler() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  // حذف أي مستمع سابق لمنع التكرار عند إعادة التحميل
  sidebar.removeEventListener('click', _sidebarClickHandler);
  sidebar.addEventListener('click', _sidebarClickHandler);
}
function _sidebarClickHandler(e) {
  const a = e.target.closest && e.target.closest('a.sidebar-link');
  if (!a) return;
  const links = document.querySelectorAll('#sidebar .sidebar-link');
  links.forEach(l => l.classList.remove('active', 'text-primary'));
  a.classList.add('active', 'text-primary');
  // لاحقاً: إذا كان التنقل داخلي (AJAX) يمكن منع السلوك الافتراضي هنا
  // e.preventDefault();
}

/* exposed globally in case صفحة أخرى تريد استدعاؤها مباشرة */
window.setActiveSidebarLink = setActiveSidebarLink;
window.initSidebarClickHandler = initSidebarClickHandler;

/* ---------- Sidebar toggle (mobile) ---------- */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!sidebar) return;

  sidebar.classList.toggle('show');

  if (window.innerWidth < 768) {
    if (sidebar.classList.contains('show')) {
      if (!overlay) {
        const newOverlay = document.createElement('div');
        newOverlay.id = 'sidebarOverlay';
        newOverlay.className = 'sidebar-overlay';
        newOverlay.addEventListener('click', toggleSidebar);
        document.body.appendChild(newOverlay);
      }
    } else {
      if (overlay) overlay.remove();
    }
  }
}

/* ---------- Dropdowns، Mobile Menu، Search، Date ---------- */
function initDropdowns() {
  const languageBtn = document.getElementById('languageBtn');
  const languageDropdown = document.getElementById('languageDropdown');

  if (languageBtn && languageDropdown) {
    languageBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      languageDropdown.classList.toggle('hidden');
      const notificationDropdown = document.getElementById('notificationDropdown');
      if (notificationDropdown) notificationDropdown.classList.add('hidden');
    });
  }

  const notificationBtn = document.getElementById('notificationBtn');
  const notificationDropdown = document.getElementById('notificationDropdown');

  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      notificationDropdown.classList.toggle('hidden');
      if (languageDropdown) languageDropdown.classList.add('hidden');
    });
  }

  // إخفاء القوائم عند النقر خارجها
  document.addEventListener('click', function () {
    if (languageDropdown) languageDropdown.classList.add('hidden');
    if (notificationDropdown) notificationDropdown.classList.add('hidden');
  });
}

function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleSidebar);
}

function initSearch() {
  const searchInput = document.querySelector('input[placeholder="بحث..."], input[placeholder="بحث عن عميل..."], input[placeholder="بحث عن فاتورة..."]');
  if (searchInput) {
    searchInput.addEventListener('keyup', function (e) {
      if (e.key === 'Enter') {
        const searchTerm = this.value.trim();
        if (searchTerm) {
          // توجيه المستخدم إلى صفحة نتائج البحث (إن كانت موجودة)
          window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
        }
      }
    });
  }
}

function updateDate() {
  const now = new Date();
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const dayName = days[now.getDay()];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  const currentDateElement = document.getElementById('current-date');
  if (currentDateElement) currentDateElement.textContent = `${dayName} ${day} ${month} ${year}`;
}

/* ---------- Tabs init (attach after DOM injection) ---------- */
function initTabsInline() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    // Remove existing listeners by cloning node (simple way) to avoid duplicate handlers
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".tab-btn").forEach((b) => {
        b.classList.remove("active", "text-primary");
        b.classList.add("text-gray-500");
      });
      this.classList.add("active", "text-primary");
      this.classList.remove("text-gray-500");

      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
      const contentId = this.id.replace("tab-", "content-");
      const contentEl = document.getElementById(contentId);
      if (contentEl) contentEl.classList.add("active");
    });
  });
}

/* ---------- Custom select simple implementation ---------- */
function initCustomSelects() {
  const customSelects = document.querySelectorAll(".custom-select");
  if (!customSelects || customSelects.length === 0) return;

  customSelects.forEach((select) => {
    const selected = select.querySelector(".custom-select-selected");
    const options = select.querySelector(".custom-select-options");
    const optionItems = select.querySelectorAll(".custom-select-option");

    if (!selected || !options) return;

    selected.addEventListener("click", (e) => {
      e.stopPropagation();
      options.style.display = options.style.display === "block" ? "none" : "block";
    });

    optionItems.forEach((option) => {
      option.addEventListener("click", () => {
        const span = selected.querySelector("span");
        if (span) span.textContent = option.textContent;
        options.style.display = "none";
      });
    });

    document.addEventListener("click", (e) => {
      if (!select.contains(e.target)) {
        options.style.display = "none";
      }
    });
  });
}

/* ---------- Utility: render tab default if none active ---------- */
function ensureDefaultTab() {
  const anyActive = document.querySelector(".tab-btn.active");
  if (anyActive) {
    // ensure content shown
    const contentId = anyActive.id.replace("tab-", "content-");
    const contentEl = document.getElementById(contentId);
    if (contentEl) {
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
      contentEl.classList.add("active");
    }
    return;
  }
  const firstBtn = document.querySelector(".tab-btn");
  if (firstBtn) firstBtn.click();
}

/* ---------- Init page function (central) ---------- */
function initPage() {
  updateDate();
  setActiveSidebarLink();
  initSidebarClickHandler();
  initDropdowns();
  initMobileMenu();
  initSearch();
  initTabsInline();
  initCustomSelects();
  ensureDefaultTab();
}

/* ---------- DOMContentLoaded: load partials then init ---------- */
document.addEventListener('DOMContentLoaded', function () {
  // Load sidebar then header then init page
  loadHTML('sidebar', 'sidebar.html', function () {
    try { setActiveSidebarLink(); } catch (e) { /* ignore */ }
    try { initSidebarClickHandler(); } catch (e) { /* ignore */ }
    // After sidebar injected, attach tab handlers if any are already present
    try { initTabsInline(); } catch (e) { /* ignore */ }
    // After sidebar load, also attach custom selects if present
    try { initCustomSelects(); } catch (e) { /* ignore */ }
  });

  loadHTML('header', 'header.html', function () {
    // header-specific init if needed
  });

  // small delay to allow injected parts to settle, then run main init
  setTimeout(function () {
    try { initPage(); } catch (e) { console.warn('initPage error', e); }
  }, 120);
});

/* ---------- Resize handler ---------- */
window.addEventListener('resize', function () {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (window.innerWidth >= 768 && sidebar) {
    sidebar.classList.remove('show');
    if (overlay) overlay.remove();
  }
});

/* ---------- Add pulse keyframes (runtime) ---------- */
(function injectPulseStyle() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { transform: translateX(-5px) scale(1); }
      50% { transform: translateX(-8px) scale(1.02); }
      100% { transform: translateX(-5px) scale(1); }
    }
  `;
  document.head.appendChild(style);
})();

/* ---------- Export some helpers globally if needed ---------- */
window.loadHTML = loadHTML;
window.toggleSidebar = toggleSidebar;
window.initPage = initPage;
window.initTabsInline = initTabsInline;
window.initCustomSelects = initCustomSelects;

/* ---------- End of common.js ---------- */
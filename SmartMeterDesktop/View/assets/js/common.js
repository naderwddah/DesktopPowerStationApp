// assets/js/common.js
// ملف مشترك لكل الصفحات:
// - إعداد tailwind في وقت التشغيل
// - تحميل الـ partials (sidebar / header) من مجلد partials
// - تهيئة الـ Sidebar / Header / Dropdowns / Tabs / تاريخ اليوم
// تم التحديث ليدعم تعدد مجموعات التبويبات في نفس الصفحة.

/* ---------- Tailwind runtime config ---------- */
if (window.tailwind) {
    window.tailwind.config = {
        theme: {
            extend: {
                colors: {
                    primary: "#2563eb",
                    secondary: "#475569",
                    success: "#10b981",
                    warning: "#f59e0b",
                    danger: "#ef4444",
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
                    "fade-in": "fadeIn 0.5s ease-in-out",
                    "slide-up": "slideUp 0.3s ease-out",
                    "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                },
                keyframes: {
                    fadeIn: {
                        "0%": { opacity: "0" },
                        "100%": { opacity: "1" },
                    },
                    slideUp: {
                        "0%": { transform: "translateY(10px)", opacity: "0" },
                        "100%": { transform: "translateY(0)", opacity: "1" },
                    },
                },
            },
        },
    };
}

/* ---------- دالة مساعدة لتحميل partial HTML ---------- */
/**
 * @param {string} elementId - الـ element الذي سيتم الحقن فيه (مثل "sidebar")
 * @param {string} filePath  - المسار النسبي لملف الـ HTML (من منظور الصفحة)
 * @param {function} [callback] - دالة تُستدعى بعد التحميل
 */
function loadHTML(elementId, filePath, callback) {
    fetch(filePath)
        .then((response) => {
            if (!response.ok) throw new Error("Failed to load " + filePath);
            return response.text();
        })
        .then((data) => {
            const el = document.getElementById(elementId);
            if (el) el.innerHTML = data;
            if (typeof callback === "function") callback();
        })
        .catch((error) => {
            console.error("Error loading HTML:", filePath, error);
        });
}

/* ---------- اسم الصفحة الحالي (بدون .html) ---------- */
function getCurrentPage() {
    try {
        const path = window.location.pathname || "";
        const file = path.split("/").pop() || "";
        const page = file.replace(".html", "").trim();
        return page || "";
    } catch (e) {
        return "";
    }
}

/* ---------- تمييز رابط الصفحة النشطة في الـ Sidebar ---------- */
function setActiveSidebarLink() {
    const currentPage = getCurrentPage();
    const sidebarLinks = document.querySelectorAll("#sidebar .sidebar-link");

    if (!sidebarLinks || sidebarLinks.length === 0) return;

    sidebarLinks.forEach((link) => {
        link.classList.remove("active", "text-primary");
        link.style.animation = "";
    });

    let matched = null;

    // 1) مطابقة حسب data-page
    if (currentPage) {
        matched = Array.from(sidebarLinks).find((link) => {
            const linkPage = (link.getAttribute("data-page") || "").trim();
            return (
                linkPage && linkPage.toLowerCase() === currentPage.toLowerCase()
            );
        });
    }

    // 2) مطابقة حسب اسم الملف في href
    if (!matched) {
        const currentFile = (window.location.pathname || "").split("/").pop();
        matched = Array.from(sidebarLinks).find((link) => {
            const href = link.getAttribute("href") || "";
            return href.split("/").pop() === currentFile;
        });
    }

    // 3) إن لم نجد مطابقاً، نستخدم أول رابط
    if (!matched && sidebarLinks.length) matched = sidebarLinks[0];

    if (matched) {
        matched.classList.add("active", "text-primary");
        try {
            matched.style.animation = "pulse 0.5s ease-in-out";
            setTimeout(() => {
                matched.style.animation = "";
            }, 500);
        } catch (e) {
            /* ignore */
        }
    }
}

/* ---------- التعامل مع نقرات الـ Sidebar (تفعيل الرابط) ---------- */
function _sidebarClickHandler(e) {
    const a = e.target.closest && e.target.closest("a.sidebar-link");
    if (!a) return;
    const links = document.querySelectorAll("#sidebar .sidebar-link");
    links.forEach((l) => l.classList.remove("active", "text-primary"));
    a.classList.add("active", "text-primary");
}

function initSidebarClickHandler() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    sidebar.removeEventListener("click", _sidebarClickHandler);
    sidebar.addEventListener("click", _sidebarClickHandler);
}

window.setActiveSidebarLink = setActiveSidebarLink;
window.initSidebarClickHandler = initSidebarClickHandler;

/* ---------- إظهار/إخفاء الـ Sidebar (موبايل) ---------- */
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!sidebar) return;

    sidebar.classList.toggle("show");

    if (window.innerWidth < 768) {
        if (sidebar.classList.contains("show")) {
            if (!overlay) {
                const newOverlay = document.createElement("div");
                newOverlay.id = "sidebarOverlay";
                newOverlay.className = "sidebar-overlay";
                newOverlay.addEventListener("click", toggleSidebar);
                document.body.appendChild(newOverlay);
            }
        } else {
            if (overlay) overlay.remove();
        }
    }
}
window.toggleSidebar = toggleSidebar;

/* ---------- Dropdowns (اللغة/الإشعارات) + قائمة الموبايل + البحث ---------- */
function initDropdowns() {
    const languageBtn = document.getElementById("languageBtn");
    const languageDropdown = document.getElementById("languageDropdown");
    const notificationBtn = document.getElementById("notificationBtn");
    const notificationDropdown = document.getElementById("notificationDropdown");

    if (languageBtn && languageDropdown) {
        languageBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            languageDropdown.classList.toggle("hidden");
            if (notificationDropdown) notificationDropdown.classList.add("hidden");
        });
    }

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle("hidden");
            if (languageDropdown) languageDropdown.classList.add("hidden");
        });
    }

    document.addEventListener("click", function () {
        if (languageDropdown) languageDropdown.classList.add("hidden");
        if (notificationDropdown) notificationDropdown.classList.add("hidden");
    });
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", toggleSidebar);
}

function initSearch() {
    const selector =
        'input[placeholder="بحث..."], input[placeholder="بحث عن عميل..."], input[placeholder="بحث عن فاتورة..."]';
    const searchInput = document.querySelector(selector);
    if (searchInput) {
        searchInput.addEventListener("keyup", function (e) {
            if (e.key === "Enter") {
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    window.location.href =
                        "search.html?q=" + encodeURIComponent(searchTerm);
                }
            }
        });
    }
}

/* ---------- تاريخ اليوم في العنصر #current-date ---------- */
function updateDate() {
    const now = new Date();
    const days = [
        "الأحد",
        "الاثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
    ];
    const months = [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
    ];
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    const currentDateElement = document.getElementById("current-date");
    if (currentDateElement) {
        currentDateElement.textContent = `${dayName} ${day} ${month} ${year}`;
    }
}

/* ---------- Tabs (يدعم عدة مجموعات Tabs في نفس الصفحة) ---------- */
/*
  القواعد:
  - زر التبويب: class="tab-btn"
    * يمكن أن يحمل data-tab-group (اسم المجموعة – اختياري، الافتراضي "default")
    * يمكن أن يحمل data-tab-key (مفتاح التبويب – اختياري)
    * إن لم يوجد data-tab-key: نأخذ من id بعد "tab-"
  - محتوى التبويب: class="tab-content"
    * يمكن أن يحمل data-tab-group (نفس اسم المجموعة)
    * يمكن أن يحمل data-tab-key
    * إن لم يوجد data-tab-key: نأخذ من id بعد "content-"
  - عند الضغط على زر تبويب:
    * نخفي جميع tab-content في نفس المجموعة (add hidden / remove active)
    * نظهر المحتوى الموافق (remove hidden / add active)
*/
function initTabsInline() {
    const buttons = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");

    if (!buttons.length || !contents.length) return;

    // تنظيف الـ listeners القديمة بطريقة استبدال العقد
    const btnArray = Array.from(buttons);
    btnArray.forEach((btn) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });

    const freshButtons = document.querySelectorAll(".tab-btn");

    // تجهيز خريطة المجموعات
    const groups = {};

    freshButtons.forEach((btn) => {
        const group = btn.dataset.tabGroup || "default";
        if (!groups[group]) {
            groups[group] = { buttons: [], contents: [] };
        }
        groups[group].buttons.push(btn);
    });

    contents.forEach((c) => {
        const group = c.dataset.tabGroup || "default";
        if (!groups[group]) {
            groups[group] = { buttons: [], contents: [] };
        }
        groups[group].contents.push(c);
    });

    // إضافة الحدث لكل زر
    Object.keys(groups).forEach((groupName) => {
        const group = groups[groupName];

        group.buttons.forEach((btn) => {
            btn.addEventListener("click", function () {
                const key =
                    this.dataset.tabKey ||
                    (this.id && this.id.indexOf("tab-") === 0
                        ? this.id.substring(4)
                        : "");

                // 1) تحديث مظهر الأزرار في هذه المجموعة فقط
                group.buttons.forEach((b) => {
                    b.classList.remove("active", "text-primary");
                    b.classList.add("text-gray-500");
                });
                this.classList.add("active", "text-primary");
                this.classList.remove("text-gray-500");

                // 2) إظهار/إخفاء المحتويات في هذه المجموعة فقط
                group.contents.forEach((c) => {
                    c.classList.remove("active");
                    c.classList.add("hidden");
                });

                if (!key) return;

                const content = group.contents.find((c) => {
                    const cKey =
                        c.dataset.tabKey ||
                        (c.id && c.id.indexOf("content-") === 0
                            ? c.id.substring(8)
                            : "");
                    return cKey === key;
                });

                if (content) {
                    content.classList.add("active");
                    content.classList.remove("hidden");
                }
            });
        });
    });
}

/* ---------- اختيار افتراضي للتبويبات لكل مجموعة ---------- */
function ensureDefaultTab() {
    const buttons = document.querySelectorAll(".tab-btn");
    if (!buttons.length) return;

    // إعادة بناء نفس خريطة المجموعات
    const groups = {};
    buttons.forEach((btn) => {
        const group = btn.dataset.tabGroup || "default";
        if (!groups[group]) groups[group] = { buttons: [] };
        groups[group].buttons.push(btn);
    });

    Object.keys(groups).forEach((groupName) => {
        const group = groups[groupName];
        if (!group.buttons.length) return;

        // إن كان هناك زر active في المجموعة، استعمله، وإلا أول زر
        let targetBtn =
            group.buttons.find((b) => b.classList.contains("active")) ||
            group.buttons[0];

        // محاكاة الضغط عليه لتفعيل نفس منطق initTabsInline
        if (targetBtn) targetBtn.click();
    });
}

/* ---------- Custom select بسيط ---------- */
function initCustomSelects() {
    const customSelects = document.querySelectorAll(".custom-select");
    if (!customSelects || !customSelects.length) return;

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

/* ---------- تهيئة الصفحة (مرة واحدة بعد تحميل partials) ---------- */
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

window.initPage = initPage;
window.initTabsInline = initTabsInline;
window.initCustomSelects = initCustomSelects;

/* ---------- تحميل الـ partials من مجلد partials ---------- */
/*
  نفترض أن الصفحات موجودة في View/pages/
  والـ partials في View/partials/
  لذا من منظور الصفحة: ../partials/sidebar.html و ../partials/header.html
*/
document.addEventListener("DOMContentLoaded", function () {
    // تحميل الـ Sidebar
    loadHTML("sidebar", "../partials/sidebar.html", function () {
        try {
            setActiveSidebarLink();
            initSidebarClickHandler();
        } catch (e) {
            console.warn("Sidebar init error:", e);
        }
    });

    // تحميل الـ Header
    loadHTML("header", "../partials/header.html", function () {
        try {
            initDropdowns();
            initMobileMenu();
        } catch (e) {
            console.warn("Header init error:", e);
        }
    });

    // بعد فترة بسيطة (لضمان تحميل الـ partials)، نهيّئ الصفحة
    setTimeout(function () {
        try {
            initPage();
        } catch (e) {
            console.warn("initPage error", e);
        }
    }, 150);
});

/* ---------- Resize handler (إغلاق الـ Sidebar في الشاشات الكبيرة) ---------- */
window.addEventListener("resize", function () {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (window.innerWidth >= 768 && sidebar) {
        sidebar.classList.remove("show");
        if (overlay) overlay.remove();
    }
});

/* ---------- حقن keyframes للـ pulse إن لم توجد ---------- */
(function injectPulseStyle() {
    const style = document.createElement("style");
    style.textContent = `
    @keyframes pulse {
      0% { transform: translateX(-5px) scale(1); }
      50% { transform: translateX(-8px) scale(1.02); }
      100% { transform: translateX(-5px) scale(1); }
    }
  `;
    document.head.appendChild(style);
})();

// View/assets/js/dashboard.ui.js
// كود الواجهة (UI Logic) المنقول من dashboard.html (inline scripts).
// أنشئ بتاريخ 2025-11-10. المصدر: dashboard.html (عدة دوال وتهيئة الرسوم).
// ملاحظة: لا يحتوي هذا الملف على منطق التفاعل مع C# (ذلك في dashboard.data.js أو api.js).

(function () {
  // -----------------------
  // Helpers / DOM utilities
  // -----------------------
  function loadHTML(elementId, filePath, callback) {
    fetch(filePath)
      .then(response => response.text())
      .then(data => {
        const el = document.getElementById(elementId);
        if (el) el.innerHTML = data;
        if (callback) callback();
      })
      .catch(error => console.error('Error loading HTML:', error));
  }

  function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    return page || 'dashboard';
  }

  // -----------------------
  // Date display (Arabic)
  // -----------------------
  function updateDate() {
    const now = new Date();
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
      currentDateElement.textContent = `${dayName} ${day} ${month} ${year}`;
    }
  }

  // -----------------------
  // Sidebar / mobile menu
  // -----------------------
  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar) {
      sidebar.classList.toggle('show');

      if (window.innerWidth < 768) {
        if (sidebar.classList.contains('show')) {
          // إنشاء عنصر التغطية إذا لم يكن موجودًا
          if (!overlay) {
            const newOverlay = document.createElement('div');
            newOverlay.id = 'sidebarOverlay';
            newOverlay.className = 'sidebar-overlay';
            newOverlay.addEventListener('click', toggleSidebar);
            document.body.appendChild(newOverlay);
          }
        } else if (overlay) {
          overlay.remove();
        }
      }
    }
  }

  function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', toggleSidebar);
    }
  }

  // -----------------------
  // Search
  // -----------------------
  function initSearch() {
    const searchInput = document.querySelector('input[placeholder="بحث..."]');
    if (searchInput) {
      searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
          const searchTerm = this.value.trim();
          if (searchTerm) {
            window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
          }
        }
      });
    }
  }

  // -----------------------
  // Dropdowns (header)
  // -----------------------
  function initDropdowns() {
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');

    if (languageBtn && languageDropdown) {
      languageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        languageDropdown.classList.toggle('hidden');

        const notificationDropdown = document.getElementById('notificationDropdown');
        if (notificationDropdown) {
          notificationDropdown.classList.add('hidden');
        }
      });
    }

    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (notificationBtn && notificationDropdown) {
      notificationBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        notificationDropdown.classList.toggle('hidden');

        if (languageDropdown) {
          languageDropdown.classList.add('hidden');
        }
      });
    }

    document.addEventListener('click', function() {
      if (languageDropdown) languageDropdown.classList.add('hidden');
      if (notificationDropdown) notificationDropdown.classList.add('hidden');
    });
  }

  // -----------------------
  // Sidebar active link
  // -----------------------
  function setActiveSidebarLink() {
    const currentPage = getCurrentPage();
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    sidebarLinks.forEach(link => {
      link.classList.remove('active');
    });

    sidebarLinks.forEach(link => {
      const linkPage = link.getAttribute('data-page');
      if (linkPage === currentPage) {
        link.classList.add('active');
        link.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => { link.style.animation = ''; }, 500);
      }
    });
  }

  // -----------------------
  // Tabs navigation
  // -----------------------
  function initTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        document
          .querySelectorAll(".tab-btn")
          .forEach((b) => b.classList.remove("active", "text-primary"));
        this.classList.add("active", "text-primary");
        document
          .querySelectorAll(".tab-content")
          .forEach((c) => c.classList.remove("active"));
        const contentId = this.id.replace("tab-", "content-");
        const contentEl = document.getElementById(contentId);
        if (contentEl) contentEl.classList.add("active");
      });
    });
  }

  // -----------------------
  // Custom select component
  // -----------------------
  function initCustomSelects() {
    const customSelects = document.querySelectorAll(".custom-select");
    customSelects.forEach((select) => {
      const selected = select.querySelector(".custom-select-selected");
      const options = select.querySelector(".custom-select-options");
      const optionItems = select.querySelectorAll(".custom-select-option");

      if (!selected) return;

      selected.addEventListener("click", () => {
        options.style.display =
          options.style.display === "block" ? "none" : "block";
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

  // -----------------------
  // Charts initialization (uses echarts)
  // -----------------------
  function initCharts() {
    try {
      const consumptionChartEl = document.getElementById("consumptionChart");
      if (consumptionChartEl && window.echarts) {
        const consumptionChart = echarts.init(consumptionChartEl);
        const consumptionOption = {
          animation: false,
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderColor: "#f0f0f0",
            textStyle: { color: "#1f2937" },
          },
          grid: { top: 10, right: 10, bottom: 20, left: 40 },
          xAxis: {
            type: "category",
            data: ["ديسمبر", "يناير", "فبراير", "مارس", "أبريل", "مايو"],
            axisLine: { lineStyle: { color: "#e5e7eb" } },
            axisLabel: { color: "#1f2937" },
          },
          yAxis: {
            type: "value",
            axisLine: { show: false },
            axisLabel: { color: "#1f2937" },
            splitLine: { lineStyle: { color: "#f3f4f6" } },
          },
          series: [
            {
              name: "الاستهلاك (ميجاواط)",
              type: "line",
              smooth: true,
              data: [4200, 3800, 4500, 5200, 4800, 6000],
              lineStyle: { color: "rgba(87, 181, 231, 1)" },
              itemStyle: { color: "rgba(87, 181, 231, 1)" },
              showSymbol: false,
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "rgba(87, 181, 231, 0.2)" },
                  { offset: 1, color: "rgba(87, 181, 231, 0.05)" },
                ]),
              },
            },
          ],
        };
        consumptionChart.setOption(consumptionOption);

        // resize on window resize
        window.addEventListener("resize", function() {
          consumptionChart.resize();
        });
      }

      const collectionChartEl = document.getElementById("collectionChart");
      if (collectionChartEl && window.echarts) {
        const collectionChart = echarts.init(collectionChartEl);
        const collectionOption = {
          animation: false,
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderColor: "#f0f0f0",
            textStyle: { color: "#1f2937" },
          },
          grid: { top: 10, right: 10, bottom: 20, left: 40 },
          xAxis: {
            type: "category",
            data: ["ديسمبر", "يناير", "فبراير", "مارس", "أبريل", "مايو"],
            axisLine: { lineStyle: { color: "#e5e7eb" } },
            axisLabel: { color: "#1f2937" },
          },
          yAxis: {
            type: "value",
            axisLine: { show: false },
            axisLabel: { color: "#1f2937", formatter: "{value}%" },
            splitLine: { lineStyle: { color: "#f3f4f6" } },
          },
          series: [
            {
              name: "نسبة التحصيل",
              type: "bar",
              data: [68, 72, 76, 82, 78, 85],
              barWidth: "40%",
              itemStyle: {
                color: "rgba(141, 211, 199, 1)",
                borderRadius: [4, 4, 0, 0],
              },
            },
            {
              name: "المستهدف",
              type: "line",
              smooth: true,
              data: [70, 72, 75, 78, 80, 85],
              lineStyle: { color: "rgba(251, 191, 114, 1)", type: "dashed" },
              itemStyle: { color: "rgba(251, 191, 114, 1)" },
              showSymbol: false,
            },
          ],
        };
        collectionChart.setOption(collectionOption);

        // resize on window resize
        window.addEventListener("resize", function() {
          collectionChart.resize();
        });
      }
    } catch (err) {
      console.error('Failed to initialize charts', err);
    }
  }

  // -----------------------
  // Tailwind config (منقولة من الصفحه)
  // -----------------------
  // ملاحظة: هذا التكوين يعتمد وجود ملف tailwind.js الذي يستعمل هذا الكائن
  if (typeof tailwind !== 'undefined') {
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
  }

  // -----------------------
  // initPage: تهيئة الصفحة
  // -----------------------
  function initPage() {
    updateDate();
    setActiveSidebarLink();
    initDropdowns();
    initMobileMenu();
    initSearch();
    initTabs();
    initCustomSelects();
    initCharts();
  }

  // Listen for DOM ready and load header/sidebar then init
  document.addEventListener('DOMContentLoaded', function() {
    loadHTML('sidebar', 'sidebar.html', function() {
      loadHTML('header', 'header.html', function() {
        initPage();
      });
    });
  });

  // Global resize handler to manage sidebar state
  window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (window.innerWidth >= 768 && sidebar) {
      sidebar.classList.remove('show');
      if (overlay) overlay.remove();
    }
  });

  // Export for testing/debug (إن احتجت)
  window.DashboardUI = {
    updateDate,
    toggleSidebar,
    initPage
  };

})();
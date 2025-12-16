// assets/js/accounting.ui.js
// UI logic لصفحة accounting (تم فصل ما كان داخل صفحة HTML).
// أنشئ بتاريخ 2025-11-11
(function () {
  // تنشيط التبويبات العامة
  function initTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".tab-btn").forEach((b) => {
          b.classList.remove("active", "text-primary");
          b.classList.add("text-gray-500");
        });
        this.classList.add("active", "text-primary");
        this.classList.remove("text-gray-500");

        document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
        const id = this.id.replace("tab-", "content-");
        const el = document.getElementById(id);
        if (el) el.classList.add("active");
      });
    });
  }

  // observer لتحريك البطاقات عند دخولها العرض
  function initObservers() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("animate-slide-up");
      });
    }, { threshold: 0.08 });

    document.querySelectorAll(".stat-card, .report-card").forEach((card) => observer.observe(card));
  }

  // رندر جدول القيود من AccountingData (بسيط)
  function renderJournalTable() {
    const tbody = document.querySelector('#content-journal .table-container tbody');
    if (!tbody || !window.AccountingData) return;
    const list = AccountingData.getJournalEntries();
    tbody.innerHTML = '';
    list.forEach(j => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(j.date)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${escapeHtml(j.ref)}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${escapeHtml(j.desc)}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${escapeHtml(j.account)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm debit">${escapeHtml(j.debit)} ريال</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm credit">${escapeHtml(j.credit)} ريال</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div class="flex items-center space-x-2 space-x-reverse">
            <button class="text-primary hover:text-blue-700"><i class="ri-eye-line"></i></button>
            <button class="text-gray-500 hover:text-gray-700"><i class="ri-edit-line"></i></button>
            <button class="text-red-500 hover:text-red-700"><i class="ri-delete-bin-line"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s){ if (typeof s !== 'string') return s; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

  function initPage() {
    initTabs();
    initObservers();
    renderJournalTable();

    // تعيين رابط الشريط الجانبي النشط أيضاً لو لم يفعل بعد
    if (typeof setActiveSidebarLink === 'function') {
      try { setActiveSidebarLink(); } catch (e) { /* ignore */ }
    }
  }

  // Expose initPage so main HTML loader can call it after header/sidebar injection
  window.AccountingUI = { initPage };
})();
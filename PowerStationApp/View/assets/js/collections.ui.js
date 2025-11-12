// assets/js/collections.ui.js
// ملف منطق الواجهة (UI Logic) الخاص بصفحة collections.
// أنشئ بتاريخ 2025-11-10.
// يعتمد على CollectionsData (collections.data.js) و على common.js للوظائف المشتركة.

(function () {
  function initTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active", "text-primary"));
        this.classList.add("active", "text-primary");
        document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
        const contentId = this.id.replace("tab-", "content-");
        const contentEl = document.getElementById(contentId);
        if (contentEl) contentEl.classList.add("active");
      });
    });
  }

  function initCharts() {
    // إذا كنت تستخدم echarts في هذه الصفحة فعّل التهيئة هنا.
    try {
      if (window.echarts) {
        const el = document.getElementById('paymentsChart');
        if (el) {
          const chart = echarts.init(el);
          const opt = {
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: ['يناير','فبراير','مارس','أبريل','مايو'] },
            yAxis: { type: 'value' },
            series: [{ name: 'مدفوعات', type: 'bar', data: [120, 200, 150, 80, 170] }]
          };
          chart.setOption(opt);
          window.addEventListener('resize', () => chart.resize());
        }
      }
    } catch (e) {
      console.warn('initCharts error', e);
    }
  }

  function renderPaymentsTable() {
    const tbody = document.querySelector('.table-container .data-table tbody');
    if (!tbody) return;
    const list = CollectionsData.getPayments();
    tbody.innerHTML = '';
    list.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-4 py-3 font-medium text-gray-900">${escapeHtml(p.id)}</td>
        <td class="px-4 py-3 text-gray-500">${escapeHtml(p.invoice)}</td>
        <td class="px-4 py-3 text-gray-500">${escapeHtml(p.customer)}</td>
        <td class="px-4 py-3 text-gray-500">${escapeHtml(p.method)}</td>
        <td class="px-4 py-3 text-gray-500">${escapeHtml(p.amount)}</td>
        <td class="px-4 py-3 text-gray-500">${escapeHtml(p.date)}</td>
        <td class="px-4 py-3"><span class="status-badge ${p.status === 'مكتمل' ? 'status-active' : 'status-pending'}">${escapeHtml(p.status)}</span></td>
        <td class="px-4 py-3">
          <div class="flex items-center space-x-2 space-x-reverse">
            <button class="text-primary hover:text-blue-700" title="عرض"><i class="ri-eye-line"></i></button>
            <button class="text-gray-500 hover:text-gray-700" title="طباعة"><i class="ri-printer-line"></i></button>
            <button class="text-red-500 hover:text-red-700" title="إلغاء"><i class="ri-delete-bin-line"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  function initPage() {
    initTabs();
    initCharts();
    renderPaymentsTable();

    // تأكد من تعيين رابط الشريط الجانبي النشط إذا لم يتم بعد
    if (typeof setActiveSidebarLink === 'function') {
      try { setActiveSidebarLink(); } catch (e) { /* ignore */ }
    }
  }

  // تصدير واجهة بسيطة
  window.CollectionsUI = { initPage, renderPaymentsTable };

  // إذا تم تحميل DOM قبل إدراج header/sidebar الفني، ستستدعي الصفحة initPage بعد تحميل الهيدر (page loader)
})();
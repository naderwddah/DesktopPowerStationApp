// View/assets/js/customers.ui.js
// أنشئ بتاريخ 2025-11-10
// جميع دوال الواجهة (DOM) المأخوذة من سكربت الصفحة الأصلية.
// يعتمد هذا الملف على window.CustomersData (customers.data.js) و on common.js / api.js عند الحاجة.

/* eslint-disable no-unused-vars */
(function () {
  // --- مساعدة لتحميل أجزاء الواجهة (header/sidebar) ---
  function loadHTML(elementId, filePath, callback) {
    fetch(filePath)
      .then((response) => response.text())
      .then((data) => {
        const el = document.getElementById(elementId);
        if (el) el.innerHTML = data;
        if (callback) callback();
      })
      .catch((error) => console.error("Error loading HTML:", error));
  }

  // --- render customers (DOM) ---
  function renderCustomers(list) {
    const cont = document.getElementById("customers-list");
    if (!cont) return;
    cont.innerHTML = "";
    list.forEach((c, index) => {
      // نستخدم animate-slide-up مع ضبط delay ديناميكي
      const card = document.createElement("div");
      card.className = "customer-card bg-white rounded-lg shadow-sm overflow-hidden animate-slide-up";
      card.style.animationDelay = `${index * 0.08}s`;
      card.innerHTML = `
        <div class="card-header p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold text-gray-800">${escapeHtml(c.fullName)}</h3>
            <div class="flex items-center">
              <label class="custom-switch mr-2">
                <input type="checkbox" ${c.status === "نشط" ? "checked" : ""} />
                <span class="switch-slider"></span>
              </label>
              <span class="text-xs ${c.status == "نشط" ? "text-green-600" : "text-red-600"}">${escapeHtml(c.status)}</span>
            </div>
          </div>
          <p class="text-sm text-gray-500">رقم العداد: ${escapeHtml(c.meterNumber)}</p>
        </div>
        <div class="p-4">
          <div class="flex items-start mb-3">
            <div class="w-5 h-5 flex items-center justify-center mt-0.5 ml-2 text-gray-400">
              <i class="ri-map-pin-line"></i>
            </div>
            <p class="text-sm text-gray-600">${escapeHtml(c.address)}</p>
          </div>
          <div class="flex items-center mb-3">
            <div class="w-5 h-5 flex items-center justify-center ml-2 text-gray-400">
              <i class="ri-phone-line"></i>
            </div>
            <p class="text-sm text-gray-600">${escapeHtml(c.phone)}</p>
          </div>
          <div class="flex items-center mb-3">
            <div class="w-5 h-5 flex items-center justify-center ml-2 text-gray-400">
              <i class="ri-mail-line"></i>
            </div>
            <p class="text-sm text-gray-600">${escapeHtml(c.email)}</p>
          </div>
        </div>
        <div class="flex border-t border-gray-100">
          <button class="flex-1 py-3 text-sm text-primary hover:bg-blue-50 transition-colors btn-view">
            <i class="ri-eye-line ml-1"></i>عرض التفاصيل
          </button>
          <button class="flex-1 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors border-r border-l border-gray-100 btn-edit">
            <i class="ri-edit-line ml-1"></i>تعديل
          </button>
          <button class="flex-1 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors btn-delete">
            <i class="ri-delete-bin-line ml-1"></i>حذف
          </button>
        </div>
      `;
      // Events delegation for each card buttons
      const viewBtn = card.querySelector(".btn-view");
      const editBtn = card.querySelector(".btn-edit");
      const delBtn = card.querySelector(".btn-delete");
      const switchInput = card.querySelector('.custom-switch input[type="checkbox"]');

      viewBtn && viewBtn.addEventListener("click", () => {
        showNotification(`عرض تفاصيل ${c.fullName}`, "info");
      });
      editBtn && editBtn.addEventListener("click", () => {
        showNotification(`تعديل ${c.fullName}`, "info");
      });
      delBtn && delBtn.addEventListener("click", () => {
        // حذف من القائمة المحلية
        const all = CustomersData._internal.customers;
        const idx = all.findIndex(x => x.meterNumber === c.meterNumber && x.cardNumber === c.cardNumber);
        if (idx > -1) {
          all.splice(idx, 1);
          filterAndRenderCustomers();
          showNotification("تم حذف العميل", "success");
        }
      });
      if (switchInput) {
        switchInput.addEventListener("change", (ev) => {
          c.status = ev.target.checked ? "نشط" : "غير نشط";
          // ممكن إرسال تغيير الحالة إلى HostApi هنا
        });
      }
      cont.appendChild(card);
    });
  }

  // --- فلترة العملاء وعرضهم ---
  function filterAndRenderCustomers() {
    const search = (document.getElementById("search-customer") || { value: "" }).value.trim();
    const region = (document.getElementById("filter-region") || { value: "" }).value;
    const status = (document.getElementById("filter-status") || { value: "" }).value;
    const filtered = CustomersData.filterCustomers({ search, region, status });
    renderCustomers(filtered);
  }

  // --- دالة عرض إشعار (مأخوذة من الصفحة الأصلية) ---
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 left-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white animate-slide-up ${
      type === "success" ? "bg-green-500" :
      type === "error" ? "bg-red-500" :
      type === "warning" ? "bg-yellow-500" : "bg-blue-500"
    }`;
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="ri-${type === "success" ? "check-line" : type === "error" ? "close-line" : type === "warning" ? "alert-line" : "information-line"} ml-2"></i>
        <span>${escapeHtml(message)}</span>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(-10px)";
      setTimeout(() => {
        if (notification.parentNode) notification.parentNode.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // --- helper: escape HTML to avoid injection when inserting data into DOM ---
  function escapeHtml(text) {
    if (typeof text !== "string") return text;
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- تهيئة العناصر والتواجد على DOMContentLoaded ---
  function initPage() {
    // تحميل الأجزاء المشتركة ثم تهيئة الصفحة
    loadHTML("sidebar", "sidebar.html", function () {
      loadHTML("header", "header.html", function () {
        // ملأ قائمة الأحياء بناءً على الاختيار
        const regionSelect = document.getElementById("region-select");
        if (regionSelect) {
          regionSelect.addEventListener("change", function () {
            const region = this.value;
            const districtSelect = document.getElementById("district-select");
            if (!districtSelect) return;
            districtSelect.innerHTML = '<option value="">اختر الحارة</option>';
            const ds = CustomersData.getDistricts(region);
            ds.forEach((d) => {
              const opt = document.createElement("option");
              opt.value = d;
              opt.textContent = d;
              districtSelect.appendChild(opt);
            });
          });
        }

        // العرض الأولي
        renderCustomers(CustomersData.getAllCustomers());

        // ربط عناصر البحث/التصفية
        const searchInput = document.getElementById("search-customer");
        if (searchInput) searchInput.addEventListener("input", filterAndRenderCustomers);
        const filterRegion = document.getElementById("filter-region");
        if (filterRegion) filterRegion.addEventListener("change", filterAndRenderCustomers);
        const filterStatus = document.getElementById("filter-status");
        if (filterStatus) filterStatus.addEventListener("change", filterAndRenderCustomers);

        // نموذج إضافة عميل
        const addForm = document.getElementById("add-customer-form");
        if (addForm) {
          addForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const fd = new FormData(this);
            const newC = {
              fullName: fd.get("fullName"),
              phone: fd.get("phone"),
              cardNumber: fd.get("cardNumber"),
              meterNumber: fd.get("meterNumber"),
              email: fd.get("email"),
              region: fd.get("region"),
              district: fd.get("district"),
              neighbor: fd.get("neighbor"),
              address: fd.get("address") || `${fd.get("region") || ""} ${fd.get("district") || ""}`,
              status: fd.get("status"),
            };
            CustomersData.addCustomer(newC);
            this.reset();
            renderCustomers(CustomersData.getAllCustomers());
            filterAndRenderCustomers();
            showNotification("تمت إضافة العميل بنجاح", "success");
          });
        }

        // Activate sidebar link for this page (if function exists in common or other)
        if (typeof setActiveSidebarLink === "function") {
          try { setActiveSidebarLink(); } catch (e) { /* ignore */ }
        }
      });
    });

    // Resize handler to close sidebar at large screens if needed
    window.addEventListener("resize", function () {
      const sidebar = document.getElementById("sidebar");
      const overlay = document.getElementById("sidebarOverlay");
      if (window.innerWidth >= 768 && sidebar) {
        sidebar.classList.remove("show");
        if (overlay) overlay.remove();
      }
    });

    // Tabs initialization (reuses generic .tab-btn behavior if any)
    if (document.querySelectorAll) {
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
  }

  // Start when DOM ready
  document.addEventListener("DOMContentLoaded", function () {
    initPage();
    // Trigger initial region select fill (original page dispatched change)
    const regionSelect = document.getElementById("region-select");
    if (regionSelect) regionSelect.dispatchEvent(new Event("change"));
  });

  // Export for debug/tests
  window.CustomersUI = {
    renderCustomers,
    filterAndRenderCustomers,
    showNotification,
  };
})();
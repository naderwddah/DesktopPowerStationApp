// assets/js/users.ui.js
// UI logic لفصل سكربت صفحة users.html (نُقل من السكربت المضمّن).
// يحتوي دالة init() التي تهيئ الصفحة — استدعِ UsersUI.init() بعد تحميل partials و common.js.
// أنشئ: 2025-11-11

(function (global) {
  const API_BASE_URL = "http://localhost/power-station/api/index.php";
  const authToken = localStorage.getItem("authToken");

  // عناصر ستُعاد قراءتها عند init
  let els = {};

  // حالة داخلية
  let users = [];
  let filteredUsers = [];
  let currentPage = 1;
  const itemsPerPage = 5;
  let userIdToDelete = null;
  let activeFilter = "all";

  /* ---------- Helpers ---------- */
  function $(sel, root = document) { return root.querySelector(sel); }
  function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getRoleBadgeClass(roleId) {
    switch (roleId) {
      case 1: return "bg-purple-100 text-purple-800";
      case 2: return "bg-blue-100 text-blue-800";
      case 3: return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  function getStatusBadgeClass(statusId) {
    switch (statusId) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-red-100 text-red-800";
      case 3: return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  function showToast(message, type = "success") {
    // If there's a global successToast element (from roles part) use it, otherwise fallback to alert
    const toast = document.getElementById("successToast");
    const msg = document.getElementById("successMessage");
    if (toast && msg) {
      msg.textContent = message;
      if (type === "error") {
        toast.className = "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform z-50";
      } else {
        toast.className = "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform z-50";
      }
      // show -> remove translate if present
      toast.classList.remove("translate-x-full");
      setTimeout(() => toast.classList.add("translate-x-full"), 3000);
      return;
    }
    alert(message);
  }

  async function apiRequest(endpoint, method = "GET", data = null) {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    if (data) options.body = JSON.stringify(data);
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=${endpoint}`, options);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request failed");
      return result;
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    }
  }

  /* ---------- Rendering & Pagination ---------- */
  function updateUsersCount() {
    const startIndex = filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredUsers.length);
    if (els.usersCount) els.usersCount.textContent = `عرض ${startIndex}-${endIndex} من ${filteredUsers.length} مستخدم`;
  }

  function renderPagination(totalPages) {
    if (!els.pagination) return;
    els.pagination.innerHTML = "";
    if (totalPages <= 1) return;

    const prevBtn = document.createElement("button");
    prevBtn.className = `w-9 h-9 flex items-center justify-center border border-gray-300 rounded ${currentPage === 1 ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"}`;
    prevBtn.innerHTML = '<i class="ri-arrow-right-s-line"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) { currentPage--; renderUsersTable(); updateUsersCount(); }
    });
    els.pagination.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `w-9 h-9 flex items-center justify-center border border-gray-300 rounded ${i === currentPage ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-50"}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener("click", () => {
        currentPage = i; renderUsersTable(); updateUsersCount();
      });
      els.pagination.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.className = `w-9 h-9 flex items-center justify-center border border-gray-300 rounded ${currentPage === totalPages ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"}`;
    nextBtn.innerHTML = '<i class="ri-arrow-left-s-line"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) { currentPage++; renderUsersTable(); updateUsersCount(); }
    });
    els.pagination.appendChild(nextBtn);
  }

  function renderUsersTable() {
    if (!els.usersTableBody) return;
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    els.usersTableBody.innerHTML = "";
    if (currentUsers.length === 0) {
      els.usersTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-4 text-center text-gray-500">لا يوجد مستخدمين</td>
        </tr>
      `;
      return;
    }

    currentUsers.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <label class="custom-checkbox">
              <input type="checkbox" class="user-checkbox" data-id="${user.UserID}" />
              <span class="checkmark"></span>
            </label>
            <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
              <span>${(user.Username || "").charAt(0).toUpperCase()}</span>
            </div>
            <div class="mr-3">
              <div class="text-sm font-medium text-gray-900">${user.Username}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 py-1 text-xs rounded-full ${getRoleBadgeClass(user.RoleID)}">${user.RoleName}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.Email || "-"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.Phone || "-"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(user.CreatedAt)}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(user.StatusID)}">${user.StatusName}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div class="flex space-x-reverse space-x-2">
            <button class="text-gray-500 hover:text-primary edit-user-btn" data-id="${user.UserID}"><i class="ri-edit-line"></i></button>
            <button class="text-gray-500 hover:text-red-500 delete-user-btn" data-id="${user.UserID}"><i class="ri-delete-bin-line"></i></button>
            <button class="text-gray-500 hover:text-primary"><i class="ri-more-2-line"></i></button>
          </div>
        </td>
      `;
      els.usersTableBody.appendChild(tr);
    });

    // attach handlers
    $all(".edit-user-btn", els.usersTableBody).forEach(btn => {
      btn.addEventListener("click", () => editUser(btn.getAttribute("data-id")));
    });
    $all(".delete-user-btn", els.usersTableBody).forEach(btn => {
      btn.addEventListener("click", () => confirmDeleteUser(btn.getAttribute("data-id")));
    });

    renderPagination(totalPages);
  }

  /* ---------- Filters & Search ---------- */
  function applyFiltersAndSearch() {
    const searchTerm = (els.searchInput && els.searchInput.value || "").toLowerCase();
    let searched = users;
    if (searchTerm) {
      searched = users.filter(u =>
        (u.Username || "").toLowerCase().includes(searchTerm) ||
        (u.Email || "").toLowerCase().includes(searchTerm) ||
        (u.Phone || "").includes(searchTerm)
      );
    }
    filteredUsers = [...searched];

    switch (activeFilter) {
      case "active": filteredUsers = filteredUsers.filter(u => u.StatusID === 1); break;
      case "inactive": filteredUsers = filteredUsers.filter(u => u.StatusID !== 1); break;
      case "admin": filteredUsers = filteredUsers.filter(u => u.RoleID === 1); break;
      case "engineer": filteredUsers = filteredUsers.filter(u => u.RoleID === 3); break;
      case "technician": filteredUsers = filteredUsers.filter(u => u.RoleID === 2); break;
    }

    // reset page if out of range
    currentPage = 1;
    renderUsersTable();
    updateUsersCount();
  }

  /* ---------- CRUD: Users ---------- */
  async function loadUsers() {
    try {
      const response = await apiRequest("users");
      if (response) {
        users = response;
        applyFiltersAndSearch();
      }
    } catch (err) {
      console.error("Error loading users:", err);
      showToast("حدث خطأ في تحميل بيانات المستخدمين", "error");
    }
  }

  async function editUser(userId) {
    try {
      const response = await apiRequest(`users&id=${userId}`);
      if (response) {
        openUserModalForEdit(response);
      }
    } catch (err) {
      console.error("Error loading user:", err);
      showToast("حدث خطأ في تحميل بيانات المستخدم", "error");
    }
  }

  function openUserModalForEdit(response) {
    if (!els.userModal) return;
    els.userModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    els.modalTitle.innerHTML = '<i class="ri-edit-line ml-2"></i> تعديل مستخدم';
    els.saveButtonText.textContent = "تحديث المستخدم";
    els.passwordInput.required = false;

    els.userIdInput.value = response.UserID;
    els.username.value = response.Username || "";
    els.email.value = response.Email || "";
    els.phone.value = response.Phone || "";
    els.role.value = response.RoleID || "";
    els.address.value = response.Address || "";
    els.note.value = response.Note || "";
  }

  function openUserModalForCreate() {
    if (!els.userModal) return;
    els.userModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    els.modalTitle.innerHTML = '<i class="ri-user-add-line ml-2"></i> إضافة مستخدم جديد';
    els.saveButtonText.textContent = "حفظ المستخدم";
    els.passwordInput.required = true;
    els.userForm.reset();
    els.userIdInput.value = "";
  }

  function closeModal() {
    if (!els.userModal) return;
    els.userModal.classList.add("hidden");
    document.body.style.overflow = "";
    els.userForm.reset();
    els.userIdInput.value = "";
  }

  function confirmDeleteUser(userId) {
    userIdToDelete = userId;
    if (els.deleteConfirmModal) els.deleteConfirmModal.classList.remove("hidden");
  }

  async function deleteUser() {
    try {
      const response = await apiRequest(`users&id=${userIdToDelete}`, "DELETE");
      if (response && response.success) {
        if (els.deleteConfirmModal) els.deleteConfirmModal.classList.add("hidden");
        await loadUsers();
        showToast("تم حذف المستخدم بنجاح", "success");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast("حدث خطأ في حذف المستخدم", "error");
    }
  }

  async function submitUserForm(e) {
    e.preventDefault();
    const userData = {
      username: els.username.value,
      password: els.passwordInput.value,
      email: els.email.value,
      phone: els.phone.value,
      role: els.role.value,
      address: els.address.value,
      note: els.note.value,
    };

    try {
      let response;
      if (els.userIdInput.value) {
        response = await apiRequest(`users&id=${els.userIdInput.value}`, "PUT", userData);
      } else {
        response = await apiRequest("users", "POST", userData);
      }
      if (response && response.success) {
        closeModal();
        await loadUsers();
        showToast(els.userIdInput.value ? "تم تحديث المستخدم بنجاح" : "تم إضافة المستخدم بنجاح", "success");
      }
    } catch (err) {
      console.error("Error saving user:", err);
      showToast("حدث خطأ في حفظ بيانات المستخدم", "error");
    }
  }

  /* ---------- Init & Events binding ---------- */
  function bindEvents() {
    if (els.addEmployeeBtn) els.addEmployeeBtn.addEventListener("click", openUserModalForCreate);
    if (els.closeModalBtn) els.closeModalBtn.addEventListener("click", closeModal);
    if (els.cancelBtn) els.cancelBtn.addEventListener("click", closeModal);
    if (els.userModal) els.userModal.addEventListener("click", (e) => { if (e.target === els.userModal) closeModal(); });
    if (els.userForm) els.userForm.addEventListener("submit", submitUserForm);

    if (els.cancelDeleteBtn) els.cancelDeleteBtn.addEventListener("click", () => { if (els.deleteConfirmModal) els.deleteConfirmModal.classList.add("hidden"); });
    if (els.confirmDeleteBtn) els.confirmDeleteBtn.addEventListener("click", deleteUser);

    if (els.searchInput) els.searchInput.addEventListener("input", () => { currentPage = 1; applyFiltersAndSearch(); });

    // custom select
    if (els.customSelect && els.customSelectSelected && els.customSelectOptions) {
      els.customSelectSelected.addEventListener("click", (e) => {
        e.stopPropagation();
        els.customSelectOptions.style.display = els.customSelectOptions.style.display === "block" ? "none" : "block";
      });
      document.addEventListener("click", (e) => { if (!els.customSelect.contains(e.target)) els.customSelectOptions.style.display = "none"; });
      $all(".custom-select-option", els.customSelectOptions).forEach(option => {
        option.addEventListener("click", function () {
          els.customSelectSelected.querySelector("span").textContent = this.textContent;
          els.customSelectOptions.style.display = "none";
          activeFilter = this.getAttribute("data-filter") || "all";
          currentPage = 1;
          applyFiltersAndSearch();
        });
      });
    }

    if (els.selectAllCheckbox) {
      els.selectAllCheckbox.addEventListener("change", function () {
        const checkboxes = $all(".user-checkbox");
        checkboxes.forEach(ch => ch.checked = this.checked);
      });
    }
  }

  function cacheElements() {
    els.addEmployeeBtn = document.getElementById("addEmployeeBtn");
    els.userModal = document.getElementById("userModal");
    els.closeModalBtn = document.getElementById("closeModalBtn");
    els.cancelBtn = document.getElementById("cancelBtn");
    els.userForm = document.getElementById("userForm");
    els.modalTitle = document.getElementById("modalTitle");
    els.saveButtonText = document.getElementById("saveButtonText");
    els.userIdInput = document.getElementById("userId");
    els.passwordInput = document.getElementById("password");
    els.deleteConfirmModal = document.getElementById("deleteConfirmModal");
    els.cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    els.confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    els.searchInput = document.getElementById("searchInput");
    els.usersTableBody = document.getElementById("usersTableBody");
    els.usersCount = document.getElementById("usersCount");
    els.pagination = document.getElementById("pagination");
    els.selectAllCheckbox = document.getElementById("selectAll");

    els.customSelect = document.querySelector(".custom-select");
    if (els.customSelect) {
      els.customSelectSelected = els.customSelect.querySelector(".custom-select-selected");
      els.customSelectOptions = els.customSelect.querySelector(".custom-select-options");
    }

    // form fields
    els.username = document.getElementById("username");
    els.email = document.getElementById("email");
    els.phone = document.getElementById("phone");
    els.role = document.getElementById("role");
    els.address = document.getElementById("address");
    els.note = document.getElementById("note");
  }

  /* Public API */
  const UsersUI = {
    async init() {
      cacheElements();
      bindEvents();
      await loadUsers();
    },
    // expose for debugging/tests
    _internal: {
      apiRequest, loadUsers, renderUsersTable
    }
  };

  // expose
  global.UsersUI = UsersUI;

})(window);
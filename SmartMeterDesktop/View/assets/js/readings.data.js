// بيانات افتراضية (سيتم استبدالها لاحقًا ببيانات من C#)
let metersData = [
  {
    region: "المنطقة الشرقية",
    type: "عداد ذكي",
    number: "EL-2025-7842",
    customer: "عبدالرحمن سعيد العامري",
    last: 12487,
    newVal: "",
    amount: "",
    status: "بانتظار القراءة",
    date: "2025-05-21",
  },
  {
    region: "المنطقة الشرقية",
    type: "عداد تقليدي",
    number: "EL-2025-7844",
    customer: "نورة أحمد السالم",
    last: 8756,
    newVal: "",
    amount: "",
    status: "بانتظار القراءة",
    date: "2025-05-21",
  },
  {
    region: "المنطقة الغربية",
    type: "عداد ذكي",
    number: "WL-2025-7845",
    customer: "سلطان خالد الغامدي",
    last: 15678,
    newVal: "",
    amount: "",
    status: "بانتظار القراءة",
    date: "2025-05-21",
  },
  {
    region: "المنطقة الغربية",
    type: "عداد ذكي",
    number: "WL-2025-7846",
    customer: "منيرة سعد القرني",
    last: 9345,
    newVal: "",
    amount: "",
    status: "بانتظار القراءة",
    date: "2025-05-21",
  },
];

let filteredData = [...metersData];
let currentSort = null;

function renderTable(data) {
  const tbody = document.getElementById("meters-tbody");
  tbody.innerHTML = "";
  data.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-4 py-3">${row.region}</td>
      <td class="px-4 py-3">${row.type}</td>
      <td class="px-4 py-3">${row.number}</td>
      <td class="px-4 py-3">${row.customer}</td>
      <td class="px-4 py-3">${row.last.toLocaleString()}</td>
      <td class="px-4 py-3">
        <input type="number" min="${row.last + 1}" data-idx="${idx}" class="reading-input w-24 border border-gray-200 rounded py-1 px-2 text-sm" value="${row.newVal || ""}">
      </td>
      <td class="px-4 py-3 consumption">${row.newVal && row.newVal > row.last ? (row.newVal - row.last).toLocaleString() : "-"}</td>
      <td class="px-4 py-3"><input type="number" min="0" class="amount-input w-24 border border-gray-200 rounded py-1 px-2 text-sm" value="${row.amount || ""}"></td>
      <td class="px-4 py-3">
        <span class="status-badge ${row.newVal ? "status-active" : "status-pending"}">${row.newVal ? "تم الإدخال" : "بانتظار القراءة"}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function applyFilters() {
  const region = document.getElementById("filter-region").value;
  const type = document.getElementById("filter-type").value;
  const search = document.getElementById("search-input").value.trim();
  const date = document.getElementById("filter-date").value;

  filteredData = metersData.filter((row) => {
    return (
      (!region || row.region === region) &&
      (!type || row.type === type) &&
      (!date || row.date === date) &&
      (!search || row.customer.includes(search) || row.number.includes(search))
    );
  });

  if (currentSort) sortData(currentSort);
  else renderTable(filteredData);
}

function sortData(sortBy) {
  currentSort = sortBy;
  filteredData.sort((a, b) => {
    switch (sortBy) {
      case "region": return a.region.localeCompare(b.region, "ar");
      case "type": return a.type.localeCompare(b.type, "ar");
      case "number": return a.number.localeCompare(b.number, "ar");
      case "customer": return a.customer.localeCompare(b.customer, "ar");
      default: return 0;
    }
  });
  renderTable(filteredData);
}

function updateConsumption(idx, value) {
  const last = metersData[idx].last;
  metersData[idx].newVal = value;
  const row = document.querySelectorAll("#meters-tbody tr")[idx];
  if (row) {
    const consumptionTd = row.querySelector(".consumption");
    if (value && value > last) {
      consumptionTd.textContent = (value - last).toLocaleString();
    } else {
      consumptionTd.textContent = "-";
    }
  }
}

// تفعيل التبويبات
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach((b) => {
        b.classList.remove('active', 'text-primary');
        b.classList.add('text-gray-500');
      });
      this.classList.add('active', 'text-primary');
      this.classList.remove('text-gray-500');

      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active')); 
      document.getElementById(this.id.replace('tab-', 'content-')).classList.add('active');
    });
  });
}

// ربط الأحداث
document.addEventListener("DOMContentLoaded", () => {
  renderTable(filteredData);
  
  // فلاتر
  document.getElementById("filter-region")?.addEventListener("change", applyFilters);
  document.getElementById("filter-type")?.addEventListener("change", applyFilters);
  document.getElementById("filter-date")?.addEventListener("change", applyFilters);
  document.getElementById("search-input")?.addEventListener("input", applyFilters);

  // ترتيب
  document.querySelectorAll(".sort-btn").forEach((btn) => {
    btn.addEventListener("click", () => sortData(btn.dataset.sort));
  });

  // إدخال القراءات
  document.getElementById("meters-tbody")?.addEventListener("input", function (e) {
    if (e.target.classList.contains("reading-input")) {
      const idx = +e.target.getAttribute("data-idx");
      updateConsumption(idx, +e.target.value);
    } else if (e.target.classList.contains("amount-input")) {
      const idx = Array.from(document.querySelectorAll("#meters-tbody tr")).indexOf(e.target.closest("tr"));
      metersData[idx].amount = e.target.value;
    }
  });

  // تبويبات
  initTabs();
});
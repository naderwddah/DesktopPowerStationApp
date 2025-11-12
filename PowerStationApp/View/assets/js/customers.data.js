// View/assets/js/customers.data.js
// أنشئ بتاريخ 2025-11-10
// ملف البيانات الخاص بصفحة customers.html.
// يحوي البيانات الافتراضية وقابليات الوصول والوظائف المتعلقة بجلب/إضافة/تصفية العملاء.
// أي اتصال مع C# (HostApi) يوضع هنا لاحقاً عند الحاجة.

/* === بيانات المناطق والأحياء (مأخوذة من الصفحة الأصلية) === */
window.CustomersData = (function () {
  const districtsByRegion = {
    الرياض: ["النزهة", "الملز", "الياسمين"],
    جدة: ["الروضة", "السلامة", "البوادي"],
    "مكة المكرمة": ["العزيزية", "الشوقية", "الزاهر"],
    الدمام: ["الشاطئ", "الريان", "الزهور"],
  };

  // بيانات العملاء الافتراضية (من الصفحة الأصلية)
  let customers = [
    {
      fullName: "عبدالله محمد العتيبي",
      phone: "+966551234567",
      cardNumber: "1234567890",
      meterNumber: "MET-10045",
      email: "abdullah@example.com",
      region: "الرياض",
      district: "النزهة",
      neighbor: "فيلا 45",
      address: "الرياض، حي النزهة، شارع الأمير سلطان، فيلا 45",
      status: "نشط",
    },
    {
      fullName: "نورة أحمد الشمري",
      phone: "+966509876543",
      cardNumber: "2234567890",
      meterNumber: "MET-10046",
      email: "nora@example.com",
      region: "جدة",
      district: "الروضة",
      neighbor: "شقة 12",
      address: "جدة، حي الروضة، شارع فلسطين، شقة 12، عمارة الأندلس",
      status: "نشط",
    },
    {
      fullName: "فهد سعد القحطاني",
      phone: "+966547654321",
      cardNumber: "3234567890",
      meterNumber: "MET-10047",
      email: "fahad@example.com",
      region: "الدمام",
      district: "الشاطئ",
      neighbor: "فيلا 23",
      address: "الدمام، حي الشاطئ، شارع الملك فهد، فيلا 23",
      status: "نشط",
    },
    {
      fullName: "سارة خالد المالكي",
      phone: "+966564321098",
      cardNumber: "4234567890",
      meterNumber: "MET-10048",
      email: "sarah@example.com",
      region: "الرياض",
      district: "الملز",
      neighbor: "شقة 7",
      address: "الرياض، حي الملز، شارع الستين، عمارة الواحة، شقة 7",
      status: "غير نشط",
    },
    {
      fullName: "محمد علي الغامدي",
      phone: "+966598765432",
      cardNumber: "5234567890",
      meterNumber: "MET-10049",
      email: "mohammed@example.com",
      region: "مكة المكرمة",
      district: "العزيزية",
      neighbor: "فيلا 32",
      address: "مكة المكرمة، حي العزيزية، شارع الحج، فيلا 32",
      status: "نشط",
    },
    {
      fullName: "هند سليمان الدوسري",
      phone: "+966583217654",
      cardNumber: "6234567890",
      meterNumber: "MET-10050",
      email: "hind@example.com",
      region: "الرياض",
      district: "الياسمين",
      neighbor: "فيلا 67",
      address: "الرياض، حي الياسمين، شارع أنس بن مالك، فيلا 67",
      status: "نشط",
    },
  ];

  // دوال مساعدة للوصول إلى البيانات
  function getAllCustomers() {
    // ممكن استبدالها بطلب HostApi.send('getCustomers') لاحقاً
    return customers.slice();
  }

  function addCustomer(c) {
    // تبسيط: يمكن التحقق من الحقول هنا قبل الإضافة
    customers.push(c);
    return c;
  }

  function getDistricts(region) {
    return districtsByRegion[region] ? districtsByRegion[region].slice() : [];
  }

  function filterCustomers({ search = "", region = "", status = "" } = {}) {
    const q = search.trim();
    return customers.filter(
      (c) =>
        (!region || c.region === region) &&
        (!status || c.status === status) &&
        (!q ||
          c.fullName.includes(q) ||
          c.phone.includes(q) ||
          c.meterNumber.includes(q))
    );
  }

  // واجهة عامة
  return {
    getAllCustomers,
    addCustomer,
    getDistricts,
    filterCustomers,
    // كشف البيانات (للاستخدام من UI)
    _internal: {
      customers,
      districtsByRegion,
    },
  };
})();
// assets/js/collections.data.js
// ملف البيانات (Data Logic) الخاص بصفحة collections.
// أنشئ بتاريخ 2025-11-10.
// حالياً يحتوي قوالب وواجهات للوصول إلى بيانات التحصيل محلياً.
// لاحقاً يمكنك استبدال getPayments/getCollections باستدعاءات HostApi.send(...).

window.CollectionsData = (function () {
  // نموذج بيانات مصغر (يمكن استبداله بالاستدعاءات عبر HostApi)
  const payments = [
    { id: 'TRX-2025-7842', invoice: 'INV-2025-0587', customer: 'عبدالرحمن سعيد العامري', method: 'إلكتروني', amount: 183, date: '20/05/2025', status: 'مكتمل' },
    { id: 'TRX-2025-7843', invoice: 'INV-2025-0588', customer: 'نورة أحمد السالم', method: 'نقدي', amount: 140, date: '19/05/2025', status: 'مكتمل' }
  ];

  function getPayments() { return payments.slice(); }

  function addPayment(p) { payments.unshift(p); return p; }

  // واجهة عامة
  return {
    getPayments,
    addPayment
  };
})();
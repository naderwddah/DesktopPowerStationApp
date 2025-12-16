// assets/js/accounting.data.js
// Data layer (قالب) لصفحة accounting.
// أنشئ بتاريخ 2025-11-11
// حاليًا يحتوي بيانات تجريبية وواجهات يمكن لاحقاً ربطها بالـ HostApi (C#).

window.AccountingData = (function () {
  // نموذج مبسط للقيود اليومية (يمكن استبداله بمكالمات HostApi)
  const journalEntries = [
    { date: '21/05/2025', ref: 'JE-1001', desc: 'تسجيل فاتورة عميل #4582', account: 'عملاء / البنك', debit: '450', credit: '450' },
    { date: '21/05/2025', ref: 'JE-1002', desc: 'شراء مواد صيانة', account: 'صيانة وتشغيل / البنك', debit: '1250', credit: '1250' },
  ];

  function getJournalEntries() { return journalEntries.slice(); }

  // واجهة خارجية
  return {
    getJournalEntries
    // لاحقاً: addJournalEntry, getLedger, getTrialBalance باستخدام HostApi.send(...)
  };
})();
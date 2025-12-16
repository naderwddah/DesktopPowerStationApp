using SmartMeterDesktop.Backend.DataAccess;
using SmartMeterDesktop.Backend.Models;
using BCrypt.Net; // من BCrypt.Net-Next

namespace SmartMeterDesktop.Backend.Services
{
    public class AuthService
    {
        private readonly UserRepository _userRepo;

        public AuthService()
        {
            _userRepo = new UserRepository();
        }

        public (bool Success, string ErrorMessage, User User) Login(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                return (false, "اسم المستخدم أو كلمة المرور فارغة.", null);

            var user = _userRepo.GetByUsername(username);
            if (user == null)
                return (false, "اسم المستخدم غير موجود.", null);

            if (string.IsNullOrWhiteSpace(user.PasswordHash))
                return (false, "كلمة المرور غير مُهيأة لهذا المستخدم.", null);

            // تطبيع صيغة الـ hash لو كانت من نوع PHP $2y$ إلى $2a$
            var hash = user.PasswordHash;
            if (hash.StartsWith("$2y$"))
            {
                hash = "$2a$" + hash.Substring(4);
            }

            bool passwordOk;
            try
            {
                passwordOk = BCrypt.Net.BCrypt.Verify(password, hash);
            }
            catch
            {
                return (false, "خطأ في التحقق من كلمة المرور.", null);
            }

            if (!passwordOk)
                return (false, "كلمة المرور غير صحيحة.", null);

            // تحقق من حالة الحساب
            if (user.StatusID.HasValue && user.StatusID.Value != 1)
                return (false, "حساب المستخدم غير نشط.", null);

            return (true, null, user);
        }
    }
}

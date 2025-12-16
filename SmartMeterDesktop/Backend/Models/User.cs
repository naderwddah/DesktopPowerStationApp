namespace SmartMeterDesktop.Backend.Models
{
    public class User
    {
        public int UserID { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; } // أو Password لو استخدمت نص عادي
        public string Email { get; set; }
        public string Phone { get; set; }
        public int RoleID { get; set; }
        public short? StatusID { get; set; }
    }
}

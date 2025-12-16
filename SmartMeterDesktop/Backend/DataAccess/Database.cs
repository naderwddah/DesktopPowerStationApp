using MySql.Data.MySqlClient;
using SmartMeterDesktop.Backend.Utils;

namespace SmartMeterDesktop.Backend.DataAccess
{
    public static class Database
    {
        public static MySqlConnection GetConnection()
        {
            var connString = ConfigHelper.GetConnectionString();
            return new MySqlConnection(connString);
        }

        public static bool TestConnection(out string error)
        {
            error = null;
            try
            {
                using (var conn = GetConnection())
                {
                    conn.Open();
                    using (var cmd = new MySqlCommand("SELECT 1", conn))
                    {
                        cmd.ExecuteScalar();
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                error = ex.Message;
                return false;
            }
        }
    }
}

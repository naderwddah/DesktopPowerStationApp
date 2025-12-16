using MySql.Data.MySqlClient;
using SmartMeterDesktop.Backend.Models;

namespace SmartMeterDesktop.Backend.DataAccess
{
    public class UserRepository
    {
        public User GetByUsername(string username)
        {
            using (var conn = Database.GetConnection())
            {
                conn.Open();
                string sql = @"SELECT UserID, Username, PasswordHash, Email, Phone, RoleID, StatusID
                               FROM users
                               WHERE Username = @username
                               LIMIT 1";

                using (var cmd = new MySqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@username", username);

                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new User
                            {
                                UserID = reader.GetInt32("UserID"),
                                Username = reader.GetString("Username"),
                                PasswordHash = reader.GetString("PasswordHash"),
                                Email = reader["Email"] as string,
                                Phone = reader["Phone"] as string,
                                RoleID = reader.GetInt32("RoleID"),
                                StatusID = reader["StatusID"] as short? ?? 1
                            };
                        }
                    }
                }
            }

            return null;
        }
    }
}

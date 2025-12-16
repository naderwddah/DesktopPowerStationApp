using System.IO;
using System.Text.Json;

namespace SmartMeterDesktop.Backend.Utils
{
    public static class ConfigHelper
    {
        private class AppSettings
        {
            public string ConnectionString { get; set; }
        }

        private static AppSettings _cached;

        public static string GetConnectionString()
        {
            if (_cached != null)
                return _cached.ConnectionString;

            var basePath = AppDomain.CurrentDomain.BaseDirectory;
            var configPath = Path.Combine(basePath, "Config", "appsettings.json");

            if (!File.Exists(configPath))
                throw new FileNotFoundException("لم يتم العثور على ملف الإعدادات appsettings.json", configPath);

            var json = File.ReadAllText(configPath);
            _cached = JsonSerializer.Deserialize<AppSettings>(json);

            if (_cached == null || string.IsNullOrWhiteSpace(_cached.ConnectionString))
                throw new Exception("لم يتم العثور على ConnectionString في appsettings.json");

            return _cached.ConnectionString;
        }
    }
}

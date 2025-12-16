using Microsoft.Web.WebView2.Core;
using SmartMeterDesktop.Backend.DataAccess;
using SmartMeterDesktop.Backend.DTOs;
using SmartMeterDesktop.Backend.Services;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace SmartMeterDesktop
{
    public partial class MainForm : Form
    {
        private readonly AuthService _authService;

        // JSON options to accept camelCase from JS (type/username/password)
        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        // Virtual host constants
        private const string VirtualHost = "app.local";
        private const string BaseUrl = "https://app.local";

        public MainForm()
        {
            InitializeComponent();
            _authService = new AuthService();
            InitializeWebViewAsync();
        }

        private async void InitializeWebViewAsync()
        {
            try
            {
                // 1) اختبار الاتصال بقاعدة البيانات
                if (!Database.TestConnection(out var dbError))
                {
                    MessageBox.Show(
                        "تعذر الاتصال بقاعدة البيانات:\n" + dbError,
                        "خطأ قاعدة البيانات",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                // 2) تهيئة WebView2
                await webViewMain.EnsureCoreWebView2Async();
                var core = webViewMain.CoreWebView2;

                // 3) ربط الهوست الافتراضي بمجلد التشغيل (يحتوي View و assets)
                string rootFolder = AppDomain.CurrentDomain.BaseDirectory;

                core.SetVirtualHostNameToFolderMapping(
                    VirtualHost,
                    rootFolder,
                    CoreWebView2HostResourceAccessKind.Allow
                );

                // 4) Diagnostics: لتتأكد أن المصدر صار https://app.local وليس file://
                core.NavigationCompleted += (s, e) =>
                {
                    Console.WriteLine("WEBVIEW SOURCE: " + core.Source);
                };

                // 5) استقبال رسائل JS
                core.WebMessageReceived -= CoreWebView2_WebMessageReceived;
                core.WebMessageReceived += CoreWebView2_WebMessageReceived;

                // 6) افتح صفحة تسجيل الدخول عبر https
                NavigateTo("View/pages/login.html");
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "خطأ أثناء تهيئة WebView2:\n" + ex.Message,
                    "خطأ",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        private void NavigateTo(string relativePath)
        {
            // relativePath مثال: "View/pages/dashboard.html"
            var url = $"{BaseUrl}/{relativePath.TrimStart('/')}";
            webViewMain.CoreWebView2.Navigate(url);
        }

        private async void CoreWebView2_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                var json = e.WebMessageAsJson;
                Console.WriteLine("Message from JS: " + json);

                JsMessage? msg;
                try
                {
                    msg = JsonSerializer.Deserialize<JsMessage>(json, JsonOptions);
                }
                catch (Exception parseEx)
                {
                    Console.WriteLine("JSON parse error: " + parseEx.Message);
                    return;
                }

                if (msg == null || string.IsNullOrWhiteSpace(msg.Type))
                    return;

                switch (msg.Type.Trim().ToLowerInvariant())
                {
                    case "login":
                        await HandleLoginMessage(msg);
                        break;

                    default:
                        Console.WriteLine("Unhandled message type: " + msg.Type);
                        break;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("خطأ في معالجة رسالة JS:\n" + ex.Message);
            }
        }

        private async Task HandleLoginMessage(JsMessage msg)
        {
            var result = _authService.Login(msg.Username, msg.Password);

            if (!result.Success)
            {
                var escaped = JsonSerializer.Serialize(result.ErrorMessage ?? "فشل تسجيل الدخول.");
                string script = $"window.showLoginError && window.showLoginError({escaped});";
                await webViewMain.CoreWebView2.ExecuteScriptAsync(script);
                return;
            }

            // نجاح تسجيل الدخول → تنقل عبر https://app.local (وليس file://)
            NavigateTo("View/pages/dashboard.html");
        }
    }
}

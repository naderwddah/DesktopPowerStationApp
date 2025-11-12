using System;
using System.IO;
using System.Text.Json;
using System.Windows.Forms;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;

namespace PowerStationApp
{
    public partial class MainForm : Form
    {
        private WebView2 webView;

        public MainForm()
        {
            InitializeComponent();
        }

        private async void MainForm_Load(object sender, EventArgs e)
        {
            try
            {
                // إنشاء عنصر WebView2
                webView = new WebView2
                {
                    Dock = DockStyle.Fill
                };
                Controls.Add(webView);

                // تفعيل إمكانية تحميل الملفات المحلية داخل WebView2
                var env = await CoreWebView2Environment.CreateAsync(
                    null, null,
                    new CoreWebView2EnvironmentOptions("--allow-file-access-from-files")
                );
                await webView.EnsureCoreWebView2Async(env);

                // الحصول على المسار الكامل لملف HTML الرئيسي
                string htmlPath = Path.Combine(Application.StartupPath, "View/pages", "dashboard.html");

                if (!File.Exists(htmlPath))
                {
                    MessageBox.Show($"❌ الملف غير موجود:\n{htmlPath}", "خطأ", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                // تحميل الملف داخل WebView2 كمصدر محلي
                webView.Source = new Uri(htmlPath);

                // التعامل مع الرسائل القادمة من JavaScript
                webView.CoreWebView2.WebMessageReceived += WebView_WebMessageReceived;

                // السماح بفتح النوافذ المنبثقة / الروابط في نفس النافذة
                webView.CoreWebView2.NewWindowRequested += (s, args) =>
                {
                    args.Handled = true;
                    webView.CoreWebView2.Navigate(args.Uri);
                };
            }
            catch (Exception ex)
            {
                MessageBox.Show($"⚠️ خطأ أثناء تحميل WebView2:\n{ex.Message}", "خطأ", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void WebView_WebMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                string message = e.TryGetWebMessageAsString();

                if (string.IsNullOrWhiteSpace(message))
                    return;

                var data = JsonSerializer.Deserialize<LoginRequest>(message);

                if (data?.Action == "login")
                {
                    // التحقق التجريبي من بيانات الدخول
                    bool isValid = (data.Username == "admin" && data.Password == "1234");

                    if (isValid)
                    {
                        var response = new
                        {
                            status = "success",
                            message = (string)null,
                            user = new { name = data.Username, role = "مدير النظام" }
                        };
                        webView.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(response));
                    }
                    else
                    {
                        var response = new
                        {
                            status = "error",
                            message = "اسم المستخدم أو كلمة المرور غير صحيحة.",
                            user = (object)null
                        };
                        webView.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(response));
                    }


                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"حدث خطأ أثناء معالجة الرسالة:\n{ex.Message}", "خطأ", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }

    // نموذج بسيط لبيانات الرسائل من JavaScript
    public class LoginRequest
    {
        public string Action { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}

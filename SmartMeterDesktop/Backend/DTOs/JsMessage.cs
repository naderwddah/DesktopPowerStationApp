namespace SmartMeterDesktop.Backend.DTOs
{
    public class JsMessage
    {
        public string Type { get; set; }          // مثل "login"
        public string Username { get; set; }      // لتسجيل الدخول
        public string Password { get; set; }      // لتسجيل الدخول
        public string Payload { get; set; }       // يمكن استخدامها لاحقاً لأغراض أخرى
    }
}

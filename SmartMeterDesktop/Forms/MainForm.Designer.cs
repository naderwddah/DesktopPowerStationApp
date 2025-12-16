namespace SmartMeterDesktop
{
    partial class MainForm
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            webViewMain = new Microsoft.Web.WebView2.WinForms.WebView2();
            ((System.ComponentModel.ISupportInitialize)webViewMain).BeginInit();
            SuspendLayout();
            // 
            // webViewMain
            // 
            webViewMain.AllowExternalDrop = true;
            webViewMain.CreationProperties = null;
            webViewMain.DefaultBackgroundColor = Color.White;
            webViewMain.Dock = DockStyle.Fill;
            webViewMain.Location = new Point(0, 0);
            webViewMain.Name = "webViewMain";
            webViewMain.Size = new Size(1164, 742);
            webViewMain.TabIndex = 0;
            webViewMain.ZoomFactor = 1D;
            // 
            // MainForm
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(1164, 742);
            Controls.Add(webViewMain);
            Name = "MainForm";
            Text = "Form1";
            WindowState = FormWindowState.Maximized;
            ((System.ComponentModel.ISupportInitialize)webViewMain).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Microsoft.Web.WebView2.WinForms.WebView2 webViewMain;
    }
}

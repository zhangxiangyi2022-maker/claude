// Clawd 桌宠（Windows）
// 由 clawd-pet.ps1 在运行时用 Add-Type 编译。为了兼容 Windows PowerShell 5.1，只用 C# 5 语法。

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

namespace ClawdDesktop
{
    public static class App
    {
        [DllImport("user32.dll")]
        static extern bool SetProcessDPIAware();

        public static void Run(string launcherPath)
        {
            bool created;
            using (Mutex m = new Mutex(true, "ClawdDesktopPet_SingleInstance", out created))
            {
                if (!created)
                {
                    MessageBox.Show("Clawd 已经在桌面上啦，看看屏幕底部或者右下角托盘～", "Clawd");
                    return;
                }
                try { SetProcessDPIAware(); } catch { }
                Application.EnableVisualStyles();
                Application.Run(new PetForm(launcherPath));
            }
        }
    }

    class Particle
    {
        public string Kind;
        public float X, Y, Vx, Vy, T, Life, Size;
    }

    // 掉下来的饼干：一个独立的小透明窗口，鼠标可以穿透
    class CookieForm : Form
    {
        public float X, Y, Vy, Floor;
        public bool Landed;
        readonly int u;

        public CookieForm(int unit)
        {
            u = unit;
            FormBorderStyle = FormBorderStyle.None;
            ShowInTaskbar = false;
            TopMost = true;
            StartPosition = FormStartPosition.Manual;
            BackColor = PetForm.Key;
            TransparencyKey = PetForm.Key;
            DoubleBuffered = true;
            Size = new Size(6 * u, 6 * u);
        }

        protected override bool ShowWithoutActivation { get { return true; } }

        protected override CreateParams CreateParams
        {
            get
            {
                CreateParams cp = base.CreateParams;
                cp.ExStyle |= 0x80 | 0x20; // WS_EX_TOOLWINDOW | WS_EX_TRANSPARENT：鼠标穿透
                return cp;
            }
        }

        public void Place()
        {
            Location = new Point((int)Math.Round(X - Width / 2f), (int)Math.Round(Y - Height));
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.None;
            using (SolidBrush c1 = new SolidBrush(Color.FromArgb(0xC9, 0x8A, 0x4B)))
            using (SolidBrush c2 = new SolidBrush(Color.FromArgb(0x5A, 0x37, 0x20)))
            {
                g.FillRectangle(c1, u, 0, 4 * u, 6 * u);
                g.FillRectangle(c1, 0, u, 6 * u, 4 * u);
                g.FillRectangle(c2, (int)(1.5 * u), (int)(1.5 * u), u, u);
                g.FillRectangle(c2, (int)(3.5 * u), (int)(2.5 * u), u, u);
                g.FillRectangle(c2, 2 * u, 4 * u, u, u);
            }
        }
    }

    public class PetForm : Form
    {
        public static readonly Color Key = Color.FromArgb(255, 0, 254);
        static readonly Color BodyC = Color.FromArgb(0xD9, 0x77, 0x57);
        static readonly Color LegC = Color.FromArgb(0xC4, 0x66, 0x4A);
        static readonly Color EyeC = Color.FromArgb(0x1B, 0x14, 0x11);
        static readonly Color HeartC = Color.FromArgb(0xE4, 0x6F, 0x8F);
        static readonly Color StarC = Color.FromArgb(0xE0, 0xA2, 0x4A);
        static readonly Color InkC = Color.FromArgb(0x2B, 0x2E, 0x35);
        static readonly Color ZC = Color.FromArgb(0x7A, 0x80, 0x8C);

        const string ClaudeUrl = "https://claude.ai/new";
        const string RunKey = @"Software\Microsoft\Windows\CurrentVersion\Run";
        const string RunName = "ClawdDesktopPet";

        static readonly string[] TapLines = { "嘿嘿～", "摸摸头！", "再摸一下嘛", "嗯？叫我吗", "今天也要加油哦" };
        static readonly string[] IdleLines = { "git push 了吗？", "要不要喝口水", "我在看着你哦", "休息一下眼睛吧", "这个 bug 我好像见过…", "记得保存文件！", "右键我可以打开 Claude 哦" };
        static readonly string[] HungryLines = { "肚子咕咕叫…", "有饼干吗…右键喂我", "饿饿" };
        static readonly string[] HeldLines = { "哇啊啊——", "放我下来！", "好高！" };
        static readonly string[] LandLines = { "晕…", "眼冒金星…", "下次轻点扔嘛" };
        static readonly string[] WakeLines = { "唔…我醒着呢", "没睡没睡", "刚才在思考" };
        static readonly string[] EatLines = { "好吃！", "嚼嚼嚼", "再来一块！" };
        static readonly string[] ComeLines = { "开饭啦！", "饼干！", "冲！" };

        readonly float S;   // DPI 缩放
        readonly int U;     // 一个像素格的大小
        readonly int FW, FH;

        float px, py, vx, vy;
        int dir = 1;
        string state = "idle";
        float t, next = 2f, target, squash, blink, nextBlink = 2f, walkPhase, idleFor, chatIn = 20f;
        CookieForm eating;
        readonly List<CookieForm> cookies = new List<CookieForm>();
        readonly List<Particle> parts = new List<Particle>();
        string bubbleText;
        float bubbleTime;
        float food = 70f, mood = 70f, saveIn = 30f;
        bool pinned;      // 定住：拖到哪儿就待在哪儿
        float pinY;
        readonly Random rnd = new Random();

        readonly System.Windows.Forms.Timer timer;
        readonly Stopwatch sw = Stopwatch.StartNew();
        long lastMs;

        bool down, dragging;
        Point downScreen, lastMouse;
        float grabDx, grabDy, mvx, mvy;
        long lastMouseMs;

        readonly NotifyIcon tray;
        readonly ContextMenuStrip menu;
        ToolStripMenuItem statItem, sleepItem, autoItem, pinItem;
        readonly string launcherPath, savePath;
        readonly Font bubbleFont, zFont;

        public PetForm(string launcher)
        {
            launcherPath = launcher;
            FormBorderStyle = FormBorderStyle.None;
            ShowInTaskbar = false;
            TopMost = true;
            StartPosition = FormStartPosition.Manual;
            BackColor = Key;
            TransparencyKey = Key;
            DoubleBuffered = true;
            Text = "Clawd";

            using (Graphics g = CreateGraphics()) S = g.DpiX / 96f;
            U = Math.Max(3, (int)Math.Round(5 * S));
            FW = (int)(260 * S);
            FH = (int)(200 * S);
            Size = new Size(FW, FH);

            bubbleFont = new Font("Microsoft YaHei UI", 9.5f);
            zFont = new Font("Consolas", 11f, FontStyle.Bold);

            string dirPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "ClawdPet");
            savePath = Path.Combine(dirPath, "state.txt");
            LoadState();

            Rectangle wa = Screen.PrimaryScreen.WorkingArea;
            bool onScreen = false;
            if (pinned)
                foreach (Screen sc in Screen.AllScreens)
                    if (sc.WorkingArea.Contains((int)px, (int)pinY - 10)) onScreen = true;
            if (onScreen) py = pinY;
            else
            {
                pinned = false;
                px = wa.Right - 220 * S;
                py = wa.Bottom;
            }
            target = px;

            menu = BuildMenu();
            ContextMenuStrip = menu;

            tray = new NotifyIcon();
            tray.Icon = MakeIcon();
            tray.Text = "Clawd 桌宠";
            tray.ContextMenuStrip = menu;
            tray.Visible = true;
            tray.MouseClick += delegate(object s, MouseEventArgs e)
            {
                if (e.Button != MouseButtons.Left) return;
                ComeHome();
            };

            timer = new System.Windows.Forms.Timer();
            timer.Interval = 15;
            timer.Tick += delegate { Tick(); };

            Load += delegate
            {
                Place();
                timer.Start();
                Say("嗨！我是 Clawd～右键我有菜单哦", 4f);
            };
        }

        protected override bool ShowWithoutActivation { get { return true; } }

        protected override CreateParams CreateParams
        {
            get
            {
                CreateParams cp = base.CreateParams;
                cp.ExStyle |= 0x80; // WS_EX_TOOLWINDOW：不出现在 Alt+Tab 里
                return cp;
            }
        }

        // ---------- 工具 ----------
        float R(float a, float b) { return a + (float)rnd.NextDouble() * (b - a); }
        string Pick(string[] arr) { return arr[rnd.Next(arr.Length)]; }
        static float Clamp(float v, float a, float b) { return Math.Max(a, Math.Min(b, v)); }

        Rectangle Area()
        {
            return Screen.FromPoint(new Point((int)px, (int)py - 10)).WorkingArea;
        }

        void Place()
        {
            Location = new Point((int)Math.Round(px - FW / 2f), (int)Math.Round(py - FH + 2 * S));
        }

        void SetState(string s, float dur)
        {
            state = s;
            t = 0;
            next = dur;
        }

        void Say(string text, float secs)
        {
            bubbleText = text;
            bubbleTime = secs;
        }

        void Touch() { idleFor = 0; }

        bool InAir() { return state == "held" || state == "fall" || state == "jump"; }

        // ---------- 存档 ----------
        void LoadState()
        {
            try
            {
                if (!File.Exists(savePath)) return;
                string[] p = File.ReadAllText(savePath).Split(',');
                float f = float.Parse(p[0], CultureInfo.InvariantCulture);
                float m = float.Parse(p[1], CultureInfo.InvariantCulture);
                long ticks = long.Parse(p[2], CultureInfo.InvariantCulture);
                double hours = Math.Min(48, Math.Max(0, (DateTime.UtcNow.Ticks - ticks) / (double)TimeSpan.TicksPerHour));
                food = Clamp(f - (float)hours * 4, 5, 100);
                mood = Clamp(m - (float)hours * 3, 5, 100);
                if (p.Length >= 6 && p[3] == "1")
                {
                    pinned = true;
                    px = float.Parse(p[4], CultureInfo.InvariantCulture);
                    pinY = float.Parse(p[5], CultureInfo.InvariantCulture);
                }
            }
            catch { }
        }

        void SaveState()
        {
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(savePath));
                File.WriteAllText(savePath, string.Format(CultureInfo.InvariantCulture, "{0:0.0},{1:0.0},{2},{3},{4:0},{5:0}", food, mood, DateTime.UtcNow.Ticks, pinned ? 1 : 0, px, pinY));
            }
            catch { }
        }

        // ---------- 菜单 ----------
        ToolStripMenuItem AddItem(ContextMenuStrip m, string text, Action act)
        {
            ToolStripMenuItem it = new ToolStripMenuItem(text);
            it.Click += delegate { act(); };
            m.Items.Add(it);
            return it;
        }

        ContextMenuStrip BuildMenu()
        {
            ContextMenuStrip m = new ContextMenuStrip();
            statItem = new ToolStripMenuItem("");
            statItem.Enabled = false;
            m.Items.Add(statItem);
            m.Items.Add(new ToolStripSeparator());
            AddItem(m, "喂饼干", Feed);
            AddItem(m, "摸摸头", PetHead);
            AddItem(m, "跳一下", Jump);
            sleepItem = AddItem(m, "睡觉", ToggleSleep);
            pinItem = AddItem(m, "定在这里", TogglePin);
            m.Items.Add(new ToolStripSeparator());
            ToolStripMenuItem claude = AddItem(m, "打开 Claude", OpenClaude);
            claude.Font = new Font(claude.Font, FontStyle.Bold);
            m.Items.Add(new ToolStripSeparator());
            AddItem(m, "叫它回来", ComeHome);
            autoItem = AddItem(m, "开机自动启动", ToggleAutoStart);
            AddItem(m, "退出", Quit);
            m.Opening += delegate
            {
                statItem.Text = string.Format("Clawd · 饱腹 {0:0} · 心情 {1:0}", food, mood);
                sleepItem.Text = state == "sleep" ? "叫醒它" : "睡觉";
                pinItem.Checked = pinned;
                autoItem.Checked = AutoStartOn();
                autoItem.Enabled = !string.IsNullOrEmpty(launcherPath);
            };
            return m;
        }

        // ---------- 动作 ----------
        void PetHead()
        {
            Touch();
            if (state == "sleep") { SetState("idle", R(1.5f, 3f)); Say(Pick(WakeLines), 2.4f); return; }
            if (InAir()) return;
            mood = Clamp(mood + 8, 0, 100);
            SetState("happy", 1.3f);
            Hearts(4);
            Say(Pick(TapLines), 2.4f);
        }

        void Feed()
        {
            Touch();
            Rectangle wa = Area();
            CookieForm c = new CookieForm(Math.Max(2, (int)Math.Round(U * 0.6f)));
            c.X = pinned ? px : Clamp(px + R(-300, 300) * S, wa.Left + 40 * S, wa.Right - 40 * S);
            c.Y = wa.Top + 10;
            c.Floor = pinned ? py : wa.Bottom;
            c.Place();
            c.Show();
            cookies.Add(c);
            if (state == "sleep") { SetState("idle", 0.5f); Say("…闻到饼干味了！", 2f); }
        }

        void Jump()
        {
            Touch();
            if (InAir() || state == "sleep") return;
            vy = -620 * S;
            vx = 0;
            squash = -0.15f;
            SetState("jump", 0);
        }

        void ToggleSleep()
        {
            Touch();
            if (state == "sleep") { SetState("idle", 2f); Say(Pick(WakeLines), 2.4f); return; }
            if (InAir()) return;
            SetState("sleep", R(90, 240));
            Say("晚安…", 1.5f);
        }

        void TogglePin()
        {
            Touch();
            if (InAir()) return;
            pinned = !pinned;
            if (pinned)
            {
                pinY = py;
                if (state == "walk") SetState("idle", 2);
                Say("好，我就待在这儿！拖我可以换地方", 3f);
            }
            else Say("自由啦～", 2f);
            SaveState();
        }

        void OpenClaude()
        {
            Touch();
            Say("去找 Claude 玩吧！", 2f);
            try { Process.Start(ClaudeUrl); }
            catch { Say("打不开浏览器…", 2f); }
        }

        void ComeHome()
        {
            Touch();
            Rectangle wa = Screen.PrimaryScreen.WorkingArea;
            pinned = false;
            px = wa.Right - 220 * S;
            py = wa.Top + 40 * S;
            vx = 0;
            vy = 0;
            SetState("fall", 0);
            Say("我在这儿！", 2f);
        }

        bool AutoStartOn()
        {
            try
            {
                using (RegistryKey k = Registry.CurrentUser.OpenSubKey(RunKey))
                    return k != null && k.GetValue(RunName) != null;
            }
            catch { return false; }
        }

        void ToggleAutoStart()
        {
            try
            {
                bool on = AutoStartOn();
                using (RegistryKey k = Registry.CurrentUser.CreateSubKey(RunKey))
                {
                    if (on) k.DeleteValue(RunName, false);
                    else k.SetValue(RunName, "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File \"" + launcherPath + "\"");
                }
                Say(on ? "好的，开机不自己跑出来了" : "以后开机我就自己出来！", 2.5f);
            }
            catch { Say("设置失败了…", 2f); }
        }

        void Quit()
        {
            SaveState();
            Close();
        }

        protected override void OnFormClosed(FormClosedEventArgs e)
        {
            timer.Stop();
            SaveState();
            tray.Visible = false;
            tray.Dispose();
            foreach (CookieForm c in cookies) c.Close();
            base.OnFormClosed(e);
            Application.Exit();
        }

        void Hearts(int n)
        {
            for (int i = 0; i < n; i++)
            {
                Particle p = new Particle();
                p.Kind = "heart";
                p.X = R(-30, 30) * S; p.Y = -10 * U + R(-10, 10) * S;
                p.Vx = R(-10, 10) * S; p.Vy = R(-50, -30) * S;
                p.Life = R(1f, 1.6f);
                parts.Add(p);
            }
        }

        void Stars()
        {
            for (int i = 0; i < 6; i++)
            {
                double a = i / 6.0 * Math.PI * 2;
                Particle p = new Particle();
                p.Kind = "star";
                p.X = (float)Math.Cos(a) * 40 * S; p.Y = -9 * U + (float)Math.Sin(a) * 12 * S;
                p.Vx = -(float)Math.Sin(a) * 40 * S; p.Vy = (float)Math.Cos(a) * 12 * S;
                p.Life = 1.6f;
                parts.Add(p);
            }
        }

        CookieForm NearestCookie()
        {
            CookieForm best = null;
            float d = float.MaxValue;
            foreach (CookieForm c in cookies)
            {
                if (!c.Landed || Math.Abs(c.Floor - py) > 4) continue;
                float dd = Math.Abs(c.X - px);
                if (dd < d) { d = dd; best = c; }
            }
            return best;
        }

        string ChatLine()
        {
            int h = DateTime.Now.Hour;
            if (food < 35) return Pick(HungryLines);
            if (h >= 23 || h < 6) return rnd.Next(2) == 0 ? "这么晚了还不睡吗…" : "早点休息哦";
            if (h >= 11 && h < 13 && rnd.Next(3) == 0) return "该吃午饭啦";
            if (h >= 17 && h < 19 && rnd.Next(3) == 0) return "快下班了吗？";
            return Pick(IdleLines);
        }

        // ---------- 每帧 ----------
        void Tick()
        {
            long now = sw.ElapsedMilliseconds;
            float dt = Math.Min((now - lastMs) / 1000f, 0.05f);
            lastMs = now;

            if (dragging)
            {
                Point c = Cursor.Position;
                px = c.X - grabDx;
                py = Math.Min(c.Y - grabDy, Area().Bottom);
                if (now - lastMouseMs > 80) { mvx = 0; mvy = 0; }
            }

            Step(dt);
            Place();
            Invalidate();
        }

        void Step(float dt)
        {
            t += dt;
            idleFor += dt;
            squash *= (float)Math.Pow(0.0005, dt);
            if (Math.Abs(squash) < 0.005f) squash = 0;

            nextBlink -= dt;
            if (blink > 0) blink -= dt;
            if (nextBlink <= 0) { blink = 0.12f; nextBlink = R(2, 5); }

            Rectangle wa = Area();
            float floor = pinned ? pinY : wa.Bottom;
            float minX = wa.Left + 50 * S, maxX = wa.Right - 50 * S;

            // 饼干下落
            foreach (CookieForm c in cookies)
            {
                if (c.Landed) continue;
                c.Vy += 1600 * S * dt;
                c.Y += c.Vy * dt;
                if (c.Y >= c.Floor) { c.Y = c.Floor; c.Landed = true; }
                c.Place();
            }

            // 屏幕或任务栏变了：站不住就掉下去
            if (!InAir())
            {
                if (py < floor - 1) { vy = 0; vx = 0; SetState("fall", 0); }
                else if (py > floor) py = floor;
            }

            bool busy = InAir() || state == "eat" || state == "sleep" || state == "dizzy";
            if (!busy)
            {
                CookieForm f = NearestCookie();
                if (f != null)
                {
                    if (Math.Abs(f.X - px) < 10 * S)
                    {
                        eating = f;
                        SetState("eat", 1.4f);
                        Say(Pick(EatLines), 1.4f);
                    }
                    else if (state != "walk" || target != f.X)
                    {
                        if (state != "walk") Say(Pick(ComeLines), 1.2f);
                        target = f.X;
                        SetState("walk", 0);
                    }
                }
            }

            if (state == "idle" || state == "walk")
            {
                chatIn -= dt;
                if (chatIn <= 0) { Say(ChatLine(), 3.5f); chatIn = R(30, 80); }
            }

            switch (state)
            {
                case "idle":
                    if (t > next)
                    {
                        if (idleFor > 180) { SetState("sleep", R(90, 240)); break; }
                        if (!pinned && rnd.NextDouble() < 0.5)
                        {
                            target = Clamp(px + R(-350, 350) * S, minX, maxX);
                            SetState("walk", 0);
                        }
                        else SetState("idle", R(3, 7));
                    }
                    break;

                case "walk":
                {
                    float dx = target - px;
                    if (dx != 0) dir = Math.Sign(dx);
                    float sp = 55 * S;
                    walkPhase += dt * 7;
                    if (Math.Abs(dx) <= sp * dt) { px = target; SetState("idle", R(2, 6)); }
                    else px += dir * sp * dt;
                    break;
                }

                case "fall":
                case "jump":
                    vy += 2000 * S * dt;
                    py += vy * dt;
                    px += vx * dt;
                    vx *= (float)Math.Pow(0.5, dt);
                    if (px < minX) { px = minX; vx = -vx * 0.5f; }
                    if (px > maxX) { px = maxX; vx = -vx * 0.5f; }
                    if (py >= floor && vy >= 0)
                    {
                        bool hard = vy > 1300 * S;
                        squash = Clamp(vy / (2800 * S), 0.08f, 0.35f);
                        py = floor; vy = 0; vx = 0;
                        if (hard) { SetState("dizzy", 1.8f); Stars(); Say(Pick(LandLines), 1.8f); }
                        else SetState("idle", R(1, 2.5f));
                    }
                    break;

                case "happy":
                    if (t > next) SetState("idle", R(1.5f, 3));
                    break;

                case "eat":
                    if (t > next)
                    {
                        if (eating != null && cookies.Remove(eating)) eating.Close();
                        eating = null;
                        food = Clamp(food + 20, 0, 100);
                        mood = Clamp(mood + 4, 0, 100);
                        Hearts(2);
                        SetState("idle", R(1, 2));
                    }
                    break;

                case "dizzy":
                    if (t > next) SetState("idle", R(1, 2));
                    break;

                case "sleep":
                    if (rnd.NextDouble() < dt * 0.9)
                    {
                        Particle p = new Particle();
                        p.Kind = "z";
                        p.X = 30 * S + R(0, 10) * S; p.Y = -9 * U;
                        p.Vx = R(8, 18) * S; p.Vy = -22 * S;
                        p.Life = 2.2f;
                        p.Size = R(9, 13);
                        parts.Add(p);
                    }
                    if (t > next) { SetState("idle", 2); Say("睡饱啦！", 2f); }
                    break;
            }

            float hours = dt / 3600f;
            food = Clamp(food - hours * (state == "sleep" ? 8 : 20), 0, 100);
            mood = Clamp(mood - hours * (state == "sleep" ? 4 : 15), 0, 100);

            for (int i = parts.Count - 1; i >= 0; i--)
            {
                Particle q = parts[i];
                q.T += dt;
                q.X += q.Vx * dt;
                q.Y += q.Vy * dt;
                if (q.T > q.Life) parts.RemoveAt(i);
            }

            if (bubbleTime > 0) bubbleTime -= dt;

            saveIn -= dt;
            if (saveIn <= 0) { SaveState(); saveIn = 30; }
        }

        // ---------- 鼠标 ----------
        protected override void OnMouseDown(MouseEventArgs e)
        {
            base.OnMouseDown(e);
            if (e.Button != MouseButtons.Left) return;
            down = true;
            dragging = false;
            downScreen = Cursor.Position;
            lastMouse = downScreen;
            lastMouseMs = sw.ElapsedMilliseconds;
            grabDx = downScreen.X - px;
            grabDy = downScreen.Y - py;
            mvx = 0; mvy = 0;
        }

        protected override void OnMouseMove(MouseEventArgs e)
        {
            base.OnMouseMove(e);
            if (!down) return;
            Point c = Cursor.Position;
            if (!dragging)
            {
                int ddx = c.X - downScreen.X, ddy = c.Y - downScreen.Y;
                if (ddx * ddx + ddy * ddy > 25 * S * S)
                {
                    dragging = true;
                    Touch();
                    if (eating != null) eating = null;
                    SetState("held", 0);
                    Say(Pick(HeldLines), 1.6f);
                }
            }
            if (dragging)
            {
                long ms = sw.ElapsedMilliseconds;
                float dtm = Math.Max(1, ms - lastMouseMs) / 1000f;
                mvx = 0.6f * mvx + 0.4f * (c.X - lastMouse.X) / dtm;
                mvy = 0.6f * mvy + 0.4f * (c.Y - lastMouse.Y) / dtm;
                lastMouse = c;
                lastMouseMs = ms;
            }
        }

        protected override void OnMouseUp(MouseEventArgs e)
        {
            base.OnMouseUp(e);
            if (e.Button != MouseButtons.Left) return;
            if (dragging && pinned)
            {
                pinY = py;
                squash = 0.12f;
                SetState("idle", R(1, 2.5f));
                Say("这里不错！", 1.6f);
                SaveState();
            }
            else if (dragging)
            {
                vx = Clamp(mvx, -1600 * S, 1600 * S);
                vy = Clamp(mvy, -1400 * S, 1800 * S);
                SetState("fall", 0);
            }
            else if (down) PetHead();
            down = false;
            dragging = false;
        }

        // ---------- 画 ----------
        static void Px(Graphics g, Brush b, float x, float y, float w, float h)
        {
            g.FillRectangle(b, (float)Math.Round(x), (float)Math.Round(y), (float)Math.Round(w), (float)Math.Round(h));
        }

        // 以脚底中心为原点画 Clawd
        static void DrawSprite(Graphics g, float u, string s, int dir, int step, float t, bool blinking, float bob)
        {
            bool walking = s == "walk";
            bool sleeping = s == "sleep";
            using (SolidBrush body = new SolidBrush(BodyC))
            using (SolidBrush leg = new SolidBrush(LegC))
            using (SolidBrush eye = new SolidBrush(EyeC))
            {
                int[] legCols = { -5, -3, 2, 4 };
                for (int i = 0; i < 4; i++)
                {
                    float h = 2 * u;
                    if (walking && (i % 2) == step) h = u;
                    if (s == "held") h = 2 * u + (i % 2 == 1 ? 2 : 0);
                    if (sleeping) h = u * 0.8f;
                    Px(g, leg, legCols[i] * u, -h, u, h);
                }
                float legH = sleeping ? u * 0.8f : 2 * u;
                float top = -legH - 7 * u + bob;

                Px(g, body, -6 * u, top, 12 * u, 7 * u);

                float lA = 0, rA = 0;
                if (s == "happy" || s == "held")
                {
                    bool up = Math.Sin(t * 18) > 0;
                    lA = up ? -u : 0;
                    rA = up ? 0 : -u;
                }
                if (s == "eat") { lA = rA = Math.Sin(t * 14) > 0 ? -u : 0; }
                Px(g, body, -7 * u, top + 3 * u + lA, u, 2 * u);
                Px(g, body, 6 * u, top + 3 * u + rA, u, 2 * u);

                int look = (walking || s == "eat") ? dir : 0;
                int[] eyes = { -4 + look, 3 + look };
                float eyeTop = top + 2 * u;
                for (int i = 0; i < 2; i++)
                {
                    float ex = eyes[i] * u;
                    if (sleeping) Px(g, eye, ex - u * 0.25f, eyeTop + 1.5f * u, u * 1.5f, u * 0.5f);
                    else if (s == "happy")
                    {
                        Px(g, eye, ex - u * 0.5f, eyeTop + u, u * 0.5f, u * 0.5f);
                        Px(g, eye, ex, eyeTop + u * 0.5f, u, u * 0.5f);
                        Px(g, eye, ex + u, eyeTop + u, u * 0.5f, u * 0.5f);
                    }
                    else if (s == "dizzy")
                    {
                        bool up = ((int)Math.Floor(t * 6) + i) % 2 == 1;
                        Px(g, eye, ex, eyeTop + (up ? 0 : u), u, u);
                    }
                    else if (blinking) Px(g, eye, ex, eyeTop + 1.25f * u, u, u * 0.5f);
                    else Px(g, eye, ex, eyeTop, u, 2 * u);
                }
                if (s == "eat" && Math.Sin(t * 14) > 0) Px(g, eye, -u, top + 5 * u, 2 * u, u);
                if (s == "held") Px(g, eye, -u * 0.5f, top + 5 * u, u, u);
            }
        }

        static void DrawHeart(Graphics g, float x, float y, float u)
        {
            using (SolidBrush b = new SolidBrush(HeartC))
            {
                Px(g, b, x - 2 * u, y, u * 1.5f, u);
                Px(g, b, x + 0.5f * u, y, u * 1.5f, u);
                Px(g, b, x - 2.5f * u, y + u, 5 * u, u);
                Px(g, b, x - 2 * u, y + 2 * u, 4 * u, u);
                Px(g, b, x - u, y + 3 * u, 2 * u, u);
            }
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.None;
            g.InterpolationMode = InterpolationMode.NearestNeighbor;

            float ax = FW / 2f, ay = FH - 2 * S;
            float hop = state == "happy" ? (float)Math.Abs(Math.Sin(t * 9)) * 8 * S : 0;
            int step = (int)Math.Floor(walkPhase) % 2;
            float bob = state == "walk" ? (step == 1 ? -U * 0.5f : 0) : (state == "sleep" ? (float)Math.Sin(t * 2) * 1.5f * S : 0);

            GraphicsState gs = g.Save();
            g.TranslateTransform(ax, ay - hop);
            g.ScaleTransform(1 + squash * 0.6f, 1 - squash);
            if (state == "held") g.RotateTransform((float)Math.Sin(t * 8) * 7);
            DrawSprite(g, U, state, dir, step, t, blink > 0, bob);
            g.Restore(gs);

            // 粒子：坐标相对脚底
            foreach (Particle q in parts)
            {
                float x = ax + q.X, y = ay + q.Y;
                if (q.Kind == "heart") DrawHeart(g, x, y, 2.5f * S);
                else if (q.Kind == "star")
                {
                    using (SolidBrush b = new SolidBrush(StarC)) Px(g, b, x - 2 * S, y - 2 * S, 4 * S, 4 * S);
                }
                else if (q.Kind == "z")
                {
                    g.TextRenderingHint = TextRenderingHint.SingleBitPerPixelGridFit;
                    using (Font f = new Font(zFont.FontFamily, q.Size, FontStyle.Bold))
                    using (SolidBrush b = new SolidBrush(ZC))
                        g.DrawString("z", f, b, x, y);
                }
            }

            if (bubbleTime > 0 && !string.IsNullOrEmpty(bubbleText)) DrawBubble(g, ax, ay - 9 * U - hop - 12 * S);
        }

        void DrawBubble(Graphics g, float cx, float bottom)
        {
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            int maxW = (int)(FW - 24 * S);
            SizeF sz = g.MeasureString(bubbleText, bubbleFont, maxW);
            float pad = 7 * S;
            float w = (float)Math.Ceiling(sz.Width + pad * 2), h = (float)Math.Ceiling(sz.Height + pad * 1.4f);
            float x = Clamp(cx - w / 2, 2, FW - w - 6 * S);
            float y = Math.Max(2, bottom - h);
            float bw = Math.Max(2, (float)Math.Round(2 * S));

            using (SolidBrush ink = new SolidBrush(InkC))
            using (SolidBrush paper = new SolidBrush(Color.White))
            {
                Px(g, ink, x + 3 * S, y + 3 * S, w, h);           // 阴影
                Px(g, ink, x, y, w, h);                           // 边框
                Px(g, paper, x + bw, y + bw, w - 2 * bw, h - 2 * bw);
                // 小尾巴
                float tx = Clamp(cx, x + 12 * S, x + w - 12 * S);
                PointF[] outer = { new PointF(tx - 7 * S, y + h - bw), new PointF(tx + 7 * S, y + h - bw), new PointF(tx, y + h + 7 * S) };
                g.FillPolygon(ink, outer);
                PointF[] inner = { new PointF(tx - 7 * S + bw * 1.6f, y + h - bw - 1), new PointF(tx + 7 * S - bw * 1.6f, y + h - bw - 1), new PointF(tx, y + h + 7 * S - bw * 2) };
                g.FillPolygon(paper, inner);
                g.DrawString(bubbleText, bubbleFont, ink, new RectangleF(x + pad, y + pad * 0.7f, maxW, h));
            }
        }

        static Icon MakeIcon()
        {
            using (Bitmap bmp = new Bitmap(32, 32))
            {
                using (Graphics g = Graphics.FromImage(bmp))
                {
                    g.Clear(Color.Transparent);
                    g.SmoothingMode = SmoothingMode.None;
                    g.TranslateTransform(16, 27);
                    DrawSprite(g, 2.3f, "idle", 0, 0, 0, false, 0);
                }
                return Icon.FromHandle(bmp.GetHicon());
            }
        }
    }
}

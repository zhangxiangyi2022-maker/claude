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
        public Color Color;
    }

    // 小玩具窗口的公共部分：无边框、透明、置顶、不抢焦点
    class ToyForm : Form
    {
        readonly bool clickThrough;

        public ToyForm(int w, int h, bool passClicks)
        {
            clickThrough = passClicks;
            FormBorderStyle = FormBorderStyle.None;
            ShowInTaskbar = false;
            TopMost = true;
            StartPosition = FormStartPosition.Manual;
            BackColor = PetForm.Key;
            TransparencyKey = PetForm.Key;
            DoubleBuffered = true;
            Size = new Size(w, h);
        }

        protected override bool ShowWithoutActivation { get { return true; } }

        protected override CreateParams CreateParams
        {
            get
            {
                CreateParams cp = base.CreateParams;
                cp.ExStyle |= 0x80;                    // WS_EX_TOOLWINDOW：不出现在 Alt+Tab 里
                if (clickThrough) cp.ExStyle |= 0x20;  // WS_EX_TRANSPARENT：鼠标穿透
                return cp;
            }
        }
    }

    // 掉下来的饼干，鼠标可以穿透
    class CookieForm : ToyForm
    {
        public float X, Y, Vy, Floor;
        public bool Landed;
        public PetForm Claimer;   // 哪只 Clawd 正在吃
        readonly int u;

        public CookieForm(int unit) : base(6 * unit, 6 * unit, true) { u = unit; }

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

    // 球：可以用鼠标拖着扔，Clawd 会追着踢
    class BallForm : ToyForm
    {
        public float X, Y, Vx, Vy;   // X 是中心，Y 是底部
        public bool Held;
        public float KickCooldown;
        public readonly int Radius;
        readonly float s;
        readonly Stopwatch sw = Stopwatch.StartNew();
        Point last;
        long lastMs;
        float mvx, mvy;

        public BallForm(int radius, float scale) : base(radius * 2, radius * 2, false)
        {
            Radius = radius;
            s = scale;
            Cursor = Cursors.Hand;
        }

        public void Place()
        {
            Location = new Point((int)Math.Round(X - Radius), (int)Math.Round(Y - 2 * Radius));
        }

        public Rectangle Area()
        {
            return Screen.FromPoint(new Point((int)X, (int)Y - 5)).WorkingArea;
        }

        public bool OnGround()
        {
            return !Held && Math.Abs(Y - Area().Bottom) < 2 && Math.Abs(Vy) < 1;
        }

        public void Step(float dt)
        {
            KickCooldown -= dt;
            if (Held)
            {
                if (sw.ElapsedMilliseconds - lastMs > 80) { mvx = 0; mvy = 0; }
                return;
            }
            Rectangle wa = Area();
            Vy += 1800 * s * dt;
            X += Vx * dt;
            Y += Vy * dt;
            if (Y >= wa.Bottom)
            {
                Y = wa.Bottom;
                Vy = Vy > 150 * s ? -Vy * 0.55f : 0;
                Vx *= (float)Math.Pow(0.35, dt);
            }
            if (Y < wa.Top + 2 * Radius) { Y = wa.Top + 2 * Radius; Vy = Math.Abs(Vy) * 0.5f; }
            if (X < wa.Left + Radius) { X = wa.Left + Radius; Vx = Math.Abs(Vx) * 0.7f; }
            if (X > wa.Right - Radius) { X = wa.Right - Radius; Vx = -Math.Abs(Vx) * 0.7f; }
            if (Math.Abs(Vx) < 5 * s && Y >= wa.Bottom) Vx = 0;
            Place();
        }

        protected override void OnMouseDown(MouseEventArgs e)
        {
            base.OnMouseDown(e);
            if (e.Button != MouseButtons.Left) return;
            Held = true;
            last = Cursor.Position;
            lastMs = sw.ElapsedMilliseconds;
            mvx = 0; mvy = 0;
        }

        protected override void OnMouseMove(MouseEventArgs e)
        {
            base.OnMouseMove(e);
            if (!Held) return;
            Point c = Cursor.Position;
            long ms = sw.ElapsedMilliseconds;
            float dtm = Math.Max(1, ms - lastMs) / 1000f;
            mvx = 0.6f * mvx + 0.4f * (c.X - last.X) / dtm;
            mvy = 0.6f * mvy + 0.4f * (c.Y - last.Y) / dtm;
            last = c;
            lastMs = ms;
            X = c.X;
            Y = Math.Min(c.Y + Radius, Area().Bottom);
            Place();
        }

        protected override void OnMouseUp(MouseEventArgs e)
        {
            base.OnMouseUp(e);
            if (e.Button != MouseButtons.Left) return;
            Held = false;
            Vx = Math.Max(-2000 * s, Math.Min(2000 * s, mvx));
            Vy = Math.Max(-2000 * s, Math.Min(2000 * s, mvy));
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.None;
            int d = Radius * 2 - 1;
            using (GraphicsPath path = new GraphicsPath())
            using (SolidBrush red = new SolidBrush(Color.FromArgb(0xE0, 0x4E, 0x4E)))
            using (SolidBrush white = new SolidBrush(Color.FromArgb(0xFA, 0xF7, 0xF2)))
            using (SolidBrush blue = new SolidBrush(Color.FromArgb(0x4E, 0x8B, 0xD9)))
            {
                path.AddEllipse(0, 0, d, d);
                g.FillPath(red, path);
                g.SetClip(path);
                g.FillRectangle(white, 0, (int)(Radius * 0.75f), d + 1, (int)(Radius * 0.5f));
                g.FillRectangle(blue, (int)(Radius * 0.8f), 0, (int)(Radius * 0.4f), d + 1);
                g.ResetClip();
            }
        }
    }

    public class PetForm : Form
    {
        public static readonly Color Key = Color.FromArgb(255, 0, 254);
        static readonly Color EyeC = Color.FromArgb(0x1B, 0x14, 0x11);
        static readonly Color HeartC = Color.FromArgb(0xE4, 0x6F, 0x8F);
        static readonly Color StarC = Color.FromArgb(0xE0, 0xA2, 0x4A);
        static readonly Color AngerC = Color.FromArgb(0xE0, 0x3E, 0x3E);
        static readonly Color InkC = Color.FromArgb(0x2B, 0x2E, 0x35);
        static readonly Color ZC = Color.FromArgb(0x7A, 0x80, 0x8C);
        static readonly Color TomatoC = Color.FromArgb(0xD9, 0x4A, 0x3D);
        static readonly Color[] NoteColors = { Color.FromArgb(0x7B, 0x6C, 0xD9), Color.FromArgb(0x4E, 0x8B, 0xD9), Color.FromArgb(0xE4, 0x6F, 0x8F), Color.FromArgb(0x3F, 0xA7, 0x7A) };
        static readonly Color ClawdOrange = Color.FromArgb(0xD9, 0x77, 0x57);
        // 新来的 Clawd 的颜色
        static readonly Color[] FriendColors = {
            Color.FromArgb(0xE8, 0xA2, 0x5A), Color.FromArgb(0x7F, 0xA7, 0xD9), Color.FromArgb(0x8F, 0xBF, 0x7F),
            Color.FromArgb(0xB4, 0x8E, 0xD6), Color.FromArgb(0xE8, 0x8F, 0xA8), Color.FromArgb(0xC9, 0x82, 0x6B)
        };
        static readonly string[] FriendNames = { "橘子", "蓝莓", "青提", "葡萄", "草莓", "可可" };

        const string ClaudeUrl = "https://claude.ai/new";
        const string RunKey = @"Software\Microsoft\Windows\CurrentVersion\Run";
        const string RunName = "ClawdDesktopPet";
        const int MaxPets = 7;
        const int PomodoroMinutes = 25;

        static readonly string[] TapLines = { "嘿嘿～", "摸摸头！", "再摸一下嘛", "嗯？叫我吗", "今天也要加油哦" };
        static readonly string[] IdleLines = { "git push 了吗？", "要不要喝口水", "我在看着你哦", "休息一下眼睛吧", "这个 bug 我好像见过…", "记得保存文件！", "右键我可以打开 Claude 哦", "要不要来个番茄钟？" };
        static readonly string[] HungryLines = { "肚子咕咕叫…", "有饼干吗…右键喂我", "饿饿" };
        static readonly string[] HeldLines = { "哇啊啊——", "放我下来！", "好高！" };
        static readonly string[] LandLines = { "晕…", "眼冒金星…", "下次轻点扔嘛" };
        static readonly string[] WakeLines = { "唔…我醒着呢", "没睡没睡", "刚才在思考" };
        static readonly string[] EatLines = { "好吃！", "嚼嚼嚼", "再来一块！" };
        static readonly string[] ComeLines = { "开饭啦！", "饼干！", "冲！" };
        static readonly string[] AngryLines = { "别戳啦！", "哼！生气了！", "再戳我咬你哦", "戳戳戳，烦死啦" };
        static readonly string[] KickLines = { "看我的！", "射门！", "嘿！", "接着！" };
        static readonly string[] CatchLines = { "抓到你啦！", "嘿嘿，追上了", "鼠标别跑！" };

        // 所有 Clawd 共享的东西
        static readonly List<PetForm> pets = new List<PetForm>();
        static readonly List<CookieForm> cookies = new List<CookieForm>();
        static BallForm ball;
        static bool chaseMouse;
        static DateTime pomoEnd = DateTime.MinValue;
        static bool pomoHalfSaid, pomoFiveSaid;
        static readonly Random rnd = new Random();
        static int friendIndex;
        static float zoom = 2f;   // 大小：1 小 / 1.5 中 / 2 大 / 3 超大
        static readonly float[] Zooms = { 1f, 1.5f, 2f, 3f };
        static readonly string[] ZoomNames = { "小", "中", "大", "超大" };

        readonly bool isMain;
        readonly string petName;
        readonly Color bodyC, legC;

        readonly float S;   // DPI 缩放
        int U;              // 一个像素格的大小（跟着 DPI 和大小设置变）
        int FW, FH;

        float px, py, vx, vy;
        int dir = 1;
        string state = "idle";
        float t, next = 2f, target, walkSpeed = 55, squash, blink, nextBlink = 2f, walkPhase, idleFor, chatIn = 20f, noteIn;
        CookieForm eating;
        readonly List<Particle> parts = new List<Particle>();
        readonly List<long> pokes = new List<long>();
        string bubbleText;
        float bubbleTime;
        float food = 70f, mood = 70f, saveIn = 30f;
        bool pinned;      // 定住：拖到哪儿就待在哪儿
        float pinY;

        readonly System.Windows.Forms.Timer timer;
        readonly Stopwatch sw = Stopwatch.StartNew();
        long lastMs;

        bool down, dragging;
        Point downScreen, lastMouse;
        float grabDx, grabDy, mvx, mvy;
        long lastMouseMs;

        readonly NotifyIcon tray;
        readonly ContextMenuStrip menu;
        ToolStripMenuItem statItem, sleepItem, autoItem, pinItem, chaseItem, ballItem, pomoItem, friendItem;
        readonly List<ToolStripMenuItem> zoomItems = new List<ToolStripMenuItem>();
        readonly string launcherPath, savePath;
        Font bubbleFont, timerFont;
        readonly Font zFont;

        public PetForm(string launcher) : this(launcher, null) { }

        PetForm(string launcher, PetForm parent)
        {
            launcherPath = launcher;
            isMain = parent == null;
            FormBorderStyle = FormBorderStyle.None;
            ShowInTaskbar = false;
            TopMost = true;
            StartPosition = FormStartPosition.Manual;
            BackColor = Key;
            TransparencyKey = Key;
            DoubleBuffered = true;
            Text = "Clawd";

            using (Graphics g = CreateGraphics()) S = g.DpiX / 96f;
            zFont = new Font("Consolas", 11f, FontStyle.Bold);

            string dirPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "ClawdPet");
            savePath = Path.Combine(dirPath, "state.txt");
            if (isMain) LoadState();
            ApplyZoom();

            Rectangle wa = Screen.PrimaryScreen.WorkingArea;
            if (isMain)
            {
                petName = "Clawd";
                bodyC = ClawdOrange;
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
            }
            else
            {
                int i = friendIndex++ % FriendColors.Length;
                petName = FriendNames[i];
                bodyC = FriendColors[i];
                food = parent.food;
                mood = parent.mood;
                px = Clamp(parent.px + R(-400, 400) * S, wa.Left + 60 * S, wa.Right - 60 * S);
                py = wa.Top + 60 * S;
                state = "fall";
            }
            legC = Darker(bodyC, 0.88f);
            target = px;

            menu = BuildMenu();
            ContextMenuStrip = menu;

            if (isMain)
            {
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
            }

            timer = new System.Windows.Forms.Timer();
            timer.Interval = 15;
            timer.Tick += delegate { Tick(); };

            pets.Add(this);
            Load += delegate
            {
                Place();
                timer.Start();
                if (isMain) Say("嗨！我是 Clawd～右键我有菜单哦", 4f);
                else Say("我是" + petName + "，我也来啦！", 3f);
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
        static float R(float a, float b) { return a + (float)rnd.NextDouble() * (b - a); }
        static string Pick(string[] arr) { return arr[rnd.Next(arr.Length)]; }
        static float Clamp(float v, float a, float b) { return Math.Max(a, Math.Min(b, v)); }
        static Color Darker(Color c, float k) { return Color.FromArgb((int)(c.R * k), (int)(c.G * k), (int)(c.B * k)); }
        static bool PomoActive { get { return pomoEnd > DateTime.Now; } }

        Rectangle Area()
        {
            return Screen.FromPoint(new Point((int)px, (int)py - 10)).WorkingArea;
        }

        // 按当前大小重新算像素格、窗口和字体
        void ApplyZoom()
        {
            U = Math.Max(3, (int)Math.Round(5 * S * zoom));
            FW = (int)Math.Max(260 * S, 18 * U + 60 * S);
            FH = 11 * U + (int)(130 * S);
            Size = new Size(FW, FH);
            float fs = Clamp(zoom * 0.75f, 1f, 1.7f);
            if (bubbleFont != null) bubbleFont.Dispose();
            if (timerFont != null) timerFont.Dispose();
            bubbleFont = new Font("Microsoft YaHei UI", 9.5f * fs);
            timerFont = new Font("Consolas", 8.5f * fs, FontStyle.Bold);
        }

        void SetZoom(float z)
        {
            zoom = z;
            foreach (PetForm p in pets.ToArray())
            {
                p.ApplyZoom();
                p.Place();
                p.Invalidate();
            }
            Say(z >= 3 ? "我变大啦！！" : (z <= 1 ? "缩小～" : "这个大小刚刚好"), 2f);
            foreach (PetForm p in pets) if (p.isMain) p.SaveState();
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

        void WalkTo(float x, float speed)
        {
            target = x;
            walkSpeed = speed;
            if (state != "walk") SetState("walk", 0);
        }

        // ---------- 存档（只存主 Clawd） ----------
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
                if (p.Length >= 7) zoom = Clamp(float.Parse(p[6], CultureInfo.InvariantCulture), 1f, 3f);
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
            if (!isMain) return;
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(savePath));
                File.WriteAllText(savePath, string.Format(CultureInfo.InvariantCulture, "{0:0.0},{1:0.0},{2},{3},{4:0},{5:0},{6:0.0}", food, mood, DateTime.UtcNow.Ticks, pinned ? 1 : 0, px, pinY, zoom));
            }
            catch { }
        }

        // ---------- 菜单 ----------
        static ToolStripMenuItem AddItem(ToolStripItemCollection items, string text, Action act)
        {
            ToolStripMenuItem it = new ToolStripMenuItem(text);
            it.Click += delegate { act(); };
            items.Add(it);
            return it;
        }

        ContextMenuStrip BuildMenu()
        {
            ContextMenuStrip m = new ContextMenuStrip();
            statItem = new ToolStripMenuItem("");
            statItem.Enabled = false;
            m.Items.Add(statItem);
            m.Items.Add(new ToolStripSeparator());
            AddItem(m.Items, "喂饼干", Feed);
            AddItem(m.Items, "摸摸头", PetHead);
            AddItem(m.Items, "跳一下", Jump);
            sleepItem = AddItem(m.Items, "睡觉", ToggleSleep);
            pinItem = AddItem(m.Items, "定在这里", TogglePin);

            ToolStripMenuItem play = new ToolStripMenuItem("一起玩");
            m.Items.Add(play);
            AddItem(play.DropDownItems, "跳舞", DanceAll);
            ballItem = AddItem(play.DropDownItems, "扔个球", ToggleBall);
            chaseItem = AddItem(play.DropDownItems, "追鼠标", ToggleChase);
            friendItem = AddItem(play.DropDownItems, "再来一只 Clawd", AddFriend);
            pomoItem = AddItem(m.Items, "番茄钟（25 分钟）", TogglePomodoro);

            ToolStripMenuItem sizeMenu = new ToolStripMenuItem("大小");
            m.Items.Add(sizeMenu);
            for (int i = 0; i < Zooms.Length; i++)
            {
                float z = Zooms[i];
                zoomItems.Add(AddItem(sizeMenu.DropDownItems, ZoomNames[i], delegate { SetZoom(z); }));
            }

            m.Items.Add(new ToolStripSeparator());
            ToolStripMenuItem claude = AddItem(m.Items, "打开 Claude", OpenClaude);
            claude.Font = new Font(claude.Font, FontStyle.Bold);
            m.Items.Add(new ToolStripSeparator());
            if (isMain)
            {
                AddItem(m.Items, "叫它回来", ComeHome);
                autoItem = AddItem(m.Items, "开机自动启动", ToggleAutoStart);
                AddItem(m.Items, "退出", Quit);
            }
            else AddItem(m.Items, "让" + petName + "回家", Close);

            m.Opening += delegate
            {
                statItem.Text = string.Format("{0} · 饱腹 {1:0} · 心情 {2:0}", petName, food, mood);
                sleepItem.Text = state == "sleep" ? "叫醒它" : "睡觉";
                pinItem.Checked = pinned;
                chaseItem.Checked = chaseMouse;
                for (int i = 0; i < zoomItems.Count; i++) zoomItems[i].Checked = Math.Abs(Zooms[i] - zoom) < 0.01f;
                ballItem.Text = ball != null ? "收起球" : "扔个球";
                friendItem.Enabled = pets.Count < MaxPets;
                if (PomoActive)
                    pomoItem.Text = string.Format("停止番茄钟（还剩 {0} 分钟）", (int)Math.Ceiling((pomoEnd - DateTime.Now).TotalMinutes));
                else
                    pomoItem.Text = "番茄钟（25 分钟）";
                if (autoItem != null)
                {
                    autoItem.Checked = AutoStartOn();
                    autoItem.Enabled = !string.IsNullOrEmpty(launcherPath);
                }
            };
            return m;
        }

        // ---------- 动作 ----------
        void PetHead()
        {
            Touch();
            if (state == "sleep") { SetState("idle", R(1.5f, 3f)); Say(Pick(WakeLines), 2.4f); return; }
            if (InAir()) return;
            if (state == "angry") { Say("哼！", 1.2f); return; }
            mood = Clamp(mood + 8, 0, 100);
            SetState("happy", 1.3f);
            Hearts(4);
            Say(Pick(TapLines), 2.4f);
        }

        // 鼠标点它：戳太多会生气
        void Poke()
        {
            long now = sw.ElapsedMilliseconds;
            pokes.Add(now);
            pokes.RemoveAll(delegate(long p) { return now - p > 2000; });
            if (pokes.Count >= 5 && state != "sleep" && !InAir())
            {
                pokes.Clear();
                Touch();
                mood = Clamp(mood - 3, 0, 100);
                SetState("angry", 2.4f);
                Say(Pick(AngryLines), 2.4f);
                return;
            }
            PetHead();
        }

        void Feed()
        {
            foreach (PetForm p in pets.ToArray()) p.DropCookie();
        }

        void DropCookie()
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

        void StartDance()
        {
            Touch();
            if (InAir() || state == "eat") return;
            SetState("dance", 6f);
            noteIn = 0;
            Say(pets.Count > 1 ? "一起跳！" : "动次打次～", 2f);
        }

        void DanceAll()
        {
            foreach (PetForm p in pets.ToArray()) p.StartDance();
        }

        void ToggleBall()
        {
            Touch();
            if (ball != null)
            {
                ball.Close();
                ball = null;
                Say("球收起来啦", 1.6f);
                return;
            }
            Rectangle wa = Area();
            ball = new BallForm(Math.Max(8, (int)Math.Round(9 * S * Math.Max(1f, zoom * 0.8f))), S);
            ball.X = Clamp(px + R(-250, 250) * S, wa.Left + 40 * S, wa.Right - 40 * S);
            ball.Y = wa.Top + 40 * S;
            ball.Vx = R(-200, 200) * S;
            ball.Place();
            ball.Show();
            Say("球！我要踢！（球可以拖着扔）", 2.6f);
        }

        void ToggleChase()
        {
            Touch();
            chaseMouse = !chaseMouse;
            Say(chaseMouse ? "鼠标别跑！我来啦！" : "不追啦，休息一下", 2f);
        }

        void AddFriend()
        {
            if (pets.Count >= MaxPets) return;
            PetForm f = new PetForm(launcherPath, this);
            f.Show();
            Say("有新朋友啦！", 2f);
        }

        void TogglePomodoro()
        {
            Touch();
            if (PomoActive)
            {
                pomoEnd = DateTime.MinValue;
                Say("番茄钟停了，休息一下吧", 2.4f);
                return;
            }
            pomoEnd = DateTime.Now.AddMinutes(PomodoroMinutes);
            pomoHalfSaid = false;
            pomoFiveSaid = false;
            Say("开始专注！" + PomodoroMinutes + " 分钟后叫你，我不吵你", 3.5f);
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
            pets.Remove(this);
            foreach (CookieForm c in cookies) if (c.Claimer == this) c.Claimer = null;
            if (isMain)
            {
                SaveState();
                tray.Visible = false;
                tray.Dispose();
                foreach (CookieForm c in cookies.ToArray()) c.Close();
                if (ball != null) ball.Close();
                foreach (PetForm p in pets.ToArray()) p.Close();
                base.OnFormClosed(e);
                Application.Exit();
                return;
            }
            base.OnFormClosed(e);
        }

        // ---------- 粒子 ----------
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

        void Note()
        {
            Particle p = new Particle();
            p.Kind = "note";
            p.X = R(-50, 50) * S; p.Y = -10 * U;
            p.Vx = R(-15, 15) * S; p.Vy = R(-45, -30) * S;
            p.Life = 1.6f;
            p.Color = NoteColors[rnd.Next(NoteColors.Length)];
            parts.Add(p);
        }

        CookieForm NearestCookie()
        {
            CookieForm best = null;
            float d = float.MaxValue;
            foreach (CookieForm c in cookies)
            {
                if (!c.Landed || Math.Abs(c.Floor - py) > 4) continue;
                if (c.Claimer != null && c.Claimer != this) continue;
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

            if (isMain) StepShared(dt);
            Step(dt);
            Place();
            Invalidate();
        }

        // 饼干、球、番茄钟只由主 Clawd 更新一次
        void StepShared(float dt)
        {
            foreach (CookieForm c in cookies)
            {
                if (c.Landed) continue;
                c.Vy += 1600 * S * dt;
                c.Y += c.Vy * dt;
                if (c.Y >= c.Floor) { c.Y = c.Floor; c.Landed = true; }
                c.Place();
            }
            if (ball != null) ball.Step(dt);

            if (pomoEnd != DateTime.MinValue)
            {
                double left = (pomoEnd - DateTime.Now).TotalMinutes;
                if (left <= 0)
                {
                    pomoEnd = DateTime.MinValue;
                    DanceAll();
                    Hearts(6);
                    Say("番茄钟到啦！起来活动一下吧～", 8f);
                }
                else if (left <= 5 && !pomoFiveSaid) { pomoFiveSaid = true; Say("还有 5 分钟，冲刺！", 3f); }
                else if (left <= PomodoroMinutes / 2.0 && !pomoHalfSaid) { pomoHalfSaid = true; Say("过半啦，加油！", 3f); }
            }
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

            // 屏幕或任务栏变了：站不住就掉下去
            if (!InAir())
            {
                if (py < floor - 1) { vy = 0; vx = 0; SetState("fall", 0); }
                else if (py > floor) py = floor;
            }

            bool busy = InAir() || state == "eat" || state == "sleep" || state == "dizzy" || state == "dance" || state == "angry";
            if (!busy)
            {
                CookieForm f = NearestCookie();
                if (f != null)
                {
                    if (Math.Abs(f.X - px) < 10 * S)
                    {
                        eating = f;
                        f.Claimer = this;
                        SetState("eat", 1.4f);
                        Say(Pick(EatLines), 1.4f);
                    }
                    else if (state != "walk" || target != f.X)
                    {
                        if (state != "walk") Say(Pick(ComeLines), 1.2f);
                        WalkTo(f.X, 75 * S);
                    }
                }
                else if (ball != null && !pinned && state != "happy") ChaseBall(floor, minX, maxX);
                else if (chaseMouse && !pinned && (state == "idle" || state == "walk")) ChaseMouse(minX, maxX);
            }

            if ((state == "idle" || state == "walk") && !PomoActive)
            {
                chatIn -= dt;
                if (chatIn <= 0) { Say(ChatLine(), 3.5f); chatIn = R(30, 80); }
            }

            switch (state)
            {
                case "idle":
                    if (t > next)
                    {
                        if (idleFor > 180 && ball == null && !chaseMouse) { SetState("sleep", R(90, 240)); break; }
                        if (!pinned && ball == null && !chaseMouse && rnd.NextDouble() < 0.5)
                            WalkTo(Clamp(px + R(-350, 350) * S, minX, maxX), 55 * S);
                        else SetState("idle", R(3, 7));
                    }
                    break;

                case "walk":
                {
                    float dx = target - px;
                    if (dx != 0) dir = Math.Sign(dx);
                    walkPhase += dt * (walkSpeed > 80 * S ? 11 : 7);
                    if (Math.Abs(dx) <= walkSpeed * dt) { px = target; SetState("idle", R(2, 6)); }
                    else px += dir * walkSpeed * dt;
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

                case "dance":
                    dir = ((int)Math.Floor(t * 4) % 2 == 0) ? 1 : -1;
                    noteIn -= dt;
                    if (noteIn <= 0) { Note(); noteIn = 0.35f; }
                    if (t > next)
                    {
                        mood = Clamp(mood + 5, 0, 100);
                        SetState("idle", R(1, 2));
                        Say(rnd.Next(2) == 0 ? "还想跳！" : "累了累了", 1.8f);
                    }
                    break;

                case "angry":
                    if (t > next) { SetState("idle", R(1, 2)); Say("…算了，原谅你了", 2f); }
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

        void ChaseBall(float floor, float minX, float maxX)
        {
            if (ball.Held || Math.Abs(ball.Y - floor) > 70 * S)
            {
                // 球在天上或者在你手里：站着看
                if (state == "walk") SetState("idle", 0.5f);
                return;
            }
            float reach = 6 * U + ball.Radius;
            if (Math.Abs(ball.X - px) < reach)
            {
                if (ball.KickCooldown > 0) return;
                int kd = ball.X >= px ? 1 : -1;
                if (Math.Abs(ball.X - px) < 2 * S) kd = rnd.Next(2) == 0 ? 1 : -1;
                ball.Vx = kd * R(450, 950) * S;
                ball.Vy = -R(350, 800) * S;
                ball.Y -= 2;
                ball.KickCooldown = 0.6f;
                dir = kd;
                mood = Clamp(mood + 1, 0, 100);
                SetState("happy", 0.6f);
                if (rnd.NextDouble() < 0.35) Say(Pick(KickLines), 1.2f);
            }
            else WalkTo(Clamp(ball.X, minX, maxX), 105 * S);
        }

        void ChaseMouse(float minX, float maxX)
        {
            float tx = Clamp(Cursor.Position.X, minX, maxX);
            if (Math.Abs(tx - px) > 30 * S) WalkTo(tx, 110 * S);
            else if (state == "walk")
            {
                SetState("idle", 1f);
                if (rnd.NextDouble() < 0.3) Say(Pick(CatchLines), 1.4f);
            }
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
                    if (eating != null) { eating.Claimer = null; eating = null; }
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
            else if (down) Poke();
            down = false;
            dragging = false;
        }

        // ---------- 画 ----------
        static void Px(Graphics g, Brush b, float x, float y, float w, float h)
        {
            g.FillRectangle(b, (float)Math.Round(x), (float)Math.Round(y), (float)Math.Round(w), (float)Math.Round(h));
        }

        // 以脚底中心为原点画 Clawd
        static void DrawSprite(Graphics g, float u, Color bodyColor, Color legColor, string s, int look, int step, float t, bool blinking, float bob)
        {
            bool walking = s == "walk";
            bool sleeping = s == "sleep";
            using (SolidBrush body = new SolidBrush(bodyColor))
            using (SolidBrush leg = new SolidBrush(legColor))
            using (SolidBrush eye = new SolidBrush(EyeC))
            {
                int[] legCols = { -5, -3, 2, 4 };
                for (int i = 0; i < 4; i++)
                {
                    float h = 2 * u;
                    if (walking && (i % 2) == step) h = u;
                    if (s == "dance" && (i % 2) == step) h = u * 1.4f;
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
                if (s == "dance")
                {
                    bool up = Math.Sin(t * Math.PI * 4) > 0;
                    lA = up ? -2 * u : 0;
                    rA = up ? 0 : -2 * u;
                }
                if (s == "angry") { lA = rA = -u * 0.5f; }
                if (s == "eat") { lA = rA = Math.Sin(t * 14) > 0 ? -u : 0; }
                Px(g, body, -7 * u, top + 3 * u + lA, u, 2 * u);
                Px(g, body, 6 * u, top + 3 * u + rA, u, 2 * u);

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
                    else if (s == "angry")
                    {
                        // 眼睛压扁 + 往中间斜的眉毛
                        Px(g, eye, ex, eyeTop + 0.75f * u, u, 1.25f * u);
                        if (i == 0)
                        {
                            Px(g, eye, ex - 0.5f * u, eyeTop - 0.5f * u, 0.75f * u, 0.5f * u);
                            Px(g, eye, ex + 0.25f * u, eyeTop, 0.75f * u, 0.5f * u);
                        }
                        else
                        {
                            Px(g, eye, ex, eyeTop, 0.75f * u, 0.5f * u);
                            Px(g, eye, ex + 0.75f * u, eyeTop - 0.5f * u, 0.75f * u, 0.5f * u);
                        }
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
                if (s == "dance") Px(g, eye, -u * 0.5f, top + 5 * u, u, u * 0.5f);
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

        static void DrawNote(Graphics g, float x, float y, float u, Color c)
        {
            using (SolidBrush b = new SolidBrush(c))
            {
                Px(g, b, x + 2 * u, y, u, 4 * u);       // 竖线
                Px(g, b, x + 2 * u, y, 2.5f * u, u);    // 小旗
                Px(g, b, x, y + 3.5f * u, 3 * u, 2 * u); // 音符头
            }
        }

        // 生气时头上的「井」字
        static void DrawAnger(Graphics g, float x, float y, float u)
        {
            using (SolidBrush b = new SolidBrush(AngerC))
            {
                Px(g, b, x, y + u, u, 2 * u); Px(g, b, x + u, y, 2 * u, u);
                Px(g, b, x + 4 * u, y, 2 * u, u); Px(g, b, x + 6 * u, y + u, u, 2 * u);
                Px(g, b, x, y + 4 * u, u, 2 * u); Px(g, b, x + u, y + 6 * u, 2 * u, u);
                Px(g, b, x + 4 * u, y + 6 * u, 2 * u, u); Px(g, b, x + 6 * u, y + 4 * u, u, 2 * u);
            }
        }

        int LookDir()
        {
            if (state == "walk" || state == "eat" || state == "dance") return dir;
            if (state == "sleep") return 0;
            float lookX = Cursor.Position.X;
            if (ball != null && (state == "idle" || state == "happy")) lookX = ball.X;
            float dx = lookX - px;
            return dx < -40 * S ? -1 : (dx > 40 * S ? 1 : 0);
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.None;
            g.InterpolationMode = InterpolationMode.NearestNeighbor;

            float ax = FW / 2f, ay = FH - 2 * S;
            float hop = 0;
            if (state == "happy") hop = (float)Math.Abs(Math.Sin(t * 9)) * 8 * S;
            if (state == "dance") hop = (float)Math.Abs(Math.Sin(t * Math.PI * 4)) * 12 * S;
            float shake = state == "angry" ? (float)Math.Sin(t * 45) * 1.5f * S : 0;
            int step = state == "dance" ? (int)Math.Floor(t * 4) % 2 : (int)Math.Floor(walkPhase) % 2;
            float bob = state == "walk" ? (step == 1 ? -U * 0.5f : 0) : (state == "sleep" ? (float)Math.Sin(t * 2) * 1.5f * S : 0);

            GraphicsState gs = g.Save();
            g.TranslateTransform(ax + shake, ay - hop);
            g.ScaleTransform(1 + squash * 0.6f, 1 - squash);
            if (state == "held") g.RotateTransform((float)Math.Sin(t * 8) * 7);
            if (state == "dance") g.RotateTransform((float)Math.Sin(t * Math.PI * 2) * 6);
            DrawSprite(g, U, bodyC, legC, state, LookDir(), step, t, blink > 0, bob);
            g.Restore(gs);

            if (state == "angry") DrawAnger(g, ax + 5 * U, ay - 12 * U, Math.Max(1, (float)Math.Round(1.5f * S)));

            // 粒子：坐标相对脚底
            foreach (Particle q in parts)
            {
                float x = ax + q.X, y = ay + q.Y;
                if (q.Kind == "heart") DrawHeart(g, x, y, 2.5f * S);
                else if (q.Kind == "note") DrawNote(g, x, y, 2.5f * S, q.Color);
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

            float headTop = ay - 9 * U - hop - 12 * S;
            if (bubbleTime > 0 && !string.IsNullOrEmpty(bubbleText)) DrawBubble(g, ax, headTop);
            else if (isMain && PomoActive) DrawPomodoro(g, ax, headTop);
        }

        void DrawPomodoro(Graphics g, float cx, float bottom)
        {
            TimeSpan left = pomoEnd - DateTime.Now;
            string text = string.Format("{0:00}:{1:00}", (int)left.TotalMinutes, left.Seconds);
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            SizeF sz = g.MeasureString(text, timerFont);
            float w = (float)Math.Ceiling(sz.Width + 8 * S), h = (float)Math.Ceiling(sz.Height + 2 * S);
            float x = cx - w / 2, y = bottom - h;
            using (SolidBrush bg = new SolidBrush(TomatoC))
            using (SolidBrush leaf = new SolidBrush(Color.FromArgb(0x3F, 0xA7, 0x5A)))
            using (SolidBrush fg = new SolidBrush(Color.White))
            {
                Px(g, bg, x, y, w, h);
                Px(g, leaf, cx - 3 * S, y - 3 * S, 6 * S, 3 * S);
                g.DrawString(text, timerFont, fg, x + 4 * S, y + 1 * S);
            }
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
                    DrawSprite(g, 2.3f, ClawdOrange, Darker(ClawdOrange, 0.88f), "idle", 0, 0, 0, false, 0);
                }
                return Icon.FromHandle(bmp.GetHicon());
            }
        }
    }
}

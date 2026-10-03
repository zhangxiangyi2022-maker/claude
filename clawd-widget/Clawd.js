// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: heart;

// Clawd 桌宠小组件（Scriptable）
// - 加到主屏幕：显示 Clawd 当前的表情、饱腹、心情和一句话
// - 点小组件：打开菜单，可以投喂饼干、摸摸头
// - 也支持锁屏小组件（圆形 / 矩形 / 单行）

const BODY = new Color("#D97757");
const LEG = new Color("#C4664A");
const EYE = new Color("#1B1411");
const HEART = new Color("#E46F8F");
const BG = Color.dynamic(new Color("#F6F0EA"), new Color("#1D1A18"));
const FG = Color.dynamic(new Color("#2A2320"), new Color("#F1ECE8"));
const MUTED = Color.dynamic(new Color("#8A7B72"), new Color("#A39A93"));
const FOOD_C = new Color("#E0A24A");
const MOOD_C = new Color("#E46F8F");
const TRACK = Color.dynamic(new Color("#E6DCD3"), new Color("#3A3431"));

// ---------- 存档 ----------
const fm = FileManager.local();
const statePath = fm.joinPath(fm.documentsDirectory(), "clawd-state.json");

function loadState() {
  let s = { food: 70, mood: 70, t: Date.now(), lastAction: null, lastActionAt: 0 };
  if (fm.fileExists(statePath)) {
    try { s = Object.assign(s, JSON.parse(fm.readString(statePath))); } catch (e) {}
  }
  // 按经过的时间扣饱腹和心情
  const hours = Math.max(0, (Date.now() - s.t) / 3600000);
  s.food = clamp(s.food - hours * 4, 0, 100);
  s.mood = clamp(s.mood - hours * 3, 0, 100);
  s.t = Date.now();
  return s;
}
function saveState(s) { fm.writeString(statePath, JSON.stringify(s)); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ---------- 根据状态决定表情和台词 ----------
function mood(s) {
  const now = new Date();
  const h = now.getHours();
  const recent = Date.now() - s.lastActionAt < 15 * 60 * 1000;

  if (recent && s.lastAction === "eat") return { face: "happy", heart: true, line: pick(["好吃！谢谢投喂", "嚼嚼嚼…", "饼干最棒了"]) };
  if (recent && s.lastAction === "pet") return { face: "happy", heart: true, line: pick(["嘿嘿～", "再摸一下嘛", "被摸头了！"]) };
  if (h >= 23 || h < 7) return { face: "sleep", zzz: true, line: pick(["zzZ…", "梦到饼干了…", "明天再写代码…"]) };
  if (s.food < 30) return { face: "normal", line: pick(["饿饿…点我喂饼干", "肚子咕咕叫", "有饼干吗…"]) };
  if (s.mood < 30) return { face: "normal", line: pick(["好久没人摸我了…", "点我一下嘛", "有点无聊…"]) };

  const timeLines = [];
  if (h >= 7 && h < 10) timeLines.push("早上好！", "今天也要加油");
  if (h >= 11 && h < 13) timeLines.push("该吃午饭啦", "午饭吃什么？");
  if (h >= 17 && h < 19) timeLines.push("快下班了吗？");
  if (h >= 21) timeLines.push("早点休息哦", "该收工啦");
  const general = ["git push 了吗？", "测试都过了吗", "喝口水吧", "我在看着你哦", "记得休息眼睛", "今天也要加油写代码"];
  const line = pick(timeLines.length && Math.random() < 0.6 ? timeLines : general);
  return { face: s.mood > 75 ? "happy" : (Math.random() < 0.2 ? "blink" : "normal"), heart: s.mood > 85, line };
}

// ---------- 画 Clawd ----------
function drawClawd(m, u) {
  const W = 18, H = 13; // 单位：像素格
  const ctx = new DrawContext();
  ctx.size = new Size(W * u, H * u);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  const ox = 9, floor = 12.5;
  const r = (x, y, w, h, c) => { ctx.setFillColor(c); ctx.fillRect(new Rect((ox + x) * u, y * u, w * u, h * u)); };

  const sleep = m.face === "sleep";
  const legH = sleep ? 0.8 : 2;
  const top = floor - legH - 7;

  // 腿
  [-5, -3, 2, 4].forEach(c => r(c, floor - legH, 1, legH, LEG));
  // 身体
  r(-6, top, 12, 7, BODY);
  // 手
  const wave = m.face === "happy";
  r(-7, top + 3 - (wave ? 1 : 0), 1, 2, BODY);
  r(6, top + 3, 1, 2, BODY);
  // 眼睛
  [-4, 3].forEach(c => {
    const ey = top + 2;
    if (sleep) r(c - 0.25, ey + 1.5, 1.5, 0.5, EYE);
    else if (m.face === "happy") {
      r(c - 0.5, ey + 1, 0.5, 0.5, EYE);
      r(c, ey + 0.5, 1, 0.5, EYE);
      r(c + 1, ey + 1, 0.5, 0.5, EYE);
    } else if (m.face === "blink") r(c, ey + 1.25, 1, 0.5, EYE);
    else r(c, ey, 1, 2, EYE);
  });
  // 爱心
  if (m.heart) {
    const hx = 6, hy = 0.3, k = 0.6;
    const hr = (x, y, w, h) => r(hx + x * k, hy + y * k, w * k, h * k, HEART);
    hr(-2, 0, 1.5, 1); hr(0.5, 0, 1.5, 1); hr(-2.5, 1, 5, 1); hr(-2, 2, 4, 1); hr(-1, 3, 2, 1);
  }
  // zzz
  if (m.zzz) {
    ctx.setTextColor(MUTED);
    ctx.setFont(Font.boldMonospacedSystemFont(u * 1.6));
    ctx.drawText("z", new Point((ox + 6) * u, top * u - u * 2.2));
    ctx.setFont(Font.boldMonospacedSystemFont(u * 1.2));
    ctx.drawText("z", new Point((ox + 7.6) * u, top * u - u * 3.6));
  }
  return ctx.getImage();
}

function drawBar(value, color, w, h) {
  const ctx = new DrawContext();
  ctx.size = new Size(w, h);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  const path = (x, wd, c) => {
    const p = new Path();
    p.addRoundedRect(new Rect(x, 0, wd, h), h / 2, h / 2);
    ctx.addPath(p); ctx.setFillColor(c); ctx.fillPath();
  };
  path(0, w, TRACK);
  if (value > 0) path(0, Math.max(h, w * value / 100), color);
  return ctx.getImage();
}

// ---------- 组装小组件 ----------
function statRow(parent, label, value, color, barW) {
  const row = parent.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  const t = row.addText(label);
  t.font = Font.mediumSystemFont(11);
  t.textColor = MUTED;
  row.addSpacer(6);
  const img = row.addImage(drawBar(value, color, barW, 7));
  img.imageSize = new Size(barW, 7);
  row.addSpacer(6);
  const n = row.addText(String(Math.round(value)));
  n.font = Font.boldMonospacedSystemFont(11);
  n.textColor = FG;
}

function buildWidget(s, family) {
  const m = mood(s);
  const w = new ListWidget();
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);

  // 锁屏小组件
  if (family && family.startsWith("accessory")) {
    if (family === "accessoryInline") {
      w.addText(`Clawd · ${m.line}`);
    } else if (family === "accessoryCircular") {
      const img = w.addImage(drawClawd(m, 4));
      img.centerAlignImage();
    } else {
      const row = w.addStack();
      row.centerAlignContent();
      const img = row.addImage(drawClawd(m, 3));
      img.imageSize = new Size(44, 32);
      row.addSpacer(6);
      const col = row.addStack();
      col.layoutVertically();
      const a = col.addText("Clawd");
      a.font = Font.boldSystemFont(13);
      const b = col.addText(m.line);
      b.font = Font.systemFont(11);
      b.lineLimit = 2;
      b.minimumScaleFactor = 0.8;
    }
    return w;
  }

  w.backgroundColor = BG;

  if (family === "small") {
    w.setPadding(12, 12, 12, 12);
    const top = w.addStack();
    const name = top.addText("CLAWD");
    name.font = Font.boldMonospacedSystemFont(12);
    name.textColor = FG;
    top.addSpacer();
    const st = top.addText(s.food < 30 ? "饿了" : (m.face === "sleep" ? "睡觉" : "在线"));
    st.font = Font.mediumSystemFont(10);
    st.textColor = MUTED;

    w.addSpacer();
    const imgRow = w.addStack();
    imgRow.addSpacer();
    const img = imgRow.addImage(drawClawd(m, 6));
    img.imageSize = new Size(90, 65);
    imgRow.addSpacer();
    w.addSpacer();

    const line = w.addText(m.line);
    line.font = Font.mediumSystemFont(12);
    line.textColor = FG;
    line.lineLimit = 2;
    line.minimumScaleFactor = 0.8;
    line.centerAlignText();
    return w;
  }

  // 中号 / 大号
  const big = family === "large";
  w.setPadding(14, 16, 14, 16);
  const row = w.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();

  const img = row.addImage(drawClawd(m, 8));
  img.imageSize = big ? new Size(150, 108) : new Size(118, 85);
  row.addSpacer(14);

  const col = row.addStack();
  col.layoutVertically();
  const name = col.addText("CLAWD");
  name.font = Font.boldMonospacedSystemFont(15);
  name.textColor = FG;
  col.addSpacer(4);
  const line = col.addText(m.line);
  line.font = Font.mediumSystemFont(13);
  line.textColor = FG;
  line.lineLimit = 2;
  line.minimumScaleFactor = 0.8;
  col.addSpacer(8);
  statRow(col, "饱腹", s.food, FOOD_C, 70);
  col.addSpacer(4);
  statRow(col, "心情", s.mood, MOOD_C, 70);

  if (big) {
    w.addSpacer(12);
    const tip = w.addText("点我可以投喂饼干、摸摸头");
    tip.font = Font.systemFont(11);
    tip.textColor = MUTED;
  }
  return w;
}

// ---------- 运行 ----------
const state = loadState();

if (config.runsInWidget) {
  saveState(state);
  Script.setWidget(buildWidget(state, config.widgetFamily));
} else {
  const a = new Alert();
  a.title = "Clawd";
  a.message = `饱腹 ${Math.round(state.food)} · 心情 ${Math.round(state.mood)}\n想对它做点什么？`;
  a.addAction("🍪 投喂饼干");
  a.addAction("🤚 摸摸头");
  a.addAction("👀 看看它");
  a.addCancelAction("走开");
  const i = await a.presentSheet();
  if (i === 0) { state.food = clamp(state.food + 25, 0, 100); state.mood = clamp(state.mood + 5, 0, 100); state.lastAction = "eat"; state.lastActionAt = Date.now(); }
  if (i === 1) { state.mood = clamp(state.mood + 15, 0, 100); state.lastAction = "pet"; state.lastActionAt = Date.now(); }
  saveState(state);
  if (i !== -1) await buildWidget(state, "medium").presentMedium();
}
Script.complete();

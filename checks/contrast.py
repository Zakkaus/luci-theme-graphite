"""README 承诺的对比度下限，逐套配色、逐个明暗实测。

这条检查是补上来的：README 里写着正文 10:1、次级 5.5:1，而仓库里没有任何
东西验证它。一条没有检查的承诺只是措辞。

对比度不从 CSS 文本里解析。oklch() 的三个数字长得像 RGB，用正则去读会得出
每一对都是 1.00 的结果——这个错犯过一次。这里把颜色画进 1×1 画布再读像素，
浏览器算完所有色彩空间转换之后的值才是读者看到的值。
"""
import subprocess, sys
from playwright.sync_api import sync_playwright

B = "http://127.0.0.1:8080/cgi-bin/luci"
RSH = ["/scratch/ssd/openwrt-vm/rsh"]
BODY_MIN, MUTED_MIN, UI_MIN = 10.0, 5.5, 4.5
ACCENTS = ["pink", "mauve", "red", "peach", "yellow", "green", "teal", "blue"]
# 六套配色全部接了强调色，所以全部要扫。
ACCENT_PALETTES = ["", "catppuccin-frappe", "catppuccin-macchiato", "catppuccin-mocha",
                   "tokyonight-storm", "tokyonight-night"]

SWEEP = """([palettes, accents]) => {
  const px = c => { const cv=document.createElement('canvas'); cv.width=cv.height=1;
    const x=cv.getContext('2d'); x.fillStyle=c; x.fillRect(0,0,1,1);
    const d=x.getImageData(0,0,1,1).data; return [d[0],d[1],d[2]]; };
  const lin = v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
  const L = c => { const [r,g,b]=px(c); return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b); };
  const ratio = (a,b) => { const l1=L(a), l2=L(b); const [hi,lo]=l1>l2?[l1,l2]:[l2,l1];
    return +((hi+0.05)/(lo+0.05)).toFixed(2); };
  const root = document.documentElement;
  // 每一轮都新建一个元素。复用同一个元素在根上的属性变化之后读 getComputedStyle，
  // 拿到的是上一轮的值——八个强调色会量出八个一模一样的数，看起来像"这套配色的
  // 强调色没生效"，实际是探针骗人。这个假象在这条检查里出现过两次。
  //
  // div 而不是 button：luci.css 的基础复位里有 button:not(...):not(...)，
  // 特异度 (0,2,1)，压过把 .cbi-button-apply 列为主按钮的那条 (0,1,0)。
  const host = document.querySelector('.shell-content') || document.body;
  const probe = () => {
    const d = document.createElement('div');
    d.className = 'cbi-button cbi-button-apply';
    d.textContent = 'x';
    host.appendChild(d);
    const cs = getComputedStyle(d);
    const r = { fg: cs.color, bg: cs.backgroundColor };
    d.remove();
    return r;
  };
  const out = [];
  for (const pal of palettes) {
    pal ? root.setAttribute('data-palette', pal) : root.removeAttribute('data-palette');
    for (const acc of accents) {
      root.setAttribute('data-accent', acc);
      for (const scheme of ['light','dark']) {
        root.setAttribute('data-theme', scheme);
        const c = probe();
        out.push({配色: pal || 'graphite', 强调色: acc, 明暗: scheme,
                  比: ratio(c.fg, c.bg)});
      }
    }
  }
  root.removeAttribute('data-theme');
  root.removeAttribute('data-palette');
  root.removeAttribute('data-accent');
  return out;
}"""
PALETTES = [("graphite", ""), ("catppuccin-frappe", "catppuccin-frappe"),
            ("catppuccin-macchiato", "catppuccin-macchiato"), ("catppuccin-mocha", "catppuccin-mocha"),
            ("tokyonight-storm", "tokyonight-storm"), ("tokyonight-night", "tokyonight-night")]

JS = """() => {
  const px = c => { const cv=document.createElement('canvas'); cv.width=cv.height=1;
    const x=cv.getContext('2d'); x.fillStyle=c; x.fillRect(0,0,1,1);
    const d=x.getImageData(0,0,1,1).data; return [d[0],d[1],d[2]]; };
  const lin = v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
  const L = c => { const [r,g,b]=px(c); return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b); };
  const ratio = (a,b) => { const l1=L(a), l2=L(b); const [hi,lo]=l1>l2?[l1,l2]:[l2,l1];
    return +((hi+0.05)/(lo+0.05)).toFixed(2); };
  const cs = getComputedStyle(document.documentElement);
  const v = n => cs.getPropertyValue(n).trim();
  return { 正文: ratio(v('--foreground'), v('--background')),
           次级: ratio(v('--muted-foreground'), v('--background')),
           内容正文: ratio(getComputedStyle(document.querySelector('.shell-content')
                          || document.body).color, v('--background')),
           卡片正文: ratio(v('--card-foreground'), v('--card')),
           强调面: (() => {
             // 令牌里的 contrast-color()/oklch(from …) 要浏览器解析过才是颜色，
             // getPropertyValue 拿到的还是那串文本，画进画布是无效值——于是比的
             // 是画布的默认黑，不是按钮上真正的字。所以插一个真的按钮，读它算完
             // 之后的前景与底色。这与本文件开头那条是同一条：读画出来的，不读写着的。
             const b = document.createElement('button');
             b.className = 'cbi-button cbi-button-save';
             b.textContent = 'x';
             (document.querySelector('.shell-content') || document.body).appendChild(b);
             const cs = getComputedStyle(b);
             const r = ratio(cs.color, cs.backgroundColor);
             b.remove();
             return r;
           })() };
}"""

def set_accent(v):
    cmd = ("uci -q delete graphite.appearance.accent; " if not v
           else f"uci set graphite.appearance.accent='{v}'; ")
    subprocess.run(RSH + [cmd + "uci commit graphite"], check=True, capture_output=True)


def set_palette(v):
    cmd = ("uci -q delete graphite.appearance.palette; " if not v
           else f"uci set graphite.appearance.palette='{v}'; ")
    subprocess.run(RSH + [cmd + "uci commit graphite"], check=True, capture_output=True)

original = subprocess.run(RSH + ["uci -q get graphite.appearance.palette || true"],
                          capture_output=True, text=True).stdout.strip()
# 强调色也要记下来再还原。上一版只还原了配色，于是这条检查每跑一次就把设备上的
# 强调色留在循环的最后一个值上——正在用这台设备的人会看到按钮无缘无故变了色。
# 一条检查改变被检查对象的状态，是它自己的缺陷，不是使用者的问题。
original_accent = subprocess.run(RSH + ["uci -q get graphite.appearance.accent || true"],
                                 capture_output=True, text=True).stdout.strip()
bad = []
try:
    with sync_playwright() as p:
        br = p.chromium.launch()
        for name, value in PALETTES:
            set_palette(value)
            for scheme in ("light", "dark"):
                ctx = br.new_context(viewport={"width": 1280, "height": 800},
                                     locale="en-US", color_scheme=scheme)
                pg = ctx.new_page(); pg.goto(B + "/", wait_until="networkidle")
                pg.fill("input[name=luci_password]", "openwrt")
                pg.press("input[name=luci_password]", "Enter")
                pg.wait_for_load_state("networkidle")
                b = pg.get_by_text("No, disable checking")
                if b.count(): b.first.click(); pg.wait_for_timeout(300)
                pg.goto(B + "/admin/status/overview", wait_until="networkidle")
                pg.wait_for_timeout(1600)
                r = pg.evaluate(JS)
                if r['正文'] < BODY_MIN:
                    bad.append(f"  {name:22} {scheme:5} 正文 {r['正文']} < {BODY_MIN}")
                # 内容区的正文走 --content-foreground，它给最暗的那一端设了上限，
                # 所以它才是读者在密页上实际读到的颜色。取它的实测值而不是令牌文本：
                # relative color 要浏览器算完才有结果。
                if r['内容正文'] < BODY_MIN:
                    bad.append(f"  {name:22} {scheme:5} 内容正文 {r['内容正文']} < {BODY_MIN}")
                if r['次级'] < MUTED_MIN:
                    bad.append(f"  {name:22} {scheme:5} 次级 {r['次级']} < {MUTED_MIN}")
                ctx.close()
        # 强调色。要验的是按钮上的字对按钮底，不是正文对页面底；按钮上的字是界面
        # 文字不是正文，下限用 4.5。
        #
        # 这一轮不改 uci、不刷页面：六套配色 × 十四个强调色 × 明暗是一百六十八种
        # 组合，每种都往返一次要跑很久。直接在根元素上换 data-palette /
        # data-accent / data-theme，读的仍是浏览器算完之后真实按钮的颜色，
        # 与页面自己带着这些属性载入是同一条级联。
        set_palette("")
        set_accent("")
        ctx = br.new_context(viewport={"width": 1280, "height": 800}, locale="en-US")
        pg = ctx.new_page(); pg.goto(B + "/", wait_until="networkidle")
        pg.fill("input[name=luci_password]", "openwrt")
        pg.press("input[name=luci_password]", "Enter")
        pg.wait_for_load_state("networkidle")
        bt = pg.get_by_text("No, disable checking")
        if bt.count(): bt.first.click(); pg.wait_for_timeout(300)
        pg.goto(B + "/admin/status/overview", wait_until="networkidle")
        pg.wait_for_timeout(1600)
        for row in pg.evaluate(SWEEP, [ACCENT_PALETTES, ACCENTS]):
            if row['比'] < UI_MIN:
                bad.append(f"  {row['配色']:22} {row['强调色']:10} {row['明暗']:5} "
                           f"按钮文字 {row['比']} < {UI_MIN}")
        ctx.close()
        set_accent("")
        br.close()
finally:
    set_palette(original)
    set_accent(original_accent)

print("\n".join(bad) if bad else
      f"六套配色的正文与次级，加 {len(ACCENT_PALETTES)} 套 × {len(ACCENTS)} 个强调色 × 明暗：\n"
      f"正文与内容正文都到 {BODY_MIN}，"
      f"次级都到 {MUTED_MIN}，强调面上的文字都到 {UI_MIN}")
sys.exit(1 if bad else 0)

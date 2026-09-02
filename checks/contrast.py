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
BODY_MIN, MUTED_MIN = 10.0, 5.5
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
           卡片正文: ratio(v('--card-foreground'), v('--card')) };
}"""

def set_palette(v):
    cmd = ("uci -q delete graphite.appearance.palette; " if not v
           else f"uci set graphite.appearance.palette='{v}'; ")
    subprocess.run(RSH + [cmd + "uci commit graphite"], check=True, capture_output=True)

original = subprocess.run(RSH + ["uci -q get graphite.appearance.palette || true"],
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
                if r['次级'] < MUTED_MIN:
                    bad.append(f"  {name:22} {scheme:5} 次级 {r['次级']} < {MUTED_MIN}")
                ctx.close()
        br.close()
finally:
    set_palette(original)

print("\n".join(bad) if bad else
      f"六套配色、明暗各一遍：正文都到 {BODY_MIN}，次级都到 {MUTED_MIN}")
sys.exit(1 if bad else 0)

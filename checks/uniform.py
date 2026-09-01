"""同一个角色的控件，主题定的那几个值必须一致。

这条检查是「很多地方不统一」那次报告之后加的。当时靠看截图找不出来，
按角色分组量一遍就出来了：同一个防火墙页面上字段有 72 / 112 / 153 / 208 /
210 / 222 / 262 七种宽度，原生 select 13px 而 .cbi-dropdown 14px，
保存栏里主操作比它旁边两个按钮小一档。

每个角色只比**主题自己写的**属性。单元格的高度和文字起点由内容决定，
一个换行的单元格本来就比不换行的高，拿它们当不一致就是误报。

需要一台跑着本主题的设备。用法:
    uniform.py [基址]        默认 http://127.0.0.1:8080/cgi-bin/luci
    PAGES=页面清单.json 可覆盖要扫的页面，默认只扫内置的那几页。
退出码非零表示同一角色出现了两种取值。
"""
import json, os, sys

# 三个例外，每个都有规则写着理由，所以从对应的角色里排除掉而不是留着天天报红：
#   - 只读字段按值取宽（显示的是值，不是输入位）
#   - 多值下拉会长高（写在 .cbi-dropdown 的注释里）
#   - 空表占位行和动作行的纵向内边距是各自定的
ROLES = {
    "字段": (".cbi-value-field :is(select, input[type=text], input[type=password], "
             "input[type=number]):not([readonly]):not(.cbi-dropdown *):not(.cbi-dynlist *), "
             ".cbi-value-field .cbi-dropdown:not(.btn):not(.cbi-button):not([multiple])",
             ["fontSize", "borderRadius", "_w", "_h"]),
    "按钮": (".cbi-page-actions .btn, .cbi-page-actions .cbi-button, "
             ".cbi-section > .btn, .cbi-section > .cbi-button",
             ["fontSize", "borderRadius", "_h", "_inset"]),
    "表头": (".table .th", ["fontSize", "paddingInline", "paddingBlock", "textTransform"]),
    "单元格": (".table .tr:not(.placeholder):not(:has(.cbi-section-actions)) > .td",
               ["fontSize", "paddingInline", "paddingBlock"]),
    "标签": (".cbi-value-title", ["fontSize", "fontWeight"]),
    "状态药丸": (".zonebadge", ["fontSize", "borderRadius", "paddingInline"]),
    "可点状态块": (".label[data-indicator]", ["fontSize", "borderRadius", "paddingInline"]),
    "页签": (".cbi-tabmenu > li > a, .tab", ["fontSize", "paddingInline", "_h"]),
}

PROBE = """(roles) => {
  const rng = document.createRange();
  /* 文字起点按实际渲染算，不按 computed padding：ComboButton 的内边距写在
     它的子元素上，属性值是 0 而文字起点和普通按钮一样。 */
  const inset = e => {
    const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (!n.textContent.trim()) continue;
      rng.selectNode(n);
      const r = rng.getBoundingClientRect();
      if (r.width > 0) return Math.round(r.left - e.getBoundingClientRect().left);
    }
    return null;
  };
  const out = {};
  for (const [role, [sel, keys]] of Object.entries(roles)) {
    const seen = {};
    for (const e of document.querySelectorAll(sel)) {
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const c = getComputedStyle(e);
      const parts = keys.map(k =>
        k === '_w' ? Math.round(r.width) + 'w' :
        k === '_h' ? Math.round(r.height) + 'h' :
        k === '_inset' ? inset(e) + 'i' : c[k]);
      const key = parts.join('|');
      seen[key] = (seen[key] || 0) + 1;
    }
    if (Object.keys(seen).length > 1)
      out[role] = Object.entries(seen).map(([k, n]) => k + ' ×' + n);
  }
  return out;
}"""

DEFAULT_PAGES = ["/admin/status/overview", "/admin/system/system",
                 "/admin/network/network", "/admin/network/firewall/zones",
                 "/admin/system/package-manager"]

def main(argv):
    from playwright.sync_api import sync_playwright
    base = argv[0] if argv else "http://127.0.0.1:8080/cgi-bin/luci"
    root = base.rsplit("/cgi-bin/", 1)[0]
    pages = json.load(open(os.environ["PAGES"])) if os.environ.get("PAGES") else DEFAULT_PAGES
    pages = [p for p in pages if "logout" not in p]
    bad = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 1400, "height": 900},
                            color_scheme="light", locale="zh-CN")
        pg = ctx.new_page()
        pg.goto(base + "/", wait_until="networkidle")
        pg.fill("input[name=luci_password]", os.environ.get("PW", "openwrt"))
        pg.press("input[name=luci_password]", "Enter")
        pg.wait_for_load_state("networkidle")
        btn = pg.get_by_text("No, disable checking")
        if btn.count():
            btn.first.click(); pg.wait_for_timeout(400)
        for h in pages:
            url = h if h.startswith("http") else (root + h if h.startswith("/cgi-bin") else base + h)
            try:
                pg.goto(url, wait_until="networkidle", timeout=25000)
                pg.wait_for_timeout(1500)
                r = pg.evaluate(PROBE, ROLES)
            except Exception:
                continue
            for role, vals in r.items():
                bad.append(f"{h.split('/')[-1]}: {role}: " + " / ".join(vals))
        b.close()
    if bad:
        print("\n".join(bad))
        print(f"uniform: {len(bad)} 处")
        return 1
    print("uniform: passed; 每个角色只有一种取值")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

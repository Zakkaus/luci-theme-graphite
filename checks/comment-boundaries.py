"""注释边界检查：一段散文落进 CSS，浏览器不会报错，它会吃掉后面的规则。

两次真实故障，都是渲染时才发现，样式检查器全绿：

  .tr.placeholder > .td/* 空表消息 …… */
  .tr.placeholder > .td { … }

去掉注释之后前后两段选择器连成后代选择器，规则不再匹配任何单元格；以及一段
长注释在中途多写了一个 `*/`，剩下的正文成为紧随其后那条规则的选择器前导，
两条 palette 规则被解析器整条丢弃。

用法: comment-boundaries.py <css...>；退出码非零表示发现问题。
"""
import re, sys, pathlib

# 选择器里可能出现的字符。散文的句号、破折号、引号都不在其中。
SELECTOR_CHARS = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
                     "0123456789_-#.:[]()=\"'^$*|~+>,@%& \t\n\r/")

def comments(src):
    """按出现顺序返回 (起, 止)，止为 */ 之后一位。未闭合时止为 -1。"""
    out, pos = [], 0
    while True:
        a = src.find("/*", pos)
        if a < 0:
            return out
        b = src.find("*/", a + 2)
        if b < 0:
            out.append((a, -1))
            return out
        out.append((a, b + 2))
        pos = b + 2

def check(path):
    src = pathlib.Path(path).read_text(encoding="utf-8")
    bad = []
    line = lambda pos: src.count("\n", 0, pos) + 1
    cs = comments(src)

    # 一、注释外出现的 */，说明上一段注释提前结束了。
    covered, prev = [], 0
    for a, b in cs:
        covered.append((prev, a))
        prev = b if b > 0 else len(src)
    covered.append((prev, len(src)))
    for lo, hi in covered:
        for m in re.finditer(r"\*/", src[lo:hi]):
            bad.append((line(lo + m.start()), "注释外出现 */，前一段注释提前结束了"))
    if cs and cs[-1][1] < 0:
        bad.append((line(cs[-1][0]), "注释没有结束"))

    # 二、注释紧贴在选择器后面：去掉注释之后两段选择器会连成一条。
    ends = {b for _, b in cs if b > 0}
    for a, _ in cs:
        j = a - 1
        while j >= 0 and src[j] in " \t":
            j -= 1
        if j < 0 or src[j] in ";{}(),\n\r" or (j + 1) in ends:
            continue
        bad.append((line(a), f"注释前紧跟着 {src[j]!r}，去掉注释后会与下一条选择器相连"))

    # 三、去掉注释之后，规则前导里不该出现选择器用不到的字符。
    #     位置一一对应，注释体按字符换成空格，行号才不会错位。
    buf = list(src)
    for a, b in cs:
        for i in range(a, (b if b > 0 else len(src))):
            if buf[i] != "\n":
                buf[i] = " "
    stripped = "".join(buf)
    depth, start = 0, 0
    for i, ch in enumerate(stripped):
        if ch == "{":
            if depth == 0:
                prelude = stripped[start:i]
                stray = [c for c in prelude if c not in SELECTOR_CHARS]
                if stray:
                    bad.append((line(start + prelude.index(stray[0])),
                                f"选择器前导里有 {stray[0]!r}，多半是注释漏了边界"))
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                start = i + 1
    return sorted(set(bad))

def main(paths):
    total = 0
    for p in paths:
        for ln, msg in check(p):
            print(f"{p}:{ln}: {msg}")
            total += 1
    if total:
        print(f"comment-boundaries: {total} 处")
        return 1
    print("comment-boundaries: passed")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

"""把样式表投影成「去掉注释与空白之后的代码」，用来证明一次改动只动了注释。

改注释最容易造成的两种事故，都不是注释的问题：删多了一个字符把选择器带走，
或者边界写错把规则并进前导。逐行读 diff 看不出来，因为 diff 里全是注释。

用法:
    code-only.py <css...>            打印投影
    code-only.py --save <目录> <css...>   把投影写进目录
之后再执行一次 --save 到另一个目录，`diff -r` 两边；完全一致才说明只动了注释。
"""
import re, sys, pathlib

def project(src):
    s = re.sub(r"/\*.*?\*/", " ", src, flags=re.S)
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\s*([{};:,>+~])\s*", r"\1", s)
    return s.replace("}", "}\n").strip()

def main(argv):
    if argv and argv[0] == "--save":
        out = pathlib.Path(argv[1]); out.mkdir(parents=True, exist_ok=True)
        for p in argv[2:]:
            (out / pathlib.Path(p).name).write_text(
                project(pathlib.Path(p).read_text(encoding="utf-8")), encoding="utf-8")
        print(f"code-only: 已写入 {out}")
        return 0
    for p in argv:
        print(project(pathlib.Path(p).read_text(encoding="utf-8")))
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

#!/bin/sh
# 在 OpenWrt 上安装 Graphite 主题。把发布页的文件和这个脚本放进同一个目录，
# 复制到设备上，然后 sh install.sh。
#
# 只做四件事：查环境、装包、把主题设为当前、清掉菜单缓存。
# 装完不重启任何服务 —— 刷新浏览器即可。

set -e
cd "$(dirname "$0")"

die() { echo "错误：$1" >&2; exit 1; }

[ -f /etc/openwrt_release ] || die "这里不是 OpenWrt"
. /etc/openwrt_release
echo "设备：$DISTRIB_ID $DISTRIB_RELEASE $DISTRIB_TARGET"

# ── 挑包管理器，再挑对应格式的文件 ──────────────────────────────
# 25.12 起是 apk，之前是 opkg。两种格式的包都在发布页上，所以这里按设备
# 实际装的那个工具选，而不是按版本号猜 —— 版本号只在提示里用。
if command -v apk >/dev/null 2>&1; then
  MGR=apk; EXT=apk
elif command -v opkg >/dev/null 2>&1; then
  MGR=opkg; EXT=ipk
else
  die "既没有 apk 也没有 opkg，认不出这台设备的包管理器"
fi

# opkg 按 名_版本_架构.ipk 解析文件名，而版本号是 git describe 给的，形如
# 26.244.50322~497fa00 —— 那个 ~ 会让它直接拒收：
#   opkg_install_cmd: ./luci-theme-graphite_...~....ipk: Illegal file name
# 发布页上的文件不带 ~（上传时被替换成了 .），自行构建出来的带。改名即可，
# 包内记录的版本不受影响。实测于 GL-BE9300 / OpenWrt 23.05。
if [ "$MGR" = opkg ]; then
  for f in *~*.ipk; do
    [ -f "$f" ] || continue
    n=$(echo "$f" | tr '~' '.')
    echo "改名以绕开 opkg 的文件名限制：$f -> $n"
    mv "$f" "$n"
  done
fi

PKGS=""
for f in luci-theme-graphite[-_]*.$EXT luci-app-graphite[-_]*.$EXT luci-i18n-graphite[-_]*.$EXT; do
  [ -f "$f" ] && PKGS="$PKGS ./$f"
done
[ -n "$PKGS" ] || die "这个目录里没有 .$EXT 文件（这台设备用的是 $MGR）"

# ── 装 ──────────────────────────────────────────────────────────
# 包本身与架构无关，但它依赖的 luci-base 不是。版本对不上时包管理器会自己
# 拒绝，这里不替它做判断。
# 两个 --allow-untrusted / --force-checksum 的等价开关：这批包没有用官方源
# 的私钥签名。
echo "安装（$MGR）：$PKGS"
if [ "$MGR" = apk ]; then
  apk add --allow-untrusted $PKGS
else
  opkg install $PKGS
fi

# ── 设为当前主题 ────────────────────────────────────────────────
# 包自己的 uci-defaults 只在「还没人选过主题」时才接管，这是刻意的：
# 升级不该把管理员选的主题换掉。所以这一步由这个脚本明确地做。
uci set luci.main.mediaurlbase=/luci-static/graphite
uci commit luci
rm -f /tmp/luci-indexcache* 2>/dev/null || true

echo
echo "装好了。刷新浏览器即可。"
echo "  外观设置：系统 → 外观"
echo "  换回原主题：uci set luci.main.mediaurlbase=/luci-static/bootstrap && uci commit luci"

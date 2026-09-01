<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/logo-dark.svg">
  <img src="docs/logo-light.svg" width="104" alt="Graphite">
</picture>

# Graphite

**OpenWrt 的 LuCI 主题**，包名 `luci-theme-graphite`。<br>
层级由灰阶承担，色相只留给状态 —— 一页四十个接口里，带颜色的那一行就是需要处理的那一行。

[English](README.md) · 简体中文 · [繁體中文](README.zh-TW.md)

[运行环境](#运行环境) • [安装](#安装) • [配色](#配色) • [设置](#设置) • [手机](#手机) • [分层](#分层)

</div>

![概览](docs/screenshots/zh-CN/graphite-overview-light.png)

## 运行环境

| | |
|---|---|
| OpenWrt | 24.10 及以后。主题针对 ucode 模板派发器编写 |
| 已测试 | OpenWrt 25.12.5，LuCI 分支 26.180 |
| 浏览器 | Chrome 119、Safari 16.4、Firefox 128 及以后。样式表使用 `oklch()`、相对颜色语法、`color-mix()`、`:has()` 与 CSS 逻辑属性，没有任何降级实现 |
| 依赖 | `luci-base` |

没有构建步骤，样式表按写下的样子发布。Makefile 里关掉了 `LUCI_MINIFY_CSS`，
因为 csstidy 遇到上面这些选择器和颜色函数不会报错，而是把它们改写成另一种写法。

## 安装

`luci.mk` 以 `PKGARCH:=all` 构建这两个包，因此一次构建适用于所有设备，与 CPU
架构无关。从[发布页](https://github.com/Zakkaus/luci-theme-graphite/releases/latest)取包，复制到路由器上执行：

```sh
apk add ./luci-theme-graphite-*.apk        # OpenWrt 25.12 及以后
apk add ./luci-app-graphite-*.apk          # 可选：设置页
apk add ./luci-i18n-graphite-*.apk         # 可选：翻译

opkg install ./luci-theme-graphite_*.ipk   # OpenWrt 24.10 及以前
```

只有主题是必需的。它读取 `/etc/config/graphite`，没有设置页也能工作；那个包的
作用是让配色能在界面里改，而不必登录 ssh。它有自己的仓库：
[luci-app-graphite](https://github.com/Zakkaus/luci-app-graphite)。

### 自行构建

两个 Makefile 都以 `../../luci.mk` 引用 LuCI 的构建规则，而该路径按真实路径解析。
因此这两个包必须位于 LuCI feed 之内 —— 放在 `package/` 下或使用符号链接，
引用都会落空，构建在开始之前即告失败。

```sh
cp -r luci-theme-graphite <sdk>/feeds/luci/themes/
cp -r luci-app-graphite   <sdk>/feeds/luci/applications/   # 取自它自己的仓库
cd <sdk>
./scripts/feeds update -i  # 重建索引，否则 install 找不到这两个包
./scripts/feeds install -p luci luci-theme-graphite luci-app-graphite
make menuconfig            # LuCI → Themes、LuCI → Applications
make package/luci-theme-graphite/compile package/luci-app-graphite/compile
```

产物位于 `bin/packages/<架构>/luci/`。

主题会注册 `Graphite`、`GraphiteLight`、`GraphiteDark` 三项，只在全新安装且
尚未选过主题时成为默认，已有的选择不会被替换。在**系统 → 系统 → 语言和界面**
里选择。

## 配色

默认配色不含色相。另外五套基于已发布的配色，按它们深色模式使用的风味命名，
并各自配对该项目自己的浅色风味：Catppuccin 配 Latte，Tokyo Night 配 Day。
切换配色只改动 token 层，`palettes.css` 之外没有任何规则知道当前是哪一套。

是「基于」不是「照搬」：这些浅色风味发布时的文字对比度低于本主题的下限。
Tokyo Night Day 的次级文字是 3.8:1，低于 4.5:1 的门槛；Latte 的正文是 7:1。
这里的每一套浅色都提到了正文 10:1、次级 5.5:1。色相是上游的，文字明度不是。

| 配色 | 浅色 | 深色 |
|---|---|---|
| **Graphite（預設）** | <img src="docs/screenshots/zh-CN/graphite-overview-light.png" width="380"> | <img src="docs/screenshots/zh-CN/graphite-overview-dark.png" width="380"> |
| **Catppuccin Frappé** | <img src="docs/screenshots/zh-CN/catppuccin-frappe-overview-light.png" width="380"> | <img src="docs/screenshots/zh-CN/catppuccin-frappe-overview-dark.png" width="380"> |
| **Catppuccin Macchiato** | <img src="docs/screenshots/zh-CN/catppuccin-macchiato-overview-light.png" width="380"> | <img src="docs/screenshots/zh-CN/catppuccin-macchiato-overview-dark.png" width="380"> |
| **Catppuccin Mocha** | <img src="docs/screenshots/zh-CN/catppuccin-mocha-overview-light.png" width="380"> | <img src="docs/screenshots/zh-CN/catppuccin-mocha-overview-dark.png" width="380"> |
| **Tokyo Night Storm** | <img src="docs/screenshots/zh-CN/tokyonight-storm-overview-light.png" width="380"> | <img src="docs/screenshots/zh-CN/tokyonight-storm-overview-dark.png" width="380"> |
| **Tokyo Night** | <img src="docs/screenshots/zh-CN/tokyonight-night-overview-light.png" width="380"> | <img src="docs/screenshots/zh-CN/tokyonight-night-overview-dark.png" width="380"> |

每套配色另外两页 —— 实时图表，和一个以表单为主的页面：

<details>
<summary>Graphite（預設） — 实时信息与系统</summary>

<img src="docs/screenshots/zh-CN/graphite-realtime-light.png" width="420"> <img src="docs/screenshots/zh-CN/graphite-realtime-dark.png" width="420">
<img src="docs/screenshots/zh-CN/graphite-system-light.png" width="420"> <img src="docs/screenshots/zh-CN/graphite-system-dark.png" width="420">

</details>

<details>
<summary>Catppuccin Frappé — 实时信息与系统</summary>

<img src="docs/screenshots/zh-CN/catppuccin-frappe-realtime-light.png" width="420"> <img src="docs/screenshots/zh-CN/catppuccin-frappe-realtime-dark.png" width="420">
<img src="docs/screenshots/zh-CN/catppuccin-frappe-system-light.png" width="420"> <img src="docs/screenshots/zh-CN/catppuccin-frappe-system-dark.png" width="420">

</details>

<details>
<summary>Catppuccin Macchiato — 实时信息与系统</summary>

<img src="docs/screenshots/zh-CN/catppuccin-macchiato-realtime-light.png" width="420"> <img src="docs/screenshots/zh-CN/catppuccin-macchiato-realtime-dark.png" width="420">
<img src="docs/screenshots/zh-CN/catppuccin-macchiato-system-light.png" width="420"> <img src="docs/screenshots/zh-CN/catppuccin-macchiato-system-dark.png" width="420">

</details>

<details>
<summary>Catppuccin Mocha — 实时信息与系统</summary>

<img src="docs/screenshots/zh-CN/catppuccin-mocha-realtime-light.png" width="420"> <img src="docs/screenshots/zh-CN/catppuccin-mocha-realtime-dark.png" width="420">
<img src="docs/screenshots/zh-CN/catppuccin-mocha-system-light.png" width="420"> <img src="docs/screenshots/zh-CN/catppuccin-mocha-system-dark.png" width="420">

</details>

<details>
<summary>Tokyo Night Storm — 实时信息与系统</summary>

<img src="docs/screenshots/zh-CN/tokyonight-storm-realtime-light.png" width="420"> <img src="docs/screenshots/zh-CN/tokyonight-storm-realtime-dark.png" width="420">
<img src="docs/screenshots/zh-CN/tokyonight-storm-system-light.png" width="420"> <img src="docs/screenshots/zh-CN/tokyonight-storm-system-dark.png" width="420">

</details>

<details>
<summary>Tokyo Night — 实时信息与系统</summary>

<img src="docs/screenshots/zh-CN/tokyonight-night-realtime-light.png" width="420"> <img src="docs/screenshots/zh-CN/tokyonight-night-realtime-dark.png" width="420">
<img src="docs/screenshots/zh-CN/tokyonight-night-system-light.png" width="420"> <img src="docs/screenshots/zh-CN/tokyonight-night-system-dark.png" width="420">

</details>

## 设置

[`luci-app-graphite`](https://github.com/Zakkaus/luci-app-graphite) 增加**系统 → Appearance** 页面，写入 `/etc/config/graphite`。
这些值在服务端读取，对打开该设备的每个浏览器生效。

| 选项 | 作用 |
|---|---|
| `palette` | 界面使用哪一套表面配色。留空即 Graphite |
| `tint_hue` | 让所有灰色表面偏向某个色相。取 0 到 360 的色相角，或 `#3b82f6` 这样的颜色码 |
| `tint_chroma` | 灰色向该色相偏移多少。`0` 为中性；超过 `0.01` 就不再读作灰色，开始与状态色竞争，因此这是上限 |

浅色与深色不在这个文件里。它们属于读者而不属于设备：右上角三个按钮选择浅色、
深色或跟随系统，选择保存在该浏览器内。侧边栏收成图标条同样如此。

<img src="docs/screenshots/zh-CN/rail-dark.png" width="640">

## 手机

布局断点是 48rem。低于它，侧边栏变成抽屉，宽表格在自己的容器里横向滚动而不是
把整页推宽，保存栏不再吸底。

| 浅色 | 深色 |
|---|---|
| <img src="docs/screenshots/zh-CN/phone-light.png" width="280"> | <img src="docs/screenshots/zh-CN/phone-dark.png" width="280"> |

第二个断点在 23.5rem，收紧保存栏里两个次要按钮的内边距，让主操作保住自己的
文字。窄于 320px（中文）或 348px（英文）时，该文字会被裁掉一截，而不是让保存栏
换成两行。现有手机都比这两个宽度宽。

## 分层

`htdocs/luci-static/graphite/` 下六份样式表，按此顺序加载，每一份只能引用它上面
几份已经定义的 token 与规则。

| 文件 | 层 | 负责 |
|---|---|---|
| `tokens.css` | 设计系统，逐字复制 | 所有具名的颜色、尺寸、圆角与时长。唯一允许写颜色字面值的文件 |
| `components.css` | 设计系统，逐字复制 | 按钮、字段、原生 `select`、徽章、表格 |
| `shell.css` | 设计系统，逐字复制 | 侧边栏、顶栏、内容列 |
| `palettes.css` | 项目层 | 五套配色。只有 token 取值，除 `:root[data-palette]` 外不写自己的选择器 |
| `graphite.css` | 项目层 | 本主题在设计系统之外增加的部分：图标条、登录页、品牌标记 |
| `luci.css` | 翻译层 | 把 LuCI 自己的类名 `.cbi-*`、`.alert-message`、`#modal_overlay` 映射到上面几层 |

前三份逐字节复制自设计系统，在这里不能修改，`checks/` 下的脚本负责核对。
页面自带的样式表在这六份之后加载，这就是归属边界：页面自带的样式由页面负责。

其余部分：

```
ucode/template/themes/graphite/   header.ut、footer.ut、sysauth.ut
htdocs/luci-static/resources/     menu-graphite.js、theme-graphite.js
root/etc/uci-defaults/            主题注册
checks/                           每条规则失败时会变红的检查
```

## 登录页

<img src="docs/screenshots/zh-CN/login-dark.png" width="640">

## 翻译

源语言是英文。简体中文已完成，包名为 `luci-i18n-graphite-zh-cn`，设置页为
`luci-i18n-graphite-app-zh-cn`。

## 许可

Apache-2.0。图标来自 [Lucide](https://lucide.dev)（ISC）；许可证原文与设计系统的
来源记在 `LICENSES/`。

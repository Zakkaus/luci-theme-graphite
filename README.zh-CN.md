<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/logo-dark.svg">
  <img src="docs/logo-light.svg" width="104" alt="Graphite">
</picture>

# Graphite

**OpenWrt 的 LuCI 主题**，`luci-theme-graphite`。

配色、强调色与品牌名可在界面中修改，需另装设置页 [**luci-app-graphite**](https://github.com/Zakkaus/luci-app-graphite)。

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

样式表直接发布，不经过构建。Makefile 里关掉了 `LUCI_MINIFY_CSS`，
因为 csstidy 遇到上面这些选择器和颜色函数不会报错，而是把它们改写成另一种写法。

## 安装

`luci.mk` 以 `PKGARCH:=all` 构建这两个包，因此一次构建适用于所有设备，与 CPU
架构无关。从[发布页](https://github.com/Zakkaus/luci-theme-graphite/releases/latest)取包，复制到路由器上执行：

```sh
# OpenWrt 25.12 及以后。这些包没有用发行版的密钥签名，所以要 --allow-untrusted，
# install.sh 会替你带上。
apk add --allow-untrusted ./luci-theme-graphite-*.apk
apk add --allow-untrusted ./luci-app-graphite-*.apk    # 可选：设置页
apk add --allow-untrusted ./luci-i18n-graphite-*.apk   # 可选：翻译

# OpenWrt 24.10 及以前
opkg install ./luci-theme-graphite_*.ipk
```

只有主题是必需的。它读取 `/etc/config/graphite`，没有设置页也能工作；那个包的
作用是让配色能在界面里改，而不必登录 ssh。它有自己的仓库：
[luci-app-graphite](https://github.com/Zakkaus/luci-app-graphite)。

### 自行构建

两个 Makefile 都以 `../../luci.mk` 引用 LuCI 的构建规则。该路径按真实路径解析。
这两个包必须位于 LuCI feed 内。放在 `package/` 下或使用符号链接时，引用会落空，
构建无法开始。

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

主题会注册 `Graphite`、`GraphiteLight`、`GraphiteDark` 三项。只有全新安装且尚未
选过主题时，它才成为默认；已有的选择不变。在**系统 → 系统 → 语言和界面**中选择。

## 配色

默认配色使用中性灰。另有五套基于已发布配色的方案，名称取自各自的深色模式。
Catppuccin 的浅色模式使用 Latte，Tokyo Night 使用 Day。切换配色时只改 token；
`palettes.css` 以外的规则不区分当前配色。

这些上游浅色配色的文字对比度低于本主题的下限。Tokyo Night Day 的次级文字为
3.8:1，低于 4.5:1；Latte 的正文为 7:1。本主题的六套配色沿用上游色相，明暗
两套都把正文和次级文字的对比度提到 10:1 和 5.5:1。`checks/contrast.py` 把每
一对颜色画进画布再读回像素，所以上面这两个数是量出来的，不是定下来的。

| 配色 | 浅色 | 深色 |
|---|---|---|
| **Graphite（默认）** | <img src="docs/screenshots/zh-CN/graphite-overview-light.png" width="380"> | <img src="docs/screenshots/zh-CN/graphite-overview-dark.png" width="380"> |
| **Catppuccin Frappé** | <img src="docs/screenshots/zh-CN/catppuccin-frappe-overview-light.png" width="380"> | <img src="docs/screenshots/zh-CN/catppuccin-frappe-overview-dark.png" width="380"> |
| **Catppuccin Macchiato** | <img src="docs/screenshots/zh-CN/catppuccin-macchiato-overview-light.png" width="380"> | <img src="docs/screenshots/zh-CN/catppuccin-macchiato-overview-dark.png" width="380"> |
| **Catppuccin Mocha** | <img src="docs/screenshots/zh-CN/catppuccin-mocha-overview-light.png" width="380"> | <img src="docs/screenshots/zh-CN/catppuccin-mocha-overview-dark.png" width="380"> |
| **Tokyo Night Storm** | <img src="docs/screenshots/zh-CN/tokyonight-storm-overview-light.png" width="380"> | <img src="docs/screenshots/zh-CN/tokyonight-storm-overview-dark.png" width="380"> |
| **Tokyo Night** | <img src="docs/screenshots/zh-CN/tokyonight-night-overview-light.png" width="380"> | <img src="docs/screenshots/zh-CN/tokyonight-night-overview-dark.png" width="380"> |

每套配色另有实时信息和系统两页。

<details>
<summary>Graphite（默认） — 实时信息与系统</summary>

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

### 强调色

强调色画界面上表示主要动作与当前位置的部件：主按钮的底色、焦点环、活动徽标、
侧栏与登录页的品牌方块，以及侧栏中当前条目的左轨和底色。其余部分仍是灰阶。
默认不启用，此时这些部件使用配色自己的中性色。

八个名字在每套配色下由该配色自己的取值回答，因此强调色始终属于它所在的那一套：
Catppuccin 取自各 flavour 自己的强调色表，Tokyo Night 取自
[folke/tokyonight.nvim](https://github.com/folke/tokyonight.nvim)，
Graphite 取自一组为纯灰界面调过的值。`accent_custom` 接受六位十六进制色号，
在任何配色下都优先于名字选择。

| 强调色 | 浅色 | 深色 |
|---|---|---|
| **Graphite + 蓝** | <img src="docs/screenshots/zh-CN/accent-graphite-light.png" width="380"> | <img src="docs/screenshots/zh-CN/accent-graphite-dark.png" width="380"> |
| **Catppuccin Mocha + 木槿紫** | <img src="docs/screenshots/zh-CN/accent-catppuccin-mocha-light.png" width="380"> | <img src="docs/screenshots/zh-CN/accent-catppuccin-mocha-dark.png" width="380"> |
| **Tokyo Night + 青** | <img src="docs/screenshots/zh-CN/accent-tokyonight-night-light.png" width="380"> | <img src="docs/screenshots/zh-CN/accent-tokyonight-night-dark.png" width="380"> |
| **Graphite + 自定义 `#e4572e`** | <img src="docs/screenshots/zh-CN/accent-graphite-custom-light.png" width="380"> | <img src="docs/screenshots/zh-CN/accent-graphite-custom-dark.png" width="380"> |

强调色上的文字不写死颜色。Graphite 的八个取值按实测对比度反推压低明度，白字
稳定达标；Catppuccin 与 Tokyo Night 两端差别大，深色 flavour 的强调色明度在
0.85 以上，白字只有 1.3:1，因此由 `contrast-color()` 按实际亮度选黑白。
`checks/contrast.py` 覆盖六套配色 × 八个强调色 × 明暗共 96 种组合，按钮文字
对按钮底不低于 4.5:1。

## 设置

[`luci-app-graphite`](https://github.com/Zakkaus/luci-app-graphite) 增加**系统 → Appearance** 页面，写入 `/etc/config/graphite`。
这些值在服务端读取，对打开该设备的每个浏览器生效。

| 选项 | 作用 |
|---|---|
| `palette` | 界面使用哪一套表面配色。留空即 Graphite |
| `accent` | 主按钮、焦点环、活动徽标与品牌方块的颜色。八个名字之一，留空即不启用 |
| `accent_custom` | 六位十六进制色号。在任何配色下都优先于 `accent` |
| `tint_hue` | 让所有灰色表面偏向某个色相。取 0 到 360 的色相角，或 `#3b82f6` 这样的颜色码 |
| `tint_chroma` | 灰色向该色相偏移多少。`0` 为中性；超过 `0.01` 就不再读作灰色，开始与状态色竞争，因此这是上限 |

浅色和深色模式不写入此文件。右上角的三个按钮可选择浅色、深色或跟随系统，
选择保存在浏览器内。侧边栏是否收成图标条也保存在浏览器内。

侧边栏按分组折叠，载入时只展开当前页所在的一组，点击分组标题可开合，多组可同时
展开。装了服务类软件包的设备上，菜单可达七组五十九项、内容高 3196px，全部展开时
一屏放不下。收起图标条时折叠不生效，因为那里没有分组标题可点。

<img src="docs/screenshots/zh-CN/rail-dark.png" width="640">

## 手机

布局断点为 48rem。低于该宽度时，侧边栏变为抽屉。宽表格在自己的容器中横向
滚动，不会撑宽整页；保存栏不再吸底。

| 浅色 | 深色 |
|---|---|
| <img src="docs/screenshots/zh-CN/phone-light.png" width="280"> | <img src="docs/screenshots/zh-CN/phone-dark.png" width="280"> |

第二个断点为 23.5rem，此时收紧保存栏中两个次要按钮的内边距，以保留主操作文字。
窄于 320px（中文）或 348px（英文）时，主操作文字会被裁掉一截，保存栏仍保持
单行。现有手机都比这两个宽度宽。

## 分层

`htdocs/luci-static/graphite/` 下六份样式表按此顺序加载。每一份只能引用上面已经
定义的 token 与规则。

| 文件 | 层 | 负责 |
|---|---|---|
| `tokens.css` | 设计系统，逐字复制 | 所有具名的颜色、尺寸、圆角与时长。唯一允许写颜色字面值的文件 |
| `components.css` | 设计系统，逐字复制 | 按钮、字段、原生 `select`、徽章、表格 |
| `shell.css` | 设计系统，逐字复制 | 侧边栏、顶栏、内容列 |
| `palettes.css` | 项目层 | 五套配色。只有 token 取值，除 `:root[data-palette]` 外不写自己的选择器 |
| `graphite.css` | 项目层 | 本主题在设计系统之外增加的部分：图标条、登录页、品牌标记 |
| `luci.css` | 翻译层 | 把 LuCI 自己的类名 `.cbi-*`、`.alert-message`、`#modal_overlay` 映射到上面几层 |

前三份逐字节复制自设计系统，在这里不能修改，`checks/` 下的脚本负责核对。
页面自带的样式表在这六份之后加载，由页面维护。

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

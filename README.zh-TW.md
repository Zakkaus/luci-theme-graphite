<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/logo-dark.svg">
  <img src="docs/logo-light.svg" width="104" alt="Graphite">
</picture>

# Graphite

**OpenWrt 的 LuCI 佈景主題**，`luci-theme-graphite`。

配色、強調色與品牌名可在介面中修改，需另裝設定頁 [**luci-app-graphite**](https://github.com/Zakkaus/luci-app-graphite)。

[English](README.md) · [简体中文](README.zh-CN.md) · 繁體中文

[執行環境](#執行環境) • [安裝](#安裝) • [配色](#配色) • [設定](#設定) • [手機](#手機) • [分層](#分層)

</div>

![概覽](docs/screenshots/zh-TW/graphite-overview-light.png)

> [!TIP]
> **配色、強調色與品牌名在介面裡修改，需要另裝
> [luci-app-graphite](https://github.com/Zakkaus/luci-app-graphite)**，與主題一同發布。

## 執行環境

| | |
|---|---|
| OpenWrt | 24.10 及以後。主題針對 ucode 模板派發器撰寫 |
| 已測試 | OpenWrt 25.12.5，LuCI 分支 26.180 |
| 瀏覽器 | Chrome 119、Safari 16.4、Firefox 128 及以後。樣式表使用 `oklch()`、相對顏色語法、`color-mix()`、`:has()` 與 CSS 邏輯屬性，沒有任何降級實作 |
| 相依 | `luci-base` |

樣式表直接發佈，不經過建置。Makefile 裡關掉了 `LUCI_MINIFY_CSS`，
因為 csstidy 遇到上面這些選擇器與顏色函式不會報錯，而是把它們改寫成另一種寫法。

## 安裝

`luci.mk` 以 `PKGARCH:=all` 建置這兩個套件，因此一次建置適用於所有裝置，與 CPU
架構無關。自[發行頁](https://github.com/Zakkaus/luci-theme-graphite/releases/latest)取得套件，複製到路由器上執行：

```sh
# OpenWrt 25.12 及之後。這些套件沒有用發行版的金鑰簽署，所以要 --allow-untrusted，
# install.sh 會替你帶上。
apk add --allow-untrusted ./luci-theme-graphite-*.apk
apk add --allow-untrusted ./luci-app-graphite-*.apk    # 選用：設定頁
apk add --allow-untrusted ./luci-i18n-graphite-*.apk   # 選用：翻譯

# OpenWrt 24.10 及之前
opkg install ./luci-theme-graphite_*.ipk
```

只有主題是必需的。它讀取 `/etc/config/graphite`，沒有設定頁也能運作；該套件的
作用是讓配色能在介面中變更，而不必登入 ssh。它有自己的倉庫：
[luci-app-graphite](https://github.com/Zakkaus/luci-app-graphite)。

### 自行建置

兩個 Makefile 都以 `../../luci.mk` 引用 LuCI 的建置規則。該路徑按真實路徑解析。
這兩個套件必須位於 LuCI feed 內。置於 `package/` 之下或使用符號連結時，引用會落空，
建置無法開始。

```sh
cp -r luci-theme-graphite <sdk>/feeds/luci/themes/
cp -r luci-app-graphite   <sdk>/feeds/luci/applications/   # 取自它自己的倉庫
cd <sdk>
./scripts/feeds update -i  # 重建索引，否則 install 找不到這兩個套件
./scripts/feeds install -p luci luci-theme-graphite luci-app-graphite
make menuconfig            # LuCI → Themes、LuCI → Applications
make package/luci-theme-graphite/compile package/luci-app-graphite/compile
```

產物位於 `bin/packages/<架構>/luci/`。

主題會註冊 `Graphite`、`GraphiteLight`、`GraphiteDark` 三項。只有全新安裝且尚未
選過主題時，才成為預設；已有的選擇不變。在**系統 → 系統 → 語言和介面**中選擇。

## 配色

預設配色使用中性灰。另有五套基於已發佈配色的方案，名稱取自各自的深色模式。
Catppuccin 的淺色模式使用 Latte，Tokyo Night 使用 Day。切換配色時只改 token；
`palettes.css` 以外的規則不區分目前配色。

這些上游淺色配色的文字對比度低於本主題的下限。Tokyo Night Day 的次級文字為
3.8:1，低於 4.5:1；Latte 的正文為 7:1。本主題的六套配色沿用上游色相，明暗
兩套都把正文和次級文字的對比度提到 10:1 和 5.5:1。`checks/contrast.py` 把每
一對顏色畫進畫布再讀回像素，所以上面這兩個數是量出來的，不是定下來的。

| 配色 | 淺色 | 深色 |
|---|---|---|
| **Graphite（預設）** | <img src="docs/screenshots/zh-TW/graphite-overview-light.png" width="380"> | <img src="docs/screenshots/zh-TW/graphite-overview-dark.png" width="380"> |
| **Catppuccin Frappé** | <img src="docs/screenshots/zh-TW/catppuccin-frappe-overview-light.png" width="380"> | <img src="docs/screenshots/zh-TW/catppuccin-frappe-overview-dark.png" width="380"> |
| **Catppuccin Macchiato** | <img src="docs/screenshots/zh-TW/catppuccin-macchiato-overview-light.png" width="380"> | <img src="docs/screenshots/zh-TW/catppuccin-macchiato-overview-dark.png" width="380"> |
| **Catppuccin Mocha** | <img src="docs/screenshots/zh-TW/catppuccin-mocha-overview-light.png" width="380"> | <img src="docs/screenshots/zh-TW/catppuccin-mocha-overview-dark.png" width="380"> |
| **Tokyo Night Storm** | <img src="docs/screenshots/zh-TW/tokyonight-storm-overview-light.png" width="380"> | <img src="docs/screenshots/zh-TW/tokyonight-storm-overview-dark.png" width="380"> |
| **Tokyo Night** | <img src="docs/screenshots/zh-TW/tokyonight-night-overview-light.png" width="380"> | <img src="docs/screenshots/zh-TW/tokyonight-night-overview-dark.png" width="380"> |

每套配色另有即時資訊和系統兩頁。

<details>
<summary>Graphite（預設） — 即時資訊與系統</summary>

<img src="docs/screenshots/zh-TW/graphite-realtime-light.png" width="420"> <img src="docs/screenshots/zh-TW/graphite-realtime-dark.png" width="420">
<img src="docs/screenshots/zh-TW/graphite-system-light.png" width="420"> <img src="docs/screenshots/zh-TW/graphite-system-dark.png" width="420">

</details>

<details>
<summary>Catppuccin Frappé — 即時資訊與系統</summary>

<img src="docs/screenshots/zh-TW/catppuccin-frappe-realtime-light.png" width="420"> <img src="docs/screenshots/zh-TW/catppuccin-frappe-realtime-dark.png" width="420">
<img src="docs/screenshots/zh-TW/catppuccin-frappe-system-light.png" width="420"> <img src="docs/screenshots/zh-TW/catppuccin-frappe-system-dark.png" width="420">

</details>

<details>
<summary>Catppuccin Macchiato — 即時資訊與系統</summary>

<img src="docs/screenshots/zh-TW/catppuccin-macchiato-realtime-light.png" width="420"> <img src="docs/screenshots/zh-TW/catppuccin-macchiato-realtime-dark.png" width="420">
<img src="docs/screenshots/zh-TW/catppuccin-macchiato-system-light.png" width="420"> <img src="docs/screenshots/zh-TW/catppuccin-macchiato-system-dark.png" width="420">

</details>

<details>
<summary>Catppuccin Mocha — 即時資訊與系統</summary>

<img src="docs/screenshots/zh-TW/catppuccin-mocha-realtime-light.png" width="420"> <img src="docs/screenshots/zh-TW/catppuccin-mocha-realtime-dark.png" width="420">
<img src="docs/screenshots/zh-TW/catppuccin-mocha-system-light.png" width="420"> <img src="docs/screenshots/zh-TW/catppuccin-mocha-system-dark.png" width="420">

</details>

<details>
<summary>Tokyo Night Storm — 即時資訊與系統</summary>

<img src="docs/screenshots/zh-TW/tokyonight-storm-realtime-light.png" width="420"> <img src="docs/screenshots/zh-TW/tokyonight-storm-realtime-dark.png" width="420">
<img src="docs/screenshots/zh-TW/tokyonight-storm-system-light.png" width="420"> <img src="docs/screenshots/zh-TW/tokyonight-storm-system-dark.png" width="420">

</details>

<details>
<summary>Tokyo Night — 即時資訊與系統</summary>

<img src="docs/screenshots/zh-TW/tokyonight-night-realtime-light.png" width="420"> <img src="docs/screenshots/zh-TW/tokyonight-night-realtime-dark.png" width="420">
<img src="docs/screenshots/zh-TW/tokyonight-night-system-light.png" width="420"> <img src="docs/screenshots/zh-TW/tokyonight-night-system-dark.png" width="420">

</details>

### 強調色

強調色畫介面上表示主要動作與目前位置的部件：主按鈕的底色、焦點環、活動徽標、
側欄與登入頁的品牌方塊，以及側欄中目前條目的左軌和底色。其餘部分仍是灰階。
預設不啟用，此時這些部件使用配色自己的中性色。

八個名稱在每套配色下由該配色自己的取值回答，因此強調色始終屬於它所在的那一套：
Catppuccin 取自各 flavour 自己的強調色表，Tokyo Night 取自
[folke/tokyonight.nvim](https://github.com/folke/tokyonight.nvim)，
Graphite 取自一組為純灰介面調過的值。`accent_custom` 接受六位十六進位色碼，
在任何配色下都優先於名稱選擇。

| 強調色 | 淺色 | 深色 |
|---|---|---|
| **Graphite + 藍** | <img src="docs/screenshots/zh-TW/accent-graphite-light.png" width="380"> | <img src="docs/screenshots/zh-TW/accent-graphite-dark.png" width="380"> |
| **Catppuccin Mocha + 木槿紫** | <img src="docs/screenshots/zh-TW/accent-catppuccin-mocha-light.png" width="380"> | <img src="docs/screenshots/zh-TW/accent-catppuccin-mocha-dark.png" width="380"> |
| **Tokyo Night + 青** | <img src="docs/screenshots/zh-TW/accent-tokyonight-night-light.png" width="380"> | <img src="docs/screenshots/zh-TW/accent-tokyonight-night-dark.png" width="380"> |
| **Graphite + 自訂 `#e4572e`** | <img src="docs/screenshots/zh-TW/accent-graphite-custom-light.png" width="380"> | <img src="docs/screenshots/zh-TW/accent-graphite-custom-dark.png" width="380"> |

上面四行是同一個介面在四種強調色下的樣子，取值分別來自 Graphite 自己、
Catppuccin 的 flavour、Tokyo Night 的調色盤，以及一個自訂色碼。切換它們在
[luci-app-graphite](https://github.com/Zakkaus/luci-app-graphite) 的外觀頁。

進度條也跟著強調色。條上的數字有兩份：一份鋪在軌道上用正文色，另一份在填充裡用
強調色算出的前景色，被填充自己的 overflow 裁掉，因此邊界處逐字元換色。LuCI 只在外層的 `title` 上給出那串數字，而 CSS 的 `attr()` 只讀元素自身的屬性，
因此第二份由 `progressbar-graphite.js` 補出並跟著輪詢更新。

<img src="docs/screenshots/zh-TW/accent-bars-light.png" width="420"> <img src="docs/screenshots/zh-TW/accent-bars-dark.png" width="420">

強調色上的文字不寫死顏色。Graphite 的八個取值按實測對比度反推壓低明度，白字
穩定達標；Catppuccin 與 Tokyo Night 兩端差別大，深色 flavour 的強調色明度在
0.85 以上，白字只有 1.3:1，因此由 `contrast-color()` 按實際亮度選黑白。
`checks/contrast.py` 涵蓋六套配色 × 八個強調色 × 明暗共 96 種組合，按鈕文字
對按鈕底不低於 4.5:1。

## 設定

[`luci-app-graphite`](https://github.com/Zakkaus/luci-app-graphite) 增加**系統 → Appearance** 頁面，寫入 `/etc/config/graphite`。
這些值在伺服端讀取，對開啟該裝置的每個瀏覽器生效。

| 選項 | 作用 |
|---|---|
| `palette` | 介面使用哪一套表面配色。留空即 Graphite |
| `accent` | 主按鈕、焦點環、活動徽標與品牌方塊的顏色。八個名稱之一，留空即不啟用 |
| `accent_custom` | 六位十六進位色碼。在任何配色下都優先於 `accent` |
| `tint_hue` | 讓所有灰色表面偏向某個色相。取 0 到 360 的色相角，或 `#3b82f6` 這樣的顏色碼 |
| `tint_chroma` | 灰色向該色相偏移多少。`0` 為中性；超過 `0.01` 就不再讀作灰色，開始與狀態色競爭，因此這是上限 |

淺色與深色模式不寫入這個檔案。右上角的三個按鈕可選擇淺色、深色或跟隨系統，
選擇保存在瀏覽器內。側邊欄是否收成圖示列也保存在瀏覽器內。

側邊欄按分組摺疊，載入時只展開目前頁所在的一組，點擊分組標題可開合，多組可同時
展開。裝了服務類套件的裝置上，選單可達七組五十九項、內容高 3196px，全部展開時
一個螢幕放不下。收成圖示列時摺疊不生效，因為那裡沒有分組標題可點。

<img src="docs/screenshots/zh-TW/rail-dark.png" width="640">

## 手機

版面斷點為 48rem。低於該寬度時，側邊欄變為抽屜。寬表格在自己的容器內橫向
捲動，不會撐寬整頁；儲存列不再吸底。

| 淺色 | 深色 |
|---|---|
| <img src="docs/screenshots/zh-TW/phone-light.png" width="280"> | <img src="docs/screenshots/zh-TW/phone-dark.png" width="280"> |

第二個斷點為 23.5rem，此時收緊儲存列中兩個次要按鈕的內距，以保留主要動作文字。
窄於 320px（中文）或 348px（英文）時，主要動作文字會被裁掉一截，儲存列仍保持
單列。現有手機都比這兩個寬度寬。

## 分層

`htdocs/luci-static/graphite/` 下六份樣式表按此順序載入。每一份只能引用上面已經
定義的 token 與規則。

| 檔案 | 層 | 負責 |
|---|---|---|
| `tokens.css` | 設計系統，逐字複製 | 所有具名的顏色、尺寸、圓角與時長。唯一允許寫顏色字面值的檔案 |
| `components.css` | 設計系統，逐字複製 | 按鈕、欄位、原生 `select`、徽章、表格 |
| `shell.css` | 設計系統，逐字複製 | 側邊欄、頂欄、內容欄 |
| `palettes.css` | 專案層 | 五套配色。只有 token 取值，除 `:root[data-palette]` 外不寫自己的選擇器 |
| `graphite.css` | 專案層 | 本主題在設計系統之外增加的部分：圖示列、登入頁、品牌標記 |
| `luci.css` | 翻譯層 | 把 LuCI 自己的類別名 `.cbi-*`、`.alert-message`、`#modal_overlay` 對應到上面幾層 |

前三份逐位元組複製自設計系統，在這裡不能修改，`checks/` 下的指令稿負責核對。
頁面自帶的樣式表在這六份之後載入，由頁面維護。

其餘部分：

```
ucode/template/themes/graphite/   header.ut、footer.ut、sysauth.ut
htdocs/luci-static/resources/     menu-graphite.js、theme-graphite.js
root/etc/uci-defaults/            主題註冊
checks/                           每條規則失敗時會變紅的檢查
```

## 登入頁

<img src="docs/screenshots/zh-TW/login-dark.png" width="640">

## 翻譯

原始語言是英文。簡體中文已完成，套件名為 `luci-i18n-graphite-zh-cn`，設定頁為
`luci-i18n-graphite-app-zh-cn`。

## 授權

Apache-2.0。圖示來自 [Lucide](https://lucide.dev)（ISC）；授權原文與設計系統的
來源記在 `LICENSES/`。

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/logo-dark.svg">
  <img src="docs/logo-light.svg" width="104" alt="Graphite">
</picture>

# Graphite

**OpenWrt 的 LuCI 佈景主題**，套件名 `luci-theme-graphite`。<br>
洗盡鉛華。

[English](README.md) · [简体中文](README.zh-CN.md) · 繁體中文

[執行環境](#執行環境) • [安裝](#安裝) • [配色](#配色) • [設定](#設定) • [手機](#手機) • [分層](#分層)

</div>

![概覽](docs/screenshots/zh-TW/graphite-overview-light.png)

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
apk add ./luci-theme-graphite-*.apk        # OpenWrt 25.12 及之後
apk add ./luci-app-graphite-*.apk          # 選用：設定頁
apk add ./luci-i18n-graphite-*.apk         # 選用：翻譯

opkg install ./luci-theme-graphite_*.ipk   # OpenWrt 24.10 及之前
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
3.8:1，低於 4.5:1；Latte 的正文為 7:1。本主題的每套淺色配色沿用上游色相，
將正文和次級文字的對比度分別設為 10:1 和 5.5:1。

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

## 設定

[`luci-app-graphite`](https://github.com/Zakkaus/luci-app-graphite) 增加**系統 → Appearance** 頁面，寫入 `/etc/config/graphite`。
這些值在伺服端讀取，對開啟該裝置的每個瀏覽器生效。

| 選項 | 作用 |
|---|---|
| `palette` | 介面使用哪一套表面配色。留空即 Graphite |
| `tint_hue` | 讓所有灰色表面偏向某個色相。取 0 到 360 的色相角，或 `#3b82f6` 這樣的顏色碼 |
| `tint_chroma` | 灰色向該色相偏移多少。`0` 為中性；超過 `0.01` 就不再讀作灰色，開始與狀態色競爭，因此這是上限 |

淺色與深色模式不寫入這個檔案。右上角的三個按鈕可選擇淺色、深色或跟隨系統，
選擇保存在瀏覽器內。側邊欄是否收成圖示列也保存在瀏覽器內。

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

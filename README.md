<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/logo-dark.svg">
  <img src="docs/logo-light.svg" width="104" alt="Graphite">
</picture>

# Graphite

**A LuCI theme for OpenWrt**, packaged as `luci-theme-graphite`.<br>
Grey carries hierarchy; hue is reserved for status, so on a page listing forty
interfaces the coloured row is the one that needs attention.

English · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md)

[Requirements](#requirements) • [Install](#install) • [Palettes](#palettes) • [Settings](#settings) • [Phone](#phone) • [Layout](#layout)

</div>

![Overview](docs/screenshots/en/graphite-overview-light.png)

## Requirements

| | |
|---|---|
| OpenWrt | 24.10 or later — the theme is written against the ucode template dispatcher |
| Tested on | OpenWrt 25.12.5, LuCI branch 26.180 |
| Browser | Chrome 119, Safari 16.4, Firefox 128 or later. The stylesheets use `oklch()`, relative colour syntax, `color-mix()`, `:has()` and CSS logical properties, none of which are polyfilled |
| Depends | `luci-base` |

There is no build step. The stylesheets ship as written; `LUCI_MINIFY_CSS` is
turned off in the Makefile because csstidy rewrites the modern selectors and
colour functions above into something else rather than failing on them.

## Install

`luci.mk` builds these with `PKGARCH:=all`, so one build runs on every device
whatever its CPU. Take the packages from the [latest release](https://github.com/Zakkaus/luci-theme-graphite/releases/latest) and copy
them to the router:

```sh
apk add ./luci-theme-graphite-*.apk        # OpenWrt 25.12 and later
apk add ./luci-app-graphite-*.apk          # optional: the settings page
apk add ./luci-i18n-graphite-*.apk         # optional: translations

opkg install ./luci-theme-graphite_*.ipk   # OpenWrt 24.10 and earlier
```

Only the theme is required. It reads `/etc/config/graphite` and works without
the settings page; that package exists so the palette can be changed from the
interface rather than over ssh. It lives in its own repository,
[luci-app-graphite](https://github.com/Zakkaus/luci-app-graphite).

### Building it yourself

Both Makefiles reach `luci.mk` through `../../luci.mk`, which is resolved
against the real path. The packages therefore have to live inside the LuCI
feed — under `package/`, or behind a symlink, the include misses and the build
fails before it starts.

```sh
cp -r luci-theme-graphite <sdk>/feeds/luci/themes/
cp -r luci-app-graphite   <sdk>/feeds/luci/applications/   # from its own repository
cd <sdk>
./scripts/feeds update -i  # rebuild the index, or install finds nothing
./scripts/feeds install -p luci luci-theme-graphite luci-app-graphite
make menuconfig            # LuCI → Themes, LuCI → Applications
make package/luci-theme-graphite/compile package/luci-app-graphite/compile
```

The packages land in `bin/packages/<arch>/luci/`.

The theme registers itself as `Graphite`, `GraphiteLight` and `GraphiteDark`,
and becomes the default only on a fresh install where no theme has been chosen.
An existing choice is never replaced. Select it under **System → System →
Language and Style**.

## Palettes

The default is achromatic. The other five are based on published palettes,
named for the flavour they use in dark mode; each pairs with that project's own
light flavour — Latte for Catppuccin, Day for Tokyo Night. A palette changes
only the token layer: no rule outside `palettes.css` knows which one is active.

Based on, not copied from: the light flavours are published at a text contrast
this theme will not ship. Tokyo Night Day puts secondary text at 3.8:1, under
the 4.5:1 floor, and Latte's body text at 7:1. Every light flavour here is
raised to 10:1 for body text and 5.5:1 for secondary. The hues are upstream's;
the text lightness is not.

| Palette | Light | Dark |
|---|---|---|
| **Graphite（默认）** | <img src="docs/screenshots/en/graphite-overview-light.png" width="380"> | <img src="docs/screenshots/en/graphite-overview-dark.png" width="380"> |
| **Catppuccin Frappé** | <img src="docs/screenshots/en/catppuccin-frappe-overview-light.png" width="380"> | <img src="docs/screenshots/en/catppuccin-frappe-overview-dark.png" width="380"> |
| **Catppuccin Macchiato** | <img src="docs/screenshots/en/catppuccin-macchiato-overview-light.png" width="380"> | <img src="docs/screenshots/en/catppuccin-macchiato-overview-dark.png" width="380"> |
| **Catppuccin Mocha** | <img src="docs/screenshots/en/catppuccin-mocha-overview-light.png" width="380"> | <img src="docs/screenshots/en/catppuccin-mocha-overview-dark.png" width="380"> |
| **Tokyo Night Storm** | <img src="docs/screenshots/en/tokyonight-storm-overview-light.png" width="380"> | <img src="docs/screenshots/en/tokyonight-storm-overview-dark.png" width="380"> |
| **Tokyo Night** | <img src="docs/screenshots/en/tokyonight-night-overview-light.png" width="380"> | <img src="docs/screenshots/en/tokyonight-night-overview-dark.png" width="380"> |

Two more pages per palette — the realtime graphs and a form-heavy page:

<details>
<summary>Graphite（默认） — Realtime and System</summary>

<img src="docs/screenshots/en/graphite-realtime-light.png" width="420"> <img src="docs/screenshots/en/graphite-realtime-dark.png" width="420">
<img src="docs/screenshots/en/graphite-system-light.png" width="420"> <img src="docs/screenshots/en/graphite-system-dark.png" width="420">

</details>

<details>
<summary>Catppuccin Frappé — Realtime and System</summary>

<img src="docs/screenshots/en/catppuccin-frappe-realtime-light.png" width="420"> <img src="docs/screenshots/en/catppuccin-frappe-realtime-dark.png" width="420">
<img src="docs/screenshots/en/catppuccin-frappe-system-light.png" width="420"> <img src="docs/screenshots/en/catppuccin-frappe-system-dark.png" width="420">

</details>

<details>
<summary>Catppuccin Macchiato — Realtime and System</summary>

<img src="docs/screenshots/en/catppuccin-macchiato-realtime-light.png" width="420"> <img src="docs/screenshots/en/catppuccin-macchiato-realtime-dark.png" width="420">
<img src="docs/screenshots/en/catppuccin-macchiato-system-light.png" width="420"> <img src="docs/screenshots/en/catppuccin-macchiato-system-dark.png" width="420">

</details>

<details>
<summary>Catppuccin Mocha — Realtime and System</summary>

<img src="docs/screenshots/en/catppuccin-mocha-realtime-light.png" width="420"> <img src="docs/screenshots/en/catppuccin-mocha-realtime-dark.png" width="420">
<img src="docs/screenshots/en/catppuccin-mocha-system-light.png" width="420"> <img src="docs/screenshots/en/catppuccin-mocha-system-dark.png" width="420">

</details>

<details>
<summary>Tokyo Night Storm — Realtime and System</summary>

<img src="docs/screenshots/en/tokyonight-storm-realtime-light.png" width="420"> <img src="docs/screenshots/en/tokyonight-storm-realtime-dark.png" width="420">
<img src="docs/screenshots/en/tokyonight-storm-system-light.png" width="420"> <img src="docs/screenshots/en/tokyonight-storm-system-dark.png" width="420">

</details>

<details>
<summary>Tokyo Night — Realtime and System</summary>

<img src="docs/screenshots/en/tokyonight-night-realtime-light.png" width="420"> <img src="docs/screenshots/en/tokyonight-night-realtime-dark.png" width="420">
<img src="docs/screenshots/en/tokyonight-night-system-light.png" width="420"> <img src="docs/screenshots/en/tokyonight-night-system-dark.png" width="420">

</details>

## Settings

[`luci-app-graphite`](https://github.com/Zakkaus/luci-app-graphite) adds **System → Appearance**, which writes
`/etc/config/graphite`. The values are read server-side and apply to every
browser that opens the device.

| Option | Effect |
|---|---|
| `palette` | Which set of surface colours the interface uses. Empty means Graphite |
| `tint_hue` | Biases every grey surface towards one hue. A hue angle from 0 to 360, or a colour code such as `#3b82f6` |
| `tint_chroma` | How far the greys move towards that hue. `0` is neutral; above `0.01` they stop reading as grey and start competing with the status colours, so that is the ceiling |

Light and dark are not in this file. They belong to the reader, not to the
device: the three buttons at the top right choose light, dark, or follow the
system, and the choice is kept in that browser. Collapsing the sidebar to an
icon rail is kept the same way.

<img src="docs/screenshots/en/rail-dark.png" width="640">

## Phone

The layout breakpoint is 48rem. Below it the sidebar becomes a drawer, wide
tables scroll inside their own container instead of pushing the page sideways,
and the save bar stops being sticky.

| Light | Dark |
|---|---|
| <img src="docs/screenshots/en/phone-light.png" width="280"> | <img src="docs/screenshots/en/phone-dark.png" width="280"> |

A second breakpoint at 23.5rem tightens the secondary buttons in the save bar
so the primary action keeps its label. Narrower than 320px in Chinese or 348px
in English, that label is clipped rather than allowed to wrap the bar onto two
lines. Every current phone is wider than both.

## Layout

Six stylesheets in `htdocs/luci-static/graphite/`, loaded in this order. Each
one may only use what the ones above it define.

| File | Layer | Owns |
|---|---|---|
| `tokens.css` | design system, vendored | Every named colour, size, radius and duration. The only file allowed to write a colour literal |
| `components.css` | design system, vendored | Buttons, fields, native `select`, badges, tables |
| `shell.css` | design system, vendored | Sidebar, top bar, content column |
| `palettes.css` | project | The five palettes. Token values only, no selectors of its own beyond `:root[data-palette]` |
| `graphite.css` | project | What this theme adds to the design system: the rail, the login page, the brand mark |
| `luci.css` | translation | LuCI's own class names — `.cbi-*`, `.alert-message`, `#modal_overlay` — mapped onto the layers above |

The first three are copied byte-for-byte from the design system and must not be
edited here; `checks/` holds the scripts that say so. A page's own stylesheet
loads after all six, which is the ownership boundary: what a page ships with
belongs to that page.

The rest:

```
ucode/template/themes/graphite/   header.ut, footer.ut, sysauth.ut
htdocs/luci-static/resources/     menu-graphite.js, theme-graphite.js
root/etc/uci-defaults/            theme registration
checks/                           the gates each rule fails on
```

## Login

<img src="docs/screenshots/en/login-dark.png" width="640">

## Translations

English is the source language. Simplified Chinese is complete
(`luci-i18n-graphite-zh-cn`, and `luci-i18n-graphite-app-zh-cn` for the
settings page).

## Licence

Apache-2.0. Icons are [Lucide](https://lucide.dev) (ISC); the licence texts and
the design system's provenance are in `LICENSES/`.

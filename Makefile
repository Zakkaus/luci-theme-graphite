#
# Copyright (C) 2026 Zakk <zakk@gentoozh.org>
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Graphite Theme
LUCI_DEPENDS:=+luci-base

PKG_LICENSE:=Apache-2.0

# luci.mk turns CSS minification on by default and runs it through csstidy,
# which predates every modern selector and function this theme is built on:
# :has(), color-mix(), oklch(), relative colour, logical properties. It does
# not fail on them, it rewrites them into something else — so the build would
# ship a stylesheet that never existed in this repository and cannot be
# reproduced from it. The bytes saved are not worth a rendering nobody wrote.
LUCI_MINIFY_CSS:=0

# The three variants are one code base reached through three media paths, the
# way luci-theme-bootstrap does it: the light and dark directories are symlinks
# to this one, and header.ut reads which of them it was reached through. That is
# the whole theme-switching mechanism — LuCI already owns the selection UI and
# the persistence, so the theme does not build a second one.
# Removing the theme has to remove the pointer to it as well. Deleting only the
# three registrations left luci.main.mediaurlbase aimed at a directory that no
# longer exists, and LuCI then served a page with no stylesheet at all — an
# unusable interface produced by uninstalling a theme. The admin's own choice is
# still respected: the pointer is only moved when it is one of ours, and it is
# moved to whatever theme is still registered rather than to a guess.
define Package/luci-theme-graphite/postrm
#!/bin/sh
# postrm runs on upgrade too, with "upgrade" as its first argument, and on
# that path the package is about to be reinstalled — deregistering the theme
# and moving the media path away would leave the device on someone else's
# theme after an update that changed nothing.
case "$$1" in *upgrade*) exit 0 ;; esac

[ -n "$${IPKG_INSTROOT}" ] || {
	base=$$(uci -q get luci.main.mediaurlbase)

	uci -q delete luci.themes.Graphite
	uci -q delete luci.themes.GraphiteLight
	uci -q delete luci.themes.GraphiteDark

	case "$$base" in
	/luci-static/graphite|/luci-static/graphite-light|/luci-static/graphite-dark)
		next=$$(uci -q show luci.themes | sed -n "s|^luci\.themes\.[^=]*='\(.*\)'$$|\1|p" | head -n 1)

		if [ -n "$$next" ]; then
			uci set luci.main.mediaurlbase="$$next"
		else
			uci -q delete luci.main.mediaurlbase
		fi
		;;
	esac

	uci commit luci
}
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature

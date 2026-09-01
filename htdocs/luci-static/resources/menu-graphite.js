'use strict';
'require baseclass';
'require ui';
'require theme-graphite';

/* The menu tree, its ACL filtering and its ordering all come from luci-base:
 * ui.menu.load() fetches it, ui.menu.getChildren() drops what this session may
 * not see and sorts the rest. Walking the tree directly would render entries
 * the reader is not allowed to open.
 *
 * The shape is the design system's sidebar: a group label per top-level entry
 * and a flat list of items under it, rendered with .nav-group / .nav-label /
 * .nav-item from shell.css. No collapsing — LuCI has three to five groups on a
 * stock install, and a group the reader has to open before they can read it is
 * a click added to every navigation.
 *
 * State lives on attributes: data-active, aria-current, aria-expanded. Nothing
 * here adds a styling class.
 */

/* Lucide v1.38.0, ISC — https://lucide.dev
 * Vendored verbatim: each entry below is the inner markup of the icon's own
 * SVG file, unmodified. The licence is in LICENSES/lucide-ISC.txt.
 *
 * Stroke width comes from the set (2), not from the design system's .ico
 * default of 1.75: a stroke width is part of an icon set's geometry, and
 * changing it is the first step towards a set nobody can re-sync.
 * The override lives in graphite.css and says the same thing there.
 */
const LUCIDE = {
	'archive': '<rect width="20" height="5" x="2" y="3" rx="1"/> <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/> <path d="M10 12h4"/>',
	'arrow-left-right': '<path d="M8 3 4 7l4 4"/> <path d="M4 7h16"/> <path d="m16 21 4-4-4-4"/> <path d="M20 17H4"/>',
	'chart-line': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/> <path d="m19 9-5 5-4-4-3 3"/>',
	'circle-arrow-up': '<circle cx="12" cy="12" r="10"/> <path d="m16 12-4-4-4 4"/> <path d="M12 16V8"/>',
	'clock': '<circle cx="12" cy="12" r="10"/> <path d="M12 6v6l4 2"/>',
	'cpu': '<path d="M12 20v2"/> <path d="M12 2v2"/> <path d="M17 20v2"/> <path d="M17 2v2"/> <path d="M2 12h2"/> <path d="M2 17h2"/> <path d="M2 7h2"/> <path d="M20 12h2"/> <path d="M20 17h2"/> <path d="M20 7h2"/> <path d="M7 20v2"/> <path d="M7 2v2"/> <rect x="4" y="4" width="16" height="16" rx="2"/> <rect x="8" y="8" width="8" height="8" rx="1"/>',
	'dot': '<circle cx="12" cy="12" r="1"/>',
	'gauge': '<path d="m12 14 4-4"/> <path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
	'globe': '<circle cx="12" cy="12" r="10"/> <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/> <path d="M2 12h20"/>',
	'hard-drive': '<path d="M10 16h.01"/> <path d="M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/> <path d="M21.946 12.013H2.054"/> <path d="M6 16h.01"/>',
	'hard-drive-download': '<path d="M12 2v8"/> <path d="m16 6-4 4-4-4"/> <rect width="20" height="8" x="2" y="14" rx="2"/> <path d="M6 18h.01"/> <path d="M10 18h.01"/>',
	'key-round': '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/> <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
	'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/> <rect width="7" height="5" x="14" y="3" rx="1"/> <rect width="7" height="9" x="14" y="12" rx="1"/> <rect width="7" height="5" x="3" y="16" rx="1"/>',
	'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/> <path d="M9 18h6"/> <path d="M10 22h4"/>',
	'log-out': '<path d="m16 17 5-5-5-5"/> <path d="M21 12H9"/> <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',
	'network': '<rect x="16" y="16" width="6" height="6" rx="1"/> <rect x="2" y="16" width="6" height="6" rx="1"/> <rect x="9" y="2" width="6" height="6" rx="1"/> <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/> <path d="M12 12V8"/>',
	'package': '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/> <path d="M12 22V12"/> <polyline points="3.29 7 12 12 20.71 7"/> <path d="m7.5 4.27 9 5.15"/>',
	'power': '<path d="M12 2v10"/> <path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',
	'radar': '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/> <path d="M4 6h.01"/> <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/> <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/> <path d="M12 18h.01"/> <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/> <circle cx="12" cy="12" r="2"/> <path d="m13.41 10.59 5.66-5.66"/>',
	'rotate-cw': '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/> <path d="M21 3v5h-5"/>',
	'route': '<circle cx="6" cy="19" r="3"/> <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/> <circle cx="18" cy="5" r="3"/>',
	'scroll-text': '<path d="M15 12h-5"/> <path d="M15 8h-5"/> <path d="M19 17V5a2 2 0 0 0-2-2H4"/> <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
	'server': '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/> <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/> <line x1="6" x2="6.01" y1="6" y2="6"/> <line x1="6" x2="6.01" y1="18" y2="18"/>',
	'settings': '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/> <circle cx="12" cy="12" r="3"/>',
	'shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
	'stethoscope': '<path d="M11 2v2"/> <path d="M5 2v2"/> <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/> <path d="M8 15a6 6 0 0 0 12 0v-3"/> <circle cx="20" cy="10" r="2"/>',
	'terminal': '<path d="M12 19h8"/> <path d="m4 17 6-6-6-6"/>',
	'cloud': '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
	'folder-open': '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
	'share-2': '<circle cx="18" cy="5" r="3"/> <circle cx="6" cy="12" r="3"/> <circle cx="18" cy="19" r="3"/> <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/> <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
	'chart-column': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/> <path d="M18 17V9"/> <path d="M13 17V5"/> <path d="M8 17v-3"/>',
	'shield-ban': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/> <path d="m4.243 5.21 14.39 12.472"/>',
	'timer': '<line x1="10" x2="14" y1="2" y2="2"/> <line x1="12" x2="15" y1="14" y2="11"/> <circle cx="12" cy="14" r="8"/>',
	'waypoints': '<path d="m10.586 5.414-5.172 5.172"/> <path d="m18.586 13.414-5.172 5.172"/> <path d="M6 12h12"/> <circle cx="12" cy="20" r="2"/> <circle cx="12" cy="4" r="2"/> <circle cx="20" cy="12" r="2"/> <circle cx="4" cy="12" r="2"/>',
	'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/> <path d="M3 5V19A9 3 0 0 0 21 19V5"/> <path d="M3 12A9 3 0 0 0 21 12"/>',
	'plug': '<path d="M12 22v-5"/> <path d="M15 8V2"/> <path d="M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z"/> <path d="M9 8V2"/>',
	'key': '<path d="m2 21 9.6-9.6"/> <path d="m7.5 15.5 2.3 2.3a1 1 0 0 1 0 1.4l-2.1 2.1a1 1 0 0 1-1.4 0L4 19"/> <circle cx="15.5" cy="7.5" r="5.5"/>',
	'square-terminal': '<path d="m7 11 2-2-2-2"/> <path d="M11 13h4"/> <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>',
	'blocks': '<path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/> <rect x="14" y="2" width="8" height="8" rx="1"/>',
	'list-checks': '<path d="M13 5h8"/> <path d="M13 12h8"/> <path d="M13 19h8"/> <path d="m3 17 2 2 4-4"/> <path d="m3 7 2 2 4-4"/>',
	'palette': '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/> <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/> <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/> <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/> <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
	'wifi': '<path d="M12 20h.01"/> <path d="M2 8.82a15 15 0 0 1 20 0"/> <path d="M5 12.859a10 10 0 0 1 14 0"/> <path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
	'download': '<path d="M12 15V3"/> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/> <path d="m7 10 5 5 5-5"/>',
	'monitor-play': '<path d="M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z"/> <path d="M12 17v4"/> <path d="M8 21h8"/> <rect x="2" y="3" width="20" height="14" rx="2"/>',
	'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/> <path d="m9 12 2 2 4-4"/>',
	'globe-lock': '<path d="M15.686 15A14.5 14.5 0 0 1 12 22a14.5 14.5 0 0 1 0-20 10 10 0 1 0 9.542 13"/> <path d="M2 12h8.5"/> <path d="M20 6V4a2 2 0 1 0-4 0v2"/> <rect width="8" height="5" x="14" y="6" rx="1"/>',
	'shuffle': '<path d="m18 14 4 4-4 4"/> <path d="m18 2 4 4-4 4"/> <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/> <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/> <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>',
	'heart-pulse': '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/> <path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
	'radio-tower': '<path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"/> <path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5"/> <circle cx="12" cy="9" r="2"/> <path d="M16.2 4.8c2 2 2.26 5.11.8 7.47"/> <path d="M19.1 1.9a9.96 9.96 0 0 1 0 14.1"/> <path d="M9.5 18h5"/> <path d="m8 22 4-11 4 11"/>',
	'shield-half': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/> <path d="M12 22V2"/>',
	'container': '<path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z"/> <path d="M10 21.9V14L2.1 9.1"/> <path d="m10 14 11.9-6.9"/> <path d="M14 19.8v-8.1"/> <path d="M18 17.5V9.4"/>',
};

/* LuCI path segment -> icon name. Keyed on the segment because that is the
 * URL and is stable; a title changes with the interface language and with
 * any package that renames its page. A segment that is not here gets the
 * dot, so a third-party package still lands in a row that lines up. */
const ICON_FOR = {
	overview: 'layout-dashboard',
	routes: 'route',
	firewall: 'shield',
	syslog: 'scroll-text',
	dmesg: 'terminal',
	processes: 'cpu',
	realtime: 'chart-line',
	channel_analysis: 'radar',
	system: 'settings',
	admin: 'key-round',
	packages: 'package',
	opkg: 'package',
	startup: 'power',
	crontab: 'clock',
	mounts: 'hard-drive',
	leds: 'lightbulb',
	flash: 'hard-drive-download',
	backup: 'archive',
	reboot: 'rotate-cw',
	attendedsysupgrade: 'circle-arrow-up',
	network: 'network',
	interfaces: 'network',
	wireless: 'wifi',
	dhcp: 'server',
	hosts: 'globe',
	dns: 'globe',
	diagnostics: 'stethoscope',
	switch: 'arrow-left-right',
	logout: 'log-out',
	status: 'gauge',
	/* 这几个是在设备上抓出来的真实路径段，不是猜的：LuCI 25.12 里防火墙状态页
	   叫 nftables、系统日志叫 logs、软件包管理叫 package-manager。 */
	nftables: 'list-checks',
	iptables: 'list-checks',
	logs: 'scroll-text',
	'package-manager': 'package',
	leases: 'server',
	wireless: 'wifi',
	bandwidth: 'chart-line',
	connections: 'arrow-left-right',
	load: 'chart-line',
	appearance: 'palette',

	/* 常见 luci-app 的落点。第三方包永远补不全,所以这张表只负责
	   把常用的那些点名,补不到的交给下面按分组兜底。 */
	ddns: 'cloud',
	samba4: 'folder-open',
	shares: 'folder-open',
	upnp: 'share-2',
	sqm: 'waypoints',
	qos: 'waypoints',
	graphs: 'chart-column',
	collectd: 'chart-column',
	statistics: 'chart-column',
	adblock: 'shield-ban',
	banip: 'shield-ban',
	nlbwmon: 'chart-column',
	vnstat: 'chart-column',
	wireguard: 'key',
	openvpn: 'key',
	mwan3: 'waypoints',
	smartdns: 'globe',
	ttyd: 'square-terminal',
	terminal: 'square-terminal',
	usb: 'plug',
	nfs: 'folder-open',
	minidlna: 'monitor-play',
	transmission: 'download',
	aria2: 'download',
	acme: 'badge-check',

	/* 代理与隧道。这一类在真实设备上是最常见的第三方包，落点写全了
	   才不会让侧边栏出现一排一模一样的兜底图标。 */
	openclash: 'shuffle',
	clash: 'shuffle',
	nikki: 'shuffle',
	mihomo: 'shuffle',
	v2raya: 'shuffle',
	v2ray: 'shuffle',
	xray: 'shuffle',
	passwall: 'shuffle',
	passwall2: 'shuffle',
	shadowsocksr: 'shuffle',
	ssr: 'shuffle',
	'ssr-plus': 'shuffle',
	shadowsocks: 'shuffle',
	singbox: 'shuffle',
	'sing-box': 'shuffle',
	homeproxy: 'shuffle',
	frpc: 'waypoints',
	frps: 'waypoints',
	cloudflared: 'cloud',
	zerotier: 'waypoints',
	tailscale: 'waypoints',
	easytier: 'waypoints',

	/* 其余在真实设备上会出现的落点。nlbw 是 nlbwmon 的实际路径段，
	   照包名写会漏。 */
	nlbw: 'chart-column',
	keepalived: 'heart-pulse',
	dawn: 'radio-tower',
	mosquitto: 'radio-tower',
	nextdns: 'globe-lock',
	smartdns: 'globe-lock',
	irqbalance: 'cpu',
	lxccm: 'container',
	lxc: 'container',
	dockerman: 'container',
	docker: 'container',
	filemanager: 'folder-open',
	openclash_ext: 'shuffle',
	watchcat: 'timer',
	ttl: 'timer',
	unbound: 'globe',
	dnscrypt: 'globe-lock',
	'https-dns-proxy': 'globe-lock',
	'dns-proxy': 'globe-lock',
	https_dns_proxy: 'globe-lock',
	commands: 'square-terminal',
	nut: 'plug',
	filemanager: 'folder-open',
	dockerman: 'blocks',
	docker: 'blocks',
};

/* Built through innerHTML rather than E(). LuCI's element factory calls
 * document.createElement, so an <svg> it creates is an HTML element with an
 * svg tag name, not an element in the SVG namespace — the browser parses it
 * and then draws nothing at all. Setting innerHTML runs the HTML parser,
 * which puts it in the right namespace. The markup is a constant from the
 * table above, never anything a request carried. */
/* When a page is not in the table above, the group it lives under still says
 * something — a third-party service package is a service, whatever it is
 * called. A row of identical dots says nothing at all, and with six packages
 * installed that is what the sidebar became. */
const ICON_FOR_GROUP = {
	status: 'gauge',
	system: 'settings',
	network: 'network',
	services: 'blocks',
	vpn: 'key',
	nas: 'database',
	storage: 'database',
};

function icon(segment, group) {
	const name = ICON_FOR[segment] ?? ICON_FOR_GROUP[group] ?? 'dot';
	const markup = LUCIDE[name] ?? LUCIDE.dot;
	const host = E('span', { 'class': 'ico-host', 'aria-hidden': 'true' });

	host.innerHTML = '<svg class="ico" viewBox="0 0 24 24" fill="none" ' +
		'stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">' +
		markup + '</svg>';

	return host;
}

return baseclass.extend({
	__init__() {
		ui.menu.load().then((tree) => this.render(tree));
		this.bindSidebarToggle();
	},

	render(tree) {
		this.renderModeMenu(tree);

		/* LuCI's own path shape: mode / category / page, and anything below
		 * that is a tab. The 3 is that fixed shape, not an arbitrary depth —
		 * the tab menu starts where the sidebar stops. */
		const TAB_DEPTH = 3;
		let node = tree;
		let url = '';

		if (L.env.dispatchpath.length >= TAB_DEPTH) {
			for (let i = 0; i < TAB_DEPTH && node; i++) {
				node = node.children[L.env.dispatchpath[i]];
				url = url + (url ? '/' : '') + L.env.dispatchpath[i];
			}

			if (node)
				this.renderTabMenu(node, url);
		}
	},

	/* aria-label carries the name when the rail hides the text. It is set
	 * unconditionally rather than only in the rail: the attribute changes
	 * nothing while the label is visible, and adding it on a media query would
	 * mean the accessible name of a link depended on the window width. */
	item(url, name, title, active, group) {
		const a = E('a', { 'class': 'nav-item', 'href': L.url(url, name),
			'aria-label': _(title)
		}, [
			icon(name, group),
			E('span', {}, [ _(title) ]),
		]);

		if (active) {
			a.setAttribute('data-active', '');
			a.setAttribute('aria-current', 'page');
		}

		return a;
	},

	renderMainMenu(tree, base) {
		const host = document.querySelector('#mainmenu');
		const groups = ui.menu.getChildren(tree);

		if (!host)
			return;

		groups.forEach((group) => {
			const children = ui.menu.getChildren(group);
			const isCurrentGroup = (L.env.dispatchpath[1] === group.name);

			/* A top-level entry with no children of its own is a page, not a
			 * group, so it renders as one item rather than as a heading with
			 * nothing under it. */
			if (children.length === 0) {
				host.appendChild(E('div', { 'class': 'nav-group' }, [
					this.item(base, group.name, group.title, isCurrentGroup, group.name),
				]));

				return;
			}

			const items = children.map((child) => this.item(
				base + '/' + group.name,
				child.name,
				child.title,
				isCurrentGroup && L.env.dispatchpath[2] === child.name,
				group.name
			));

			host.appendChild(E('div', { 'class': 'nav-group' }, [
				E('div', { 'class': 'nav-label' }, [ _(group.title) ]),
				...items,
			]));
		});
	},

	renderTabMenu(tree, url, level) {
		const container = document.querySelector('#tabmenu');
		const children = ui.menu.getChildren(tree);
		const depth = level || 0;

		if (!container || children.length === 0)
			return;

		const ul = E('ul', { 'class': 'tabs' });
		let activeNode = null;

		children.forEach((child) => {
			const isActive = (L.env.dispatchpath[3 + depth] === child.name);
			const a = E('a', { 'class': 'tab', 'href': L.url(url, child.name) }, [ _(child.title) ]);

			if (isActive) {
				a.setAttribute('data-active', '');
				a.setAttribute('aria-current', 'page');
				activeNode = child;
			}

			ul.appendChild(E('li', {}, a));
		});

		container.appendChild(ul);
		container.hidden = false;

		if (activeNode)
			this.renderTabMenu(activeNode, url + '/' + activeNode.name, depth + 1);
	},

	/* The mode row only earns its place when there is more than one mode,
	 * which on a stock install there is not. */
	renderModeMenu(tree) {
		const ul = document.querySelector('#modemenu');
		const children = ui.menu.getChildren(tree);

		if (!ul)
			return;

		children.forEach((child, index) => {
			const isActive = L.env.requestpath.length
				? child.name === L.env.requestpath[0]
				: index === 0;
			/* The text goes in a span so the rail can hide it the same way it
			 * hides every other label, and the accessible name is on the link
			 * so hiding it takes nothing away. A bare text node cannot be
			 * selected by CSS — that is recorded in findings.md — so without
			 * the wrapper this one menu would have stayed spelled out in a
			 * 60px rail. */
			const a = E('a', {
				'class': 'nav-item',
				'href': L.url(child.name),
				'aria-label': _(child.title)
			}, [ E('span', {}, [ _(child.title) ]) ]);

			if (isActive) {
				a.setAttribute('data-active', '');
				a.setAttribute('aria-current', 'true');
			}

			ul.appendChild(E('li', {}, a));

			if (isActive)
				this.renderMainMenu(child, child.name);
		});

		if (ul.children.length > 1)
			ul.hidden = false;
	},

	/* One button, two jobs, because it is the same question asked of two
	 * layouts: is the navigation showing? On a phone the answer is a drawer
	 * over the page and the button owns the state, which the stylesheet reads
	 * off aria-expanded. On a wide screen the sidebar never goes away — it
	 * collapses to a rail of icons — so the state belongs on the document
	 * instead, and it is remembered, because someone who narrowed the
	 * navigation to read a wide table wants it still narrow on the next page.
	 *
	 * Escape closes the drawer, because a drawer that can only be closed by
	 * hitting the same button again traps a keyboard user. It deliberately
	 * does not un-collapse the rail: the rail is not a mode anyone is stuck
	 * in, and Escape undoing a saved preference would be a surprise.
	 */
	bindSidebarToggle() {
		const btn = document.querySelector('#sidebar-toggle');

		if (!btn)
			return;

		const root = document.documentElement;
		const wide = window.matchMedia('(min-width: 48.0625rem)');
		const set = (open) => btn.setAttribute('aria-expanded', open ? 'true' : 'false');

		const setRail = (on) => {
			root.toggleAttribute('data-rail', on);
			set(!on);

			try { localStorage.setItem('graphite-rail', on ? '1' : '0'); }
			catch (e) { /* private window: the choice lasts this page only */ }
		};

		/* aria-expanded has to describe the layout the reader is actually
		 * looking at, and that changes under them when the window is resized. */
		const sync = () => {
			if (wide.matches)
				set(!root.hasAttribute('data-rail'));
			else
				set(false);
		};

		wide.addEventListener('change', sync);
		sync();

		btn.addEventListener('click', () => {
			if (wide.matches)
				setRail(!root.hasAttribute('data-rail'));
			else
				set(btn.getAttribute('aria-expanded') !== 'true');
		});

		document.addEventListener('keydown', (ev) => {
			if (ev.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
				set(false);
				btn.focus();
			}
		});

		document.querySelector('#sidebar')?.addEventListener('click', (ev) => {
			if (ev.target.closest('.nav-item'))
				set(false);
		});

		/* The scrim is a ::after on the body, which cannot receive a click, and
		 * it covers the toggle — so on a phone the drawer could be opened and
		 * then only closed with a keyboard. Anything outside the sidebar closes
		 * it; the toggle is excluded because its own handler already flips the
		 * state and would otherwise reopen what this just closed. */
		document.addEventListener('click', (ev) => {
			if (wide.matches || btn.getAttribute('aria-expanded') !== 'true')
				return;

			if (ev.target.closest('#sidebar') || ev.target.closest('#sidebar-toggle'))
				return;

			set(false);
		});
	}
});

'use strict';
'require baseclass';

/* The theme switch, on its own so both shells can use it: the admin pages get
 * it through menu-graphite.js, and the login page — which renders with
 * blank_page and therefore has no top bar and no menu module — gets it through
 * its own view.
 *
 * The head script in header.ut has already applied the stored choice before
 * the first stylesheet. This module only reflects the current state onto the
 * buttons and writes a new choice.
 *
 * Two layers, and the difference matters:
 *   - the device default, from which of the three media paths served the page.
 *     It is on the body as data-theme-default and an administrator sets it in
 *     System - Language and Interface.
 *   - this browser's override, in localStorage.
 * "Auto" means drop the override and fall back to the device default, which is
 * why it has to be one of the three choices rather than the absence of one.
 */
return baseclass.extend({
	__init__() {
		this.bind();
	},

	bind() {
		const group = document.querySelector('.theme-switch');

		if (!group)
			return;

		const root = document.documentElement;
		const opts = group.querySelectorAll('[role="radio"][value]');

		/* The choice is held here first and persisted second. A browser with
		   site data blocked throws on both read and write, and reading the
		   store back to decide what is checked meant the radio reported Auto
		   immediately after the reader picked Dark — the page was dark and the
		   control said otherwise. */
		let override = null;

		try {
			const v = localStorage.getItem('graphite-theme');

			if (v === 'auto' || v === 'light' || v === 'dark')
				override = v;
		}
		catch (e) { /* private window: this session keeps its choice in memory */ }

		const current = () => override || document.body.getAttribute('data-theme-default') || 'auto';

		/* The phone paints its chrome from these, and in auto mode there are
		   two because the answer depends on the device. An explicit choice
		   pins both; auto puts each back on its own side. */
		const bar = (mode) => {
			const l = document.getElementById('graphite-bar-light');
			const d = document.getElementById('graphite-bar-dark');

			if (!l || !d)
				return;

			if (mode === 'light' || mode === 'dark') {
				const c = (mode === 'dark') ? '#101010' : '#fbfbfb';

				l.setAttribute('content', c);
				d.setAttribute('content', c);
			}
			else {
				l.setAttribute('content', '#fbfbfb');
				d.setAttribute('content', '#101010');
			}
		};

		const reflect = () => {
			const now = current();

			opts.forEach((o) => o.setAttribute('aria-checked', String(o.value === now)));
		};

		opts.forEach((o) => {
			o.addEventListener('click', () => {
				override = o.value;

				try { localStorage.setItem('graphite-theme', o.value); }
				catch (e) { /* private window: the choice lasts this page only */ }

				if (o.value === 'auto') {
					const dflt = document.body.getAttribute('data-theme-default');

					if (dflt === 'light' || dflt === 'dark')
						root.setAttribute('data-theme', dflt);
					else
						root.removeAttribute('data-theme');

					bar(dflt === 'light' || dflt === 'dark' ? dflt : 'auto');
				}
				else {
					root.setAttribute('data-theme', o.value);
					bar(o.value);
				}

				reflect();
			});
		});

		reflect();
	},
});

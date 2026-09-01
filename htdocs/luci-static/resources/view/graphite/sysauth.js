'use strict';
'require ui';
'require view';
'require theme-graphite';

/* The login form is rendered by sysauth.ut and submits on its own. This view
 * adds the two things a server-rendered form cannot do for itself: put the
 * cursor where the reader will type, and say that a submit is in flight.
 *
 * It deliberately does not move the form into a modal the way the stock theme
 * does. The form is already the page here, and a form that only works once a
 * JavaScript module has resolved is a login page that can lock you out. */
return view.extend({
	render() {
		const form = document.querySelector('.login-panel form');
		const btn = form?.querySelector('button[type="submit"]');

		if (!form || !btn)
			return '';

		const password = form.querySelector('input[type="password"]');

		if (password && !password.value)
			password.focus();
		else
			form.querySelector('input[type="text"]')?.focus();

		/* Busy state goes on the element as an attribute, and the handler
		 * blocks itself. `disabled` would drop the button out of the tab
		 * order mid-operation, which loses focus for a screen-reader user
		 * at exactly the moment they are waiting for an answer.
		 *
		 * One submit per attempt, whatever the reader does: a double click,
		 * a held Enter and a slow network all have to end up as one request,
		 * or the second one races the session the first one just created. */
		form.addEventListener('submit', (ev) => {
			if (btn.getAttribute('aria-disabled') === 'true') {
				ev.preventDefault();
				return;
			}

			btn.setAttribute('aria-disabled', 'true');
			btn.textContent = _('Logging in…');
		});

		/* Enter while an input method is composing is confirming a candidate,
		 * not submitting the form. Without this a Chinese or Japanese reader
		 * submits half a password the first time they pick a character. */
		form.addEventListener('keydown', (ev) => {
			if (ev.key === 'Enter' && ev.isComposing)
				ev.preventDefault();
		});

		return '';
	},

	/* A login screen has no save/reset bar. */
	addFooter() {},
});

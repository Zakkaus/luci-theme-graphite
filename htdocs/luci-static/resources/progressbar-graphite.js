'use strict';
'require baseclass';

/* 进度条上的数字要在两种底色上都读得出：露出的轨道是浅色，填充是强调色。一份文字
 * 只能有一个颜色，因此这里补出第二份——这也是常见进度条的做法，把文字在标记里放两
 * 遍，一份铺在轨道上，另一份放进填充里被它自己的 overflow 裁掉，边界处逐字符换色。
 *
 * 为什么不用纯 CSS：LuCI 的标记是 <div class="cbi-progressbar" title="…"><div
 * style="width:…"></div></div>，那串数字只存在于外层的 title 上，而填充的宽度只存在
 * 于内层的行内样式里。CSS 的 attr() 取不到另一个元素的属性；把 title 写进注册过的自
 * 定义属性再传给子元素也不行——Chrome 151 能解析 attr(title type(<string>))，
 * CSS.supports 也返回 true，但它计算出来是空字符串。
 *
 * 宽度用容器查询单位取外层的宽度，所以两份文字落在同一个位置上，不必读行内样式。
 *
 * 这些条由 LuCI 轮询重绘：title 变、内层的 width 变，元素本身可能整个换掉。所以用
 * MutationObserver 跟着改，而不是只在载入时跑一遍。
 */
const CLASS = 'bar-ink';

function sync(bar) {
	const fill = bar.firstElementChild;

	if (!fill)
		return;

	let span = fill.querySelector('.' + CLASS);

	if (!span) {
		span = document.createElement('span');
		span.className = CLASS;
		span.setAttribute('aria-hidden', 'true');
		fill.appendChild(span);
	}

	const text = bar.getAttribute('title') ?? '';

	if (span.textContent !== text)
		span.textContent = text;
}

function syncAll(root) {
	(root instanceof Element ? [root] : [])
		.concat(Array.from((root.querySelectorAll?.('.cbi-progressbar')) ?? []))
		.forEach((el) => {
			if (el.classList?.contains('cbi-progressbar'))
				sync(el);
		});
}

return baseclass.extend({
	__init__() {
		/* 没设强调色就一份也不补。定位这一份的 CSS 挂在 :root[data-accent] 下，
		 * 不设强调色时那些规则不生效，补出来的 span 会变成填充里一段普通的内联
		 * 文字，数字因此出现两次——v0.4.2 就是这样发出去的。强调色由服务端写在
		 * 根元素上，一次判断即可。 */
		if (!document.documentElement.hasAttribute('data-accent'))
			return;

		syncAll(document);

		/* attributes: LuCI writes the new figure onto title. childList: a
		 * refreshed view replaces whole bars rather than editing them. */
		new MutationObserver((records) => {
			for (const r of records) {
				if (r.type === 'attributes' && r.target.classList.contains('cbi-progressbar'))
					sync(r.target);

				for (const node of r.addedNodes)
					if (node.nodeType === 1)
						syncAll(node);
			}
		}).observe(document.body, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: [ 'title' ],
		});
	}
});

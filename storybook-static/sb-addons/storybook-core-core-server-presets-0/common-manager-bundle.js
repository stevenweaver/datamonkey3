try {
	(() => {
		var T = __STORYBOOK_API__,
			{
				ActiveTabs: _,
				Consumer: O,
				ManagerContext: f,
				Provider: A,
				RequestResponseError: v,
				addons: n,
				combineParameters: P,
				controlOrMetaKey: k,
				controlOrMetaSymbol: x,
				eventMatchesShortcut: M,
				eventToShortcut: R,
				experimental_requestResponse: w,
				isMacLike: C,
				isShortcutTaken: G,
				keyToSymbol: I,
				merge: K,
				mockChannel: q,
				optionOrAltSymbol: B,
				shortcutMatchesShortcut: F,
				shortcutToHumanString: Y,
				types: j,
				useAddonState: E,
				useArgTypes: H,
				useArgs: L,
				useChannel: N,
				useGlobalTypes: z,
				useGlobals: D,
				useParameter: J,
				useSharedState: Q,
				useStoryPrepared: U,
				useStorybookApi: V,
				useStorybookState: W
			} = __STORYBOOK_API__;
		var c = (() => {
				let e;
				return (
					typeof window < 'u'
						? (e = window)
						: typeof globalThis < 'u'
							? (e = globalThis)
							: typeof window < 'u'
								? (e = window)
								: typeof self < 'u'
									? (e = self)
									: (e = {}),
					e
				);
			})(),
			S = 'tag-filters',
			d = 'static-filter';
		n.register(S, (e) => {
			let u = Object.entries(c.TAGS_OPTIONS ?? {}).reduce((t, r) => {
				let [o, i] = r;
				return i.excludeFromSidebar && (t[o] = !0), t;
			}, {});
			e.experimental_setFilter(d, (t) => {
				let r = t.tags ?? [];
				return (r.includes('dev') || t.type === 'docs') && r.filter((o) => u[o]).length === 0;
			});
		});
	})();
} catch (e) {
	console.error('[Storybook] One of your manager-entries failed: ' + import.meta.url, e);
}

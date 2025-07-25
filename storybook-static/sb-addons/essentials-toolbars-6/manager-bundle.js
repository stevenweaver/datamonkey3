try {
	(() => {
		var n = __REACT__,
			{
				Children: se,
				Component: ie,
				Fragment: ue,
				Profiler: ce,
				PureComponent: pe,
				StrictMode: me,
				Suspense: de,
				__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: be,
				cloneElement: Se,
				createContext: Te,
				createElement: ye,
				createFactory: _e,
				createRef: fe,
				forwardRef: Ce,
				isValidElement: ve,
				lazy: Ie,
				memo: Oe,
				startTransition: Ee,
				unstable_act: xe,
				useCallback: C,
				useContext: ge,
				useDebugValue: ke,
				useDeferredValue: he,
				useEffect: g,
				useId: Ae,
				useImperativeHandle: Re,
				useInsertionEffect: Le,
				useLayoutEffect: Be,
				useMemo: Pe,
				useReducer: Me,
				useRef: L,
				useState: B,
				useSyncExternalStore: Ne,
				useTransition: we,
				version: De
			} = __REACT__;
		var Ge = __STORYBOOK_API__,
			{
				ActiveTabs: Ke,
				Consumer: Ye,
				ManagerContext: $e,
				Provider: qe,
				RequestResponseError: ze,
				addons: k,
				combineParameters: Ue,
				controlOrMetaKey: je,
				controlOrMetaSymbol: Ze,
				eventMatchesShortcut: Je,
				eventToShortcut: Qe,
				experimental_requestResponse: Xe,
				isMacLike: et,
				isShortcutTaken: tt,
				keyToSymbol: ot,
				merge: rt,
				mockChannel: at,
				optionOrAltSymbol: nt,
				shortcutMatchesShortcut: lt,
				shortcutToHumanString: st,
				types: P,
				useAddonState: it,
				useArgTypes: ut,
				useArgs: ct,
				useChannel: pt,
				useGlobalTypes: M,
				useGlobals: h,
				useParameter: mt,
				useSharedState: dt,
				useStoryPrepared: bt,
				useStorybookApi: N,
				useStorybookState: St
			} = __STORYBOOK_API__;
		var Ct = __STORYBOOK_COMPONENTS__,
			{
				A: vt,
				ActionBar: It,
				AddonPanel: Ot,
				Badge: Et,
				Bar: xt,
				Blockquote: gt,
				Button: kt,
				ClipboardCode: ht,
				Code: At,
				DL: Rt,
				Div: Lt,
				DocumentWrapper: Bt,
				EmptyTabContent: Pt,
				ErrorFormatter: Mt,
				FlexBar: Nt,
				Form: wt,
				H1: Dt,
				H2: Vt,
				H3: Ht,
				H4: Wt,
				H5: Ft,
				H6: Gt,
				HR: Kt,
				IconButton: w,
				IconButtonSkeleton: Yt,
				Icons: A,
				Img: $t,
				LI: qt,
				Link: zt,
				ListItem: Ut,
				Loader: jt,
				Modal: Zt,
				OL: Jt,
				P: Qt,
				Placeholder: Xt,
				Pre: eo,
				ProgressSpinner: to,
				ResetWrapper: oo,
				ScrollArea: ro,
				Separator: D,
				Spaced: ao,
				Span: no,
				StorybookIcon: lo,
				StorybookLogo: so,
				Symbols: io,
				SyntaxHighlighter: uo,
				TT: co,
				TabBar: po,
				TabButton: mo,
				TabWrapper: bo,
				Table: So,
				Tabs: To,
				TabsState: yo,
				TooltipLinkList: V,
				TooltipMessage: _o,
				TooltipNote: fo,
				UL: Co,
				WithTooltip: H,
				WithTooltipPure: vo,
				Zoom: Io,
				codeCommon: Oo,
				components: Eo,
				createCopyToClipboardFunction: xo,
				getStoryHref: go,
				icons: ko,
				interleaveSeparators: ho,
				nameSpaceClassNames: Ao,
				resetComponents: Ro,
				withReset: Lo
			} = __STORYBOOK_COMPONENTS__;
		var K = { type: 'item', value: '' },
			Y = (o, t) => ({
				...t,
				name: t.name || o,
				description: t.description || o,
				toolbar: {
					...t.toolbar,
					items: t.toolbar.items.map((e) => {
						let r = typeof e == 'string' ? { value: e, title: e } : e;
						return (
							r.type === 'reset' &&
								t.toolbar.icon &&
								((r.icon = t.toolbar.icon), (r.hideIcon = !0)),
							{ ...K, ...r }
						);
					})
				}
			}),
			$ = ['reset'],
			q = (o) => o.filter((t) => !$.includes(t.type)).map((t) => t.value),
			S = 'addon-toolbars',
			z = async (o, t, e) => {
				e &&
					e.next &&
					(await o.setAddonShortcut(S, {
						label: e.next.label,
						defaultShortcut: e.next.keys,
						actionName: `${t}:next`,
						action: e.next.action
					})),
					e &&
						e.previous &&
						(await o.setAddonShortcut(S, {
							label: e.previous.label,
							defaultShortcut: e.previous.keys,
							actionName: `${t}:previous`,
							action: e.previous.action
						})),
					e &&
						e.reset &&
						(await o.setAddonShortcut(S, {
							label: e.reset.label,
							defaultShortcut: e.reset.keys,
							actionName: `${t}:reset`,
							action: e.reset.action
						}));
			},
			U = (o) => (t) => {
				let {
						id: e,
						toolbar: { items: r, shortcuts: a }
					} = t,
					c = N(),
					[T, i] = h(),
					l = L([]),
					u = T[e],
					v = C(() => {
						i({ [e]: '' });
					}, [i]),
					I = C(() => {
						let s = l.current,
							m = s.indexOf(u),
							d = m === s.length - 1 ? 0 : m + 1,
							p = l.current[d];
						i({ [e]: p });
					}, [l, u, i]),
					O = C(() => {
						let s = l.current,
							m = s.indexOf(u),
							d = m > -1 ? m : 0,
							p = d === 0 ? s.length - 1 : d - 1,
							b = l.current[p];
						i({ [e]: b });
					}, [l, u, i]);
				return (
					g(() => {
						a &&
							z(c, e, {
								next: { ...a.next, action: I },
								previous: { ...a.previous, action: O },
								reset: { ...a.reset, action: v }
							});
					}, [c, e, a, I, O, v]),
					g(() => {
						l.current = q(r);
					}, []),
					n.createElement(o, { cycleValues: l.current, ...t })
				);
			},
			W = ({ currentValue: o, items: t }) =>
				o != null && t.find((e) => e.value === o && e.type !== 'reset'),
			j = ({ currentValue: o, items: t }) => {
				let e = W({ currentValue: o, items: t });
				if (e) return e.icon;
			},
			Z = ({ currentValue: o, items: t }) => {
				let e = W({ currentValue: o, items: t });
				if (e) return e.title;
			},
			J = ({ active: o, disabled: t, title: e, icon: r, description: a, onClick: c }) =>
				n.createElement(
					w,
					{ active: o, title: a, disabled: t, onClick: t ? () => {} : c },
					r && n.createElement(A, { icon: r, __suppressDeprecationWarning: !0 }),
					e ? `\xA0${e}` : null
				),
			Q = ({
				right: o,
				title: t,
				value: e,
				icon: r,
				hideIcon: a,
				onClick: c,
				disabled: T,
				currentValue: i
			}) => {
				let l =
						r &&
						n.createElement(A, {
							style: { opacity: 1 },
							icon: r,
							__suppressDeprecationWarning: !0
						}),
					u = { id: e ?? '_reset', active: i === e, right: o, title: t, disabled: T, onClick: c };
				return r && !a && (u.icon = l), u;
			},
			X = U(
				({
					id: o,
					name: t,
					description: e,
					toolbar: { icon: r, items: a, title: c, preventDynamicIcon: T, dynamicTitle: i }
				}) => {
					let [l, u, v] = h(),
						[I, O] = B(!1),
						s = l[o],
						m = !!s,
						d = o in v,
						p = r,
						b = c;
					T || (p = j({ currentValue: s, items: a }) || p),
						i && (b = Z({ currentValue: s, items: a }) || b),
						!b && !p && console.warn(`Toolbar '${t}' has no title or icon`);
					let F = C(
						(x) => {
							u({ [o]: x });
						},
						[o, u]
					);
					return n.createElement(
						H,
						{
							placement: 'top',
							tooltip: ({ onHide: x }) => {
								let G = a
									.filter(({ type: E }) => {
										let R = !0;
										return E === 'reset' && !s && (R = !1), R;
									})
									.map((E) =>
										Q({
											...E,
											currentValue: s,
											disabled: d,
											onClick: () => {
												F(E.value), x();
											}
										})
									);
								return n.createElement(V, { links: G });
							},
							closeOnOutsideClick: !0,
							onVisibleChange: O
						},
						n.createElement(J, {
							active: I || m,
							disabled: d,
							description: e || '',
							icon: p,
							title: b || ''
						})
					);
				}
			),
			ee = () => {
				let o = M(),
					t = Object.keys(o).filter((e) => !!o[e].toolbar);
				return t.length
					? n.createElement(
							n.Fragment,
							null,
							n.createElement(D, null),
							t.map((e) => {
								let r = Y(e, o[e]);
								return n.createElement(X, { key: e, id: e, ...r });
							})
						)
					: null;
			};
		k.register(S, () =>
			k.add(S, {
				title: S,
				type: P.TOOL,
				match: ({ tabId: o }) => !o,
				render: () => n.createElement(ee, null)
			})
		);
	})();
} catch (e) {
	console.error('[Storybook] One of your manager-entries failed: ' + import.meta.url, e);
}

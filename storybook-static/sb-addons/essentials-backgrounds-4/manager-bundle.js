try {
	(() => {
		var re = Object.create;
		var Y = Object.defineProperty;
		var ie = Object.getOwnPropertyDescriptor;
		var ae = Object.getOwnPropertyNames;
		var ce = Object.getPrototypeOf,
			le = Object.prototype.hasOwnProperty;
		var E = ((e) =>
			typeof require < 'u'
				? require
				: typeof Proxy < 'u'
					? new Proxy(e, { get: (o, c) => (typeof require < 'u' ? require : o)[c] })
					: e)(function (e) {
			if (typeof require < 'u') return require.apply(this, arguments);
			throw Error('Dynamic require of "' + e + '" is not supported');
		});
		var M = (e, o) => () => (e && (o = e((e = 0))), o);
		var se = (e, o) => () => (o || e((o = { exports: {} }).exports, o), o.exports);
		var ue = (e, o, c, r) => {
			if ((o && typeof o == 'object') || typeof o == 'function')
				for (let i of ae(o))
					!le.call(e, i) &&
						i !== c &&
						Y(e, i, { get: () => o[i], enumerable: !(r = ie(o, i)) || r.enumerable });
			return e;
		};
		var Ie = (e, o, c) => (
			(c = e != null ? re(ce(e)) : {}),
			ue(o || !e || !e.__esModule ? Y(c, 'default', { value: e, enumerable: !0 }) : c, e)
		);
		var p = M(() => {});
		var h = M(() => {});
		var f = M(() => {});
		var X = se((Q, V) => {
			p();
			h();
			f();
			(function (e) {
				if (typeof Q == 'object' && typeof V < 'u') V.exports = e();
				else if (typeof define == 'function' && define.amd) define([], e);
				else {
					var o;
					typeof window < 'u' || typeof window < 'u'
						? (o = window)
						: typeof self < 'u'
							? (o = self)
							: (o = this),
						(o.memoizerific = e());
				}
			})(function () {
				var e, o, c;
				return (function r(i, d, l) {
					function t(a, I) {
						if (!d[a]) {
							if (!i[a]) {
								var s = typeof E == 'function' && E;
								if (!I && s) return s(a, !0);
								if (n) return n(a, !0);
								var C = new Error("Cannot find module '" + a + "'");
								throw ((C.code = 'MODULE_NOT_FOUND'), C);
							}
							var m = (d[a] = { exports: {} });
							i[a][0].call(
								m.exports,
								function (b) {
									var S = i[a][1][b];
									return t(S || b);
								},
								m,
								m.exports,
								r,
								i,
								d,
								l
							);
						}
						return d[a].exports;
					}
					for (var n = typeof E == 'function' && E, u = 0; u < l.length; u++) t(l[u]);
					return t;
				})(
					{
						1: [
							function (r, i, d) {
								i.exports = function (l) {
									if (typeof Map != 'function' || l) {
										var t = r('./similar');
										return new t();
									} else return new Map();
								};
							},
							{ './similar': 2 }
						],
						2: [
							function (r, i, d) {
								function l() {
									return (this.list = []), (this.lastItem = void 0), (this.size = 0), this;
								}
								(l.prototype.get = function (t) {
									var n;
									if (this.lastItem && this.isEqual(this.lastItem.key, t)) return this.lastItem.val;
									if (((n = this.indexOf(t)), n >= 0))
										return (this.lastItem = this.list[n]), this.list[n].val;
								}),
									(l.prototype.set = function (t, n) {
										var u;
										return this.lastItem && this.isEqual(this.lastItem.key, t)
											? ((this.lastItem.val = n), this)
											: ((u = this.indexOf(t)),
												u >= 0
													? ((this.lastItem = this.list[u]), (this.list[u].val = n), this)
													: ((this.lastItem = { key: t, val: n }),
														this.list.push(this.lastItem),
														this.size++,
														this));
									}),
									(l.prototype.delete = function (t) {
										var n;
										if (
											(this.lastItem &&
												this.isEqual(this.lastItem.key, t) &&
												(this.lastItem = void 0),
											(n = this.indexOf(t)),
											n >= 0)
										)
											return this.size--, this.list.splice(n, 1)[0];
									}),
									(l.prototype.has = function (t) {
										var n;
										return this.lastItem && this.isEqual(this.lastItem.key, t)
											? !0
											: ((n = this.indexOf(t)), n >= 0 ? ((this.lastItem = this.list[n]), !0) : !1);
									}),
									(l.prototype.forEach = function (t, n) {
										var u;
										for (u = 0; u < this.size; u++)
											t.call(n || this, this.list[u].val, this.list[u].key, this);
									}),
									(l.prototype.indexOf = function (t) {
										var n;
										for (n = 0; n < this.size; n++) if (this.isEqual(this.list[n].key, t)) return n;
										return -1;
									}),
									(l.prototype.isEqual = function (t, n) {
										return t === n || (t !== t && n !== n);
									}),
									(i.exports = l);
							},
							{}
						],
						3: [
							function (r, i, d) {
								var l = r('map-or-similar');
								i.exports = function (a) {
									var I = new l(!1),
										s = [];
									return function (C) {
										var m = function () {
											var b = I,
												S,
												R,
												_ = arguments.length - 1,
												x = Array(_ + 1),
												O = !0,
												A;
											if ((m.numArgs || m.numArgs === 0) && m.numArgs !== _ + 1)
												throw new Error(
													'Memoizerific functions should always be called with the same number of arguments'
												);
											for (A = 0; A < _; A++) {
												if (((x[A] = { cacheItem: b, arg: arguments[A] }), b.has(arguments[A]))) {
													b = b.get(arguments[A]);
													continue;
												}
												(O = !1), (S = new l(!1)), b.set(arguments[A], S), (b = S);
											}
											return (
												O && (b.has(arguments[_]) ? (R = b.get(arguments[_])) : (O = !1)),
												O || ((R = C.apply(null, arguments)), b.set(arguments[_], R)),
												a > 0 &&
													((x[_] = { cacheItem: b, arg: arguments[_] }),
													O ? t(s, x) : s.push(x),
													s.length > a && n(s.shift())),
												(m.wasMemoized = O),
												(m.numArgs = _ + 1),
												R
											);
										};
										return (m.limit = a), (m.wasMemoized = !1), (m.cache = I), (m.lru = s), m;
									};
								};
								function t(a, I) {
									var s = a.length,
										C = I.length,
										m,
										b,
										S;
									for (b = 0; b < s; b++) {
										for (m = !0, S = 0; S < C; S++)
											if (!u(a[b][S].arg, I[S].arg)) {
												m = !1;
												break;
											}
										if (m) break;
									}
									a.push(a.splice(b, 1)[0]);
								}
								function n(a) {
									var I = a.length,
										s = a[I - 1],
										C,
										m;
									for (
										s.cacheItem.delete(s.arg), m = I - 2;
										m >= 0 && ((s = a[m]), (C = s.cacheItem.get(s.arg)), !C || !C.size);
										m--
									)
										s.cacheItem.delete(s.arg);
								}
								function u(a, I) {
									return a === I || (a !== a && I !== I);
								}
							},
							{ 'map-or-similar': 1 }
						]
					},
					{},
					[3]
				)(3);
			});
		});
		p();
		h();
		f();
		p();
		h();
		f();
		p();
		h();
		f();
		p();
		h();
		f();
		var g = __REACT__,
			{
				Children: Ee,
				Component: we,
				Fragment: D,
				Profiler: Be,
				PureComponent: Re,
				StrictMode: xe,
				Suspense: Le,
				__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: Pe,
				cloneElement: Me,
				createContext: De,
				createElement: Ge,
				createFactory: Fe,
				createRef: Ne,
				forwardRef: Ue,
				isValidElement: He,
				lazy: qe,
				memo: w,
				startTransition: ze,
				unstable_act: Ke,
				useCallback: G,
				useContext: Ve,
				useDebugValue: We,
				useDeferredValue: Ye,
				useEffect: je,
				useId: $e,
				useImperativeHandle: Ze,
				useInsertionEffect: Je,
				useLayoutEffect: Qe,
				useMemo: j,
				useReducer: Xe,
				useRef: eo,
				useState: F,
				useSyncExternalStore: oo,
				useTransition: no,
				version: to
			} = __REACT__;
		p();
		h();
		f();
		var lo = __STORYBOOK_API__,
			{
				ActiveTabs: so,
				Consumer: uo,
				ManagerContext: Io,
				Provider: mo,
				RequestResponseError: po,
				addons: N,
				combineParameters: ho,
				controlOrMetaKey: fo,
				controlOrMetaSymbol: go,
				eventMatchesShortcut: bo,
				eventToShortcut: Co,
				experimental_requestResponse: So,
				isMacLike: yo,
				isShortcutTaken: ko,
				keyToSymbol: vo,
				merge: To,
				mockChannel: _o,
				optionOrAltSymbol: Ao,
				shortcutMatchesShortcut: Oo,
				shortcutToHumanString: Eo,
				types: $,
				useAddonState: wo,
				useArgTypes: Bo,
				useArgs: Ro,
				useChannel: xo,
				useGlobalTypes: Lo,
				useGlobals: L,
				useParameter: P,
				useSharedState: Po,
				useStoryPrepared: Mo,
				useStorybookApi: Do,
				useStorybookState: Go
			} = __STORYBOOK_API__;
		p();
		h();
		f();
		var qo = __STORYBOOK_COMPONENTS__,
			{
				A: zo,
				ActionBar: Ko,
				AddonPanel: Vo,
				Badge: Wo,
				Bar: Yo,
				Blockquote: jo,
				Button: $o,
				ClipboardCode: Zo,
				Code: Jo,
				DL: Qo,
				Div: Xo,
				DocumentWrapper: en,
				EmptyTabContent: on,
				ErrorFormatter: nn,
				FlexBar: tn,
				Form: rn,
				H1: an,
				H2: cn,
				H3: ln,
				H4: sn,
				H5: un,
				H6: In,
				HR: dn,
				IconButton: B,
				IconButtonSkeleton: mn,
				Icons: pn,
				Img: hn,
				LI: fn,
				Link: gn,
				ListItem: bn,
				Loader: Cn,
				Modal: Sn,
				OL: yn,
				P: kn,
				Placeholder: vn,
				Pre: Tn,
				ProgressSpinner: _n,
				ResetWrapper: An,
				ScrollArea: On,
				Separator: En,
				Spaced: wn,
				Span: Bn,
				StorybookIcon: Rn,
				StorybookLogo: xn,
				Symbols: Ln,
				SyntaxHighlighter: Pn,
				TT: Mn,
				TabBar: Dn,
				TabButton: Gn,
				TabWrapper: Fn,
				Table: Nn,
				Tabs: Un,
				TabsState: Hn,
				TooltipLinkList: U,
				TooltipMessage: qn,
				TooltipNote: zn,
				UL: Kn,
				WithTooltip: H,
				WithTooltipPure: Vn,
				Zoom: Wn,
				codeCommon: Yn,
				components: jn,
				createCopyToClipboardFunction: $n,
				getStoryHref: Zn,
				icons: Jn,
				interleaveSeparators: Qn,
				nameSpaceClassNames: Xn,
				resetComponents: et,
				withReset: ot
			} = __STORYBOOK_COMPONENTS__;
		p();
		h();
		f();
		var at = __STORYBOOK_ICONS__,
			{
				AccessibilityAltIcon: ct,
				AccessibilityIcon: lt,
				AddIcon: st,
				AdminIcon: ut,
				AlertAltIcon: It,
				AlertIcon: dt,
				AlignLeftIcon: mt,
				AlignRightIcon: pt,
				AppleIcon: ht,
				ArrowBottomLeftIcon: ft,
				ArrowBottomRightIcon: gt,
				ArrowDownIcon: bt,
				ArrowLeftIcon: Ct,
				ArrowRightIcon: St,
				ArrowSolidDownIcon: yt,
				ArrowSolidLeftIcon: kt,
				ArrowSolidRightIcon: vt,
				ArrowSolidUpIcon: Tt,
				ArrowTopLeftIcon: _t,
				ArrowTopRightIcon: At,
				ArrowUpIcon: Ot,
				AzureDevOpsIcon: Et,
				BackIcon: wt,
				BasketIcon: Bt,
				BatchAcceptIcon: Rt,
				BatchDenyIcon: xt,
				BeakerIcon: Lt,
				BellIcon: Pt,
				BitbucketIcon: Mt,
				BoldIcon: Dt,
				BookIcon: Gt,
				BookmarkHollowIcon: Ft,
				BookmarkIcon: Nt,
				BottomBarIcon: Ut,
				BottomBarToggleIcon: Ht,
				BoxIcon: qt,
				BranchIcon: zt,
				BrowserIcon: Kt,
				ButtonIcon: Vt,
				CPUIcon: Wt,
				CalendarIcon: Yt,
				CameraIcon: jt,
				CategoryIcon: $t,
				CertificateIcon: Zt,
				ChangedIcon: Jt,
				ChatIcon: Qt,
				CheckIcon: Xt,
				ChevronDownIcon: er,
				ChevronLeftIcon: or,
				ChevronRightIcon: nr,
				ChevronSmallDownIcon: tr,
				ChevronSmallLeftIcon: rr,
				ChevronSmallRightIcon: ir,
				ChevronSmallUpIcon: ar,
				ChevronUpIcon: cr,
				ChromaticIcon: lr,
				ChromeIcon: sr,
				CircleHollowIcon: ur,
				CircleIcon: Z,
				ClearIcon: Ir,
				CloseAltIcon: dr,
				CloseIcon: mr,
				CloudHollowIcon: pr,
				CloudIcon: hr,
				CogIcon: fr,
				CollapseIcon: gr,
				CommandIcon: br,
				CommentAddIcon: Cr,
				CommentIcon: Sr,
				CommentsIcon: yr,
				CommitIcon: kr,
				CompassIcon: vr,
				ComponentDrivenIcon: Tr,
				ComponentIcon: _r,
				ContrastIcon: Ar,
				ControlsIcon: Or,
				CopyIcon: Er,
				CreditIcon: wr,
				CrossIcon: Br,
				DashboardIcon: Rr,
				DatabaseIcon: xr,
				DeleteIcon: Lr,
				DiamondIcon: Pr,
				DirectionIcon: Mr,
				DiscordIcon: Dr,
				DocChartIcon: Gr,
				DocListIcon: Fr,
				DocumentIcon: Nr,
				DownloadIcon: Ur,
				DragIcon: Hr,
				EditIcon: qr,
				EllipsisIcon: zr,
				EmailIcon: Kr,
				ExpandAltIcon: Vr,
				ExpandIcon: Wr,
				EyeCloseIcon: Yr,
				EyeIcon: jr,
				FaceHappyIcon: $r,
				FaceNeutralIcon: Zr,
				FaceSadIcon: Jr,
				FacebookIcon: Qr,
				FailedIcon: Xr,
				FastForwardIcon: ei,
				FigmaIcon: oi,
				FilterIcon: ni,
				FlagIcon: ti,
				FolderIcon: ri,
				FormIcon: ii,
				GDriveIcon: ai,
				GithubIcon: ci,
				GitlabIcon: li,
				GlobeIcon: si,
				GoogleIcon: ui,
				GraphBarIcon: Ii,
				GraphLineIcon: di,
				GraphqlIcon: mi,
				GridAltIcon: pi,
				GridIcon: q,
				GrowIcon: hi,
				HeartHollowIcon: fi,
				HeartIcon: gi,
				HomeIcon: bi,
				HourglassIcon: Ci,
				InfoIcon: Si,
				ItalicIcon: yi,
				JumpToIcon: ki,
				KeyIcon: vi,
				LightningIcon: Ti,
				LightningOffIcon: _i,
				LinkBrokenIcon: Ai,
				LinkIcon: Oi,
				LinkedinIcon: Ei,
				LinuxIcon: wi,
				ListOrderedIcon: Bi,
				ListUnorderedIcon: Ri,
				LocationIcon: xi,
				LockIcon: Li,
				MarkdownIcon: Pi,
				MarkupIcon: Mi,
				MediumIcon: Di,
				MemoryIcon: Gi,
				MenuIcon: Fi,
				MergeIcon: Ni,
				MirrorIcon: Ui,
				MobileIcon: Hi,
				MoonIcon: qi,
				NutIcon: zi,
				OutboxIcon: Ki,
				OutlineIcon: Vi,
				PaintBrushIcon: Wi,
				PaperClipIcon: Yi,
				ParagraphIcon: ji,
				PassedIcon: $i,
				PhoneIcon: Zi,
				PhotoDragIcon: Ji,
				PhotoIcon: z,
				PinAltIcon: Qi,
				PinIcon: Xi,
				PlayAllHollowIcon: ea,
				PlayBackIcon: oa,
				PlayHollowIcon: na,
				PlayIcon: ta,
				PlayNextIcon: ra,
				PlusIcon: ia,
				PointerDefaultIcon: aa,
				PointerHandIcon: ca,
				PowerIcon: la,
				PrintIcon: sa,
				ProceedIcon: ua,
				ProfileIcon: Ia,
				PullRequestIcon: da,
				QuestionIcon: ma,
				RSSIcon: pa,
				RedirectIcon: ha,
				ReduxIcon: fa,
				RefreshIcon: J,
				ReplyIcon: ga,
				RepoIcon: ba,
				RequestChangeIcon: Ca,
				RewindIcon: Sa,
				RulerIcon: ya,
				SaveIcon: ka,
				SearchIcon: va,
				ShareAltIcon: Ta,
				ShareIcon: _a,
				ShieldIcon: Aa,
				SideBySideIcon: Oa,
				SidebarAltIcon: Ea,
				SidebarAltToggleIcon: wa,
				SidebarIcon: Ba,
				SidebarToggleIcon: Ra,
				SpeakerIcon: xa,
				StackedIcon: La,
				StarHollowIcon: Pa,
				StarIcon: Ma,
				StatusFailIcon: Da,
				StatusPassIcon: Ga,
				StatusWarnIcon: Fa,
				StickerIcon: Na,
				StopAltHollowIcon: Ua,
				StopAltIcon: Ha,
				StopIcon: qa,
				StorybookIcon: za,
				StructureIcon: Ka,
				SubtractIcon: Va,
				SunIcon: Wa,
				SupportIcon: Ya,
				SwitchAltIcon: ja,
				SyncIcon: $a,
				TabletIcon: Za,
				ThumbsUpIcon: Ja,
				TimeIcon: Qa,
				TimerIcon: Xa,
				TransferIcon: ec,
				TrashIcon: oc,
				TwitterIcon: nc,
				TypeIcon: tc,
				UbuntuIcon: rc,
				UndoIcon: ic,
				UnfoldIcon: ac,
				UnlockIcon: cc,
				UnpinIcon: lc,
				UploadIcon: sc,
				UserAddIcon: uc,
				UserAltIcon: Ic,
				UserIcon: dc,
				UsersIcon: mc,
				VSCodeIcon: pc,
				VerifiedIcon: hc,
				VideoIcon: fc,
				WandIcon: gc,
				WatchIcon: bc,
				WindowsIcon: Cc,
				WrenchIcon: Sc,
				XIcon: yc,
				YoutubeIcon: kc,
				ZoomIcon: vc,
				ZoomOutIcon: Tc,
				ZoomResetIcon: _c,
				iconList: Ac
			} = __STORYBOOK_ICONS__;
		p();
		h();
		f();
		var Rc = __STORYBOOK_CLIENT_LOGGER__,
			{ deprecate: xc, logger: K, once: Lc, pretty: Pc } = __STORYBOOK_CLIENT_LOGGER__;
		var W = Ie(X());
		p();
		h();
		f();
		var zc = __STORYBOOK_THEMING__,
			{
				CacheProvider: Kc,
				ClassNames: Vc,
				Global: Wc,
				ThemeProvider: Yc,
				background: jc,
				color: $c,
				convert: Zc,
				create: Jc,
				createCache: Qc,
				createGlobal: Xc,
				createReset: el,
				css: ol,
				darken: nl,
				ensure: tl,
				ignoreSsrWarning: rl,
				isPropValid: il,
				jsx: al,
				keyframes: cl,
				lighten: ll,
				styled: ee,
				themes: sl,
				typography: ul,
				useTheme: Il,
				withTheme: dl
			} = __STORYBOOK_THEMING__;
		p();
		h();
		f();
		function oe(e) {
			for (var o = [], c = 1; c < arguments.length; c++) o[c - 1] = arguments[c];
			var r = Array.from(typeof e == 'string' ? [e] : e);
			r[r.length - 1] = r[r.length - 1].replace(/\r?\n([\t ]*)$/, '');
			var i = r.reduce(function (t, n) {
				var u = n.match(/\n([\t ]+|(?!\s).)/g);
				return u
					? t.concat(
							u.map(function (a) {
								var I, s;
								return (s =
									(I = a.match(/[\t ]/g)) === null || I === void 0 ? void 0 : I.length) !== null &&
									s !== void 0
									? s
									: 0;
							})
						)
					: t;
			}, []);
			if (i.length) {
				var d = new RegExp(
					`
[	 ]{` +
						Math.min.apply(Math, i) +
						'}',
					'g'
				);
				r = r.map(function (t) {
					return t.replace(
						d,
						`
`
					);
				});
			}
			r[0] = r[0].replace(/^\r?\n/, '');
			var l = r[0];
			return (
				o.forEach(function (t, n) {
					var u = l.match(/(?:^|\n)( *)$/),
						a = u ? u[1] : '',
						I = t;
					typeof t == 'string' &&
						t.includes(`
`) &&
						(I = String(t)
							.split(
								`
`
							)
							.map(function (s, C) {
								return C === 0 ? s : '' + a + s;
							}).join(`
`)),
						(l += I + r[n + 1]);
				}),
				l
			);
		}
		var ne = 'storybook/background',
			y = 'backgrounds',
			de = { light: { name: 'light', value: '#F8F8F8' }, dark: { name: 'dark', value: '#333' } },
			me = w(function () {
				let e = P(y),
					[o, c, r] = L(),
					[i, d] = F(!1),
					{ options: l = de, disable: t = !0 } = e || {};
				if (t) return null;
				let n = o[y] || {},
					u = n.value,
					a = n.grid || !1,
					I = l[u],
					s = !!r?.[y],
					C = Object.keys(l).length;
				return g.createElement(pe, {
					length: C,
					backgroundMap: l,
					item: I,
					updateGlobals: c,
					backgroundName: u,
					setIsTooltipVisible: d,
					isLocked: s,
					isGridActive: a,
					isTooltipVisible: i
				});
			}),
			pe = w(function (e) {
				let {
						item: o,
						length: c,
						updateGlobals: r,
						setIsTooltipVisible: i,
						backgroundMap: d,
						backgroundName: l,
						isLocked: t,
						isGridActive: n,
						isTooltipVisible: u
					} = e,
					a = G(
						(I) => {
							r({ [y]: I });
						},
						[r]
					);
				return g.createElement(
					D,
					null,
					g.createElement(
						B,
						{
							key: 'grid',
							active: n,
							disabled: t,
							title: 'Apply a grid to the preview',
							onClick: () => a({ value: l, grid: !n })
						},
						g.createElement(q, null)
					),
					c > 0
						? g.createElement(
								H,
								{
									key: 'background',
									placement: 'top',
									closeOnOutsideClick: !0,
									tooltip: ({ onHide: I }) =>
										g.createElement(U, {
											links: [
												...(o
													? [
															{
																id: 'reset',
																title: 'Reset background',
																icon: g.createElement(J, null),
																onClick: () => {
																	a({ value: void 0, grid: n }), I();
																}
															}
														]
													: []),
												...Object.entries(d).map(([s, C]) => ({
													id: s,
													title: C.name,
													icon: g.createElement(Z, { color: C?.value || 'grey' }),
													active: s === l,
													onClick: () => {
														a({ value: s, grid: n }), I();
													}
												}))
											].flat()
										}),
									onVisibleChange: i
								},
								g.createElement(
									B,
									{
										disabled: t,
										key: 'background',
										title: 'Change the background of the preview',
										active: !!o || u
									},
									g.createElement(z, null)
								)
							)
						: null
				);
			}),
			he = ee.span(
				({ background: e }) => ({
					borderRadius: '1rem',
					display: 'block',
					height: '1rem',
					width: '1rem',
					background: e
				}),
				({ theme: e }) => ({ boxShadow: `${e.appBorderColor} 0 0 0 1px inset` })
			),
			fe = (e, o = [], c) => {
				if (e === 'transparent') return 'transparent';
				if (o.find((i) => i.value === e) || e) return e;
				let r = o.find((i) => i.name === c);
				if (r) return r.value;
				if (c) {
					let i = o.map((d) => d.name).join(', ');
					K.warn(oe`
        Backgrounds Addon: could not find the default color "${c}".
        These are the available colors for your story based on your configuration:
        ${i}.
      `);
				}
				return 'transparent';
			},
			te = (0, W.default)(1e3)((e, o, c, r, i, d) => ({
				id: e || o,
				title: o,
				onClick: () => {
					i({ selected: c, name: o });
				},
				value: c,
				right: r ? g.createElement(he, { background: c }) : void 0,
				active: d
			})),
			ge = (0, W.default)(10)((e, o, c) => {
				let r = e.map(({ name: i, value: d }) => te(null, i, d, !0, c, d === o));
				return o !== 'transparent'
					? [te('reset', 'Clear background', 'transparent', null, c, !1), ...r]
					: r;
			}),
			be = { default: null, disable: !0, values: [] },
			Ce = w(function () {
				let e = P(y, be),
					[o, c] = F(!1),
					[r, i] = L(),
					d = r[y]?.value,
					l = j(() => fe(d, e.values, e.default), [e, d]);
				Array.isArray(e) &&
					K.warn(
						'Addon Backgrounds api has changed in Storybook 6.0. Please refer to the migration guide: https://github.com/storybookjs/storybook/blob/next/MIGRATION.md'
					);
				let t = G(
					(n) => {
						i({ [y]: { ...r[y], value: n } });
					},
					[e, r, i]
				);
				return e.disable
					? null
					: g.createElement(
							H,
							{
								placement: 'top',
								closeOnOutsideClick: !0,
								tooltip: ({ onHide: n }) =>
									g.createElement(U, {
										links: ge(e.values, l, ({ selected: u }) => {
											l !== u && t(u), n();
										})
									}),
								onVisibleChange: c
							},
							g.createElement(
								B,
								{
									key: 'background',
									title: 'Change the background of the preview',
									active: l !== 'transparent' || o
								},
								g.createElement(z, null)
							)
						);
			}),
			Se = w(function () {
				let [e, o] = L(),
					{ grid: c } = P(y, { grid: { disable: !1 } });
				if (c?.disable) return null;
				let r = e[y]?.grid || !1;
				return g.createElement(
					B,
					{
						key: 'background',
						active: r,
						title: 'Apply a grid to the preview',
						onClick: () => o({ [y]: { ...e[y], grid: !r } })
					},
					g.createElement(q, null)
				);
			});
		N.register(ne, () => {
			N.add(ne, {
				title: 'Backgrounds',
				type: $.TOOL,
				match: ({ viewMode: e, tabId: o }) => !!(e && e.match(/^(story|docs)$/)) && !o,
				render: () =>
					FEATURES?.backgroundsStoryGlobals
						? g.createElement(me, null)
						: g.createElement(D, null, g.createElement(Ce, null), g.createElement(Se, null))
			});
		});
	})();
} catch (e) {
	console.error('[Storybook] One of your manager-entries failed: ' + import.meta.url, e);
}

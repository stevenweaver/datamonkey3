try {
	(() => {
		var he = Object.create;
		var J = Object.defineProperty;
		var me = Object.getOwnPropertyDescriptor;
		var fe = Object.getOwnPropertyNames;
		var ge = Object.getPrototypeOf,
			we = Object.prototype.hasOwnProperty;
		var O = ((e) =>
			typeof require < 'u'
				? require
				: typeof Proxy < 'u'
					? new Proxy(e, { get: (t, a) => (typeof require < 'u' ? require : t)[a] })
					: e)(function (e) {
			if (typeof require < 'u') return require.apply(this, arguments);
			throw Error('Dynamic require of "' + e + '" is not supported');
		});
		var H = (e, t) => () => (e && (t = e((e = 0))), t);
		var be = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
		var ye = (e, t, a, s) => {
			if ((t && typeof t == 'object') || typeof t == 'function')
				for (let c of fe(t))
					!we.call(e, c) &&
						c !== a &&
						J(e, c, { get: () => t[c], enumerable: !(s = me(t, c)) || s.enumerable });
			return e;
		};
		var Se = (e, t, a) => (
			(a = e != null ? he(ge(e)) : {}),
			ye(t || !e || !e.__esModule ? J(a, 'default', { value: e, enumerable: !0 }) : a, e)
		);
		var f = H(() => {});
		var g = H(() => {});
		var w = H(() => {});
		var le = be((ce, Z) => {
			f();
			g();
			w();
			(function (e) {
				if (typeof ce == 'object' && typeof Z < 'u') Z.exports = e();
				else if (typeof define == 'function' && define.amd) define([], e);
				else {
					var t;
					typeof window < 'u' || typeof window < 'u'
						? (t = window)
						: typeof self < 'u'
							? (t = self)
							: (t = this),
						(t.memoizerific = e());
				}
			})(function () {
				var e, t, a;
				return (function s(c, b, p) {
					function o(n, d) {
						if (!b[n]) {
							if (!c[n]) {
								var r = typeof O == 'function' && O;
								if (!d && r) return r(n, !0);
								if (i) return i(n, !0);
								var u = new Error("Cannot find module '" + n + "'");
								throw ((u.code = 'MODULE_NOT_FOUND'), u);
							}
							var I = (b[n] = { exports: {} });
							c[n][0].call(
								I.exports,
								function (m) {
									var y = c[n][1][m];
									return o(y || m);
								},
								I,
								I.exports,
								s,
								c,
								b,
								p
							);
						}
						return b[n].exports;
					}
					for (var i = typeof O == 'function' && O, h = 0; h < p.length; h++) o(p[h]);
					return o;
				})(
					{
						1: [
							function (s, c, b) {
								c.exports = function (p) {
									if (typeof Map != 'function' || p) {
										var o = s('./similar');
										return new o();
									} else return new Map();
								};
							},
							{ './similar': 2 }
						],
						2: [
							function (s, c, b) {
								function p() {
									return (this.list = []), (this.lastItem = void 0), (this.size = 0), this;
								}
								(p.prototype.get = function (o) {
									var i;
									if (this.lastItem && this.isEqual(this.lastItem.key, o)) return this.lastItem.val;
									if (((i = this.indexOf(o)), i >= 0))
										return (this.lastItem = this.list[i]), this.list[i].val;
								}),
									(p.prototype.set = function (o, i) {
										var h;
										return this.lastItem && this.isEqual(this.lastItem.key, o)
											? ((this.lastItem.val = i), this)
											: ((h = this.indexOf(o)),
												h >= 0
													? ((this.lastItem = this.list[h]), (this.list[h].val = i), this)
													: ((this.lastItem = { key: o, val: i }),
														this.list.push(this.lastItem),
														this.size++,
														this));
									}),
									(p.prototype.delete = function (o) {
										var i;
										if (
											(this.lastItem &&
												this.isEqual(this.lastItem.key, o) &&
												(this.lastItem = void 0),
											(i = this.indexOf(o)),
											i >= 0)
										)
											return this.size--, this.list.splice(i, 1)[0];
									}),
									(p.prototype.has = function (o) {
										var i;
										return this.lastItem && this.isEqual(this.lastItem.key, o)
											? !0
											: ((i = this.indexOf(o)), i >= 0 ? ((this.lastItem = this.list[i]), !0) : !1);
									}),
									(p.prototype.forEach = function (o, i) {
										var h;
										for (h = 0; h < this.size; h++)
											o.call(i || this, this.list[h].val, this.list[h].key, this);
									}),
									(p.prototype.indexOf = function (o) {
										var i;
										for (i = 0; i < this.size; i++) if (this.isEqual(this.list[i].key, o)) return i;
										return -1;
									}),
									(p.prototype.isEqual = function (o, i) {
										return o === i || (o !== o && i !== i);
									}),
									(c.exports = p);
							},
							{}
						],
						3: [
							function (s, c, b) {
								var p = s('map-or-similar');
								c.exports = function (n) {
									var d = new p(!1),
										r = [];
									return function (u) {
										var I = function () {
											var m = d,
												y,
												k,
												S = arguments.length - 1,
												M = Array(S + 1),
												A = !0,
												C;
											if ((I.numArgs || I.numArgs === 0) && I.numArgs !== S + 1)
												throw new Error(
													'Memoizerific functions should always be called with the same number of arguments'
												);
											for (C = 0; C < S; C++) {
												if (((M[C] = { cacheItem: m, arg: arguments[C] }), m.has(arguments[C]))) {
													m = m.get(arguments[C]);
													continue;
												}
												(A = !1), (y = new p(!1)), m.set(arguments[C], y), (m = y);
											}
											return (
												A && (m.has(arguments[S]) ? (k = m.get(arguments[S])) : (A = !1)),
												A || ((k = u.apply(null, arguments)), m.set(arguments[S], k)),
												n > 0 &&
													((M[S] = { cacheItem: m, arg: arguments[S] }),
													A ? o(r, M) : r.push(M),
													r.length > n && i(r.shift())),
												(I.wasMemoized = A),
												(I.numArgs = S + 1),
												k
											);
										};
										return (I.limit = n), (I.wasMemoized = !1), (I.cache = d), (I.lru = r), I;
									};
								};
								function o(n, d) {
									var r = n.length,
										u = d.length,
										I,
										m,
										y;
									for (m = 0; m < r; m++) {
										for (I = !0, y = 0; y < u; y++)
											if (!h(n[m][y].arg, d[y].arg)) {
												I = !1;
												break;
											}
										if (I) break;
									}
									n.push(n.splice(m, 1)[0]);
								}
								function i(n) {
									var d = n.length,
										r = n[d - 1],
										u,
										I;
									for (
										r.cacheItem.delete(r.arg), I = d - 2;
										I >= 0 && ((r = n[I]), (u = r.cacheItem.get(r.arg)), !u || !u.size);
										I--
									)
										r.cacheItem.delete(r.arg);
								}
								function h(n, d) {
									return n === d || (n !== n && d !== d);
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
		f();
		g();
		w();
		f();
		g();
		w();
		f();
		g();
		w();
		f();
		g();
		w();
		var l = __REACT__,
			{
				Children: $e,
				Component: Je,
				Fragment: V,
				Profiler: Qe,
				PureComponent: Xe,
				StrictMode: et,
				Suspense: tt,
				__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ot,
				cloneElement: nt,
				createContext: rt,
				createElement: N,
				createFactory: it,
				createRef: at,
				forwardRef: ct,
				isValidElement: lt,
				lazy: st,
				memo: Q,
				startTransition: ut,
				unstable_act: It,
				useCallback: X,
				useContext: pt,
				useDebugValue: dt,
				useDeferredValue: ht,
				useEffect: _,
				useId: mt,
				useImperativeHandle: ft,
				useInsertionEffect: gt,
				useLayoutEffect: wt,
				useMemo: bt,
				useReducer: yt,
				useRef: ee,
				useState: z,
				useSyncExternalStore: St,
				useTransition: vt,
				version: Ct
			} = __REACT__;
		f();
		g();
		w();
		var kt = __STORYBOOK_API__,
			{
				ActiveTabs: At,
				Consumer: xt,
				ManagerContext: Ot,
				Provider: _t,
				RequestResponseError: Lt,
				addons: G,
				combineParameters: Bt,
				controlOrMetaKey: Pt,
				controlOrMetaSymbol: Mt,
				eventMatchesShortcut: Vt,
				eventToShortcut: Dt,
				experimental_requestResponse: Ht,
				isMacLike: Nt,
				isShortcutTaken: zt,
				keyToSymbol: Gt,
				merge: Ft,
				mockChannel: Ut,
				optionOrAltSymbol: qt,
				shortcutMatchesShortcut: Wt,
				shortcutToHumanString: Yt,
				types: te,
				useAddonState: jt,
				useArgTypes: Kt,
				useArgs: Zt,
				useChannel: $t,
				useGlobalTypes: Jt,
				useGlobals: F,
				useParameter: U,
				useSharedState: Qt,
				useStoryPrepared: Xt,
				useStorybookApi: oe,
				useStorybookState: eo
			} = __STORYBOOK_API__;
		f();
		g();
		w();
		var io = __STORYBOOK_COMPONENTS__,
			{
				A: ao,
				ActionBar: co,
				AddonPanel: lo,
				Badge: so,
				Bar: uo,
				Blockquote: Io,
				Button: po,
				ClipboardCode: ho,
				Code: mo,
				DL: fo,
				Div: go,
				DocumentWrapper: wo,
				EmptyTabContent: bo,
				ErrorFormatter: yo,
				FlexBar: So,
				Form: vo,
				H1: Co,
				H2: Eo,
				H3: Ro,
				H4: To,
				H5: ko,
				H6: Ao,
				HR: xo,
				IconButton: L,
				IconButtonSkeleton: Oo,
				Icons: _o,
				Img: Lo,
				LI: Bo,
				Link: Po,
				ListItem: Mo,
				Loader: Vo,
				Modal: Do,
				OL: Ho,
				P: No,
				Placeholder: zo,
				Pre: Go,
				ProgressSpinner: Fo,
				ResetWrapper: Uo,
				ScrollArea: qo,
				Separator: Wo,
				Spaced: Yo,
				Span: jo,
				StorybookIcon: Ko,
				StorybookLogo: Zo,
				Symbols: $o,
				SyntaxHighlighter: Jo,
				TT: Qo,
				TabBar: Xo,
				TabButton: en,
				TabWrapper: tn,
				Table: on,
				Tabs: nn,
				TabsState: rn,
				TooltipLinkList: q,
				TooltipMessage: an,
				TooltipNote: cn,
				UL: ln,
				WithTooltip: W,
				WithTooltipPure: sn,
				Zoom: un,
				codeCommon: In,
				components: pn,
				createCopyToClipboardFunction: dn,
				getStoryHref: hn,
				icons: mn,
				interleaveSeparators: fn,
				nameSpaceClassNames: gn,
				resetComponents: wn,
				withReset: bn
			} = __STORYBOOK_COMPONENTS__;
		f();
		g();
		w();
		var En = __STORYBOOK_THEMING__,
			{
				CacheProvider: Rn,
				ClassNames: Tn,
				Global: Y,
				ThemeProvider: kn,
				background: An,
				color: xn,
				convert: On,
				create: _n,
				createCache: Ln,
				createGlobal: Bn,
				createReset: Pn,
				css: Mn,
				darken: Vn,
				ensure: Dn,
				ignoreSsrWarning: Hn,
				isPropValid: Nn,
				jsx: zn,
				keyframes: Gn,
				lighten: Fn,
				styled: v,
				themes: Un,
				typography: qn,
				useTheme: Wn,
				withTheme: Yn
			} = __STORYBOOK_THEMING__;
		f();
		g();
		w();
		var Jn = __STORYBOOK_ICONS__,
			{
				AccessibilityAltIcon: Qn,
				AccessibilityIcon: Xn,
				AddIcon: er,
				AdminIcon: tr,
				AlertAltIcon: or,
				AlertIcon: nr,
				AlignLeftIcon: rr,
				AlignRightIcon: ir,
				AppleIcon: ar,
				ArrowBottomLeftIcon: cr,
				ArrowBottomRightIcon: lr,
				ArrowDownIcon: sr,
				ArrowLeftIcon: ur,
				ArrowRightIcon: Ir,
				ArrowSolidDownIcon: pr,
				ArrowSolidLeftIcon: dr,
				ArrowSolidRightIcon: hr,
				ArrowSolidUpIcon: mr,
				ArrowTopLeftIcon: fr,
				ArrowTopRightIcon: gr,
				ArrowUpIcon: wr,
				AzureDevOpsIcon: br,
				BackIcon: yr,
				BasketIcon: Sr,
				BatchAcceptIcon: vr,
				BatchDenyIcon: Cr,
				BeakerIcon: Er,
				BellIcon: Rr,
				BitbucketIcon: Tr,
				BoldIcon: kr,
				BookIcon: Ar,
				BookmarkHollowIcon: xr,
				BookmarkIcon: Or,
				BottomBarIcon: _r,
				BottomBarToggleIcon: Lr,
				BoxIcon: Br,
				BranchIcon: Pr,
				BrowserIcon: ne,
				ButtonIcon: Mr,
				CPUIcon: Vr,
				CalendarIcon: Dr,
				CameraIcon: Hr,
				CategoryIcon: Nr,
				CertificateIcon: zr,
				ChangedIcon: Gr,
				ChatIcon: Fr,
				CheckIcon: Ur,
				ChevronDownIcon: qr,
				ChevronLeftIcon: Wr,
				ChevronRightIcon: Yr,
				ChevronSmallDownIcon: jr,
				ChevronSmallLeftIcon: Kr,
				ChevronSmallRightIcon: Zr,
				ChevronSmallUpIcon: $r,
				ChevronUpIcon: Jr,
				ChromaticIcon: Qr,
				ChromeIcon: Xr,
				CircleHollowIcon: ei,
				CircleIcon: ti,
				ClearIcon: oi,
				CloseAltIcon: ni,
				CloseIcon: ri,
				CloudHollowIcon: ii,
				CloudIcon: ai,
				CogIcon: ci,
				CollapseIcon: li,
				CommandIcon: si,
				CommentAddIcon: ui,
				CommentIcon: Ii,
				CommentsIcon: pi,
				CommitIcon: di,
				CompassIcon: hi,
				ComponentDrivenIcon: mi,
				ComponentIcon: fi,
				ContrastIcon: gi,
				ControlsIcon: wi,
				CopyIcon: bi,
				CreditIcon: yi,
				CrossIcon: Si,
				DashboardIcon: vi,
				DatabaseIcon: Ci,
				DeleteIcon: Ei,
				DiamondIcon: Ri,
				DirectionIcon: Ti,
				DiscordIcon: ki,
				DocChartIcon: Ai,
				DocListIcon: xi,
				DocumentIcon: Oi,
				DownloadIcon: _i,
				DragIcon: Li,
				EditIcon: Bi,
				EllipsisIcon: Pi,
				EmailIcon: Mi,
				ExpandAltIcon: Vi,
				ExpandIcon: Di,
				EyeCloseIcon: Hi,
				EyeIcon: Ni,
				FaceHappyIcon: zi,
				FaceNeutralIcon: Gi,
				FaceSadIcon: Fi,
				FacebookIcon: Ui,
				FailedIcon: qi,
				FastForwardIcon: Wi,
				FigmaIcon: Yi,
				FilterIcon: ji,
				FlagIcon: Ki,
				FolderIcon: Zi,
				FormIcon: $i,
				GDriveIcon: Ji,
				GithubIcon: Qi,
				GitlabIcon: Xi,
				GlobeIcon: ea,
				GoogleIcon: ta,
				GraphBarIcon: oa,
				GraphLineIcon: na,
				GraphqlIcon: ra,
				GridAltIcon: ia,
				GridIcon: aa,
				GrowIcon: j,
				HeartHollowIcon: ca,
				HeartIcon: la,
				HomeIcon: sa,
				HourglassIcon: ua,
				InfoIcon: Ia,
				ItalicIcon: pa,
				JumpToIcon: da,
				KeyIcon: ha,
				LightningIcon: ma,
				LightningOffIcon: fa,
				LinkBrokenIcon: ga,
				LinkIcon: wa,
				LinkedinIcon: ba,
				LinuxIcon: ya,
				ListOrderedIcon: Sa,
				ListUnorderedIcon: va,
				LocationIcon: Ca,
				LockIcon: Ea,
				MarkdownIcon: Ra,
				MarkupIcon: Ta,
				MediumIcon: ka,
				MemoryIcon: Aa,
				MenuIcon: xa,
				MergeIcon: Oa,
				MirrorIcon: _a,
				MobileIcon: re,
				MoonIcon: La,
				NutIcon: Ba,
				OutboxIcon: Pa,
				OutlineIcon: Ma,
				PaintBrushIcon: Va,
				PaperClipIcon: Da,
				ParagraphIcon: Ha,
				PassedIcon: Na,
				PhoneIcon: za,
				PhotoDragIcon: Ga,
				PhotoIcon: Fa,
				PinAltIcon: Ua,
				PinIcon: qa,
				PlayAllHollowIcon: Wa,
				PlayBackIcon: Ya,
				PlayHollowIcon: ja,
				PlayIcon: Ka,
				PlayNextIcon: Za,
				PlusIcon: $a,
				PointerDefaultIcon: Ja,
				PointerHandIcon: Qa,
				PowerIcon: Xa,
				PrintIcon: ec,
				ProceedIcon: tc,
				ProfileIcon: oc,
				PullRequestIcon: nc,
				QuestionIcon: rc,
				RSSIcon: ic,
				RedirectIcon: ac,
				ReduxIcon: cc,
				RefreshIcon: ie,
				ReplyIcon: lc,
				RepoIcon: sc,
				RequestChangeIcon: uc,
				RewindIcon: Ic,
				RulerIcon: pc,
				SaveIcon: dc,
				SearchIcon: hc,
				ShareAltIcon: mc,
				ShareIcon: fc,
				ShieldIcon: gc,
				SideBySideIcon: wc,
				SidebarAltIcon: bc,
				SidebarAltToggleIcon: yc,
				SidebarIcon: Sc,
				SidebarToggleIcon: vc,
				SpeakerIcon: Cc,
				StackedIcon: Ec,
				StarHollowIcon: Rc,
				StarIcon: Tc,
				StatusFailIcon: kc,
				StatusPassIcon: Ac,
				StatusWarnIcon: xc,
				StickerIcon: Oc,
				StopAltHollowIcon: _c,
				StopAltIcon: Lc,
				StopIcon: Bc,
				StorybookIcon: Pc,
				StructureIcon: Mc,
				SubtractIcon: Vc,
				SunIcon: Dc,
				SupportIcon: Hc,
				SwitchAltIcon: Nc,
				SyncIcon: zc,
				TabletIcon: ae,
				ThumbsUpIcon: Gc,
				TimeIcon: Fc,
				TimerIcon: Uc,
				TransferIcon: K,
				TrashIcon: qc,
				TwitterIcon: Wc,
				TypeIcon: Yc,
				UbuntuIcon: jc,
				UndoIcon: Kc,
				UnfoldIcon: Zc,
				UnlockIcon: $c,
				UnpinIcon: Jc,
				UploadIcon: Qc,
				UserAddIcon: Xc,
				UserAltIcon: el,
				UserIcon: tl,
				UsersIcon: ol,
				VSCodeIcon: nl,
				VerifiedIcon: rl,
				VideoIcon: il,
				WandIcon: al,
				WatchIcon: cl,
				WindowsIcon: ll,
				WrenchIcon: sl,
				XIcon: ul,
				YoutubeIcon: Il,
				ZoomIcon: pl,
				ZoomOutIcon: dl,
				ZoomResetIcon: hl,
				iconList: ml
			} = __STORYBOOK_ICONS__;
		var $ = Se(le()),
			B = 'storybook/viewport',
			x = 'viewport',
			Ie = {
				mobile1: {
					name: 'Small mobile',
					styles: { height: '568px', width: '320px' },
					type: 'mobile'
				},
				mobile2: {
					name: 'Large mobile',
					styles: { height: '896px', width: '414px' },
					type: 'mobile'
				},
				tablet: { name: 'Tablet', styles: { height: '1112px', width: '834px' }, type: 'tablet' }
			},
			P = { name: 'Reset viewport', styles: { height: '100%', width: '100%' }, type: 'desktop' },
			Ce = { [x]: { value: void 0, isRotated: !1 } },
			Ee = { viewport: 'reset', viewportRotated: !1 },
			Re = FEATURES?.viewportStoryGlobals ? Ce : Ee,
			pe = (e, t) => e.indexOf(t),
			Te = (e, t) => {
				let a = pe(e, t);
				return a === e.length - 1 ? e[0] : e[a + 1];
			},
			ke = (e, t) => {
				let a = pe(e, t);
				return a < 1 ? e[e.length - 1] : e[a - 1];
			},
			de = async (e, t, a, s) => {
				await e.setAddonShortcut(B, {
					label: 'Previous viewport',
					defaultShortcut: ['alt', 'shift', 'V'],
					actionName: 'previous',
					action: () => {
						a({ viewport: ke(s, t) });
					}
				}),
					await e.setAddonShortcut(B, {
						label: 'Next viewport',
						defaultShortcut: ['alt', 'V'],
						actionName: 'next',
						action: () => {
							a({ viewport: Te(s, t) });
						}
					}),
					await e.setAddonShortcut(B, {
						label: 'Reset viewport',
						defaultShortcut: ['alt', 'control', 'V'],
						actionName: 'reset',
						action: () => {
							a(Re);
						}
					});
			},
			Ae = v.div(() => ({ display: 'inline-flex', alignItems: 'center' })),
			se = v.div(({ theme: e }) => ({
				display: 'inline-block',
				textDecoration: 'none',
				padding: 10,
				fontWeight: e.typography.weight.bold,
				fontSize: e.typography.size.s2 - 1,
				lineHeight: '1',
				height: 40,
				border: 'none',
				borderTop: '3px solid transparent',
				borderBottom: '3px solid transparent',
				background: 'transparent'
			})),
			xe = v(L)(() => ({ display: 'inline-flex', alignItems: 'center' })),
			Oe = v.div(({ theme: e }) => ({ fontSize: e.typography.size.s2 - 1, marginLeft: 10 })),
			_e = {
				desktop: l.createElement(ne, null),
				mobile: l.createElement(re, null),
				tablet: l.createElement(ae, null),
				other: l.createElement(V, null)
			},
			Le = ({ api: e }) => {
				let t = U(x),
					[a, s, c] = F(),
					[b, p] = z(!1),
					{ options: o = Ie, disable: i } = t || {},
					h = a?.[x] || {},
					n = h.value,
					d = h.isRotated,
					r = o[n] || P,
					u = b || r !== P,
					I = x in c,
					m = Object.keys(o).length;
				if (
					(_(() => {
						de(e, n, s, Object.keys(o));
					}, [o, n, s, e]),
					r.styles === null || !o || m < 1)
				)
					return null;
				if (typeof r.styles == 'function')
					return (
						console.warn(
							'Addon Viewport no longer supports dynamic styles using a function, use css calc() instead'
						),
						null
					);
				let y = d ? r.styles.height : r.styles.width,
					k = d ? r.styles.width : r.styles.height;
				return i
					? null
					: l.createElement(Be, {
							item: r,
							updateGlobals: s,
							viewportMap: o,
							viewportName: n,
							isRotated: d,
							setIsTooltipVisible: p,
							isLocked: I,
							isActive: u,
							width: y,
							height: k
						});
			},
			Be = l.memo(function (e) {
				let {
						item: t,
						viewportMap: a,
						viewportName: s,
						isRotated: c,
						updateGlobals: b,
						setIsTooltipVisible: p,
						isLocked: o,
						isActive: i,
						width: h,
						height: n
					} = e,
					d = X((r) => b({ [x]: r }), [b]);
				return l.createElement(
					V,
					null,
					l.createElement(
						W,
						{
							placement: 'bottom',
							tooltip: ({ onHide: r }) =>
								l.createElement(q, {
									links: [
										...(length > 0 && t !== P
											? [
													{
														id: 'reset',
														title: 'Reset viewport',
														icon: l.createElement(ie, null),
														onClick: () => {
															d({ value: void 0, isRotated: !1 }), r();
														}
													}
												]
											: []),
										...Object.entries(a).map(([u, I]) => ({
											id: u,
											title: I.name,
											icon: _e[I.type],
											active: u === s,
											onClick: () => {
												d({ value: u, isRotated: !1 }), r();
											}
										}))
									].flat()
								}),
							closeOnOutsideClick: !0,
							onVisibleChange: p
						},
						l.createElement(
							xe,
							{
								disabled: o,
								key: 'viewport',
								title: 'Change the size of the preview',
								active: i,
								onDoubleClick: () => {
									d({ value: void 0, isRotated: !1 });
								}
							},
							l.createElement(j, null),
							t !== P ? l.createElement(Oe, null, t.name, ' ', c ? '(L)' : '(P)') : null
						)
					),
					l.createElement(Y, {
						styles: { 'iframe[data-is-storybook="true"]': { width: h, height: n } }
					}),
					t !== P
						? l.createElement(
								Ae,
								null,
								l.createElement(se, { title: 'Viewport width' }, h.replace('px', '')),
								o
									? '/'
									: l.createElement(
											L,
											{
												key: 'viewport-rotate',
												title: 'Rotate viewport',
												onClick: () => {
													d({ value: s, isRotated: !c });
												}
											},
											l.createElement(K, null)
										),
								l.createElement(se, { title: 'Viewport height' }, n.replace('px', ''))
							)
						: null
				);
			}),
			Pe = (0, $.default)(50)((e) => [
				...Me,
				...Object.entries(e).map(([t, { name: a, ...s }]) => ({ ...s, id: t, title: a }))
			]),
			D = { id: 'reset', title: 'Reset viewport', styles: null, type: 'other' },
			Me = [D],
			Ve = (0, $.default)(50)((e, t, a, s) =>
				e
					.filter((c) => c.id !== D.id || t.id !== c.id)
					.map((c) => ({
						...c,
						onClick: () => {
							a({ viewport: c.id }), s();
						}
					}))
			),
			De = ({ width: e, height: t, ...a }) => ({ ...a, height: e, width: t }),
			He = v.div(() => ({ display: 'inline-flex', alignItems: 'center' })),
			ue = v.div(({ theme: e }) => ({
				display: 'inline-block',
				textDecoration: 'none',
				padding: 10,
				fontWeight: e.typography.weight.bold,
				fontSize: e.typography.size.s2 - 1,
				lineHeight: '1',
				height: 40,
				border: 'none',
				borderTop: '3px solid transparent',
				borderBottom: '3px solid transparent',
				background: 'transparent'
			})),
			Ne = v(L)(() => ({ display: 'inline-flex', alignItems: 'center' })),
			ze = v.div(({ theme: e }) => ({ fontSize: e.typography.size.s2 - 1, marginLeft: 10 })),
			Ge = (e, t, a) => {
				if (t === null) return;
				let s = typeof t == 'function' ? t(e) : t;
				return a ? De(s) : s;
			},
			Fe = Q(function () {
				let [e, t] = F(),
					{ viewports: a = Ie, defaultOrientation: s, defaultViewport: c, disable: b } = U(x, {}),
					p = Pe(a),
					o = oe(),
					[i, h] = z(!1);
				c &&
					!p.find((u) => u.id === c) &&
					console.warn(
						`Cannot find "defaultViewport" of "${c}" in addon-viewport configs, please check the "viewports" setting in the configuration.`
					),
					_(() => {
						de(o, e, t, Object.keys(a));
					}, [a, e, e.viewport, t, o]),
					_(() => {
						let u = s === 'landscape';
						((c && e.viewport !== c) || (s && e.viewportRotated !== u)) &&
							t({ viewport: c, viewportRotated: u });
					}, [s, c, t]);
				let n =
						p.find((u) => u.id === e.viewport) ||
						p.find((u) => u.id === c) ||
						p.find((u) => u.default) ||
						D,
					d = ee(),
					r = Ge(d.current, n.styles, e.viewportRotated);
				return (
					_(() => {
						d.current = r;
					}, [n]),
					b || Object.entries(a).length === 0
						? null
						: l.createElement(
								V,
								null,
								l.createElement(
									W,
									{
										placement: 'top',
										tooltip: ({ onHide: u }) => l.createElement(q, { links: Ve(p, n, t, u) }),
										closeOnOutsideClick: !0,
										onVisibleChange: h
									},
									l.createElement(
										Ne,
										{
											key: 'viewport',
											title: 'Change the size of the preview',
											active: i || !!r,
											onDoubleClick: () => {
												t({ viewport: D.id });
											}
										},
										l.createElement(j, null),
										r
											? l.createElement(
													ze,
													null,
													e.viewportRotated ? `${n.title} (L)` : `${n.title} (P)`
												)
											: null
									)
								),
								r
									? l.createElement(
											He,
											null,
											l.createElement(Y, {
												styles: {
													'iframe[data-is-storybook="true"]': {
														...(r || { width: '100%', height: '100%' })
													}
												}
											}),
											l.createElement(ue, { title: 'Viewport width' }, r.width.replace('px', '')),
											l.createElement(
												L,
												{
													key: 'viewport-rotate',
													title: 'Rotate viewport',
													onClick: () => {
														t({ viewportRotated: !e.viewportRotated });
													}
												},
												l.createElement(K, null)
											),
											l.createElement(ue, { title: 'Viewport height' }, r.height.replace('px', ''))
										)
									: null
							)
				);
			});
		G.register(B, (e) => {
			G.add(B, {
				title: 'viewport / media-queries',
				type: te.TOOL,
				match: ({ viewMode: t, tabId: a }) => t === 'story' && !a,
				render: () => (FEATURES?.viewportStoryGlobals ? N(Le, { api: e }) : N(Fe, null))
			});
		});
	})();
} catch (e) {
	console.error('[Storybook] One of your manager-entries failed: ' + import.meta.url, e);
}

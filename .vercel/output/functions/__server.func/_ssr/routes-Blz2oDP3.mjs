import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as BookOpen, i as Radio, o as ArrowUpRight, r as Smartphone, t as Unlink } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Blz2oDP3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK = {
	schema: 1,
	appName: "Mortal Reader",
	versionName: "3.5",
	sitesEnabled: 138,
	updatedAt: "2026-11-01T01:04:29Z",
	commit: "0d59d7fc",
	release: {
		name: "Actualización a v3.5",
		tag: "Nuevo/Ahora",
		body: "Actualización de versión v3.5\n~ Solo dispositivos arm64-v8a.",
		publishedAt: "2026-10-31T23:40:08Z",
		url: "https://github.com/Lenoxlkz/Mortal-Reader-App/releases/tag/Nuevo/Ahora"
	},
	repo: "https://github.com/Lenoxlkz/Mortal-Reader-App"
};
var SOURCES = [
	"https://raw.githubusercontent.com/Lenoxlkz/Mortal-Reader-App/live-data/live.json",
	"https://cdn.jsdelivr.net/gh/Lenoxlkz/Mortal-Reader-App@live-data/live.json",
	"https://cdn.statically.io/gh/Lenoxlkz/Mortal-Reader-App/live-data/live.json",
	"https://raw.githubusercontent.com/Lenoxlkz/Mortal-Reader-App/main/docs/live.json"
];
function asRelease(value) {
	if (!value || typeof value !== "object") return null;
	const r = value;
	if (typeof r.url !== "string" || typeof r.name !== "string") return null;
	return {
		name: r.name,
		tag: typeof r.tag === "string" ? r.tag : "",
		body: typeof r.body === "string" ? r.body : "",
		publishedAt: typeof r.publishedAt === "string" ? r.publishedAt : "",
		url: r.url
	};
}
function parseSnap(value) {
	if (!value || typeof value !== "object") return null;
	const v = value;
	if (v.schema !== 1) return null;
	if (typeof v.appName !== "string" || typeof v.versionName !== "string") return null;
	if (typeof v.sitesEnabled !== "number" || !Number.isFinite(v.sitesEnabled)) return null;
	if (typeof v.repo !== "string") return null;
	return {
		schema: 1,
		appName: v.appName,
		versionName: v.versionName,
		sitesEnabled: Math.max(0, Math.round(v.sitesEnabled)),
		updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : "",
		commit: typeof v.commit === "string" ? v.commit : "",
		release: asRelease(v.release),
		repo: v.repo
	};
}
async function pull(url, signal) {
	const response = await fetch(url, {
		signal,
		cache: "no-store"
	});
	if (!response.ok) throw new Error(String(response.status));
	const snap = parseSnap(await response.json());
	if (!snap) throw new Error("shape");
	return snap;
}
async function loadLive(parent) {
	for (const url of SOURCES) {
		if (parent.aborted) return null;
		const timeout = AbortSignal.timeout(2800);
		const signal = AbortSignal.any([parent, timeout]);
		try {
			return await pull(url, signal);
		} catch {}
	}
	return null;
}
function formatUtc(iso) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("es", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC"
	}).format(date);
}
var NOTICES = [
	"Esta aplicación ha sido concebida exclusivamente como una herramienta «Todo en Uno». Su esencia no trasciende más allá de esta funcionalidad unificada.",
	"Es imperativo aclarar que los anuncios emergentes o las páginas caídas que no respondan son responsabilidad absoluta de los autores de dichas páginas externas. Esta aplicación no guarda relación alguna con dichos contenidos ni su gestión.",
	"No podemos garantizar que el usuario se vea exento de presenciar publicidad en sitios de terceros."
];
function Home() {
	const [snap, setSnap] = (0, import_react.useState)(FALLBACK);
	const [phase, setPhase] = (0, import_react.useState)("boot");
	(0, import_react.useEffect)(() => {
		const controller = new AbortController();
		loadLive(controller.signal).then((next) => {
			if (controller.signal.aborted) return;
			if (next) {
				setSnap(next);
				setPhase("live");
			} else setPhase("local");
		});
		return () => controller.abort();
	}, []);
	const releaseUrl = snap.release?.url ?? `${snap.repo}/releases`;
	const status = phase === "live" ? "En vivo" : phase === "local" ? "Copia local" : "Sincronizando";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		id: "contenido",
		className: "bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#contenido",
				className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:bg-fg focus:px-3 focus:py-2 focus:text-bg",
				children: "Saltar al contenido"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-14 max-w-6xl items-center justify-between px-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow text-xs text-muted",
						children: "Mortal Reader"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
								className: "live-dot",
								"aria-hidden": true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: status
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: snap.repo,
							className: "inline-flex min-h-11 items-center gap-1 text-sm text-fg",
							children: ["Repositorio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
								className: "size-4",
								"aria-hidden": true
							})]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-5 pb-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid items-end gap-10 pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow rise text-xs text-muted",
								children: "Puente local"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "wordmark rise mt-4 text-5xl text-fg sm:text-7xl",
								children: [
									"Mortal",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "Reader" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cut mt-6 max-w-xs" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rise mt-6 max-w-xl text-lg leading-relaxed text-fg",
								children: "Colecciona sitios para leer y reproducir, en distintos idiomas. La app solo abre el puente. Sin cuenta. Todo se queda en el dispositivo."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-wrap gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: releaseUrl,
									className: "inline-flex min-h-11 items-center bg-fg px-5 text-sm font-medium text-bg",
									children: ["Versión ", snap.versionName]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: snap.repo,
									className: "inline-flex min-h-11 items-center border border-line px-5 text-sm text-fg",
									children: "Código"
								})]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Device, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-14 grid gap-px border border-line bg-line sm:grid-cols-3",
						"aria-label": "Estado del repositorio",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								k: "Versión",
								v: snap.versionName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								k: "Sitios en el puente",
								v: String(snap.sitesEnabled)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								k: "Publicado",
								v: snap.release ? formatUtc(snap.release.publishedAt) : "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: status === "En vivo" ? `Leído del repositorio${snap.commit ? ` · ${snap.commit}` : ""}.` : "Mostrando la última copia conocida. Las direcciones no se publican aquí."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow text-xs text-muted",
								children: "El catálogo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "display mt-3 text-4xl text-fg",
								children: "Un punto por sitio."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-sm text-base leading-relaxed text-muted",
								children: "El número se actualiza cuando cambia el repositorio. Los enlaces viven solo dentro de la app."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "constellation",
							"aria-hidden": true,
							children: Array.from({ length: Math.min(snap.sitesEnabled, 240) }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: i === snap.sitesEnabled - 1 ? "star on" : "star" }, i))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-sm text-muted",
							children: [snap.sitesEnabled, " sitios habilitados. Ninguna URL sale del teléfono."]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-16 grid gap-4 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Principle, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
									className: "size-5",
									"aria-hidden": true
								}),
								index: "01",
								title: "Sin cuenta",
								body: "No hay login ni perfil. Lo que usas se queda en ese dispositivo."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Principle, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
									className: "size-5",
									"aria-hidden": true
								}),
								index: "02",
								title: "Todo en uno",
								body: "Lectura y reproducción, en varios idiomas, dentro de una sola herramienta."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Principle, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unlink, {
									className: "size-5",
									"aria-hidden": true
								}),
								index: "03",
								title: "Solo un puente",
								body: "La app no aloja el contenido. Abre el sitio. El resto es de quien lo publica."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-16 border-t border-line pt-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "eyebrow flex items-center gap-2 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {
								className: "size-4",
								"aria-hidden": true
							}), "Aviso"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-6 grid gap-4",
							children: NOTICES.map((text) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "border border-line bg-surface p-5 text-base leading-relaxed text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mr-2 text-accent",
									"aria-hidden": true,
									children: "✦"
								}), text]
							}, text))
						})]
					}),
					snap.release ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-16 grid gap-6 border border-line p-5 sm:p-8 md:grid-cols-[1fr_auto] md:items-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow text-xs text-muted",
								children: "Última actualización"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 text-2xl font-medium text-fg",
								children: snap.release.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 max-w-xl text-sm leading-relaxed whitespace-pre-line text-muted",
								children: snap.release.body
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: snap.release.url,
							className: "inline-flex min-h-11 items-center justify-center border border-line px-5 text-sm text-fg",
							children: "Ver release"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "mt-16 flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Mortal Reader. El contenido no es de esta app." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: snap.repo,
							className: "text-fg",
							children: "Lenoxlkz / Mortal-Reader-App"
						})]
					})
				]
			})
		]
	});
}
function Stat({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-bg px-5 py-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "eyebrow text-xs text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-2xl text-fg",
			children: v
		})]
	});
}
function Principle({ icon, index, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "border border-line bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: icon }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "display text-lg",
					children: index
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 text-xl text-fg",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: body
			})
		]
	});
}
function Device() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		className: "rise border border-line bg-surface p-4 shadow-none sm:p-5",
		"aria-label": "Vista de la app",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "shell border border-line bg-bg px-5 py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-8 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow text-xs text-muted",
						children: "En el teléfono"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-10 bg-accent" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							name: "Lectura",
							lang: "ES"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							name: "Novela",
							lang: "EN",
							active: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							name: "Reproducción",
							lang: "ES"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-sm text-muted",
					children: "Nada se envía. Nada sale del aparato."
				})
			]
		})
	});
}
function Row({ name, lang, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: `flex items-center justify-between border px-4 py-3 text-sm ${active ? "border-fg text-fg" : "border-line text-muted"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted",
			children: lang
		})]
	});
}
//#endregion
export { Home as component };

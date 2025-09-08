// src/bridge/getwebpackRequire.ts
function getWebpackChunkKey(win) {
  const keys = Object.keys(win);
  const found = keys.find((k) => /^webpackChunk/.test(k));
  if (!found) {
    throw new Error("webpackChunk* key not found on window");
  }
  return found;
}
async function getWebpackRequire() {
  const key = getWebpackChunkKey(window);
  const bag = window[key];
  if (typeof bag !== "object" || bag === null || !("push" in bag)) {
    throw new Error("Invalid webpackChunk object");
  }
  const queue = bag;
  return await new Promise((resolve) => {
    const id = `probe_${Math.random().toString(36).slice(2)}`;
    const modules = {
      [id]: (_module, _exports, __r) => resolve(__r)
    };
    const runtime = (req) => req(id);
    queue.push([[id], modules, runtime]);
  });
}

// src/bridge/page-bridge.ts
var LOG_PREFIX = "[preview-bridge]";
function reportError(where, err, extra) {
  try {
    const payload = {
      where,
      message: err instanceof Error ? err.message : String(err),
      name: err instanceof Error ? err.name : void 0,
      extra
    };
    console.error(LOG_PREFIX, payload);
  } catch {
  }
}
function isPlayerNamespace(ns) {
  if (!ns || typeof ns !== "object") return false;
  const obj = ns;
  const cp = obj["CorePlayer"];
  const lp = obj["LiveProvider"];
  const fromJSON = lp?.["fromJSON"];
  return typeof cp === "function" && typeof fromJSON === "function";
}
async function resolvePlayerNamespace() {
  const __r = await getWebpackRequire();
  const ids = Object.keys(__r.m);
  const candidates = ids.filter((id) => {
    try {
      const src = __r.m[id].toString();
      return src.includes("CorePlayer") || src.includes("LiveProvider.fromJSON");
    } catch {
      return false;
    }
  });
  for (const id of candidates) {
    const mod = __r(id);
    if (isPlayerNamespace(mod)) return mod;
  }
  throw new Error("Player namespace not found");
}
async function fetchLiveDetail(uid) {
  const r = await fetch(
    `https://api.chzzk.naver.com/service/v3.2/channels/${uid}/live-detail`,
    { credentials: "include" }
  );
  if (!r.ok) throw new Error("live-detail fetch failed");
  const j = await r.json();
  if (!j || typeof j !== "object" || !("code" in j)) {
    throw new Error("invalid live-detail response");
  }
  const res = j;
  if (res.code !== 200) throw new Error("live-detail code != 200");
  const info = res.content;
  if (!info.livePlayback && "livePlaybackJson" in res.content) {
    const raw = res.content.livePlaybackJson;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        info.livePlayback = parsed;
      } catch {
      }
    }
  }
  return info;
}
var mounted = { player: null, container: null, token: null, cleanup: [] };
function callIf(obj, name) {
  const fn = obj?.[name];
  if (typeof fn === "function") {
    try {
      fn.call(obj);
    } catch (e) {
      reportError(`callIf:${name}`, e);
    }
  }
}
async function mountPlayer(params) {
  const { containerId, livePlayback, volume, maxLevel = 480, token } = params;
  const ns = await resolvePlayerNamespace();
  const container = document.getElementById(containerId);
  if (!container) throw new Error("container not found");
  if (mounted.cleanup?.length) {
    mounted.cleanup.forEach((fn) => fn());
  }
  mounted = { player: null, container: null, token: null, cleanup: [] };
  mounted.container = container;
  mounted.token = token;
  const previewPlayer = new ns.CorePlayer();
  container.innerHTML = "";
  container.appendChild(previewPlayer.shadowRoot);
  previewPlayer.muted = true;
  previewPlayer.volume = volume;
  previewPlayer.shadowRoot.style.visibility = "hidden";
  const src = ns.LiveProvider.fromJSON(livePlayback, {
    devt: "HTML5_PC",
    serviceId: 2099,
    countryCode: "kr",
    p2pDisabled: true,
    maxLevel
  });
  const onReady = async () => {
    if (mounted.token !== token) return;
    try {
      if (previewPlayer.shadowRoot?.style)
        previewPlayer.shadowRoot.style.visibility = "";
    } catch {
    }
    try {
      if (typeof previewPlayer.play === "function") await previewPlayer.play();
      else previewPlayer.shadowRoot?.querySelector?.("video")?.play?.();
    } catch {
    }
  };
  try {
    previewPlayer.addEventListener?.("loadedmetadata", onReady, { once: true });
  } catch (e) {
    reportError(`loadedmetadata`, e);
  }
  previewPlayer.srcObject = src;
  requestAnimationFrame(() => onReady());
  mounted.cleanup.push(
    () => {
      try {
        previewPlayer.removeEventListener?.("loadedmetadata", onReady);
      } catch (e) {
        reportError(`loadedmetadata`, e);
      }
    },
    () => {
      try {
        previewPlayer.removeEventListener?.("canplay", onReady);
      } catch (e) {
        reportError(`remove canplay`, e);
      }
    },
    () => {
      try {
        if ("src" in previewPlayer) previewPlayer.src = "";
      } catch (e) {
        reportError(`init src`, e);
      }
    },
    () => {
      callIf(previewPlayer, "pause");
    },
    () => {
      callIf(previewPlayer, "stop");
    },
    () => {
      callIf(previewPlayer, "destroy");
    },
    () => {
      callIf(previewPlayer, "dispose");
    },
    () => {
      callIf(previewPlayer, "unload");
    },
    () => {
      try {
        if (mounted.container) mounted.container.innerHTML = "";
      } catch (e) {
        reportError(`init container`, e);
      }
    }
  );
  mounted.player = previewPlayer;
}
function unmountPlayer() {
  const fns = mounted.cleanup || [];
  for (const fn of fns) {
    try {
      fn();
    } catch (e) {
      reportError(`unmount Error`, e);
    }
  }
  mounted = { player: null, container: null, token: null, cleanup: [] };
}
window.__previewBridge = {
  fetchLiveDetail,
  mountPlayer,
  unmountPlayer
};
var api = { fetchLiveDetail, mountPlayer, unmountPlayer };
window.addEventListener("message", async (ev) => {
  const data = ev.data;
  if (!data || data.__previewRPC !== true) return;
  if (ev.source !== window) return;
  const { id, method, args } = data;
  try {
    if (!(method in api)) throw new Error("unknown method");
    const result = await api[method](...args ?? []);
    const res = { __previewRPC: true, id, ok: true, result };
    window.postMessage(res, "*");
  } catch (e) {
    const res = {
      __previewRPC: true,
      id,
      ok: false,
      error: e instanceof Error ? e.message : String(e)
    };
    window.postMessage(res, "*");
  }
});

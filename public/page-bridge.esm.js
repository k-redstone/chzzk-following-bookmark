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
var LOG_PREFIX = "[preview-bridge:min]";
var isDev = typeof process !== "undefined" && process.env?.NODE_ENV === "development";
var logError = (where, err, extra) => {
  if (!isDev) return;
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
};
var isPlayerNs = (ns) => {
  if (!ns || typeof ns !== "object") return false;
  const o = ns;
  return typeof o["CorePlayer"] === "function" && typeof o["LiveProvider"]?.["fromJSON"] === "function";
};
var getRoot = (p) => p?.shadowRoot ?? p?.root ?? p?.el ?? p?.element ?? null;
var stopHtmlVideo = (root) => {
  const v = root?.querySelector?.("video");
  if (!v) return;
  try {
    v.pause();
  } catch (e) {
    logError("video.pause", e);
  }
  try {
    v.removeAttribute("src");
  } catch (e) {
    logError("video.removeSrc", e);
  }
  try {
    v.load();
  } catch (e) {
    logError("video.load", e);
  }
};
async function resolvePlayerNamespace() {
  const __r = await getWebpackRequire();
  const ids = Object.keys(__r.m);
  for (const id of ids) {
    try {
      const src = __r.m[id].toString();
      if (!src.includes("CorePlayer") && !src.includes("LiveProvider.fromJSON"))
        continue;
      const mod = __r(id);
      if (isPlayerNs(mod)) return mod;
    } catch {
    }
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
  if (!j || typeof j !== "object" || !("code" in j))
    throw new Error("invalid live-detail response");
  const res = j;
  if (res.code !== 200) throw new Error("live-detail code != 200");
  const info = res.content;
  if (!info.livePlayback && info.livePlaybackJson) {
    try {
      info.livePlayback = JSON.parse(
        info.livePlaybackJson
      );
    } catch {
    }
  }
  return info;
}
var state = {
  ns: null,
  player: null,
  container: null,
  token: null
};
async function mountPlayer(params) {
  const { containerId, livePlayback, volume, maxLevel = 480, token } = params;
  state.token = token;
  const ns = await resolvePlayerNamespace();
  const container = document.getElementById(containerId);
  if (!container) throw new Error("container not found");
  let player = state.player;
  if (!player) {
    player = new ns.CorePlayer();
    state.player = player;
    state.container = container;
  }
  container.innerHTML = "";
  const root = getRoot(player);
  if (root) {
    try {
      root.style.visibility = "hidden";
    } catch {
    }
    container.appendChild(root);
  }
  try {
    if (typeof volume === "number") player.volume = volume / 100;
  } catch (e) {
    logError("player.props", e);
  }
  const src = ns.LiveProvider.fromJSON(livePlayback, {
    devt: "HTML5_PC",
    serviceId: 2099,
    countryCode: "kr",
    p2pDisabled: true,
    maxLevel
  });
  try {
    ;
    player.srcObject = src;
  } catch (e) {
    logError("player.srcObject", e);
  }
  const onReady = async () => {
    if (state.token !== token) return;
    const root2 = getRoot(player);
    if (root2) root2.style.visibility = "";
    const video = root2?.querySelector?.("video");
    try {
      if (video ? video.readyState >= 3 : true) {
        if (typeof player.play === "function") {
          await player.play();
        } else {
          await video?.play();
        }
      }
    } catch (e) {
      if (e?.name !== "AbortError") {
        logError("player.play", e);
      }
    }
  };
  try {
    ;
    player.addEventListener?.("canplay", onReady, { once: true });
  } catch (e) {
    logError("addEventListener.canplay", e);
  }
}
function unmountPlayer() {
  state.token = null;
  const player = state.player;
  const container = state.container;
  try {
    stopHtmlVideo(getRoot(player));
  } catch (e) {
    logError("unmount.stopVideo", e);
  }
  try {
    if (player && "srcObject" in player)
      player.srcObject = null;
    if (player && "src" in player) player.src = "";
  } catch (e) {
    logError("unmount.srcReset", e);
  }
  try {
    container && (container.innerHTML = "");
  } catch (e) {
    logError("unmount.container", e);
  }
}
window.addEventListener("preview:mount", (ev) => {
  void mountPlayer(ev.detail).catch((e) => logError("event.mount", e));
});
window.addEventListener("preview:unmount", () => {
  try {
    unmountPlayer();
  } catch (e) {
    logError("event.unmount", e);
  }
});
window.__previewBridge = {
  fetchLiveDetail,
  mountPlayer,
  unmountPlayer
};

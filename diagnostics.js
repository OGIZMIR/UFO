(function () {
  "use strict";

  const DIAGNOSTICS_VERSION = "1.0.0";
  const GAME_VERSION = "1.2.0";

  const files = [
    "index.html",
    "online-highscores.js",
    "diagnostics.js",
    "favicon.svg"
  ];

  let panel = null;
  let fileResults = {};
  let visible = false;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function statusClass(value) {
    const normalized = String(value || "").toUpperCase();

    if (
      normalized.includes("ONLINE") ||
      normalized.includes("ANGEMELDET") ||
      normalized === "OK"
    ) {
      return "diagOk";
    }

    if (
      normalized.includes("FEHLER") ||
      normalized.includes("NICHT") ||
      normalized.includes("FEHLGESCHLAGEN")
    ) {
      return "diagError";
    }

    return "diagPending";
  }

  function createPanel() {
    if (panel) {
      return panel;
    }

    const style = document.createElement("style");
    style.textContent = `
      #ufoDiagnostics {
        position: fixed;
        top: 18px;
        right: 18px;
        z-index: 2147483647;
        width: min(520px, calc(100vw - 36px));
        max-height: calc(100vh - 36px);
        overflow: auto;
        display: none;
        padding: 18px;
        border: 1px solid rgba(111, 235, 255, 0.8);
        border-radius: 14px;
        background:
          linear-gradient(145deg, rgba(7, 31, 57, 0.97), rgba(1, 5, 15, 0.98));
        color: #e9fcff;
        box-shadow:
          0 18px 60px rgba(0, 0, 0, 0.75),
          0 0 30px rgba(0, 217, 255, 0.22);
        font: 12px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace;
        cursor: default !important;
      }

      #ufoDiagnostics * {
        cursor: default !important;
      }

      #ufoDiagnostics button {
        cursor: pointer !important;
      }

      #ufoDiagnostics h2 {
        margin: 0;
        color: #9ef8ff;
        font-size: 19px;
        letter-spacing: 1px;
      }

      #ufoDiagnostics .diagHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      #ufoDiagnostics .diagClose {
        min-height: auto;
        padding: 6px 11px;
        border: 1px solid rgba(127, 239, 255, 0.55);
        border-radius: 8px;
        background: #12334c;
        color: #e9fcff;
        font: inherit;
        box-shadow: none;
      }

      #ufoDiagnostics .diagGrid {
        display: grid;
        grid-template-columns: minmax(145px, 0.8fr) minmax(180px, 1.2fr);
        gap: 7px 12px;
      }

      #ufoDiagnostics .diagLabel {
        color: #93b8c9;
      }

      #ufoDiagnostics .diagValue {
        min-width: 0;
        overflow-wrap: anywhere;
        color: #ffffff;
      }

      #ufoDiagnostics .diagSection {
        margin-top: 15px;
        padding-top: 12px;
        border-top: 1px solid rgba(122, 226, 244, 0.2);
      }

      #ufoDiagnostics .diagSection strong {
        color: #ffdd78;
      }

      #ufoDiagnostics .diagOk {
        color: #78ff9a;
      }

      #ufoDiagnostics .diagError {
        color: #ff7979;
      }

      #ufoDiagnostics .diagPending {
        color: #ffd36b;
      }

      #ufoDiagnostics .diagHint {
        margin-top: 14px;
        color: #8fb3c4;
        font-size: 11px;
      }

      @media (max-width: 560px) {
        #ufoDiagnostics {
          top: 8px;
          right: 8px;
          width: calc(100vw - 16px);
          max-height: calc(100vh - 16px);
          padding: 14px;
        }

        #ufoDiagnostics .diagGrid {
          grid-template-columns: 1fr;
          gap: 3px;
        }

        #ufoDiagnostics .diagValue {
          margin-bottom: 7px;
        }
      }
    `;

    document.head.appendChild(style);

    panel = document.createElement("section");
    panel.id = "ufoDiagnostics";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-label", "UFO-Jagd Diagnose");
    panel.innerHTML = `
      <div class="diagHeader">
        <h2>UFO-DIAGNOSE</h2>
        <button class="diagClose" type="button">Schließen</button>
      </div>
      <div id="ufoDiagnosticsContent"></div>
    `;

    panel
      .querySelector(".diagClose")
      .addEventListener("click", hidePanel);

    document.body.appendChild(panel);

    return panel;
  }

  async function checkFile(fileName) {
    try {
      const response = await fetch(
        fileName + "?diag=" + Date.now(),
        {
          method: "GET",
          cache: "no-store"
        }
      );

      return {
        file: fileName,
        ok: response.ok,
        status: response.status
      };
    } catch (error) {
      return {
        file: fileName,
        ok: false,
        status: "NETZWERKFEHLER"
      };
    }
  }

  async function checkFiles() {
    const results = await Promise.all(files.map(checkFile));

    fileResults = {};

    results.forEach(function (result) {
      fileResults[result.file] = result;
    });

    render();
  }

  function diagnosticsState() {
    return window.UFOOnlineDiagnostics || {
      moduleVersion: "nicht geladen",
      firebaseConfigured: false,
      authStatus: "MODUL NICHT GELADEN",
      userId: null,
      databaseStatus: "MODUL NICHT GELADEN",
      onlineScoreCount: 0,
      loadedTopScoreCount: 0,
      lastError: "online-highscores.js ist nicht aktiv",
      lastUpdate: null
    };
  }

  function fileRows() {
    return files.map(function (fileName) {
      const result = fileResults[fileName];

      if (!result) {
        return `
          <div class="diagLabel">${escapeHtml(fileName)}</div>
          <div class="diagValue diagPending">PRÜFUNG...</div>
        `;
      }

      const status = result.ok
        ? "OK (" + result.status + ")"
        : "FEHLER (" + result.status + ")";

      return `
        <div class="diagLabel">${escapeHtml(fileName)}</div>
        <div class="diagValue ${result.ok ? "diagOk" : "diagError"}">
          ${escapeHtml(status)}
        </div>
      `;
    }).join("");
  }

  function render() {
    if (!panel) {
      return;
    }

    const target = panel.querySelector("#ufoDiagnosticsContent");

    if (!target) {
      return;
    }

    const state = diagnosticsState();
    const authStatus = state.authStatus || "UNBEKANNT";
    const databaseStatus = state.databaseStatus || "UNBEKANNT";

    target.innerHTML = `
      <div class="diagGrid">
        <div class="diagLabel">Spielversion</div>
        <div class="diagValue">${escapeHtml(GAME_VERSION)}</div>

        <div class="diagLabel">Diagnoseversion</div>
        <div class="diagValue">${escapeHtml(DIAGNOSTICS_VERSION)}</div>

        <div class="diagLabel">Highscore-Modul</div>
        <div class="diagValue">
          ${escapeHtml(state.moduleVersion || "nicht geladen")}
        </div>

        <div class="diagLabel">Firebase-Konfiguration</div>
        <div class="diagValue ${state.firebaseConfigured ? "diagOk" : "diagError"}">
          ${state.firebaseConfigured ? "GELADEN" : "NICHT GELADEN"}
        </div>

        <div class="diagLabel">Authentifizierung</div>
        <div class="diagValue ${statusClass(authStatus)}">
          ${escapeHtml(authStatus)}
        </div>

        <div class="diagLabel">Anonyme Benutzer-ID</div>
        <div class="diagValue">
          ${escapeHtml(state.userId || "noch nicht verfügbar")}
        </div>

        <div class="diagLabel">Realtime Database</div>
        <div class="diagValue ${statusClass(databaseStatus)}">
          ${escapeHtml(databaseStatus)}
        </div>

        <div class="diagLabel">Online-Scores gesamt</div>
        <div class="diagValue">
          ${escapeHtml(state.onlineScoreCount ?? 0)}
        </div>

        <div class="diagLabel">Top-Scores geladen</div>
        <div class="diagValue">
          ${escapeHtml(state.loadedTopScoreCount ?? 0)}
        </div>

        <div class="diagLabel">Letzte Aktualisierung</div>
        <div class="diagValue">
          ${escapeHtml(state.lastUpdate || "noch keine")}
        </div>

        <div class="diagLabel">Letzter Firebase-Fehler</div>
        <div class="diagValue ${state.lastError ? "diagError" : "diagOk"}">
          ${escapeHtml(state.lastError || "KEIN FEHLER")}
        </div>

        <div class="diagLabel">Seitenadresse</div>
        <div class="diagValue">
          ${escapeHtml(location.href)}
        </div>
      </div>

      <div class="diagSection">
        <strong>Dateiprüfung</strong>
        <div class="diagGrid" style="margin-top:8px">
          ${fileRows()}
        </div>
      </div>

      <div class="diagHint">
        F2 oder Escape schließt die Diagnose. Die Benutzer-ID darf öffentlich
        diagnostiziert, aber nicht als Geheimnis oder Passwort verwendet werden.
      </div>
    `;
  }

  function showPanel() {
    createPanel();
    visible = true;
    panel.style.display = "block";
    render();
    checkFiles();
  }

  function hidePanel() {
    if (!panel) {
      return;
    }

    visible = false;
    panel.style.display = "none";
  }

  function togglePanel() {
    if (visible) {
      hidePanel();
    } else {
      showPanel();
    }
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "F2") {
      event.preventDefault();
      event.stopPropagation();
      togglePanel();
      return;
    }

    if (event.key === "Escape" && visible) {
      event.preventDefault();
      hidePanel();
    }
  }, true);

  window.addEventListener(
    "ufo-online-diagnostics-update",
    render
  );

  window.setInterval(function () {
    if (visible) {
      render();
    }
  }, 1000);
})();

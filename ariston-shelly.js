/**
 * Scaldacqua intelligente con Shelly + Fotovoltaico
 *
 * Controlla automaticamente uno scaldacqua Ariston Lydos Hybrid
 * in base allo stato della Smart Load dell'inverter fotovoltaico.
 *
 * - Smart Load ON (batterie cariche) → Boost 70°C (resistenza elettrica)
 *                                    → Relè output ON (carico fisico bonus)
 * - Smart Load OFF (batterie scariche) → Green 53°C (pompa di calore)
 *                                      → Relè output OFF (carico fisico bonus)
 *
 * Licenza: MIT
 */

// ── Configurazione ────────────────────────────────────────────
var BASE     = "https://www.ariston-net.remotethermo.com";
var EMAIL    = "tua_email@example.com";   // Email account Ariston NET
var PASSWORD = "tua_password";            // Password account Ariston NET
var HEATER   = "GATEWAY_ID";             // Gateway ID (vedi INSTALL.md)
// ─────────────────────────────────────────────────────────────

var mod = "pompa"; // Stato iniziale assunto

/**
 * Estrae il cookie di sessione dalla risposta del login
 */
function getCookie(r) {
  var parts = r.headers["Set-Cookie"].split(",");
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].indexOf(".AspNet.ApplicationCookie=") >= 0)
      return parts[i].trim().split(";")[0];
  }
  return null;
}

/**
 * Imposta la temperatura del boiler
 */
function setTemp(ck, s, temp) {
  Shelly.call("HTTP.Request", {
    method: "POST",
    url: BASE + "/api/v2/velis/sePlantData/" + HEATER + "/temperature",
    headers: {"Content-Type": "application/json", "Cookie": ck},
    body: JSON.stringify({new: temp, old: s.reqTemp})
  }, function() { print("OK temp=" + temp); });
}

/**
 * Imposta la modalità del boiler
 */
function setMode(ck, s, mode, temp) {
  Shelly.call("HTTP.Request", {
    method: "POST",
    url: BASE + "/api/v2/velis/sePlantData/" + HEATER + "/mode",
    headers: {"Content-Type": "application/json", "Cookie": ck},
    body: JSON.stringify({new: mode, old: s.mode})
  }, function() { setTemp(ck, s, temp); });
}

/**
 * Legge lo stato attuale del boiler
 */
function getStato(ck, mode, temp) {
  Shelly.call("HTTP.Request", {
    method: "GET",
    url: BASE + "/api/v2/velis/sePlantData/" + HEATER,
    headers: {"Cookie": ck}
  }, function(r) { setMode(ck, JSON.parse(r.body), mode, temp); });
}

/**
 * Esegue login, imposta modalità e temperatura su Ariston
 * e gestisce il relè fisico per il carico bonus (es. scalda salviette)
 */
function run(mode, temp) {
  // Relè fisico: ON con batterie cariche (mode 7), OFF con pompa (mode 2)
  Shelly.call("Switch.Set", {id: 0, on: (mode === 7)}, null);

  Shelly.call("HTTP.Request", {
    method: "POST",
    url: BASE + "/R2/Account/Login",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({email: EMAIL, password: PASSWORD})
  }, function(r) {
    var ck = getCookie(r);
    if (!ck) { print("Login fallito"); return; }
    getStato(ck, mode, temp);
  });
}

/**
 * Gestione evento ingresso digitale
 * Configurare lo Shelly in modalità input: detached
 */
Shelly.addEventHandler(function(e) {
  if (e.component !== "input:0" || !e.info || e.info.event !== "single_push") return;
  if (mod === "pompa") {
    mod = "resistenza";
    print("→ Resistenza 70C + carico fisico ON");
    run(7, 70);
  } else {
    mod = "pompa";
    print("→ Pompa 53C + carico fisico OFF");
    run(2, 53);
  }
});

print("Pronto | mod=" + mod);

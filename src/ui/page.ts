/**
 * Pagina HTML autonoma della UI locale. E' servita cosi' com'e' dal server: nessuna dipendenza
 * esterna, nessuna risorsa remota, tutto inline (CSS e JavaScript). La pagina interroga le API
 * locali del server (/api/anni, /api/netto) e renderizza il Prospetto come una dichiarazione
 * commentata, la stessa struttura che la CLI stampa in testo. Il JavaScript lato client non usa
 * template literal per non confliggere con la stringa template di questo modulo.
 */

export const PAGINA_HTML = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>fiscal-toolkit - calcolo netto</title>
<style>
  :root { color-scheme: light dark; --muted:#6b7280; --line:#e5e7eb; --accent:#2563eb; }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 2rem 1rem; line-height: 1.5; }
  .wrap { max-width: 820px; margin: 0 auto; }
  h1 { font-size: 1.4rem; margin: 0 0 0.25rem; }
  .sub { color: var(--muted); margin: 0 0 1.5rem; font-size: 0.9rem; }
  form { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: end; margin-bottom: 1.5rem; }
  label { display: flex; flex-direction: column; font-size: 0.8rem; color: var(--muted); gap: 0.25rem; }
  input, select, button { font: inherit; padding: 0.5rem 0.6rem; border: 1px solid var(--line); border-radius: 8px; background: transparent; color: inherit; }
  button { background: var(--accent); color: white; border: none; cursor: pointer; padding: 0.55rem 1.1rem; }
  button:hover { opacity: 0.9; }
  .voce { border-bottom: 1px solid var(--line); padding: 0.7rem 0; }
  .riga { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; }
  .etichetta { font-weight: 600; }
  .importo { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .spiega { color: var(--muted); font-size: 0.85rem; margin-top: 0.15rem; }
  .fonte { color: var(--muted); font-size: 0.75rem; margin-top: 0.1rem; font-style: italic; }
  .dett { margin: 0.35rem 0 0 1rem; font-size: 0.8rem; color: var(--muted); }
  .dett li { list-style: none; }
  .netto .etichetta, .netto .importo { font-size: 1.15rem; color: var(--accent); font-weight: 700; }
  .nd { color: var(--muted); font-style: italic; }
  .panel { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 1.25rem; padding-top: 1rem; border-top: 2px solid var(--line); }
  .kpi { font-size: 0.85rem; }
  .kpi b { display: block; font-size: 1.05rem; font-variant-numeric: tabular-nums; }
  .disclaimer { margin-top: 1.5rem; font-size: 0.8rem; color: var(--muted); }
  .err { color: #b91c1c; }
</style>
</head>
<body>
<div class="wrap">
  <h1>fiscal-toolkit</h1>
  <p class="sub">Calcolo netto per un lavoratore dipendente, spiegato voce per voce. Non e' consulenza fiscale.</p>
  <form id="form">
    <label>Retribuzione annua lorda (EUR)
      <input id="ral" type="number" min="0" step="100" value="30000" />
    </label>
    <label>Anno d'imposta
      <select id="anno"></select>
    </label>
    <button type="submit">Calcola</button>
  </form>
  <div id="out"></div>
</div>
<script>
  var fmtEuro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
  var fmtPct = new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var out = document.getElementById('out');

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

  function rigaVoce(v) {
    var importo = v.disponibile ? '<span class="importo">' + fmtEuro.format(v.euro) + '</span>' : '<span class="importo nd">n.d.</span>';
    var html = '<div class="voce ' + (v.chiave === 'nettoAnnuo' ? 'netto' : '') + '">';
    html += '<div class="riga"><span class="etichetta">' + esc(v.etichetta) + '</span>' + importo + '</div>';
    if (v.spiegazione) { html += '<div class="spiega">' + esc(v.spiegazione) + '</div>'; }
    if (v.fonte) { html += '<div class="fonte">Fonte: ' + esc(v.fonte.articolo) + ' - ' + esc(v.fonte.urn) + '</div>'; }
    if (v.dettaglio && v.dettaglio.length) {
      html += '<ul class="dett">';
      for (var i = 0; i < v.dettaglio.length; i++) {
        var d = v.dettaglio[i];
        html += '<li>' + esc(d.etichetta) + ' = ' + fmtEuro.format(d.euro) + ' (' + esc(d.nota) + ')</li>';
      }
      html += '</ul>';
    }
    html += '</div>';
    return html;
  }

  function render(data) {
    var netto = 0;
    for (var i = 0; i < data.voci.length; i++) { if (data.voci[i].chiave === 'nettoAnnuo') { netto = data.voci[i].euro; } }
    var html = '<h2>Anno d\\'imposta ' + esc(data.anno) + '</h2>';
    for (var j = 0; j < data.voci.length; j++) { html += rigaVoce(data.voci[j]); }
    html += '<div class="panel">';
    html += '<div class="kpi">Netto mensile (12)<b>' + fmtEuro.format(netto / 12) + '</b></div>';
    html += '<div class="kpi">Netto mensile (13)<b>' + fmtEuro.format(netto / 13) + '</b></div>';
    html += '<div class="kpi">Netto mensile (14)<b>' + fmtEuro.format(netto / 14) + '</b></div>';
    html += '<div class="kpi">Aliquota marginale IRPEF<b>' + fmtPct.format(data.indicatori.aliquotaMarginaleIrpef) + '</b></div>';
    html += '<div class="kpi">Pressione fiscale<b>' + fmtPct.format(data.indicatori.pressioneFiscale) + '</b></div>';
    html += '</div>';
    html += '<p class="disclaimer">Calcolo su base annua. Non e\\' consulenza fiscale: verificare con un commercialista.</p>';
    out.innerHTML = html;
  }

  function calcola(e) {
    if (e) { e.preventDefault(); }
    var ral = document.getElementById('ral').value;
    var anno = document.getElementById('anno').value;
    out.innerHTML = '<p class="sub">Calcolo in corso...</p>';
    fetch('/api/netto?ral=' + encodeURIComponent(ral) + '&anno=' + encodeURIComponent(anno))
      .then(function (r) { return r.json(); })
      .then(function (data) { if (data.errore) { out.innerHTML = '<p class="err">' + esc(data.errore) + '</p>'; } else { render(data); } })
      .catch(function (err) { out.innerHTML = '<p class="err">Errore: ' + esc(err.message) + '</p>'; });
  }

  fetch('/api/anni').then(function (r) { return r.json(); }).then(function (data) {
    var sel = document.getElementById('anno');
    for (var i = 0; i < data.anni.length; i++) {
      var o = document.createElement('option');
      o.value = data.anni[i]; o.textContent = data.anni[i];
      sel.appendChild(o);
    }
    sel.value = data.anni[data.anni.length - 1];
    calcola();
  });
  document.getElementById('form').addEventListener('submit', calcola);
</script>
</body>
</html>`;

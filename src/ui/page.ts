/**
 * Pagina HTML autonoma della UI locale. Servita cosi' com'e' dal server: nessuna dipendenza
 * esterna, nessuna risorsa remota, CSS e JavaScript inline. Interroga le API locali del server
 * (/api/anni, /api/netto, /api/confronta) e offre due viste: il dettaglio di un anno, con la
 * composizione della RAL come barra impilata e la dichiarazione voce per voce, e il confronto fra
 * gli anni disponibili come tabella.
 *
 * La palette della barra e' quella validata dalla skill dataviz (slot categoriali 1-4), con
 * etichette dirette e la tabella di dettaglio a coprire la regola di rilievo sul contrasto in
 * chiaro. Il JavaScript lato client non usa template literal per non confliggere con la stringa
 * template di questo modulo.
 */

export const PAGINA_HTML = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>fiscal-toolkit - calcolo netto</title>
<style>
  :root {
    color-scheme: light dark;
    --muted:#898781; --line:#e1e0d9; --accent:#256abf; --err:#d03b3b;
    --s-netto:#2a78d6; --s-inps:#eb6834; --s-irpef:#1baf7a; --s-addiz:#eda100;
    --surface:#fcfcfb;
  }
  @media (prefers-color-scheme: dark) {
    :root:where(:not([data-theme="light"])) {
      --muted:#898781; --line:#2c2c2a; --accent:#3987e5;
      --s-netto:#3987e5; --s-inps:#d95926; --s-irpef:#199e70; --s-addiz:#c98500;
      --surface:#1a1a19;
    }
  }
  :root[data-theme="dark"] {
    --muted:#898781; --line:#2c2c2a; --accent:#3987e5;
    --s-netto:#3987e5; --s-inps:#d95926; --s-irpef:#199e70; --s-addiz:#c98500;
    --surface:#1a1a19;
  }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 2rem 1rem; line-height: 1.5; }
  .wrap { max-width: 860px; margin: 0 auto; }
  h1 { font-size: 1.4rem; margin: 0 0 0.25rem; }
  h2 { font-size: 1.05rem; margin: 1.25rem 0 0.5rem; }
  .sub { color: var(--muted); margin: 0 0 1.5rem; font-size: 0.9rem; }
  form { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: end; margin-bottom: 1rem; }
  label { display: flex; flex-direction: column; font-size: 0.8rem; color: var(--muted); gap: 0.25rem; }
  input, select, button { font: inherit; padding: 0.5rem 0.6rem; border: 1px solid var(--line); border-radius: 8px; background: transparent; color: inherit; }
  button { background: var(--accent); color: white; border: none; cursor: pointer; padding: 0.55rem 1.1rem; }
  button:hover { opacity: 0.92; }
  .tabs { display: flex; gap: 0.5rem; border-bottom: 1px solid var(--line); margin-bottom: 1rem; }
  .tab { background: transparent; color: var(--muted); border: none; border-bottom: 2px solid transparent; border-radius: 0; padding: 0.5rem 0.4rem; }
  .tab[aria-selected="true"] { color: inherit; border-bottom-color: var(--accent); font-weight: 600; }
  .hidden { display: none; }
  .voce { border-bottom: 1px solid var(--line); padding: 0.7rem 0; }
  .riga { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; }
  .etichetta { font-weight: 600; }
  .importo { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .spiega { color: var(--muted); font-size: 0.85rem; margin-top: 0.15rem; }
  .fonte { color: var(--muted); font-size: 0.75rem; margin-top: 0.1rem; font-style: italic; }
  .dett { margin: 0.35rem 0 0 1rem; font-size: 0.8rem; color: var(--muted); padding: 0; }
  .dett li { list-style: none; }
  .netto .etichetta, .netto .importo { font-size: 1.15rem; color: var(--accent); font-weight: 700; }
  .nd { color: var(--muted); font-style: italic; }
  .panel { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 1.25rem; padding-top: 1rem; border-top: 2px solid var(--line); }
  .kpi { font-size: 0.85rem; color: var(--muted); }
  .kpi b { display: block; font-size: 1.05rem; font-variant-numeric: tabular-nums; color: inherit; }
  .disclaimer { margin-top: 1.5rem; font-size: 0.8rem; color: var(--muted); }
  .err { color: var(--err); }
  .bar { display: flex; gap: 2px; background: var(--surface); border-radius: 4px; overflow: hidden; height: 2.4rem; margin: 0.25rem 0 0.75rem; }
  .seg { display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.72rem; font-variant-numeric: tabular-nums; min-width: 2px; overflow: hidden; white-space: nowrap; }
  .seg-netto { background: var(--s-netto); } .seg-inps { background: var(--s-inps); }
  .seg-irpef { background: var(--s-irpef); } .seg-addiz { background: var(--s-addiz); }
  .legend { display: flex; flex-wrap: wrap; gap: 0.25rem 1.25rem; font-size: 0.82rem; margin-bottom: 0.5rem; }
  .legend div { display: flex; align-items: center; gap: 0.4rem; }
  .sw { width: 0.8rem; height: 0.8rem; border-radius: 3px; display: inline-block; }
  table { border-collapse: collapse; width: 100%; font-size: 0.9rem; }
  th, td { text-align: right; padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--line); font-variant-numeric: tabular-nums; }
  th:first-child, td:first-child { text-align: left; }
  thead th { color: var(--muted); font-weight: 600; }
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
  <div class="tabs" role="tablist">
    <button class="tab" id="tab-dettaglio" role="tab" aria-selected="true">Dettaglio</button>
    <button class="tab" id="tab-confronto" role="tab" aria-selected="false">Confronto anni</button>
  </div>
  <div id="view-dettaglio"></div>
  <div id="view-confronto" class="hidden"></div>
</div>
<script>
  var fmtEuro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
  var fmtPct = new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var viewDett = document.getElementById('view-dettaglio');
  var viewConf = document.getElementById('view-confronto');
  var dati = { netto: null, confronto: null };

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function voceEuro(d, chiave) { for (var i = 0; i < d.voci.length; i++) { if (d.voci[i].chiave === chiave) return d.voci[i].euro; } return 0; }

  function barra(d) {
    var ral = voceEuro(d, 'ral');
    var inps = voceEuro(d, 'inps');
    var irpef = voceEuro(d, 'irpefNetta');
    var addiz = voceEuro(d, 'addizionaleRegionale') + voceEuro(d, 'addizionaleComunale');
    var netto = ral - inps - irpef - addiz;
    var seg = [
      { cls: 'seg-netto', sw: '--s-netto', nome: 'Netto da RAL', val: netto },
      { cls: 'seg-inps', sw: '--s-inps', nome: 'Contributi INPS', val: inps },
      { cls: 'seg-irpef', sw: '--s-irpef', nome: 'IRPEF netta', val: irpef },
      { cls: 'seg-addiz', sw: '--s-addiz', nome: 'Addizionali', val: addiz }
    ];
    var html = '<h2>Composizione della RAL</h2><div class="bar" role="img" aria-label="Composizione della retribuzione annua lorda">';
    for (var i = 0; i < seg.length; i++) {
      var q = ral > 0 ? seg[i].val / ral : 0;
      var etich = q >= 0.08 ? fmtPct.format(q) : '';
      html += '<div class="seg ' + seg[i].cls + '" style="flex:' + Math.max(seg[i].val, 0) + ' 0 auto" title="' + esc(seg[i].nome) + '">' + etich + '</div>';
    }
    html += '</div><div class="legend">';
    for (var j = 0; j < seg.length; j++) {
      html += '<div><span class="sw" style="background:var(' + seg[j].sw + ')"></span>' + esc(seg[j].nome) + ': ' + fmtEuro.format(seg[j].val) + '</div>';
    }
    html += '</div>';
    return html;
  }

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

  function renderDettaglio(d) {
    var netto = voceEuro(d, 'nettoAnnuo');
    var html = '<h2>Anno d\\'imposta ' + esc(d.anno) + '</h2>';
    html += barra(d);
    html += '<h2>Dichiarazione voce per voce</h2>';
    for (var j = 0; j < d.voci.length; j++) { html += rigaVoce(d.voci[j]); }
    html += '<div class="panel">';
    html += '<div class="kpi">Netto mensile (12)<b>' + fmtEuro.format(netto / 12) + '</b></div>';
    html += '<div class="kpi">Netto mensile (13)<b>' + fmtEuro.format(netto / 13) + '</b></div>';
    html += '<div class="kpi">Netto mensile (14)<b>' + fmtEuro.format(netto / 14) + '</b></div>';
    html += '<div class="kpi">Aliquota marginale IRPEF<b>' + fmtPct.format(d.indicatori.aliquotaMarginaleIrpef) + '</b></div>';
    html += '<div class="kpi">Pressione fiscale<b>' + fmtPct.format(d.indicatori.pressioneFiscale) + '</b></div>';
    html += '</div>';
    html += '<p class="disclaimer">Calcolo su base annua. Non e\\' consulenza fiscale: verificare con un commercialista.</p>';
    viewDett.innerHTML = html;
  }

  function renderConfronto(c) {
    var html = '<h2>Confronto fra anni - RAL ' + fmtEuro.format(c.ral) + '</h2>';
    html += '<table><thead><tr><th>Anno</th><th>Netto annuo</th><th>Mensile (14)</th><th>Imponibile</th><th>IRPEF netta</th><th>Addizionali</th><th>Pressione</th></tr></thead><tbody>';
    for (var i = 0; i < c.prospetti.length; i++) {
      var p = c.prospetti[i];
      var netto = voceEuro(p, 'nettoAnnuo');
      var addiz = voceEuro(p, 'addizionaleRegionale') + voceEuro(p, 'addizionaleComunale');
      html += '<tr><td>' + esc(p.anno) + '</td><td>' + fmtEuro.format(netto) + '</td><td>' + fmtEuro.format(netto / 14) + '</td><td>' + fmtEuro.format(voceEuro(p, 'imponibile')) + '</td><td>' + fmtEuro.format(voceEuro(p, 'irpefNetta')) + '</td><td>' + fmtEuro.format(addiz) + '</td><td>' + fmtPct.format(p.indicatori.pressioneFiscale) + '</td></tr>';
    }
    html += '</tbody></table>';
    html += '<p class="disclaimer">Non e\\' consulenza fiscale: verificare con un commercialista.</p>';
    viewConf.innerHTML = html;
  }

  function calcola(e) {
    if (e) { e.preventDefault(); }
    var ral = document.getElementById('ral').value;
    var anno = document.getElementById('anno').value;
    viewDett.innerHTML = '<p class="sub">Calcolo in corso...</p>';
    fetch('/api/netto?ral=' + encodeURIComponent(ral) + '&anno=' + encodeURIComponent(anno))
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d.errore) { viewDett.innerHTML = '<p class="err">' + esc(d.errore) + '</p>'; } else { dati.netto = d; renderDettaglio(d); } })
      .catch(function (err) { viewDett.innerHTML = '<p class="err">Errore: ' + esc(err.message) + '</p>'; });
    fetch('/api/confronta?ral=' + encodeURIComponent(ral))
      .then(function (r) { return r.json(); })
      .then(function (c) { if (!c.errore) { dati.confronto = c; renderConfronto(c); } })
      .catch(function () {});
  }

  function mostra(quale) {
    var dett = quale === 'dettaglio';
    document.getElementById('tab-dettaglio').setAttribute('aria-selected', dett ? 'true' : 'false');
    document.getElementById('tab-confronto').setAttribute('aria-selected', dett ? 'false' : 'true');
    viewDett.classList.toggle('hidden', !dett);
    viewConf.classList.toggle('hidden', dett);
  }

  document.getElementById('tab-dettaglio').addEventListener('click', function () { mostra('dettaglio'); });
  document.getElementById('tab-confronto').addEventListener('click', function () { mostra('confronto'); });
  document.getElementById('form').addEventListener('submit', calcola);

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
</script>
</body>
</html>`;

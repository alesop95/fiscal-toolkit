/**
 * Pagina HTML autonoma della UI locale. Servita cosi' com'e' dal server: nessuna dipendenza
 * esterna, nessuna risorsa remota, CSS e JavaScript inline. Interroga le API locali del server
 * (/api/anni, /api/netto, /api/confronta, /api/curva) e offre tre viste: il dettaglio di un anno,
 * con la composizione della RAL come barra impilata e la dichiarazione voce per voce; il confronto
 * fra gli anni disponibili come tabella; la curva del prelievo al variare della RAL come grafico
 * SVG inline.
 *
 * Il client non fa aritmetica fiscale. Segmenti della barra, quote, mensilita' e riconciliazione
 * del cuneo arrivano gia' calcolati dal Prospetto serializzato: e' la correzione di un errore
 * concreto, perche' quando la barra ricostruiva il netto per differenza ignorava la somma non
 * tassata del cuneo e contraddiceva la voce sottostante. Qui si formatta e si disegna, nient'altro.
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
  .tab-wrap { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; font-size: 0.9rem; }
  th, td { text-align: right; padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--line); font-variant-numeric: tabular-nums; }
  th:first-child, td:first-child { text-align: left; }
  thead th { color: var(--muted); font-weight: 600; }
  .ric { margin: 0.25rem 0 0.5rem; font-size: 0.9rem; }
  .ric div { display: flex; justify-content: space-between; max-width: 22rem; }
  .ric .tot { border-top: 1px solid var(--line); font-weight: 600; padding-top: 0.2rem; }
  .ric span:last-child { font-variant-numeric: tabular-nums; }
  .azioni { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
  .azioni button { background: transparent; color: var(--accent); border: 1px solid var(--line); }
  .chart { width: 100%; height: auto; overflow: visible; }
  .chart .grid { stroke: var(--line); stroke-width: 1; }
  .chart .axis { fill: var(--muted); font-size: 10px; }
  .chart .l-netto { stroke: var(--s-netto); fill: none; stroke-width: 2; }
  .chart .l-eff { stroke: var(--s-inps); fill: none; stroke-width: 2; }
  .chart .l-irpef { stroke: var(--s-irpef); fill: none; stroke-width: 1.5; stroke-dasharray: 4 3; }
  @media print {
    form, .tabs, .azioni { display: none; }
    body { padding: 0; }
    .hidden { display: none; }
    a[href]:after { content: ""; }
  }
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
    <button class="tab" id="tab-curva" role="tab" aria-selected="false">Curva RAL</button>
  </div>
  <div id="view-dettaglio"></div>
  <div id="view-confronto" class="hidden"></div>
  <div id="view-curva" class="hidden"></div>
  <div class="azioni">
    <button type="button" id="scarica">Scarica JSON</button>
    <button type="button" id="stampa">Stampa o PDF</button>
  </div>
</div>
<script>
  // useGrouping esplicito: in it-IT il default non raggruppa i numeri di quattro cifre, e la CLI
  // invece le raggruppa. Forzarlo tiene le due viste allineate sullo stesso importo.
  var fmtEuro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', useGrouping: true });
  var fmtPct = new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var viewDett = document.getElementById('view-dettaglio');
  var viewConf = document.getElementById('view-confronto');
  var viewCurva = document.getElementById('view-curva');
  var dati = { netto: null, confronto: null, curva: null };
  var CLASSE = { nettoDaRal: 'seg-netto', inps: 'seg-inps', irpef: 'seg-irpef', addizionali: 'seg-addiz' };
  var SWATCH = { nettoDaRal: '--s-netto', inps: '--s-inps', irpef: '--s-irpef', addizionali: '--s-addiz' };

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function voceEuro(d, chiave) { for (var i = 0; i < d.voci.length; i++) { if (d.voci[i].chiave === chiave) return d.voci[i].euro; } return 0; }

  // I segmenti e le quote arrivano dal Prospetto: qui non si ricalcola nulla, si disegna soltanto.
  function barra(d) {
    var c = d.composizione;
    var html = '<h2>Composizione della RAL</h2><div class="bar" role="img" aria-label="Composizione della retribuzione annua lorda">';
    for (var i = 0; i < c.segmenti.length; i++) {
      var s = c.segmenti[i];
      var etich = s.quota >= 0.08 ? fmtPct.format(s.quota) : '';
      html += '<div class="seg ' + CLASSE[s.chiave] + '" style="flex:' + Math.max(s.euro, 0) + ' 0 auto" title="' + esc(s.etichetta) + '">' + etich + '</div>';
    }
    html += '</div><div class="legend">';
    for (var j = 0; j < c.segmenti.length; j++) {
      var g = c.segmenti[j];
      html += '<div><span class="sw" style="background:var(' + SWATCH[g.chiave] + ')"></span>' + esc(g.etichetta) + ': ' + fmtEuro.format(g.euro) + '</div>';
    }
    html += '</div>';
    // La somma del cuneo non e' una fetta della RAL: si aggiunge sopra, quindi va riconciliata a parte.
    if (c.cuneoSomma > 0) {
      html += '<div class="ric">';
      html += '<div><span>Netto da RAL</span><span>' + fmtEuro.format(c.nettoDaRal) + '</span></div>';
      html += '<div><span>+ Cuneo (somma non tassata)</span><span>' + fmtEuro.format(c.cuneoSomma) + '</span></div>';
      html += '<div class="tot"><span>= Netto annuo</span><span>' + fmtEuro.format(c.nettoAnnuo) + '</span></div>';
      html += '</div>';
    }
    return html;
  }

  function rigaVoce(v) {
    var importo = v.disponibile ? '<span class="importo">' + fmtEuro.format(v.euro) + '</span>' : '<span class="importo nd">n.d.</span>';
    var html = '<div class="voce ' + (v.chiave === 'nettoAnnuo' ? 'netto' : '') + '">';
    html += '<div class="riga"><span class="etichetta">' + esc(v.etichetta) + '</span>' + importo + '</div>';
    if (v.spiegazione) { html += '<div class="spiega">' + esc(v.spiegazione) + '</div>'; }
    if (v.fonte) {
      html += '<div class="fonte">Fonte: ' + esc(v.fonte.testo);
      if (v.fonte.nota) { html += ' - ' + esc(v.fonte.nota); }
      html += '</div>';
    }
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
    var html = '<h2>Anno d\\'imposta ' + esc(d.anno) + '</h2>';
    html += barra(d);
    html += '<h2>Dichiarazione voce per voce</h2>';
    for (var j = 0; j < d.voci.length; j++) { html += rigaVoce(d.voci[j]); }
    html += '<div class="panel">';
    for (var m = 0; m < d.mensilita.length; m++) {
      html += '<div class="kpi">Netto mensile (' + esc(d.mensilita[m].rate) + ')<b>' + fmtEuro.format(d.mensilita[m].euro) + '</b></div>';
    }
    html += '<div class="kpi">Aliquota marginale IRPEF<b>' + fmtPct.format(d.indicatori.aliquotaMarginaleIrpef) + '</b></div>';
    html += '<div class="kpi">Aliquota media imposte<b>' + fmtPct.format(d.indicatori.aliquotaMediaImposte) + '</b></div>';
    html += '<div class="kpi">Pressione fiscale<b>' + fmtPct.format(d.indicatori.pressioneFiscale) + '</b></div>';
    html += '</div>';
    html += '<p class="disclaimer">Calcolo su base annua. Non e\\' consulenza fiscale: verificare con un commercialista.</p>';
    viewDett.innerHTML = html;
  }

  function renderConfronto(c) {
    var html = '<h2>Confronto fra anni - RAL ' + fmtEuro.format(c.ral) + '</h2>';
    html += '<div class="tab-wrap"><table><thead><tr><th>Anno</th><th>Netto annuo</th><th>Mensile (14)</th><th>Imponibile</th><th>IRPEF netta</th><th>Addizionali</th><th>Pressione</th></tr></thead><tbody>';
    for (var i = 0; i < c.prospetti.length; i++) {
      var p = c.prospetti[i];
      var netto = voceEuro(p, 'nettoAnnuo');
      var addiz = voceEuro(p, 'addizionaleRegionale') + voceEuro(p, 'addizionaleComunale');
      html += '<tr><td>' + esc(p.anno) + '</td><td>' + fmtEuro.format(netto) + '</td><td>' + fmtEuro.format(netto / 14) + '</td><td>' + fmtEuro.format(voceEuro(p, 'imponibile')) + '</td><td>' + fmtEuro.format(voceEuro(p, 'irpefNetta')) + '</td><td>' + fmtEuro.format(addiz) + '</td><td>' + fmtPct.format(p.indicatori.pressioneFiscale) + '</td></tr>';
    }
    html += '</tbody></table></div>';
    html += '<p class="disclaimer">Non e\\' consulenza fiscale: verificare con un commercialista.</p>';
    viewConf.innerHTML = html;
  }

  // Grafico delle sole aliquote: mescolare euro e percentuali su un solo asse produrrebbe una
  // scala che non significa niente. Gli importi restano nella tabella sotto.
  function grafico(c) {
    var L = 46, R = 12, T = 12, B = 30, W = 720, H = 250;
    var w = W - L - R, h = H - T - B;
    var xMin = c.punti[0].ral, xMax = c.punti[c.punti.length - 1].ral;
    // Il pavimento dell'asse e' fissato: alle discontinuita' della norma la marginale effettiva
    // sprofonda di decine di punti, e lasciare che sia un solo valore a dettare la scala
    // schiaccerebbe in un angolo la fascia 20-70% dove sta tutta l'informazione. I punti che
    // escono dalla scala non vengono nascosti: la linea e' ritagliata e ognuno e' dichiarato in
    // chiaro sotto il grafico, col suo valore esatto.
    var PAVIMENTO = -0.2;
    var lo = 0, hi = 0.5, fuori = [];
    for (var i = 0; i < c.punti.length; i++) {
      lo = Math.min(lo, c.punti[i].aliquotaMarginaleEffettiva);
      hi = Math.max(hi, c.punti[i].aliquotaMarginaleEffettiva, c.punti[i].aliquotaMarginaleIrpef);
      if (c.punti[i].aliquotaMarginaleEffettiva < PAVIMENTO) { fuori.push(c.punti[i]); }
    }
    lo = Math.max(PAVIMENTO, Math.floor(lo * 10) / 10); hi = Math.ceil(hi * 10) / 10;
    var x = function (ral) { return L + (xMax > xMin ? (ral - xMin) / (xMax - xMin) : 0) * w; };
    var y = function (q) { return T + (1 - (Math.max(q, lo) - lo) / (hi - lo)) * h; };
    var linea = function (campo) {
      var d = '';
      for (var k = 0; k < c.punti.length; k++) {
        d += (k === 0 ? 'M' : 'L') + x(c.punti[k].ral).toFixed(1) + ' ' + y(c.punti[k][campo]).toFixed(1) + ' ';
      }
      return d;
    };

    var svg = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Aliquota marginale effettiva al variare della RAL">';
    for (var q = lo; q <= hi + 1e-9; q += 0.1) {
      var yy = y(q).toFixed(1);
      svg += '<line class="grid" x1="' + L + '" y1="' + yy + '" x2="' + (L + w) + '" y2="' + yy + '" />';
      svg += '<text class="axis" x="' + (L - 6) + '" y="' + (Number(yy) + 3) + '" text-anchor="end">' + Math.round(q * 100) + '%</text>';
    }
    var passoX = Math.max(1, Math.round(c.punti.length / 8));
    for (var t = 0; t < c.punti.length; t += passoX) {
      var xx = x(c.punti[t].ral).toFixed(1);
      svg += '<text class="axis" x="' + xx + '" y="' + (T + h + 18) + '" text-anchor="middle">' + Math.round(c.punti[t].ral / 1000) + 'k</text>';
    }
    svg += '<path class="l-irpef" d="' + linea('aliquotaMarginaleIrpef') + '" />';
    svg += '<path class="l-eff" d="' + linea('aliquotaMarginaleEffettiva') + '" />';
    svg += '</svg>';

    svg += '<div class="legend">';
    svg += '<div><span class="sw" style="background:var(--s-inps)"></span>Marginale effettiva</div>';
    svg += '<div><span class="sw" style="background:var(--s-irpef)"></span>Marginale IRPEF di legge</div>';
    svg += '</div>';
    if (fuori.length) {
      var voci = [];
      for (var f = 0; f < fuori.length; f++) {
        voci.push('a RAL ' + fmtEuro.format(fuori[f].ral) + ' vale ' + fmtPct.format(fuori[f].aliquotaMarginaleEffettiva));
      }
      svg += '<p class="sub">Fuori scala, dove la norma ha un gradino: ' + esc(voci.join('; ')) + '. La linea e\\' ritagliata al pavimento dell\\'asse, il valore resta nella tabella.</p>';
    }
    return svg;
  }

  function renderCurva(c) {
    var html = '<h2>Prelievo al variare della RAL - anno ' + esc(c.anno) + '</h2>';
    html += '<p class="sub">La marginale effettiva e\\' la quota trattenuta di ' + fmtEuro.format(c.passo) + ' lordi in piu\\', contati contributi, IRPEF, detrazioni, cuneo e addizionali. Dove supera la marginale IRPEF di legge, e\\' il cuneo che si sta spegnendo.</p>';
    html += grafico(c);
    html += '<div class="tab-wrap"><table><thead><tr><th>RAL</th><th>Netto annuo</th><th>Mensile (14)</th><th>Pressione</th><th>Marg. IRPEF</th><th>Marg. effettiva</th></tr></thead><tbody>';
    for (var i = 0; i < c.punti.length; i++) {
      var p = c.punti[i];
      html += '<tr><td>' + fmtEuro.format(p.ral) + '</td><td>' + fmtEuro.format(p.nettoAnnuo) + '</td><td>' + fmtEuro.format(p.nettoAnnuo / 14) + '</td><td>' + fmtPct.format(p.pressioneFiscale) + '</td><td>' + fmtPct.format(p.aliquotaMarginaleIrpef) + '</td><td>' + fmtPct.format(p.aliquotaMarginaleEffettiva) + '</td></tr>';
    }
    html += '</tbody></table></div>';
    html += '<p class="disclaimer">Non e\\' consulenza fiscale: verificare con un commercialista.</p>';
    viewCurva.innerHTML = html;
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
    fetch('/api/curva?anno=' + encodeURIComponent(anno))
      .then(function (r) { return r.json(); })
      .then(function (c) { if (c.errore) { viewCurva.innerHTML = '<p class="err">' + esc(c.errore) + '</p>'; } else { dati.curva = c; renderCurva(c); } })
      .catch(function () {});
  }

  var VISTE = { dettaglio: viewDett, confronto: viewConf, curva: viewCurva };
  var corrente = 'dettaglio';

  function mostra(quale) {
    corrente = quale;
    for (var nome in VISTE) {
      document.getElementById('tab-' + nome).setAttribute('aria-selected', nome === quale ? 'true' : 'false');
      VISTE[nome].classList.toggle('hidden', nome !== quale);
    }
  }

  // Scarico locale: il JSON e' gia' in memoria, si serializza in un Blob e non parte alcuna
  // richiesta verso l'esterno.
  function scarica() {
    var payload = corrente === 'curva' ? dati.curva : corrente === 'confronto' ? dati.confronto : dati.netto;
    if (!payload) { return; }
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'fiscal-toolkit-' + corrente + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  document.getElementById('tab-dettaglio').addEventListener('click', function () { mostra('dettaglio'); });
  document.getElementById('tab-confronto').addEventListener('click', function () { mostra('confronto'); });
  document.getElementById('tab-curva').addEventListener('click', function () { mostra('curva'); });
  document.getElementById('scarica').addEventListener('click', scarica);
  document.getElementById('stampa').addEventListener('click', function () { window.print(); });
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

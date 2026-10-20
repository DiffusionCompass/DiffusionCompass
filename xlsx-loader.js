/* =========================================================================
   SHARED XLSX LOADER
   ========================================================================= */

const BOOL_TRUE = new Set(["yes","true","1","✔","x","oui","vrai"]);
const WEBSITE_ID_ALIASES = ["website","link","url","github","repo","repository","site"];

function parseBool(v){
  if(v === null || v === undefined) return false;
  return BOOL_TRUE.has(String(v).trim().toLowerCase());
}
function parseList(v){
  if(!v) return [];
  return String(v).split(/[,;]/).map(s=>s.trim().toLowerCase()).filter(Boolean);
}
function parseNum(v, fallback){
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
}

const BOOL_FIELDS = ["gpu","parallel","polyvalent","resume","bids","gradientCheck","mppca","gibbs","b1","motion",
  "fieldmapless","htmlReport","containerized","tractography","dki","noddi","freewater","fodf","qcBoilerplate",
  "qcQuant","qcVisual","connectivity","filtering","atlasSupport","tractometry","wmAtlas","multiShell","cartesian","compressedSensing",
  "testRetest","signalDrift","tutorial","outlierDetection","wmSegmentationAging","lesionMaskHandling",
  "partialVolumeCorrection","agingAtlas","agingCohortValidation"];
const NUM_FIELDS = { modifiability:1, hpcLevel:1, activity:1 };

async function fetchSheetGrid(url){
  const res = await fetch(url, { cache: "no-store" });
  if(!res.ok) throw new Error(`File not found (${res.status}): ${url}`);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName = wb.SheetNames.includes("Pipelines") ? "Pipelines" : wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if(!rows.length) throw new Error("'Pipelines' sheet is empty.");

  const header = rows[0];
  const pipelineCols = [];
  for(let c = 2; c < header.length; c++){
    const name = String(header[c] || "").trim();
    if(name) pipelineCols.push({ name, col: c });
  }
  if(!pipelineCols.length) throw new Error("No pipeline column detected on row 1 (starting from column C).");

  const byId = {};
  const dataRows = [];
  for(let r = 1; r < rows.length; r++){
    const id    = String(rows[r][0] || "").trim();
    const label = String(rows[r][1] || "").trim();
    if(!id) continue;
    // Col B (label) empty => section header row
    const isSection = label === "";
    if(!isSection) byId[id.toLowerCase()] = rows[r];
    dataRows.push({ id, label, row: rows[r], isSection });
  }

  return { pipelineCols, dataRows, byId };
}

function findWebsiteValue(byId, col){
  for(const alias of WEBSITE_ID_ALIASES){
    if(byId[alias]) return String(byId[alias][col] || "").trim();
  }
  return "";
}

/* Returns an array of parsed pipeline objects — signature inchangée */
async function loadPipelinesFromXlsx(url){
  const { pipelineCols, dataRows, byId } = await fetchSheetGrid(url);
  const knownIds = new Set(["desc","interface","scalability", ...BOOL_FIELDS, ...Object.keys(NUM_FIELDS), ...WEBSITE_ID_ALIASES]);

  return pipelineCols.map(({name, col})=>{
    const get = (id)=> {
      const row = byId[String(id).toLowerCase()];
      return row ? row[col] : "";
    };
    const p = { id: name.toLowerCase().replace(/[^a-z0-9]+/g,"-"), name };
    p.desc = String(get("desc") || "").trim();
    p.interface = String(get("interface") || "").trim().toLowerCase();
    p.scalability = parseList(get("scalability"));
    p.website = findWebsiteValue(byId, col);
    for(const [field, fallback] of Object.entries(NUM_FIELDS)){
      p[field] = parseNum(get(field), fallback);
    }
    for(const field of BOOL_FIELDS){
      p[field] = parseBool(get(field));
    }
    dataRows.forEach(({id, isSection})=>{
      if(!isSection && !knownIds.has(id)) p[id] = String(get(id) || "").trim();
    });
    return p;
  });
}

/* Returns the full grid for criteria.html */
async function loadCriteriaGrid(url){
  const { pipelineCols, dataRows } = await fetchSheetGrid(url);
  const pipelineNames = pipelineCols.map(p => p.name);
  const rows = dataRows.map(({id, label, row, isSection})=>({
    id, label: label || id, isSection,
    values: pipelineCols.map(({col}) => String(row[col] ?? "").trim()),
  }));
  return { pipelineNames, rows };
}

/* Returns a dynamic field list for suggest-pipeline.html, built straight
   from a category's own Excel file (no hardcoded field list): for every
   non-section data row, infers "bool" / "number" / "list" / "text" from
   the values already entered for existing pipelines, and groups fields
   under the section header they fall under. */
async function loadCriteriaSchema(url){
  const { pipelineCols, dataRows } = await fetchSheetGrid(url);
  const boolFalse = new Set(["no","false","0","✘","non","faux"]);
  const SKIP_IDS = new Set(["desc", ...WEBSITE_ID_ALIASES]);

  const fields = [];
  let currentSection = "General";

  dataRows.forEach(({ id, label, row, isSection })=>{
    if(isSection){
      currentSection = id.replace(/_/g, " ");
      return;
    }
    if(SKIP_IDS.has(id.toLowerCase())) return;

    const values = pipelineCols
      .map(({col}) => String(row[col] ?? "").trim())
      .filter(Boolean);

    const lower = values.map(v => v.toLowerCase());
    let type = "text";
    let options = null;

    if(lower.length && lower.every(v => BOOL_TRUE.has(v) || boolFalse.has(v))){
      type = "bool";
    } else if(lower.length && lower.every(v => v !== "" && isFinite(parseFloat(v)) && /^-?\d+(\.\d+)?$/.test(v))){
      type = "number";
    } else if(
      lower.some(v => v.includes(",") || v.includes(";")) &&
      !lower.some(v => /^(yes|no|true|false)\b[\s,:;-]/.test(v)) &&
      lower.every(v => v.split(/[,;]/).every(t => { t = t.trim(); return t.length > 0 && t.length <= 24; }))
    ){
      type = "list";
      const tokenSet = new Set();
      lower.forEach(v => v.split(/[,;]/).forEach(t=>{ t = t.trim(); if(t) tokenSet.add(t); }));
      options = Array.from(tokenSet).sort();
    }

    fields.push({
      id,
      label: label || id,
      section: currentSection,
      type,
      options,
      example: values[0] || "",
    });
  });

  return fields; 
}

/* Libellés lisibles pour les critères notés sur une échelle numérique.
   Les valeurs numériques restent utilisées pour le scoring ; seul l'affichage change.
   Les clés sont les ids de lignes du tableur, en minuscules. */
const SCALE_LABELS = {
  modifiability:      { 1: "Poor", 2: "Basic", 3: "Good" },
  hpclevel:           { 1: "Supported", 2: "Optimized" },
  activity:           { 1: "Inactive", 2: "Slow", 3: "Active", 4: "Very active" },
  documentation:      { 1: "Poor", 2: "Basic", 3: "Good", 4: "Excellent" },
  documentationlevel: { 1: "Poor", 2: "Basic", 3: "Good", 4: "Excellent" },
};

/* Renvoie la table de libellés d'un critère, ou null s'il n'a pas d'échelle. */
function getScaleLabels(id){
  return SCALE_LABELS[String(id || "").toLowerCase()] || null;
}

/* Convertit une valeur brute ("3") en libellé ("Good"). Sinon renvoie la valeur inchangée. */
function scaleLabel(id, raw){
  const labels = getScaleLabels(id);
  if(!labels) return null;
  const n = parseInt(String(raw).trim(), 10);
  return labels[n] || null;
}

/* =========================================================================
   CRITERIA HELP (descriptions + level details from sheet 2)
   ========================================================================= */

/* Returns { idLowercase: { text, levels: {1:"...",2:"..."} } } */
const DESC_SHEET_NAMES = ["legend","descriptions","description","help"];

async function loadCriteriaDescriptions(url){
  const map = {};
  try{
    const res = await fetch(url, { cache: "no-store" });
    if(!res.ok) return map;
    const wb = XLSX.read(await res.arrayBuffer(), { type: "array" });
    let name = wb.SheetNames.find(n => DESC_SHEET_NAMES.includes(n.trim().toLowerCase()));
    if(!name && wb.SheetNames.length > 1) name = wb.SheetNames[1];
    if(!name) return map;

    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: "" });
    if(!rows.length) return map;

    const header  = rows[0].map(h => String(h).trim().toLowerCase());
    let idCol     = header.findIndex(h => h.startsWith("criterion_id") || h === "id");
    if(idCol < 0) idCol = 0;
    const descCol = header.indexOf("description");
    const fmtCol  = header.findIndex(h => h.startsWith("format"));
    const typeCol = header.findIndex(h => h.startsWith("expected type"));

    for(let r = 1; r < rows.length; r++){
      const id = String(rows[r][idCol] || "").trim().toLowerCase();
      if(!id) continue;
      const text = descCol >= 0 ? String(rows[r][descCol] || "").trim() : "";

      // paliers : "1=low, 2=medium, 3=high" (uniquement pour les types "number")
      const levels = {};
      const levelNames = {};
      const type = typeCol >= 0 ? String(rows[r][typeCol] || "").toLowerCase() : "";
      const fmt  = fmtCol  >= 0 ? String(rows[r][fmtCol]  || "") : "";
      if(type.startsWith("number")){
        // coupe sur , ; | seulement si ce qui suit ressemble à "clé="
        const chunks = fmt.split(/\s*[,;|]\s*(?=[A-Za-z0-9][A-Za-z0-9 \-]{0,20}\s*=)/);
        chunks.forEach((chunk, i) => {
          const m = chunk.match(/^\s*([^=]+?)\s*=\s*([\s\S]+?)\s*$/);
          if(!m) return;
          const key = m[1].trim();
          const n = /^\d+$/.test(key) ? parseInt(key, 10) : i + 1;
          levels[n] = m[2].trim();
          if(!/^\d+$/.test(key)) levelNames[n] = key;
        });
      }

      if(text || Object.keys(levels).length) map[id] = { text, levels, levelNames };
    }
  }catch(e){ console.warn("loadCriteriaDescriptions:", e); }
  return map;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function hasHelp(id){
  return !!window.CRITERIA_HELP[String(id || "").toLowerCase()];
}

/* Wraps a criterion label so it can show the tooltip. */
function helpLabel(id, label){
  const cls = hasHelp(id) ? "help-target has-help" : "help-target";
  return `<span class="${cls}" data-help-id="${escapeHtml(id)}" tabindex="0">${label}</span>`;
}

function buildHelpHtml(id){
  const h = window.CRITERIA_HELP[String(id || "").toLowerCase()];
  if(!h) return "";
  let html = h.text ? `<div class="help-text">${escapeHtml(h.text)}</div>` : "";
  const nums = Object.keys(h.levels).map(Number).sort((a,b)=>a-b);
  if(nums.length){
    const labels = getScaleLabels(id) || {};
    html += '<ul class="help-levels">';
    nums.forEach(n => {
      const name = (h.levelNames && h.levelNames[n]) || labels[n] || String(n);
      const title = name.charAt(0).toUpperCase() + name.slice(1);
      html += `<li><b>${escapeHtml(title)}</b> : ${escapeHtml(h.levels[n])}</li>`;
    });
    html += '</ul>';
  }
  return html;
}

/* One floating tooltip shared by the whole page. Call once. */
function initHelpTooltips(){
  if(document.getElementById("helpTip")) return;
  const tip = document.createElement("div");
  tip.id = "helpTip";
  tip.className = "help-tip";
  document.body.appendChild(tip);

  function show(el){
    const html = buildHelpHtml(el.dataset.helpId);
    if(!html){ tip.style.display = "none"; return; }
    tip.innerHTML = html;
    tip.style.display = "block";
    const r = el.getBoundingClientRect();
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let left = Math.min(Math.max(8, r.left), window.innerWidth - tw - 8);
    let top = r.bottom + 8;
    if(top + th > window.innerHeight - 8) top = Math.max(8, r.top - th - 8);
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }
  function hide(){ tip.style.display = "none"; }

  document.addEventListener("mouseover", e => {
    const el = e.target.closest && e.target.closest("[data-help-id]");
    if(el) show(el);
  });
  document.addEventListener("mouseout", e => {
    if(e.target.closest && e.target.closest("[data-help-id]")) hide();
  });
  document.addEventListener("focusin", e => {
    const el = e.target.closest && e.target.closest("[data-help-id]");
    if(el) show(el);
  });
  document.addEventListener("focusout", hide);
  window.addEventListener("scroll", hide, true);
}
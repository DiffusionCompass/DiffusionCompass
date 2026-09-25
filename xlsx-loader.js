/* =========================================================================
   SHARED XLSX LOADER — used by engine.js (the quiz) and by pipelines.html /
   criteria.html (the read-only detail views).

   EXCEL FILE FORMAT expected in the "Pipelines" sheet:
   - Col A: criterion_id   (technical key, e.g. multiShell, interface, activity...)
   - Col B: criterion_label (human-readable label, shown in the criteria table)
   - Col C, D, E...: one column per pipeline, header = pipeline name
   Accepted boolean values: yes/no, true/false, 1/0, ✔/✘, x
   ========================================================================= */

const BOOL_TRUE = new Set(["yes","true","1","✔","x","oui","vrai"]);
const BOOL_FALSE = new Set(["no","false","0","✘","non","faux"]);
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
  "qcQuant","qcVisual","connectivity","biasCorrection","tractometry","multiShell","cartesian","compressedSensing",
  "testRetest","signalDrift","tutorial","outlierDetection","wmSegmentationAging","lesionMaskHandling",
  "partialVolumeCorrection","agingAtlas","agingCohortValidation"];
const NUM_FIELDS = { modifiability:1, hpcLevel:1, activity:1 };

/* Fetches + parses the sheet's raw grid. Returns { header, rows, byId } where
   byId maps a lowercase criterion_id to its full row array (including label). */
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
    const id = String(rows[r][0] || "").trim();
    const label = String(rows[r][1] || "").trim();
    if(!id) continue;
    byId[id.toLowerCase()] = rows[r];
    dataRows.push({ id, label, row: rows[r] });
  }

  return { pipelineCols, dataRows, byId };
}

function findWebsiteValue(byId, col){
  for(const alias of WEBSITE_ID_ALIASES){
    if(byId[alias]) return String(byId[alias][col] || "").trim();
  }
  return "";
}

/* Returns an array of parsed pipeline objects (used by the quiz engine). */
async function loadPipelinesFromXlsx(url){
  const { pipelineCols, dataRows, byId } = await fetchSheetGrid(url);
  const knownIds = new Set(["desc","interface","scalability", ...BOOL_FIELDS, ...Object.keys(NUM_FIELDS), ...WEBSITE_ID_ALIASES]);

  return pipelineCols.map(({name, col})=>{
    const get = (id)=> (byId[id] ? byId[id][col] : "");
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
    dataRows.forEach(({id})=>{
      if(!knownIds.has(id)) p[id] = String(get(id) || "").trim();
    });
    return p;
  });
}

/* Returns the full grid for display purposes (criteria.html):
   { pipelineNames: [...], rows: [{ id, label, values: [...] }] } */
async function loadCriteriaGrid(url){
  const { pipelineCols, dataRows } = await fetchSheetGrid(url);
  const pipelineNames = pipelineCols.map(p => p.name);
  const rows = dataRows.map(({id, label, row})=>({
    id, label: label || id,
    values: pipelineCols.map(({col}) => String(row[col] ?? "").trim()),
  }));
  return { pipelineNames, rows };
}

/* =========================================================================
   DYNAMIC FORM SCHEMA — used by suggest-pipeline.html to build a submission
   form straight from a category's own Excel file, so each category's form
   always matches its own comparison table (no hardcoded field list).

   For every criterion row (excluding "desc" and any website/link alias,
   which already have their own dedicated form fields) we look at the values
   already entered for existing pipelines in that column and infer a field
   type:
     - "bool"   every non-empty sample is a yes/no-style token  -> checkbox
     - "number" every non-empty sample parses as a number       -> number input
     - "list"   some sample contains a comma/semicolon          -> checkbox
                                                                     group, options = union of tokens seen
     - "text"   anything else (free text)                       -> text input

   Rows whose id is a section divider (no label AND no data in any pipeline
   column, e.g. "GENERAL", "RAW DATA"...) are not turned into fields; instead
   they start a new named section that subsequent fields are grouped under.

   Returns: [{ id, label, section, type, options, example }, ...]
   ========================================================================= */
async function loadCriteriaSchema(url){
  const { pipelineCols, dataRows } = await fetchSheetGrid(url);
  const SKIP_IDS = new Set(["desc", ...WEBSITE_ID_ALIASES]);

  const fields = [];
  let currentSection = "General";

  dataRows.forEach(({ id, label, row })=>{
    if(SKIP_IDS.has(id.toLowerCase())) return;

    const values = pipelineCols
      .map(({col}) => String(row[col] ?? "").trim())
      .filter(Boolean);

    // Section divider row: has an id but no label and no data anywhere.
    if(!label && values.length === 0){
      currentSection = id.replace(/_/g, " ");
      return;
    }

    const lower = values.map(v => v.toLowerCase());
    let type = "text";
    let options = null;

    if(lower.length && lower.every(v => BOOL_TRUE.has(v) || BOOL_FALSE.has(v))){
      type = "bool";
    } else if(lower.length && lower.every(v => v !== "" && isFinite(parseFloat(v)) && /^-?\d+(\.\d+)?$/.test(v))){
      type = "number";
    } else if(
      // Looks like a short tag list (e.g. "local,hpc"), NOT a boolean-plus-
      // detail free-text answer (e.g. "yes, N4/MICO", "no - Patch2self
      // instead") or a long descriptive sentence.
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
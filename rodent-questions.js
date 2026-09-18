/* Rodent — quiz questions. Loaded by rodent.html (the quiz) and by
   questions.html?cat=rodent (the read-only summary page).
   Each option may have: filter (blocking constraint), score (preference
   points), note (plain-language explanation shown on the summary page). */
window.QUESTIONS = [
  { id:"species", eyebrow:"Species", type:"single",
    title:"Which species are your data from?",
    options:[
      { label:"Mouse", score:p=>String(p.speciesSupport||"").toLowerCase().includes("mouse") ? 4 : 0,
        note:"+4 pts if the pipeline mentions mouse in its species support." },
      { label:"Rat", score:p=>String(p.speciesSupport||"").toLowerCase().includes("rat") ? 4 : 0,
        note:"+4 pts if the pipeline mentions rat in its species support." },
      { label:"Both mouse and rat", score:p=>{
          const s = String(p.speciesSupport||"").toLowerCase();
          return (s.includes("mouse")?4:0) + (s.includes("rat")?4:0);
        },
        note:"+4 pts for mouse support, +4 pts for rat support." },
      { label:"Other species", score:null,
        note:"No points awarded — check pipeline documentation manually." },
    ]},

  { id:"acq", eyebrow:"Raw data", type:"single",
    title:"What type of acquisition are your data?",
    options:[
      { label:"In vivo only", filter:p=>String(p.inVivo||"").toLowerCase().startsWith("yes"),
        note:"Blocking filter: keeps only pipelines that support in vivo acquisitions." },
      { label:"Ex vivo only", filter:p=>String(p.exVivo||"").toLowerCase().startsWith("yes"),
        note:"Blocking filter: keeps only pipelines that support ex vivo acquisitions." },
      { label:"Both in vivo and ex vivo",
        filter:p=>String(p.inVivo||"").toLowerCase().startsWith("yes") && String(p.exVivo||"").toLowerCase().startsWith("yes"),
        note:"Blocking filter: keeps only pipelines that support both acquisition types." },
      { label:"Not sure", filter:null, note:"No constraint applied." },
    ]},

  { id:"inputData", eyebrow:"Input format", type:"single",
    title:"What is your raw data format?",
    options:[
      { label:"NIfTI", score:p=>String(p.inputData||"").toLowerCase().includes("nifti") ? 4 : 0,
        note:"+4 pts if the pipeline accepts NIfTI input." },
      { label:"Bruker", score:p=>String(p.inputData||"").toLowerCase().includes("bruker") ? 4 : 0,
        note:"+4 pts if the pipeline accepts Bruker input." },
      { label:"DICOM", score:p=>String(p.inputData||"").toLowerCase().includes("dicom") ? 4 : 0,
        note:"+4 pts if the pipeline accepts DICOM input." },
      { label:"Doesn't matter", score:null, note:"No points awarded." },
    ]},

  { id:"atlas", eyebrow:"Reference space", type:"single",
    title:"Which reference atlas do you need support for?",
    options:[
      { label:"Allen Mouse Brain Atlas", score:p=>String(p.atlasSupport||"").toLowerCase().includes("allen") ? 5 : 0,
        note:"+5 pts if the pipeline mentions the Allen Mouse Brain Atlas." },
      { label:"Waxholm Space atlas", score:p=>String(p.atlasSupport||"").toLowerCase().includes("waxholm") ? 5 : 0,
        note:"+5 pts if the pipeline mentions Waxholm Space." },
      { label:"Flexible / custom atlas", score:p=>String(p.atlasSupport||"").toLowerCase().includes("flexible") ? 3 : 0,
        note:"+3 pts if the pipeline supports flexible or custom atlases." },
      { label:"Not sure / no specific atlas", score:null, note:"No points awarded." },
    ]},

  { id:"tracto", eyebrow:"Analysis goal", type:"single",
    title:"Do you need to run tractography?",
    options:[
      { label:"Yes, in vivo tractography", filter:p=>String(p.inVivoTractography||"").toLowerCase().startsWith("yes"),
        note:"Blocking filter: keeps only pipelines with in vivo tractography." },
      { label:"Yes, any tractography", filter:p=>String(p.tractography||"").toLowerCase().startsWith("yes"),
        note:"Blocking filter: keeps only pipelines that include a tractography step." },
      { label:"No, preprocessing only", filter:null, note:"No constraint applied." },
      { label:"Not sure yet", filter:null, note:"No constraint applied." },
    ]},

  { id:"connectomics", eyebrow:"Connectomics", type:"multi",
    title:"Do you need connectomics or bundle-level analyses?",
    options:[
      { label:"Structural connectivity matrix", score:p=>String(p.connectivity||"").toLowerCase()==="yes" ? 4 : 0,
        note:"+4 pts if the pipeline supports structural connectivity." },
      { label:"Bundle / tract extraction", score:p=>String(p.BundleExtraction||"").toLowerCase().startsWith("yes") ? 4 : 0,
        note:"+4 pts if the pipeline supports bundle extraction." },
      { label:"No, I don't need connectomics", score:null, note:"No points awarded." },
    ]},

  { id:"compute", eyebrow:"Environment", type:"single",
    title:"What compute environment do you have access to?",
    options:[
      { label:"My own computer only (local)", score:p=>p.scalability.includes("local") ? 3 : 0,
        note:"+3 pts if the pipeline supports local execution." },
      { label:"HPC cluster (Slurm / SGE / PBS)", score:p=>(p.scalability.includes("hpc")?3:0)+(p.hpcLevel===2?3:0),
        note:"+3 pts if HPC is supported, +3 more if HPC readiness is rated optimized." },
      { label:"Cloud or web platform", score:p=>p.scalability.includes("cloud") ? 5 : 0,
        note:"+5 pts if the pipeline supports cloud or web execution." },
      { label:"Doesn't matter", score:null, note:"No points awarded." },
    ]},

  { id:"advanced", eyebrow:"Advanced needs", type:"multi",
    title:"Do you need any specific advanced methods?",
    options:[
      { label:"fODF / CSD reconstruction", score:p=>String(p.fodf||"").toLowerCase().startsWith("yes") ? 5 : 0,
        note:"+5 pts if the pipeline supports fODF / CSD reconstruction." },
      { label:"Advanced quantitative QC", score:p=>(String(p.qcQuant||"").toLowerCase()==="yes"?3:0)+(String(p.qcVisual||"").toLowerCase().startsWith("yes")?2:0),
        note:"+3 pts for quantitative QC metrics, +2 for visual QC." },
      { label:"Nothing specific", score:null, note:"No points awarded." },
    ]},

  { id:"maintenance", eyebrow:"Longevity", type:"single",
    title:"Does the pipeline need to be actively maintained long-term?",
    options:[
      { label:"Yes, that's important to me", score:p=>p.activity * 2,
        note:"+2 pts per activity level (1-4)." },
      { label:"Doesn't matter", score:null, note:"No points awarded." },
    ]},
];
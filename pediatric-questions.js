/* Pediatric human — quiz questions. Loaded by pediatric.html (the quiz) and
   by questions.html?cat=pediatric (the read-only summary page).
   Each option may have: filter (blocking constraint), score (preference
   points), note (plain-language explanation shown on the summary page). */
window.QUESTIONS = [
  { id:"age", eyebrow:"Cohort", type:"single",
    title:"What age range best matches your cohort?",
    options:[
      { label:"Neonates / infants (0–2 years)", score:p=>(String(p.ageRange||"").toLowerCase().includes("neonat")||String(p.ageRange||"").toLowerCase().includes("infant")) ? 4 : 0,
        note:"+4 pts if the pipeline's ageRange field mentions neonates or infants." },
      { label:"Children (3–12 years)", score:p=>String(p.ageRange||"").toLowerCase().includes("child") ? 4 : 0,
        note:"+4 pts if the pipeline's ageRange field mentions children." },
      { label:"Adolescents (13–17 years)", score:p=>String(p.ageRange||"").toLowerCase().includes("adolescent") ? 4 : 0,
        note:"+4 pts if the pipeline's ageRange field mentions adolescents." },
      { label:"Not sure / spans multiple ranges", score:null, note:"No points awarded — this question is skipped in scoring." },
    ]
  },
  { id: "bids", eyebrow: "BIDS",
    type: "single", title: "How is your data organized?",
    options: [
      { label: "BIDS", filter: p => p.bids === true, note: "Blocking filter: keeps only pipelines that explicitly support BIDS datasets." },  
      { label: "NIfTI files, but not BIDS", filter: null, note: "No BIDS constraint applied." },
      { label: "Not sure", filter: null, note: "No constraint applied." }
    ]
  },
  { id: "dataSize", eyebrow: "Data size", type: "single",
    title: "How many subjects are in your dataset?",
    options: [
      { label: "Small — a few subjects (1-10)",
        score: p => p.scalability?.includes("local") ? 2 : 0,
        note: "+2 for pipelines supporting convenient local execution." },
      { label: "Medium — tens of subjects (11-100)",
        score: p => p.scalability?.includes("local") || p.scalability?.includes("hpc") ? 2 : 0,
        note: "+2 pts for pipelines suitable for local or HPC execution." },
      { label: "Large — hundreds or thousands of subjects (101+)",
        score: p => p.scalability?.includes("hpc") || p.scalability?.includes("cloud") ? 3 : 0,
        note: "+3 for HPC or cloud scalability." },
      { label: "Not sure", score: null, note: "No points awarded — this question is skipped in scoring." }
    ]
  },
  { id:"acq", eyebrow:"Acquisition", type:"single",
    title:"What type of acquisition are your data?",
    options:[
      { label:"Single shell only", filter:null, note:"No constraint — all compared pipelines support single-shell data." },
      { label:"Multi-shell (multiple b-values)", filter:p=>p.multiShell===true,
        note:"Blocking filter: keeps only pipelines that explicitly support multi-shell acquisitions." },
      { label:"Compressed sensing / non-Cartesian acquisition", filter:p=>p.compressedSensing===true,
        note:"Blocking filter: keeps only pipelines that support compressed-sensing / non-Cartesian sampling." },
      { label:"Not sure", filter:null, note:"No constraint applied." },
    ]
  },
  { id:"tracto", eyebrow:"Analysis goal", type:"single",
    title:"What type of analysis do you want to perform for your research question?",
    options:[
      { label:"Tractography", filter:p=>p.tractography===true,
        note:"Blocking filter: keeps only pipelines that include a tractography step." },
      { label: "Connectomics", filter:p=>p.connectivity===true,
        note:"Blocking filter: keeps only pipelines that include a connectomics step." },
      { label: "White matter bundles analysis", filter:p=>p.tractometry===true,
        note:"Blocking filter: keeps only pipelines that include a white matter bundles analysis step." },
      { label:"Preprocessing-only", filter:null, note:"No constraint applied." },
      { label:"I'm not sure / interested in everything", filter:null, note:"No constraint applied." },
    ]
  },
  { id:"advanced", eyebrow:"Advanced needs", type:"multi",
    title:"Do you need any specific advanced models or analyses?",
    options:[
      { label:"Advanced models (NODDI, DKI, free-water)", score:p=>(p.noddi?3:0)+(p.dki?3:0)+(p.freewater?3:0),
        note:"+3 pts each for NODDI, DKI, and free-water elimination support." },
      { label:"fODF reconstruction / advanced tractography (CSD)", score:p=>p.fodf ? 4 : 0,
        note:"+4 pts if the pipeline supports fODF / CSD reconstruction." },
      { label:"False-positive filtering (SIFT/COMMIT)", score:p=>(p.filtering?3:0),
        note:"+3 for false-positive filtering" },
      { label:"Multiple cortical/subcortical atlas support", score:p=>(p.atlasSupport?3:0),
        note:"+3 for multiple cortical/subcortical atlas support" },
      { label:"Age-specific white matter atlas (for WM bundle segmentation)", score:p=>(p.wmAtlas?3:0),
        note:"+3 for age-specific white matter atlas support" },
      { label:"Detailed QC (reports, visualizations, outlier detection, etc.)", score:p=>(p.qcOutlier?2:0)+(p.qcQuant?2:0)+(p.qcBoilerplate?2:0)+(p.qcVisual?2:0)+(p.htmlReport?1:0),
        note:"+2 for quantitative QC metrics, +2 for automated QC boilerplate, +2 for visual QC, +1 for an HTML report." },
      { label:"I'm not sure / interested in everything", score:null, note:"No points awarded — this option is skipped in scoring." },
    ]
  },
  { id:"custom", eyebrow:"Customization", type:"single",
    title:"How important is it to be able to modify the pipeline's parameters?",
    options:[
      { label:"Very important", score:p=>p.modifiability * 2 + (p.polyvalent?2:0),
        note:"+2 per modifiability level (1-3), +2 more if the pipeline is versatile/multi-software." },
      { label:"Moderate", score:p=>p.modifiability,
        note:"+1 pt per modifiability level (1-3)." },
      { label:"Not important", score:p=>(3-p.modifiability),
        note:"Rewards low modifiability (inverse score)" },
    ]
  },
  { id:"software", eyebrow:"Software", type:"single",
    title:"Would you prefer to use containerized pipelines?",
    options:[
      { label:"Yes", score:p=>p.containerized ? 3 : 0,
        note:"+3 for containerized pipelines" },
      { label:"No", score:null,
        note:"No containerization preference is scored." },
    ]
  },
  { id:"gpu", eyebrow:"GPU", type:"single",
    title:"Do you have access to a GPU?",
    options:[
      { label:"Yes", score:p=>p.gpu ? 3 : 0,
        note:"+3 for GPU acceleration" },
      { label:"No", score:null,
        note:"No GPU preference is scored." },
    ]
  },
  { id:"resume", eyebrow:"Resume on error", type:"single",
    title:"How important is it for the pipeline to resume on error? (e.g. if the pipeline fails, it should be able to resume from where it left off)",
    options:[
      { label:"Very important", score:p=>p.resume ? 3 : 0,
        note:"+3 if resume on error support is available." },
      { label:"Moderate", score:p=>p.resume ? 1 : 0,
        note:"+1 if resume on error support is available." },
      { label:"Not important", score:null,
        note:"No points awarded — this question is skipped in scoring." },
    ]},
  { id:"compute", eyebrow:"Environment", type:"single",
    title:"What compute environment do you have access to?",
    options:[
      { label:"My own computer only (local)", score:p=>p.scalability.includes("local") ? 3 : 0,
        note:"+3 if the pipeline's scalability options include local execution." },
      { label:"HPC cluster (Slurm / SGE / PBS)", score:p=>(p.scalability.includes("hpc")?2:0) + (p.hpcLevel===2?2:0),
        note:"+2 if HPC is supported, +2 more if HPC readiness is rated 'optimized/recommended'." },
      { label:"Cloud (AWS/GCP/Azure) or a web platform", score:p=>p.scalability.includes("cloud") ? 4 : 0,
        note:"+4 if the pipeline supports cloud execution." },
      { label:"I don't have a preference", score:null, note:"No points awarded — this question is skipped in scoring." },
    ]
  },
  { id:"interface", eyebrow:"Day-to-day use", type:"single",
    title:"What kind of interface do you prefer to work with?",
    options:[
      { label:"Terminal / command line, no problem", score:p=>p.interface==="terminal" ? 3 : 0,
        note:"+3 if the pipeline's interface is 'terminal'." },
      { label:"A graphical interface or a web platform", score:p=>(p.interface==="gui"||p.interface==="gui+terminal"||p.interface==="web") ? 3 : 0,
        note:"+3 if the interface is 'gui', 'gui+terminal', or 'web'." },
      { label:"Doesn't matter", score:null, note:"No points awarded — this question is skipped in scoring." },
    ]
  },
  { id:"maintenance", eyebrow:"Longevity", type:"single",
    title:"How important is it for the pipeline to be actively maintained?",
    options:[
      { label:"Very important", score:p=>p.activity * 2,
        note:"+2 per activity level (1-4)." },
      { label:"Moderate", score:p=>p.activity,
        note:"+1 per activity level (1-4)." },
      { label:"Not important", score:null,
        note:"No points awarded — this question is skipped in scoring." },
    ]
  },
];

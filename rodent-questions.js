/* Rodent — quiz questions.
   Loaded by rodent.html and questions.html?cat=rodent.

   Each option may have:
   - filter: blocking constraint
   - score: preference points
   - note: explanation shown on the summary page
*/

window.QUESTIONS = [

  // 1. Species
  {
    id:"species",
    eyebrow:"Species",
    type:"single",
    title:"Which species are your data from?",
    options:[
      {
        label:"Mouse",
        score:p=>String(p.speciesSupport||"").toLowerCase().includes("mouse") ? 4 : 0,
        note:"+4 pts if mouse is explicitly supported."
      },
      {
        label:"Rat",
        score:p=>String(p.speciesSupport||"").toLowerCase().includes("rat") ? 4 : 0,
        note:"+4 pts if rat is explicitly supported."
      },
      {
        label:"Mouse and rat",
        score:p=>{
          const s = String(p.speciesSupport||"").toLowerCase();
          return (s.includes("mouse") ? 4 : 0) +
                 (s.includes("rat") ? 4 : 0);
        },
        note:"+4 pts for mouse support and +4 pts for rat support."
      },
      {
        label:"Other / flexible species",
        score:p=>{
          const s = String(p.speciesSupport||"").toLowerCase();
          return (
            s.includes("flexible") ||
            s.includes("small mammal") ||
            s.includes("rodent") ||
            s.includes("other")
          ) ? 3 : 0;
        },
        note:"+3 pts if broader or flexible species support is documented."
      }
    ]
  },

  // 2. Acquisition
  {
    id:"acq",
    eyebrow:"Acquisition",
    type:"single",
    title:"Are your data acquired in vivo or ex vivo?",
    options:[
      {
        label:"In vivo",
        filter:p=>String(p.inVivo||"").toLowerCase().startsWith("yes"),
        note:"Keeps pipelines supporting in vivo data."
      },
      {
        label:"Ex vivo",
        filter:p=>String(p.exVivo||"").toLowerCase().startsWith("yes"),
        note:"Keeps pipelines supporting ex vivo data."
      },
      {
        label:"Both",
        filter:p=>
          String(p.inVivo||"").toLowerCase().startsWith("yes") &&
          String(p.exVivo||"").toLowerCase().startsWith("yes"),
        note:"Keeps pipelines supporting both acquisition types."
      },
      {
        label:"No preference",
        filter:null,
        note:"No constraint applied."
      }
    ]
  },

  // 3. Input format
  {
    id:"inputData",
    eyebrow:"Input",
    type:"single",
    title:"What input format do you need?",
    options:[
      {
        label:"NIfTI",
        score:p=>String(p.inputData||"").toLowerCase().includes("nifti") ? 4 : 0,
        note:"+4 pts if NIfTI input is supported."
      },
      {
        label:"Bruker",
        score:p=>String(p.inputData||"").toLowerCase().includes("bruker") ? 4 : 0,
        note:"+4 pts if Bruker data are supported."
      },
      {
        label:"DICOM",
        score:p=>String(p.inputData||"").toLowerCase().includes("dicom") ? 4 : 0,
        note:"+4 pts if DICOM input is supported."
      },
      {
        label:"BIDS",
        score:p=>String(p.bids||"").toLowerCase().startsWith("yes") ? 4 : 0,
        note:"+4 pts if BIDS is supported."
      },
      {
        label:"No preference",
        score:null,
        note:"No points awarded."
      }
    ]
  },

  // 4. Preprocessing
  {
    id:"preprocessing",
    eyebrow:"Preprocessing",
    type:"multi",
    title:"Which preprocessing features do you need?",
    options:[
      {
        label:"Denoising",
        score:p=>String(p.mppca||"").toLowerCase().startsWith("yes") ? 3 : 0,
        note:"+3 pts if MP-PCA denoising is available."
      },
      {
        label:"Bias-field correction",
        score:p=>String(p.b1||"").toLowerCase().startsWith("yes") ? 3 : 0,
        note:"+3 pts if bias-field correction is available."
      },
      {
        label:"Motion correction",
        score:p=>String(p.motion||"").toLowerCase().startsWith("yes") ? 3 : 0,
        note:"+3 pts if motion correction is available."
      },
      {
        label:"No specific requirement",
        score:null,
        note:"No points awarded."
      }
    ]
  },

  // 5. Diffusion model
  {
    id:"diffusionModel",
    eyebrow:"Diffusion model",
    type:"multi",
    title:"Which diffusion models do you need?",
    options:[
      {
        label:"DTI",
        score:p=>String(p.dti||"").toLowerCase().startsWith("yes") ? 3 : 0,
        note:"+3 pts if DTI modelling is supported."
      },
      {
        label:"Q-ball / GQI",
        score:p=>String(p.qballGqui||"").toLowerCase().startsWith("yes") ? 4 : 0,
        note:"+4 pts if Q-ball or GQI reconstruction is supported."
      },
      {
        label:"fODF / CSD",
        score:p=>String(p.fodf||"").toLowerCase().startsWith("yes") ? 5 : 0,
        note:"+5 pts if fODF / CSD reconstruction is supported."
      },
      {
        label:"No specific model",
        score:null,
        note:"No points awarded."
      }
    ]
  },

  // 6. Tractography
  {
    id:"tracto",
    eyebrow:"Tractography",
    type:"single",
    title:"Do you need tractography?",
    options:[
      {
        label:"Yes, including in vivo",
        filter:p=>String(p.inVivoTractography||"").toLowerCase().startsWith("yes"),
        note:"Keeps pipelines supporting in vivo tractography."
      },
      {
        label:"Yes, any tractography",
        filter:p=>String(p.tractography||"").toLowerCase().startsWith("yes"),
        note:"Keeps pipelines with a tractography step."
      },
      {
        label:"No",
        filter:null,
        note:"No tractography requirement."
      }
    ]
  },

  // 7. Connectomics
  {
    id:"connectomics",
    eyebrow:"Connectomics",
    type:"multi",
    title:"Which connectomics outputs do you need?",
    options:[
      {
        label:"Structural connectivity matrix",
        score:p=>String(p.connectivity||"").toLowerCase().startsWith("yes") ? 4 : 0,
        note:"+4 pts if connectivity matrices are supported."
      },
      {
        label:"Bundle / tract extraction",
        score:p=>String(p.BundleExtraction||"").toLowerCase().startsWith("yes") ? 4 : 0,
        note:"+4 pts if bundle extraction is supported."
      },
      {
        label:"None",
        score:null,
        note:"No points awarded."
      }
    ]
  },

  // 8. Atlas
  {
    id:"atlas",
    eyebrow:"Atlas",
    type:"single",
    title:"Which reference atlas do you want to use?",
    options:[
      {
        label:"Allen Mouse Brain Atlas (AMBA)",
        score:p=>{
          const s = String(p.atlasSupport||"").toLowerCase();
          return (s.includes("allen") || s.includes("amba")) ? 5 : 0;
        },
        note:"+5 pts if AMBA / Allen Mouse Brain Atlas is supported."
      },
      {
        label:"Waxholm Space",
        score:p=>String(p.atlasSupport||"").toLowerCase().includes("waxholm") ? 5 : 0,
        note:"+5 pts if Waxholm Space is supported."
      },
      {
        label:"User-supplied atlas",
        score:p=>{
          const s = String(p.atlasSupport||"").toLowerCase();
          return (
            s.includes("user") ||
            s.includes("custom") ||
            s.includes("flexible") ||
            s.includes("template")
          ) ? 4 : 0;
        },
        note:"+4 pts if a custom or user-supplied atlas can be used."
      },
      {
        label:"No specific atlas / no preference",
        score:null,
        note:"No atlas preference applied."
      }
    ]
  },

  // 9. Compute environment
  {
    id:"compute",
    eyebrow:"Compute",
    type:"single",
    title:"Where do you want to run the pipeline?",
    options:[
      {
        label:"Local workstation",
        score:p=>String(p.scalability||"").toLowerCase().includes("local") ? 3 : 0,
        note:"+3 pts if local execution is supported."
      },
      {
        label:"HPC cluster",
        score:p=>{
          const s = String(p.scalability||"").toLowerCase();
          return (s.includes("hpc") ? 3 : 0) +
                 (Number(p.hpcLevel) >= 2 ? 3 : 0);
        },
        note:"+3 pts for HPC support, with +3 additional pts for stronger HPC readiness."
      },
      {
        label:"Cloud / web platform",
        score:p=>{
          const s = String(p.scalability||"").toLowerCase();
          return (s.includes("cloud") || s.includes("web")) ? 5 : 0;
        },
        note:"+5 pts if cloud or web execution is supported."
      },
      {
        label:"No preference",
        score:null,
        note:"No points awarded."
      }
    ]
  },

  // 10. Reproducibility / usability
  {
    id:"usability",
    eyebrow:"Usability",
    type:"multi",
    title:"Which usability features are important to you?",
    options:[
      {
        label:"Containerized execution",
        score:p=>{
          const s = String(p.containerized||"").toLowerCase();
          return (
            s.includes("docker") ||
            s.includes("singularity") ||
            s.includes("apptainer") ||
            s.startsWith("yes")
          ) ? 4 : 0;
        },
        note:"+4 pts if containerized execution is available."
      },
      {
        label:"Beginner tutorial / documentation",
        score:p=>
          (String(p.tutorial||"").toLowerCase().startsWith("yes") ? 2 : 0) +
          (Number(p.documentationLevel) >= 2 ? 2 : 0),
        note:"Up to +4 pts for tutorials and stronger documentation."
      },
      {
        label:"Quality-control report",
        score:p=>
          (String(p.qcQuant||"").toLowerCase().startsWith("yes") ? 2 : 0) +
          (String(p.qcVisual||"").toLowerCase().startsWith("yes") ? 2 : 0) +
          (String(p.htmlReport||"").toLowerCase().startsWith("yes") ? 2 : 0),
        note:"Up to +6 pts for quantitative, visual and HTML quality control."
      },
      {
        label:"Active maintenance",
        score:p=>Number(p.activity||0) * 2,
        note:"+2 pts per maintenance/activity level."
      },
      {
        label:"No preference",
        score:null,
        note:"No points awarded."
      }
    ]
  }

];
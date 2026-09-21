/* Adult human — quiz questions.
   Used by adult.html (interactive quiz) and questions.html?cat=adult
   (read-only summary page).

   Each option may have:
   - filter: a hard, blocking constraint
   - score: a soft preference
   - note: explanation shown on the Questions summary page.
*/

window.QUESTIONS = [

  /* =========================================================
     RAW DATA
     ========================================================= */

  {
    id: "acq",
    eyebrow: "Raw data",
    type: "single",
    title: "What type of acquisition are your data?",
    options: [
      {
        label: "Single shell only",
        filter: null,
        note: "No constraint — all compared pipelines support single-shell data."
      },
      {
        label: "Multi-shell (multiple b-values)",
        filter: p => p.multiShell === true,
        note: "Blocking filter: keeps only pipelines that explicitly support multi-shell acquisitions."
      },
      {
        label: "Compressed sensing / non-Cartesian acquisition",
        filter: p => p.compressedSensing === true,
        note: "Blocking filter: keeps only pipelines that support compressed-sensing / non-Cartesian sampling."
      },
      {
        label: "Not sure",
        filter: null,
        note: "No constraint applied."
      }
    ]
  },

  {
    id: "bids",
    eyebrow: "Raw data",
    type: "single",
    title: "How are your data organized?",
    options: [
      {
        label: "BIDS",
        filter: p => p.bids === true,
        note: "Blocking filter: keeps only pipelines that explicitly support BIDS datasets."
      },
      {
        label: "NIfTI files, but not BIDS",
        filter: null,
        note: "No BIDS constraint applied."
      },
      {
        label: "Not sure",
        filter: null,
        note: "No constraint applied."
      }
    ]
  },

  /* =========================================================
     POPULATION / DATA TYPE
     ========================================================= */

  {
    id: "population",
    eyebrow: "Study population",
    type: "single",
    title: "What type of study are these data from?",
    options: [
      {
        label: "Aging / lifespan research",
        score: p => 
          (p.wmSegmentationAging ? 3 : 0) + 
          (p.lesionMaskHandling ? 3 : 0) +
          (p.partialVolumeCorrection ? 3 : 0),
        note: "+3 pts for each features or validation relevant to aging/lifespan datasets."
      },
      {
        label: "Clinical / medical data",
        score: p =>  
          (p.lesionMaskHandling ? 3 : 0) +
          (p.partialVolumeCorrection ? 3 : 0) +
          (p.harmonisation ? 3 : 0),
        note: "+3 pts for each features or validation relevant to clinical/medical datasets."
      },
      {
        label: "Generic / healthy research dataset",
        score: null,
        note: "No constraint applied."
      },
      {
        label: "Not sure",
        score: null,
        note: "No population-specific preference is scored."
      }
    ]
  },

  /* =========================================================
     ANALYSIS GOAL
     ========================================================= */

  {
    id: "preprocessing",
    eyebrow: "Analysis goal",
    type: "multi",
    title: "Which preprocessing steps do you want the pipeline to handle?",
    options: [
      {
        label: "Denoising",
        score: p => p.mppca ? 2 : 0,
        note: "+2 pts if the pipeline supports diffusion MRI denoising."
      },
      {
        label: "Gibbs ringing correction",
        score: p => p.gibbs ? 2 : 0,
        note: "+2 pts if Gibbs ringing correction is supported."
      },
      {
        label: "Motion / eddy-current correction",
        score: p => p.motion ? 3 : 0,
        note: "+3 pts if motion and/or eddy-current correction is supported."
      },
      {
        label: "Susceptibility / distortion correction",
        score: p => p.susceptibilityCorrection || p.topup ? 3 : 0,
        note: "+3 pts if susceptibility or susceptibility-induced distortion correction is supported."
      },
      {
        label: "Bias-field correction",
        score: p => p.b1 ? 2 : 0,
        note: "+2 pts if bias-field correction is supported."
      },
      {
        label: "Registration / spatial normalization",
        score: p => p.t1wNormalization ? 2 : 0,
        note: "+2 pts if registration or spatial normalization is supported."
      },
      {
        label: "Brain masking / tissue segmentation",
        score: p => p.t1wBrainExtraction ? 2 : 0,
        note: "+2 pts if brain masking or tissue segmentation is supported."
      },
      {
        label: "I want the pipeline to decide the preprocessing",
        score: null,
        note: "No specific preprocessing preference is scored."
      }
    ]
  },

  {
    id: "analysis",
    eyebrow: "Analysis goal",
    type: "single",
    title: "What is the main goal of your analysis?",
    options: [
      {
        label: "Preprocessing only",
        filter: null,
        note: "No analysis-specific constraint applied."
      },
      {
        label: "Preprocessing + tractography",
        filter: p => p.tractography === true,
        note: "Blocking filter: keeps only pipelines that include tractography."
      },
      {
        label: "Tractometry",
        filter: p => p.tractometry === true,
        note: "Blocking filter: keeps only pipelines that support tractometry."
      },
      {
        label: "Connectome / structural connectivity",
        filter: p => p.connectivity === true,
        note: "Blocking filter: keeps only pipelines that support connectivity matrices or connectome generation."
      },
      {
        label: "Multiple of these",
        filter: null,
        note: "No single analysis constraint is applied."
      },
      {
        label: "Not sure yet",
        filter: null,
        note: "No constraint applied."
      }
    ]
  },

  /* =========================================================
     ENVIRONMENT
     ========================================================= */

  {
    id: "dataSize",
    eyebrow: "Environment",
    type: "single",
    title: "How large is your dataset?",
    options: [
      {
        label: "Small — a few subjects",
        score: p => p.scalability?.includes("local") ? 2 : 0,
        note: "+2 pts for pipelines supporting convenient local execution."
      },
      {
        label: "Medium — tens of subjects",
        score: p => p.scalability?.includes("local") || p.scalability?.includes("hpc") ? 2 : 0,
        note: "+2 pts for pipelines suitable for local or HPC execution."
      },
      {
        label: "Large — hundreds of subjects",
        score: p => p.scalability?.includes("hpc") ? 3 : 0,
        note: "+3 pts if HPC execution is supported."
      },
      {
        label: "Very large — thousands of subjects",
        score: p => p.scalability?.includes("hpc") || p.scalability?.includes("cloud") ? 4 : 0,
        note: "+4 pts for HPC or cloud scalability."
      },
      {
        label: "Not sure yet",
        score: null,
        note: "No points awarded."
      }
    ]
  },

  {
    id: "gpu",
    eyebrow: "Environment",
    type: "single",
    title: "Do you have access to a GPU?",
    options: [
      {
        label: "Yes",
        score: p => p.gpu === true ? 4 : 0,
        note: "+4 pts if GPU acceleration is supported."
      },
      {
        label: "No GPU",
        score: null,
        note: "No GPU preference is scored."
      },
      {
        label: "Not sure",
        score: null,
        note: "No constraint applied."
      }
    ]
  },
  
  /* =========================================================
     INTERFACE
     ========================================================= */

  {
    id: "interface",
    eyebrow: "Day-to-day use",
    type: "single",
    title: "What kind of interface do you prefer?",
    options: [
      {
        label: "Terminal / command line",
        score: p => p.interface === "terminal" ? 3 : 0,
        note: "+3 pts if the pipeline is designed for terminal/CLI use."
      },
      {
        label: "Graphical interface",
        score: p =>
          (p.interface === "gui" ||
           p.interface === "gui+terminal" ||
           p.interface === "web") ? 3 : 0,
        note: "+3 pts if a graphical or web interface is available."
      },
      {
        label: "Web platform",
        score: p => p.interface === "web" ? 4 : 0,
        note: "+4 pts if the pipeline is available through a web platform."
      },
      {
        label: "Doesn't matter",
        score: null,
        note: "No points awarded."
      }
    ]
  },

  {
    id: "tutorial",
    eyebrow: "Day-to-day use",
    type: "single",
    title: "How much guidance or tutorial support do you need?",
    options: [
      {
        label: "I want a detailed tutorial / beginner-friendly documentation",
        score: p => p.tutorial=== true ? 4 : 0,
        note: "+4 pts for pipelines with strong tutorials or beginner-oriented documentation."
      },
      {
        label: "Standard documentation is enough",
        score: p => p.documentation >= 3 ? 2 : 0,
        note: "+2 pts if good documentation is available."
      },
      {
        label: "I am comfortable figuring it out myself",
        score: null,
        note: "No documentation preference is scored."
      }
    ]
  },

  /* =========================================================
     QUALITY CONTROL
     ========================================================= */

  {
    id: "qc",
    eyebrow: "Quality control",
    type: "single",
    title: "How much quality control do you need?",
    options: [
      {
        label: "Basic QC",
        score: p => p.qcVisual || p.qcBoilerplate ? 2 : 0,
        note: "+2 pts for pipelines providing basic visual or automated QC."
      },
      {
        label: "Automated QC with quantitative metrics",
        score: p =>
          (p.qcQuant ? 3 : 0) +
          (p.qcBoilerplate ? 2 : 0),
        note: "+3 pts for quantitative QC and +2 for automated QC."
      },
      {
        label: "Extensive QC and reports",
        score: p =>
          (p.qcQuant ? 2 : 0) +
          (p.qcBoilerplate ? 2 : 0) +
          (p.qcVisual ? 2 : 0) +
          (p.outlierDetection ? 2 : 0) +
          (p.htmlReport ? 2 : 0),
        note: "+2 pts each for quantitative QC, automated QC, visual QC, and HTML reports."
      },
      {
        label: "QC is not a major requirement",
        score: null,
        note: "No QC preference is scored."
      }
    ]
  },

  /* =========================================================
     ADVANCED NEEDS
     ========================================================= */

  {
    id: "advanced",
    eyebrow: "Advanced needs",
    type: "multi",
    title: "Do you need any specific advanced methods or analyses?",
    options: [
      {
        label: "Advanced diffusion models (NODDI, DKI, free-water)",
        score: p =>
          (p.noddi ? 3 : 0) +
          (p.dki ? 3 : 0) +
          (p.freewater ? 3 : 0),
        note: "+3 pts each for NODDI, DKI, and free-water support."
      },
      {
        label: "fODF reconstruction / CSD",
        score: p => p.fodf ? 4 : 0,
        note: "+4 pts if fODF / CSD reconstruction is supported."
      },
      {
        label: "Fieldmapless distortion correction",
        score: p => p.fieldmapless ? 4 : 0,
        note: "+4 pts if advanced tractography methods are supported."
      },
      {
        label: "Resume on error",
        score: p => p.resume ? 4 : 0,
        note: "+4 pts if connectivity / connectome generation is supported."
      },
      {
        label: "Multi-session / longitudinal support",
        score: p => p.longitudinalSupport ? 4 : 0,
        note: "+4 pts if tractometry is supported."
      },
      {
        label: "Nothing specific",
        score: null,
        note: "No points awarded."
      }
    ]
  }
];


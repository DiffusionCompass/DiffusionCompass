/* NHP / Monkey — quiz questions.
   Loaded by monkey.html and questions.html?cat=monkey.

   Philosophy:
   - Species + acquisition context = strong compatibility constraints
   - Atlas/template = species-dependent preference
   - Remaining questions = generic diffusion-pipeline requirements
*/

window.QUESTIONS = [

  // ============================================================
  // 1. SPECIES
  // ============================================================

  {
    id: "species",
    eyebrow: "NHP species",
    type: "single",
    title: "Which non-human primate species are you studying?",
    options: [

      {
        label: "Rhesus macaque (Macaca mulatta)",
        filter: p => p.rhesusMacaque === true,
        note: "Blocking filter: keeps pipelines with documented support for rhesus macaque."
      },

      {
        label: "Cynomolgus macaque (Macaca fascicularis)",
        filter: p => p.cynomolgusMacaque === true,
        note: "Blocking filter: keeps pipelines with documented support for cynomolgus macaque."
      },

      {
        label: "Marmoset (Callithrix jacchus)",
        filter: p => p.marmoset === true,
        note: "Blocking filter: keeps pipelines with documented marmoset support."
      },

      {
        label: "Chimpanzee (Pan troglodytes)",
        filter: p => p.chimpanzee === true,
        note: "Blocking filter: keeps pipelines with documented chimpanzee support."
      },

      {
        label: "Baboon (Papio spp.)",
        filter: p => p.baboon === true,
        note: "Blocking filter: keeps pipelines with documented baboon support."
      },

      {
        label: "Other Old World monkey",
        filter: p => p.otherOldWorldMonkey === true,
        note: "Blocking filter: keeps pipelines documented for other Old World monkeys."
      },

      {
        label: "Other New World monkey",
        filter: p => p.otherNewWorldMonkey === true,
        note: "Blocking filter: keeps pipelines documented for other New World monkeys."
      },

      {
        label: "Prosimian / strepsirrhine",
        filter: p => p.prosimian === true,
        note: "Blocking filter: keeps pipelines documented for prosimians / strepsirrhines."
      },

      {
        label: "Not sure / another NHP species",
        filter: null,
        note: "No species constraint applied."
      },
    ]
  },


  // ============================================================
  // 2. IN VIVO / EX VIVO
  // ============================================================

  {
    id: "context",
    eyebrow: "Acquisition context",
    type: "single",
    title: "Are your diffusion MRI data acquired in vivo or ex vivo?",
    options: [
      {
        label: "In vivo",
        filter: null,
        note: "No constraint — all compared pipelines support in-vivo NHP data."
      },
      {
        label: "Ex vivo / post-mortem",
        filter: p => p.exVivoSupport === true,
        note: "Keeps pipelines with documented ex-vivo / post-mortem support."
      }
    ]
  },


  // ============================================================
  // 3. RAW DATA
  // ============================================================

  {
    id: "acq",
    eyebrow: "Raw data",
    type: "single",
    title: "What type of diffusion acquisition are your data?",
    options: [

      {
        label: "Single shell only",
        filter: null,
        note: "No constraint — all compared pipelines are assumed to accept conventional single-shell diffusion MRI."
      },

      {
        label: "Multi-shell (multiple b-values)",
        filter: p => p.multiShell === true,
        note: "Blocking filter: keeps only pipelines that explicitly support multi-shell acquisitions."
      },

      {
        label: "Compressed sensing / non-Cartesian acquisition",
        filter: p => p.compressedSensing === true,
        note: "Blocking filter: keeps only pipelines that explicitly support compressed-sensing / non-Cartesian sampling."
      },

      {
        label: "Not sure",
        filter: null,
        note: "No acquisition constraint applied."
      },
    ]
  },


  // ============================================================
  // 4. REFERENCE SPACE / ATLAS
  // ============================================================

  {
    id: "atlas",
    eyebrow: "Reference space",
    type: "single",
    title: "Which NHP reference atlas or template do you need support for?",
    options: [

      {
        label: "NMT (NIMH Macaque Template)",
        score: p =>
          String(p.atlasSupport || "").toLowerCase().includes("nmt") ? 4 : 0,
        note: "+4 pts if atlasSupport includes NMT."
      },

      {
        label: "D99 macaque atlas",
        score: p =>
          String(p.atlasSupport || "").toLowerCase().includes("d99") ? 4 : 0,
        note: "+4 pts if atlasSupport includes D99."
      },

      {
        label: "INIA19 macaque template",
        score: p =>
          String(p.atlasSupport || "").toLowerCase().includes("inia19") ? 4 : 0,
        note: "+4 pts if atlasSupport includes INIA19."
      },

      {
        label: "F99 macaque template",
        score: p =>
          String(p.atlasSupport || "").toLowerCase().includes("f99") ? 4 : 0,
        note: "+4 pts if atlasSupport includes F99."
      },

      {
        label: "Juna.Chimp / chimpanzee-specific template",
        score: p =>
          String(p.atlasSupport || "").toLowerCase().includes("juna") ? 4 : 0,
        note: "+4 pts if atlasSupport includes Juna.Chimp or a chimpanzee-specific reference space."
      },

      {
        label: "Marmoset-specific template",
        score: p => {
          const atlas = String(p.atlasSupport || "").toLowerCase();
          return (
            atlas.includes("marmoset") ||
            atlas.includes("nih") ||
            atlas.includes("mbm")
          ) ? 4 : 0;
        },
        note: "+4 pts if a marmoset-specific template is explicitly supported."
      },

      {
        label: "Custom / species-native template",
        score: p => {
          const atlas = String(p.atlasSupport || "").toLowerCase();
          return (
            atlas.includes("custom") ||
            atlas.includes("species-specific") ||
            atlas.includes("species native") ||
            atlas.includes("species-native")
          ) ? 3 : 0;
        },
        note: "+3 pts if custom or species-native reference spaces are supported."
      },

      {
        label: "Not sure / no specific atlas",
        score: null,
        note: "No atlas preference applied."
      },
    ]
  },


  // ============================================================
  // 5. NHP-SPECIFIC PROCESSING
  // ============================================================

  {
    id: "nhpProcessing",
    eyebrow: "NHP-specific processing",
    type: "multi",
    title: "Do you need processing specifically adapted to non-human primate anatomy?",
    options: [

      {
        label: "Species-specific brain extraction",
        score: p => p.speciesSpecificBrainExtraction ? 3 : 0,
        note: "+3 pts if species-specific brain extraction is supported."
      },

      {
        label: "Species-specific registration",
        score: p => p.speciesSpecificRegistration ? 3 : 0,
        note: "+3 pts if the workflow includes registration adapted to NHP anatomy."
      },

      {
        label: "Small-brain optimized processing",
        score: p => p.smallBrainOptimized ? 3 : 0,
        note: "+3 pts if the pipeline is explicitly adapted to smaller NHP brains."
      },

      {
        label: "Ultra-high-field / submillimetric acquisitions",
        score: p => p.ultraHighField ? 3 : 0,
        note: "+3 pts if the pipeline has documented support for ultra-high-field or high-resolution NHP diffusion MRI."
      },

      {
        label: "Cross-species comparison",
        score: p => p.crossSpecies ? 4 : 0,
        note: "+4 pts if cross-species comparative neuroanatomy is an explicit pipeline capability."
      },

      {
        label: "Cortical surface integration",
        score: p => p.surfaceIntegration ? 3 : 0,
        note: "+3 pts if diffusion processing can be integrated with species-specific cortical surfaces."
      },

      {
        label: "Nothing specific",
        score: null,
        note: "No NHP-specific preference applied."
      },
    ]
  },


  // ============================================================
  // 6. TRACTOGRAPHY
  // ============================================================

  {
    id: "tracto",
    eyebrow: "Analysis goal",
    type: "single",
    title: "Do you need to run tractography?",
    options: [

      {
        label: "Yes, tractography is part of the analysis",
        filter: p => p.tractography === true,
        note: "Blocking filter: keeps only pipelines that include a tractography step."
      },

      {
        label: "No, preprocessing / modelling only",
        filter: null,
        note: "No tractography constraint applied."
      },

      {
        label: "Not sure yet",
        filter: null,
        note: "No tractography constraint applied."
      },
    ]
  },


  // ============================================================
  // 7. ADVANCED DIFFUSION MODELLING
  // ============================================================

  {
    id: "advanced",
    eyebrow: "Advanced needs",
    type: "multi",
    title: "Do you need any specific diffusion models or downstream analyses?",
    options: [

      {
        label: "DKI",
        score: p => p.dki ? 3 : 0,
        note: "+3 pts if diffusion kurtosis imaging is supported."
      },

      {
        label: "NODDI",
        score: p => p.noddi ? 3 : 0,
        note: "+3 pts if NODDI is supported."
      },

      {
        label: "Free-water modelling",
        score: p => p.freewater ? 3 : 0,
        note: "+3 pts if free-water modelling is supported."
      },

      {
        label: "CSD / fODF reconstruction",
        score: p => p.fodf ? 4 : 0,
        note: "+4 pts if fODF / CSD reconstruction is supported."
      },

      {
        label: "DIAMOND",
        score: p => p.diamond ? 4 : 0,
        note: "+4 pts if DIAMOND modelling is natively supported."
      },

      {
        label: "BEDPOSTX / crossing-fibre modelling",
        score: p => p.bedpostx ? 3 : 0,
        note: "+3 pts if BEDPOSTX or equivalent crossing-fibre modelling is available."
      },

      {
        label: "Connectomics",
        score: p =>
          (p.connectivity ? 3 : 0) +
          (p.biasCorrection ? 2 : 0),
        note: "+3 pts for connectivity matrices and +2 pts for tractography-bias correction."
      },

      {
        label: "Tractometry",
        score: p => p.tractometry ? 3 : 0,
        note: "+3 pts if tractometry is supported."
      },

      {
        label: "Advanced quantitative QC",
        score: p =>
          (p.qcQuant ? 2 : 0) +
          (p.qcBoilerplate ? 2 : 0) +
          (p.qcVisual ? 2 : 0) +
          (p.htmlReport ? 1 : 0),
        note: "+2 pts each for quantitative, automated, and visual QC, +1 for an HTML report."
      },

      {
        label: "Nothing specific",
        score: null,
        note: "No advanced-method preference applied."
      },
    ]
  },


  // ============================================================
  // 8. COMPUTE
  // ============================================================

  {
    id: "compute",
    eyebrow: "Environment",
    type: "single",
    title: "What compute environment do you have access to?",
    options: [

      {
        label: "My own computer only (local)",
        score: p =>
          Array.isArray(p.scalability)
            ? (p.scalability.includes("local") ? 3 : 0)
            : String(p.scalability || "").includes("local") ? 3 : 0,
        note: "+3 pts if local execution is supported."
      },

      {
        label: "HPC cluster (Slurm / SGE / PBS)",
        score: p => {
          const scalability = Array.isArray(p.scalability)
            ? p.scalability
            : String(p.scalability || "").split(/[,;]/).map(x => x.trim());

          return (
            (scalability.includes("hpc") ? 2 : 0) +
            (p.hpcLevel === 2 ? 2 : 0)
          );
        },
        note: "+2 pts for HPC support, +2 more if HPC readiness is optimized/recommended."
      },

      {
        label: "Cloud (AWS/GCP/Azure) or web platform",
        score: p =>
          Array.isArray(p.scalability)
            ? (p.scalability.includes("cloud") ? 4 : 0)
            : String(p.scalability || "").includes("cloud") ? 4 : 0,
        note: "+4 pts if cloud execution is supported."
      },

      {
        label: "Doesn't matter",
        score: null,
        note: "No compute-environment preference applied."
      },
    ]
  },


  // ============================================================
  // 9. INTERFACE
  // ============================================================

  {
    id: "interface",
    eyebrow: "Day-to-day use",
    type: "single",
    title: "What kind of interface do you prefer to work with?",
    options: [

      {
        label: "Terminal / command line, no problem",
        score: p => p.interface === "terminal" ? 3 : 0,
        note: "+3 pts for a command-line interface."
      },

      {
        label: "A graphical interface or web platform",
        score: p =>
          (
            p.interface === "gui" ||
            p.interface === "gui+terminal" ||
            p.interface === "web"
          ) ? 3 : 0,
        note: "+3 pts for GUI, GUI+terminal, or web interfaces."
      },

      {
        label: "Doesn't matter",
        score: null,
        note: "No interface preference applied."
      },
    ]
  },


  // ============================================================
  // 10. CUSTOMIZATION
  // ============================================================

  {
    id: "custom",
    eyebrow: "Customization",
    type: "single",
    title: "How important is it to be able to modify the pipeline?",
    options: [

      {
        label: "Very important, I want full control",
        score: p =>
          p.modifiability * 2 +
          (p.polyvalent ? 2 : 0),
        note: "+2 pts per modifiability level, +2 if the pipeline is versatile / multi-software."
      },

      {
        label: "Somewhat, a few parameters are enough",
        score: p => p.modifiability,
        note: "+1 pt per modifiability level."
      },

      {
        label: "Not important, I want a reliable out-of-the-box tool",
        score: p =>
          (3 - p.modifiability) +
          (p.containerized ? 2 : 0) +
          (p.htmlReport ? 1 : 0),
        note: "Rewards simpler pipelines, containerization, and automated reporting."
      },
    ]
  },


  // ============================================================
  // 11. MAINTENANCE
  // ============================================================

  {
    id: "maintenance",
    eyebrow: "Longevity",
    type: "single",
    title: "Does the pipeline need to be actively maintained long-term?",
    options: [

      {
        label: "Yes, that's important to me",
        score: p =>
          p.activity * 2 +
          (p.resume ? 1 : 0),
        note: "+2 pts per activity level, +1 if resume-on-error is supported."
      },

      {
        label: "Doesn't matter, I mostly care about features",
        score: null,
        note: "No maintenance preference applied."
      },
    ]
  }

];
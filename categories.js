/* Shared category metadata, used by pipelines.html, criteria.html, and
   questions.html to resolve the ?cat= URL parameter. */
const CATEGORIES = {
  adult:     { label: 'Adult human',     file: 'data/adult.xlsx',     page: 'adult.html',     questionsFile: 'adult-questions.js',     quizPage: 'adult.html'     },
  pediatric: { label: 'Pediatric human', file: 'data/pediatric.xlsx', page: 'pediatric.html', questionsFile: 'pediatric-questions.js', quizPage: 'pediatric.html' },
  rodent:    { label: 'Rodent',          file: 'data/rodent.xlsx',    page: 'rodent.html',    questionsFile: 'rodent-questions.js',    quizPage: 'rodent.html'    },
  monkey:    { label: 'Monkey',          file: 'data/monkey.xlsx',    page: 'monkey.html',    questionsFile: 'monkey-questions.js',    quizPage: 'monkey.html'    },
};

function getCategoryFromUrl(){
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  return (cat && CATEGORIES[cat]) ? cat : null;
}
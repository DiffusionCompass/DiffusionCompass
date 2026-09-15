/* Shared category metadata, used by pipelines.html, criteria.html, and
   questions.html to resolve the ?cat= URL parameter. */
const CATEGORIES = {
  adult:      { label: "Adult human",           xlsx: "data/adult.xlsx",      questionsFile: "adult-questions.js",      quizPage: "adult.html" },
  pediatric:  { label: "Pediatric human",        xlsx: "data/pediatric.xlsx",  questionsFile: "pediatric-questions.js",  quizPage: "pediatric.html" },
  rodent:      { label: "Rodent",                  xlsx: "data/rodent.xlsx",      questionsFile: "rodent-questions.js",      quizPage: "rodent.html" },
  monkey:     { label: "Monkey",                 xlsx: "data/monkey.xlsx",     questionsFile: "monkey-questions.js",     quizPage: "monkey.html" },
};

function getCategoryFromUrl(){
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  return (cat && CATEGORIES[cat]) ? cat : null;
}

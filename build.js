const fs = require('node:fs');
const zlib = require('node:zlib');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

function hasTerm(value, term) {
  const special = '\\^$.*+?()[]{}|';
  const escaped = String(term).split('').map(ch => special.includes(ch) ? '\\' + ch : ch).join('');
  return new RegExp('(^|[^A-Za-z0-9])' + escaped + '($|[^A-Za-z0-9])', 'i').test(String(value));
}
function containsExcluded(value, excluded) {
  return excluded.some(term => hasTerm(value, term));
}

const appDataMatch = html.match(/<script[^>]*id=["']appData["'][^>]*>([\s\S]*?)<\/script>/i);
if (!appDataMatch) throw new Error('Medication source audit: appData was not found.');
const data = JSON.parse(appDataMatch[1]);
const policy = data.medicationSourcePolicy || {};
const excluded = Array.isArray(policy.excludedNamedMedicationTerms) ? policy.excludedNamedMedicationTerms : [];
if (!excluded.length) throw new Error('Medication source audit: exclusion list is missing.');

let removedQuestions = 0;
const removedByModule = {};
for (const path of fs.readdirSync('.').filter(name => /^bank-data-\d+\.js$/.test(name))) {
  const source = fs.readFileSync(path, 'utf8');
  const match = source.match(/Object\.assign\(window\.__BANK_DATA__\|\|\{\},([\s\S]*?)\);?\s*$/);
  if (!match) throw new Error('Medication source audit: could not parse ' + path);
  const banks = JSON.parse(match[1]);
  for (const [moduleId, questions] of Object.entries(banks)) {
    const filtered = (questions || []).filter(question => !containsExcluded(JSON.stringify(question), excluded));
    const removed = (questions || []).length - filtered.length;
    if (removed) { removedQuestions += removed; removedByModule[moduleId] = (removedByModule[moduleId] || 0) + removed; }
    banks[moduleId] = filtered;
  }
  fs.writeFileSync(path, 'window.__BANK_DATA__=Object.assign(window.__BANK_DATA__||{},' + JSON.stringify(banks) + ');\n');
}

if (data.banks && typeof data.banks === 'object') {
  for (const [moduleId, questions] of Object.entries(data.banks)) {
    const filtered = (questions || []).filter(question => !containsExcluded(JSON.stringify(question), excluded));
    const removed = (questions || []).length - filtered.length;
    if (removed) { removedQuestions += removed; removedByModule[moduleId] = (removedByModule[moduleId] || 0) + removed; }
    data.banks[moduleId] = filtered;
  }
}

let removedCards = 0;
if (Array.isArray(data.ch4PharmGuide)) {
  const before = data.ch4PharmGuide.length;
  data.ch4PharmGuide = data.ch4PharmGuide.filter(card => !containsExcluded(JSON.stringify(card), excluded));
  removedCards = before - data.ch4PharmGuide.length;
}
let removedReviewSections = 0;
for (const review of Object.values(data.reviews || {})) {
  if (!Array.isArray(review.sections)) continue;
  const before = review.sections.length;
  review.sections = review.sections.filter(section => !containsExcluded(JSON.stringify(section), excluded));
  removedReviewSections += before - review.sections.length;
}

policy.removedQuizQuestions = (Number(policy.removedQuizQuestions) || 0) + removedQuestions;
policy.removedQuizQuestionsByModule = Object.assign({}, policy.removedQuizQuestionsByModule || {});
for (const [moduleId, count] of Object.entries(removedByModule)) policy.removedQuizQuestionsByModule[moduleId] = (policy.removedQuizQuestionsByModule[moduleId] || 0) + count;
policy.removedChapter4MedicationCards = (Number(policy.removedChapter4MedicationCards) || 0) + removedCards;
policy.removedReviewSectionsAtBuild = (Number(policy.removedReviewSectionsAtBuild) || 0) + removedReviewSections;
data.medicationSourcePolicy = policy;
html = html.replace(appDataMatch[1], JSON.stringify(data));
fs.writeFileSync(file, html);
fs.writeFileSync('index.html.gz', zlib.gzipSync(Buffer.from(html, 'utf8'), { level: 9, mtime: 0 }));
console.log('Built source-controlled study site. Removed ' + removedQuestions + ' unsupported quiz items and ' + removedCards + ' unsupported medication cards.');

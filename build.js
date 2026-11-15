const fs = require('node:fs');
const zlib = require('node:zlib');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

function replaceOnce(oldText, newText, label) {
  const first = html.indexOf(oldText);
  if (first < 0 || html.indexOf(oldText, first + oldText.length) >= 0) {
    throw new Error('Expected exactly one ' + label + ' target. Refusing an unsafe partial update.');
  }
  html = html.slice(0, first) + newText + html.slice(first + oldText.length);
}

const oldCss = [
  '.chapterSwitcher{margin:0 0 18px;background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:10px;display:flex;gap:10px;align-items:center;box-shadow:0 8px 24px rgba(20,35,38,.05)}',
  '.chapterTab{flex:1;border:1px solid var(--line);background:#fff;border-radius:12px;padding:11px 14px;font-weight:900;cursor:pointer;color:var(--muted);transition:.15s}',
  '.chapterTab.active{background:var(--green);color:#fff;border-color:var(--green);box-shadow:0 6px 18px rgba(20,90,75,.18)}',
  '.chapterTab small{display:block;font-weight:600;margin-top:3px;opacity:.85}'
].join('\n');
const newCss = [
  '.chapterSwitcher{margin:0 0 18px;background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:8px;box-shadow:0 8px 24px rgba(20,35,38,.05)}',
  '.chapterPickerToggle{width:100%;display:flex;align-items:center;gap:10px;text-align:left;border:0;border-radius:11px;background:transparent;padding:8px 10px;cursor:pointer;color:var(--ink);min-height:44px}',
  '.chapterPickerToggle:hover{background:rgba(20,90,75,.05)}',
  '.chapterPickerEyebrow{font-size:.68rem;font-weight:900;letter-spacing:.08em;color:var(--muted)}',
  '.chapterPickerToggle strong{font-size:.95rem;font-weight:950;color:var(--green)}',
  '.chapterPickerHint{font-size:.78rem;color:var(--muted);margin-left:auto}',
  '.chapterPickerChevron{font-size:1rem;color:var(--muted);transition:transform .16s ease}',
  '.chapterPickerToggle[aria-expanded="true"] .chapterPickerChevron{transform:rotate(180deg)}',
  '.chapterTabsPanel{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;padding:8px 2px 2px}',
  '.chapterTabsPanel[hidden]{display:none}',
  '.chapterTab{width:100%;min-width:0;border:1px solid var(--line);background:#fff;border-radius:10px;padding:9px 10px;font-weight:900;cursor:pointer;color:var(--muted);transition:.15s;text-align:left}',
  '.chapterTab.active{background:var(--green);color:#fff;border-color:var(--green);box-shadow:0 6px 18px rgba(20,90,75,.18)}',
  '.chapterTab small{display:block;font-weight:600;margin-top:3px;opacity:.85;font-size:.72rem;line-height:1.3}'
].join('\n');
replaceOnce(oldCss, newCss, 'chapter selector styles');

replaceOnce(
  '@media(max-width:760px){.chapterSwitcher{flex-direction:column}.chapterTab{width:100%}.renalFlow{grid-template-columns:1fr}.renalFlow b{transform:rotate(90deg)}.renalCompare,.akiTriad,.dialysisAccess,.dialysisTypes{grid-template-columns:1fr}}',
  '@media(max-width:760px){.chapterTabsPanel{grid-template-columns:repeat(2,minmax(0,1fr))}.chapterPickerHint{font-size:.72rem}.renalFlow{grid-template-columns:1fr}.renalFlow b{transform:rotate(90deg)}.renalCompare,.akiTriad,.dialysisAccess,.dialysisTypes{grid-template-columns:1fr}}',
  'mobile chapter selector styles'
);

const oldHtml = [
  '<div aria-label="Chapter switcher" class="chapterSwitcher" role="tablist">',
  '<button class="chapterTab" id="chapterTab1" onclick="setChapter(1)">📘 Chapter 1<small>Cardiovascular • Pharmacology • Tissue Integrity</small></button>',
  '<button class="chapterTab" id="chapterTab2" onclick="setChapter(2)">📗 Chapter 2<small>Renal • Urinary • Sexual Function</small></button>',
  '<button class="chapterTab" id="chapterTab3" onclick="setChapter(3)">📙 Chapter 3<small>Mobility • Spinal Cord • Neurologic</small></button>',
  '<button class="chapterTab" id="chapterTab4" onclick="setChapter(4)">📕 Chapter 4<small>GI • Cancer • End-of-Life Care</small></button>',
  '<button class="chapterTab" id="chapterTab5" onclick="setChapter(5)">📒 Chapter 5<small>Immunity • Metabolism • Endocrine</small></button>',
  '</div>'
].join('\n');
const newHtml = [
  '<div aria-label="Chapter selector" class="chapterSwitcher">',
  '<button aria-controls="chapterTabsPanel" aria-expanded="false" class="chapterPickerToggle" id="chapterPickerToggle" onclick="toggleChapterPicker()" type="button">',
  '<span class="chapterPickerEyebrow">STUDY CENTER</span><strong id="chapterPickerLabel">Chapter 5</strong><span class="chapterPickerHint">Change chapter</span><span aria-hidden="true" class="chapterPickerChevron">▾</span>',
  '</button>',
  '<div aria-label="Choose a chapter" class="chapterTabsPanel" id="chapterTabsPanel" role="tablist" hidden>',
  '<button aria-controls="homeScreen" aria-selected="false" class="chapterTab" id="chapterTab1" onclick="setChapter(1)" role="tab">📘 Chapter 1<small>Cardiovascular • Pharmacology • Tissue Integrity</small></button>',
  '<button aria-controls="homeScreen" aria-selected="false" class="chapterTab" id="chapterTab2" onclick="setChapter(2)" role="tab">📗 Chapter 2<small>Renal • Urinary • Sexual Function</small></button>',
  '<button aria-controls="homeScreen" aria-selected="false" class="chapterTab" id="chapterTab3" onclick="setChapter(3)" role="tab">📙 Chapter 3<small>Mobility • Spinal Cord • Neurologic</small></button>',
  '<button aria-controls="homeScreen" aria-selected="false" class="chapterTab" id="chapterTab4" onclick="setChapter(4)" role="tab">📕 Chapter 4<small>GI • Cancer • End-of-Life Care</small></button>',
  '<button aria-controls="homeScreen" aria-selected="false" class="chapterTab" id="chapterTab5" onclick="setChapter(5)" role="tab">📒 Chapter 5<small>Immunity • Metabolism • Endocrine</small></button>',
  '</div>',
  '</div>'
].join('\n');
replaceOnce(oldHtml, newHtml, 'chapter selector markup');

const tick = String.fromCharCode(96);
const oldFn = [
  'function setChapter(ch){',
  '  currentChapter=[1,2,3,4,5].includes(Number(ch))?Number(ch):4;',
  '  try{localStorage.setItem(K_CHAPTER,String(currentChapter))}catch(e){}',
  '  const meta=CHAPTER_META[currentChapter];',
  "  [1,2,3,4,5].forEach(n=>document.getElementById(" + tick + "chapterTab" + '$' + "{n}" + tick + ")?.classList.toggle('active',currentChapter===n));",
  "  const eb=document.getElementById('chapterEyebrow');if(eb)eb.textContent=meta.eyebrow;"
].join('\n');
const newFn = [
  'function toggleChapterPicker(forceOpen){',
  "  const panel=document.getElementById('chapterTabsPanel');",
  "  const toggle=document.getElementById('chapterPickerToggle');",
  '  if(!panel||!toggle)return;',
  "  const open=typeof forceOpen==='boolean'?forceOpen:panel.hidden;",
  '  panel.hidden=!open;',
  "  toggle.setAttribute('aria-expanded',String(open));",
  '}',
  'function updateChapterPicker(){',
  "  const label=document.getElementById('chapterPickerLabel');",
  "  if(label)label.textContent=CHAPTER_META[currentChapter]?.title||('Chapter '+currentChapter);",
  '  [1,2,3,4,5].forEach(n=>{',
  "    const tab=document.getElementById('chapterTab'+n);",
  "    if(tab){tab.classList.toggle('active',currentChapter===n);tab.setAttribute('aria-selected',String(currentChapter===n));}",
  '  });',
  '}',
  'function setChapter(ch){',
  '  currentChapter=[1,2,3,4,5].includes(Number(ch))?Number(ch):4;',
  '  try{localStorage.setItem(K_CHAPTER,String(currentChapter))}catch(e){}',
  '  const meta=CHAPTER_META[currentChapter];',
  '  updateChapterPicker();',
  '  toggleChapterPicker(false);',
  "  const eb=document.getElementById('chapterEyebrow');if(eb)eb.textContent=meta.eyebrow;"
].join('\n');
replaceOnce(oldFn, newFn, 'chapter selection logic');

replaceOnce(
  'function renderHome(){\n  currentModule=null;updatePracticeToggles();',
  'function renderHome(){\n  updateChapterPicker();\n  currentModule=null;updatePracticeToggles();',
  'initial selected chapter sync'
);

html = html.replace('Last updated: October 28, 2026 — Chapter 4 added', 'Last updated: November 15, 2026 — Compact lesson layout');
const lupusGlossaryPatch = `
/* Explicit systemic lupus erythematosus glossary coverage + searchable aliases */
Object.assign(window.GLOSSARY, {
  "systemic lupus erythematosus":["Systemic Lupus Erythematosus (SLE)","A chronic systemic autoimmune disease in which autoantibodies and immune-complex inflammation can affect multiple organs, especially the skin, joints, kidneys, blood cells, heart, lungs, and nervous system.","Common findings include fatigue, joint pain, photosensitive malar or other rashes, oral ulcers, and possible nephritis. ANA is sensitive but not specific; anti-dsDNA and anti-Smith antibodies are more specific, and complement levels/urinalysis help assess activity and kidney involvement. Treatment is individualized and may include hydroxychloroquine, corticosteroids, or immunosuppressants. Teach sun protection, medication adherence, infection precautions when immunosuppressed, and prompt reporting of chest pain, shortness of breath, edema, foamy/bloody urine, fever, or new neurologic symptoms."],
  "SLE":["Systemic Lupus Erythematosus (SLE)","The standard abbreviation for systemic lupus erythematosus, a chronic systemic autoimmune disease that can affect multiple organs.","Assess for skin and joint symptoms, fatigue, cytopenias, and renal involvement. ANA is sensitive but not specific; anti-dsDNA/anti-Smith antibodies, complement levels, and urinalysis help evaluate the diagnosis and disease activity. Reinforce sun protection, prescribed therapy, infection precautions when immunosuppressed, and reporting of possible organ involvement."],\n  "lupus":["Lupus (Systemic Lupus Erythematosus, SLE)","A chronic autoimmune disease that can cause inflammation and damage in multiple organs; systemic lupus erythematosus is the most common systemic form.","Look for fatigue, photosensitivity, joint pain, characteristic rashes, oral ulcers, cytopenias, and kidney involvement. ANA is commonly positive but is not diagnostic by itself. Monitor renal function and urine protein/blood, support sun protection, and reinforce prescribed therapy and infection precautions."],
  "lupas":["Lupus (commonly misspelled “lupas”)","A common misspelling of lupus, an autoimmune disease; the full medical term is systemic lupus erythematosus (SLE).","Use the correct spelling lupus. SLE can affect the skin, joints, kidneys, blood cells, heart, lungs, and nervous system."],
  "erythematosus":["Erythematosus","A medical adjective meaning characterized by erythema (redness); it appears in the name systemic lupus erythematosus.","In SLE, the term is part of the disease name and is associated with inflammatory skin findings such as a malar rash. It does not mean that every person with SLE has a rash."]
});
`;
replaceOnce('const GLOSSARY_PRON=window.GLOSSARY_PRON||{};', lupusGlossaryPatch+'\\nconst GLOSSARY_PRON=window.GLOSSARY_PRON||{};', 'lupus glossary terms');
const compactLessonCss = `
/* Compact lesson browser: two cards per row, less vertical padding */
.moduleGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.moduleCard{min-height:0;padding:13px;border-radius:15px;box-shadow:0 3px 12px rgba(34,54,56,.045)}
.moduleCard h3{font-size:1.08rem;line-height:1.2;margin:6px 0}
.moduleCard p{font-size:.82rem;line-height:1.35;margin:5px 0 8px}
.moduleCard .badge{font-size:.66rem;padding:4px 7px}
.moduleCard .metrics{gap:5px;margin:8px 0}
.moduleCard .metric{padding:6px 4px;font-size:.68rem;border-radius:9px}
.moduleCard .metric b{font-size:.88rem}
.moduleCard .progress{margin:5px 0 9px}
.moduleCard .cardActions{gap:6px}
.moduleCard .cardActions .btn{flex:1 1 auto;padding:7px 8px;font-size:.76rem;min-width:0}
#moduleSections>section{margin-bottom:18px}
#moduleSections .sectionTitle{font-size:1.35rem;margin:18px 0 9px}
#moduleSections .sectionHead .sectionTitle{margin-bottom:8px}
@media(max-width:760px){
  .moduleGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .moduleCard{padding:10px;border-radius:12px}
  .moduleCard h3{font-size:.98rem}
  .moduleCard p{font-size:.76rem;line-height:1.3}
  .moduleCard .cardActions{display:grid;grid-template-columns:1fr;gap:5px}
  .moduleCard .cardActions .btn{width:100%;padding:7px 6px;font-size:.72rem}
  .moduleCard .metrics{grid-template-columns:repeat(3,minmax(0,1fr))}
  #moduleSections>section{margin-bottom:13px}
  #moduleSections .sectionTitle{font-size:1.18rem;margin:14px 0 7px}
}
@media(max-width:360px){
  .moduleCard{padding:8px}
  .moduleCard h3{font-size:.9rem}
  .moduleCard p{font-size:.71rem}
  .moduleCard .metric{font-size:.62rem}
}
`;
replaceOnce('</head>', '<style>\n'+compactLessonCss+'\n</style>\n</head>', 'compact lesson layout insertion');

if (!html.includes('Sinusitis') || !html.includes('ch5-high-yield-immunity-metabolism')) {
  throw new Error('Preservation check failed. Refusing to publish.');
}
fs.writeFileSync(file, html);
fs.writeFileSync('index.html.gz', zlib.gzipSync(Buffer.from(html, 'utf8'), { level: 9, mtime: 0 }));
console.log('Built compact chapter selector and gzip HTML output.');

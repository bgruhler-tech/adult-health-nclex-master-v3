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
const ch5GlossaryData = JSON.parse(fs.readFileSync('ch5-glossary-data.json', 'utf8'));
const lupusGlossaryPatch = `
/* Chapter 5 audit: add missing terms and improve incomplete existing definitions without replacing established entries. */
const ch5GlossaryEntries = ${JSON.stringify(ch5GlossaryData)};
Object.entries(ch5GlossaryEntries).forEach(([term, entry]) => {
  const existing = window.GLOSSARY[term];
  if (!existing || !existing[1] || String(existing[1]).trim().length < 45) window.GLOSSARY[term] = entry;
});
`;
replaceOnce('const GLOSSARY_PRON=window.GLOSSARY_PRON||{};', lupusGlossaryPatch+'\nconst GLOSSARY_PRON=window.GLOSSARY_PRON||{};', 'lupus glossary terms');
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


const interactiveGlossaryPatch = String.raw`
<script id="interactiveGlossaryPatch">
(function(){
  const skip='script,style,noscript,textarea,input,select,option,button,a,.glossaryWord,[contenteditable="true"],#glossaryModal,header,nav';
  function glossaryKeys(){
    return Object.keys(window.GLOSSARY||{}).filter(k=>typeof k==='string'&&k.trim().length>1).sort((a,b)=>b.length-a.length);
  }
  function escapeRegExp(s){const slash=String.fromCharCode(92),special='.^$*+?()[]{}|'+slash;return String(s).split('').map(ch=>special.includes(ch)?slash+ch:ch).join('');}
  function enhance(root){
    if(!root)return;
    const keys=glossaryKeys();
    if(!keys.length)return;
    let re;
    try{re=new RegExp('(?<![A-Za-z0-9])('+keys.map(escapeRegExp).join('|')+')(?![A-Za-z0-9])','gi');}
    catch(e){console.error('Glossary matcher error',e);return;}
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode(n){
        if(!n.nodeValue||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;
        if(n.parentElement?.closest(skip))return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const n of nodes){
      const value=n.nodeValue;re.lastIndex=0;if(!re.test(value))continue;re.lastIndex=0;
      const frag=document.createDocumentFragment();let pos=0,m;
      while((m=re.exec(value))){
        if(m.index>pos)frag.appendChild(document.createTextNode(value.slice(pos,m.index)));
        const term=m[0],b=document.createElement('button');
        b.type='button';b.className='glossaryWord';b.dataset.term=term;b.textContent=term;
        b.title='Click to view glossary definition';b.setAttribute('aria-label','Define '+term);
        frag.appendChild(b);pos=m.index+term.length;
      }
      if(pos<value.length)frag.appendChild(document.createTextNode(value.slice(pos)));
      n.parentNode?.replaceChild(frag,n);
    }
  }
  function openDefinition(term){
    const g=window.GLOSSARY||{},key=Object.keys(g).find(k=>k.toLowerCase()===String(term||'').toLowerCase());
    if(!key)return;
    const value=g[key],modal=document.getElementById('glossaryModal');
    if(!modal)return;
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v||'';};
    set('glossaryTitle',key);set('glossaryFull',value[0]||key);set('glossaryDef',value[1]);set('glossaryWhy',value[2]);
    modal.classList.remove('hidden');modal.style.display='flex';document.body.style.overflow='hidden';
  }
  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('.glossaryWord');if(!b)return;
    e.preventDefault();e.stopPropagation();openDefinition(b.dataset.term||b.textContent);
  },true);
  function scan(){enhance(document.getElementById('quizPanel'));enhance(document.getElementById('reviewPanel'));}
  let queued=false;
  function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan();});}
  function start(){
    scan();
    ['quizPanel','reviewPanel'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)new MutationObserver(schedule).observe(el,{childList:true,subtree:true});
    });
    if(!window.__glossaryBodyObserver){
      window.__glossaryBodyObserver=new MutationObserver(schedule);
      window.__glossaryBodyObserver.observe(document.body,{childList:true,subtree:true});
    }
  }
  window.refreshStudyGlossary=scan;
  window.enhanceGlossary=enhance;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>`;
const oldPatchStart = html.indexOf('<script id="glossaryDynamicPatch">');
const oldPatchEnd = oldPatchStart < 0 ? -1 : html.indexOf('</script>', oldPatchStart);
if (oldPatchStart >= 0 && oldPatchEnd >= 0) html = html.slice(0, oldPatchStart) + html.slice(oldPatchEnd + 9);
const oldQuestionStart = html.indexOf('<script id="questionGlossaryFinalPatch">');
const oldQuestionEnd = oldQuestionStart < 0 ? -1 : html.indexOf('</script>', oldQuestionStart);
if (oldQuestionStart >= 0 && oldQuestionEnd >= 0) html = html.slice(0, oldQuestionStart) + html.slice(oldQuestionEnd + 9);
html = html.replace('</body>', interactiveGlossaryPatch + '\\n</body>');
const glossaryStyle = '.glossaryWord{display:inline!important;color:inherit!important;background:rgba(216,164,58,.22)!important;text-decoration:underline!important;text-decoration-style:dotted!important;text-decoration-color:#b9851d!important;text-underline-offset:3px!important;border:0!important;padding:0 1px!important;font:inherit!important;cursor:pointer!important;border-radius:2px!important}.glossaryWord:hover,.glossaryWord:focus{background:rgba(216,164,58,.42)!important;outline:1px solid rgba(185,133,29,.45)!important}';
html = html.replace('</head>', '<style>'+glossaryStyle+'</style>\\n</head>');
if (!html.includes('Sinusitis') || !html.includes('ch5-high-yield-immunity-metabolism')) throw new Error('Preservation check failed.');

const finalCompactCss = `
/* Compact two-column module cards across each home-screen category. */
#moduleSections{display:block!important}
#moduleSections>section{min-width:0!important;margin:0 0 14px!important}
#moduleSections .sectionHead{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
#moduleSections .sectionHead .sectionTitle{font-size:1.18rem!important;line-height:1.2!important;margin:10px 0 8px!important;min-width:0}
#moduleSections .sectionToggle{font-size:.68rem!important;white-space:nowrap;gap:5px;margin:0 0 7px auto}
#moduleSections .moduleGrid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
#moduleSections .moduleCard{min-width:0!important;width:100%!important;padding:12px!important;border-radius:15px!important;min-height:0!important}
#moduleSections .moduleCard h3{font-size:1.02rem!important;line-height:1.22!important;margin:6px 0!important}
#moduleSections .moduleCard p{font-size:.78rem!important;line-height:1.35!important;margin:5px 0 8px!important}
#moduleSections .moduleCard .metrics{gap:5px!important;margin:7px 0!important}
#moduleSections .moduleCard .metric{padding:6px 3px!important;font-size:.66rem!important}
#moduleSections .moduleCard .progress{margin:5px 0 8px!important}
#moduleSections .moduleCard .randomCheck{font-size:.68rem!important;margin:3px 0 6px!important}
#moduleSections .moduleCard .cardActions{gap:5px!important;flex-wrap:wrap}
#moduleSections .moduleCard .cardActions .btn{flex:1 1 0!important;min-width:0!important;padding:7px 6px!important;font-size:.7rem!important}
@media(max-width:760px){
 #moduleSections .sectionHead .sectionTitle{font-size:1.1rem!important}
 #moduleSections .moduleCard{padding:10px!important}
 #moduleSections .moduleGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
}
@media(max-width:360px){
 #moduleSections .moduleCard{padding:8px!important}
 #moduleSections .moduleGrid{gap:6px!important}
}
`;

if (!html.includes('Keep module cards in a compact two-column layout')) {
 html = html.replace('</head>', '<style>\\n'+finalCompactCss+'\\n</style>\\n</head>');
}


/* sourceLinkedStudyNotesPatch: hydrate missing review sections from the question bank's own source IDs and rationales. */
const sourceNoteInit = 'const MODULES=DATA.modules, BANKS=DATA.banks, REVIEWS=DATA.reviews;';
const sourceNoteRuntime = `
Object.entries(BANKS).forEach(([mid, questions]) => {
  const groups = new Map();
  (questions || []).forEach(q => { if(q.noteId){if(!groups.has(q.noteId))groups.set(q.noteId,[]);groups.get(q.noteId).push(q);} });
  groups.forEach((cards,noteId) => {
    const review=REVIEWS[mid]||(REVIEWS[mid]={title:M[mid]?.title||cards[0]?.noteTitle||'Study Notes',sections:[]});
    if(review.sections.some(section=>Array.isArray(section)&&section[2]===noteId))return;
    const items=cards.map((q,index)=>{
      q.conceptTarget={...(q.conceptTarget||{}),sourceModuleId:mid,sourceNoteId:noteId,itemIndex:index,title:q.tag||q.question};
      const correct=Array.isArray(q.answer)?q.answer.map(i=>q.rationales?.[i]||'').filter(Boolean).join(' '):(q.rationales?.[q.answer]||'');
      const summary=String(correct||q.question||'Review the question and rationale.').replace(/^Correct\\.\\s*/i,'').trim();
      return '<strong>'+esc(q.id)+'</strong> — '+esc(summary);
    });
    review.sections.push([cards[0]?.noteTitle||'Source Study Notes',items,noteId]);
  });
});
peekDirectHTML = function(q){
  if(!q)return '';
  const c=getConceptForQuestion(q),match=noteSectionForQuestion(q);
  const answer=Array.isArray(q.answer)?q.answer.map(i=>q.options[i]).join(', '):(q.options||[])[q.answer]||'Answer';
  const rationale=Array.isArray(q.answer)?(q.rationales||[])[q.answer?.[0]]||'':(q.rationales||[])[q.answer]||'';
  const summary=match?.items?.[match.itemIndex]||rationale||'Review the source section for this card.';
  const sourceTitle=q.noteTitle||match?.h||'Linked study source';
  return '<div class="peekDirect"><div class="peekDirectEyebrow">🎯 WHAT THIS QUESTION IS ACTUALLY TESTING</div><h3>'+esc(c?.title||q.tag||answer)+'</h3><div class="peekDirectWhy"><b>Why this answer fits:</b> '+esc(rationale)+'</div><div class="peekDirectStudy"><div class="peekSourceId"><b>Card ID:</b> <code>'+esc(q.id)+'</code></div><div class="peekSourceId"><b>Source:</b> '+esc(sourceTitle)+'</div><div class="peekSourceId"><b>Source ID:</b> <code>'+esc(q.noteId||match?.noteId||'Not supplied')+'</code></div><div class="peekDirectNote"><b>Key point summary:</b><div class="peekStudyItem">'+summary+'</div></div></div></div>';
};
`;
replaceOnce(sourceNoteInit, sourceNoteInit+'\\n'+sourceNoteRuntime, 'source-linked study note initialization');
const oldQuizMeta = '<div class="qmeta"><span class="qbadge">\${esc(q.category||q.tag||"NCLEX")}</span><span class="qtype">';
const newQuizMeta = '<div class="qmeta"><span class="qbadge">\${esc(q.category||q.tag||"NCLEX")}</span><span class="qIdBadge">Card ID: \${esc(q.id)}</span><span class="qtype">';
replaceOnce(oldQuizMeta,newQuizMeta,'quiz card ID');
const sourceCardCss = '.qIdBadge{display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:999px;padding:4px 8px;font-size:.72rem;font-weight:850;color:var(--green);background:rgba(15,107,97,.07);white-space:nowrap}.peekDirectStudy{margin-top:12px;padding-top:10px;border-top:1px solid var(--line)}.peekSourceId{font-size:.82rem;color:var(--muted);margin:5px 0}.peekSourceId code{font-weight:850;color:var(--green)}.peekDirectNote{margin-top:9px;padding:10px 12px;border-radius:10px;background:rgba(15,107,97,.06);line-height:1.5}';
replaceOnce('</head>','<style>'+sourceCardCss+'</style>\\n</head>','source card styles');

fs.writeFileSync(file, html);
fs.writeFileSync('index.html.gz', zlib.gzipSync(Buffer.from(html, 'utf8'), { level: 9, mtime: 0 }));
console.log('Built compact chapter selector and gzip HTML output.');

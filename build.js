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


const interactiveGlossaryPatch = String.raw`
<script id="interactiveGlossaryPatch">
(function(){
  const skip='script,style,noscript,textarea,input,select,option,button,a,.glossaryWord,[contenteditable="true"],#glossaryModal,header,nav';
  function glossaryKeys(){
    return Object.keys(window.GLOSSARY||{}).filter(k=>typeof k==='string'&&k.trim().length>1).sort((a,b)=>b.length-a.length);
  }
  function escapeRegExp(s){const special='.^$*+?()[]{}|\\\\';return String(s).split('').map(ch=>special.includes(ch)?'\\\\'+ch:ch).join('');}
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
if (!html.includes('Sinusitis') || !html.includes('ch5-high-yield-immunity-metabolism')) {'));
    try{return new RegExp('(?<![A-Za-z0-9])('+escaped.join('|')+')(?![A-Za-z0-9])','gi');}
    catch(e){console.error('Glossary matcher could not be built',e);return null;}
  }
  function enhance(root){
    if(!root)return;
    const re=makeRegex();
    if(!re)return;
    const scope=root.nodeType===Node.TEXT_NODE?root.parentElement:root;
    if(!scope)return;
    const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT,{
      acceptNode(node){
        if(!node.nodeValue||!node.nodeValue.trim())return NodeFilter.FILTER_REJECT;
        const p=node.parentElement;
        if(!p||p.closest(excluded))return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes=[];
    if(root.nodeType===Node.TEXT_NODE){
      if(walker.currentNode!==root && !root.parentElement?.closest(excluded))nodes.push(root);
    }else{
      while(walker.nextNode())nodes.push(walker.currentNode);
    }
    nodes.forEach(node=>{
      const value=node.nodeValue;
      re.lastIndex=0;
      if(!re.test(value)){re.lastIndex=0;return;}
      re.lastIndex=0;
      const fragment=document.createDocumentFragment();
      let cursor=0,match;
      while((match=re.exec(value))){
        if(match.index>cursor)fragment.appendChild(document.createTextNode(value.slice(cursor,match.index)));
        const term=match[0],button=document.createElement('button');
        button.type='button';button.className='glossaryWord';button.dataset.term=term;
        button.textContent=term;button.title='Tap to view definition';
        button.setAttribute('aria-label','Define '+term);
        fragment.appendChild(button);cursor=match.index+term.length;
      }
      if(cursor<value.length)fragment.appendChild(document.createTextNode(value.slice(cursor)));
      node.parentNode?.replaceChild(fragment,node);
    });
  }
  Object.assign(window.GLOSSARY, {
    "systemic":["Systemic","A term describing something that affects or involves the body as a whole rather than one isolated area.","In nursing, systemic findings suggest broader body involvement. Systemic lupus erythematosus is an autoimmune disease that can affect multiple organs."],
    "systemic lupus erythematosus":["Systemic Lupus Erythematosus (SLE)","A chronic systemic autoimmune disease that can affect multiple organs, including the skin, joints, kidneys, blood cells, heart, lungs, and nervous system.","Assess for fatigue, joint pain, photosensitive rash, oral ulcers, cytopenias, and renal involvement. ANA is sensitive but not specific; anti-dsDNA and anti-Smith antibodies are more specific. Monitor urinalysis and renal function; reinforce sun protection, prescribed treatment, and infection precautions when immunosuppressed."],
    "lupus":["Lupus (Systemic Lupus Erythematosus, SLE)","An autoimmune disease that causes inflammation and can affect multiple organs.","Assess skin, joint, renal, blood, cardiac, pulmonary, and neurologic manifestations. Reinforce sun protection, medication adherence, and monitoring for organ involvement."],
    "erythematosus":["Erythematosus","A medical adjective relating to redness or erythema; it is part of the name systemic lupus erythematosus.","In SLE, it is part of the disease name and is associated with inflammatory skin findings such as a malar rash."]
  });
  window.showGlossary=function(term){
    const raw=String(term||'').trim(),g=window.GLOSSARY||{};
    const key=Object.keys(g).find(k=>k.toLowerCase()===raw.toLowerCase());
    const value=key?g[key]:null,modal=document.getElementById('glossaryModal');
    if(!value||!modal)return;
    document.getElementById('glossaryTitle').textContent=key;
    document.getElementById('glossaryFull').textContent=value[0]||key;
    document.getElementById('glossaryDef').textContent=value[1]||'';
    document.getElementById('glossaryWhy').textContent=value[2]||'';
    modal.classList.remove('hidden');modal.style.display='flex';
    document.body.style.overflow='hidden';
  };
  window.enhanceGlossary=enhance;
  document.addEventListener('click',function(event){
    const word=event.target?.closest?.('.glossaryWord');
    if(!word)return;
    event.preventDefault();event.stopPropagation();
    window.showGlossary(word.dataset.term||word.textContent);
  },true);
  let queued=false;
  function refresh(){
    if(queued)return;queued=true;
    queueMicrotask(()=>{queued=false;enhance(document.body);});
  }
  function start(){
    enhance(document.body);
    if(!window.__globalGlossaryObserver){
      window.__globalGlossaryObserver=new MutationObserver(records=>{
        if(records.some(r=>r.addedNodes.length))refresh();
      });
      window.__globalGlossaryObserver.observe(document.body,{childList:true,subtree:true});
    }
  }
  window.refreshStudyGlossary=refresh;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
</script>`;
const globalGlossaryStart = html.indexOf('<script id="glossaryDynamicPatch">');
const globalGlossaryEnd = globalGlossaryStart < 0 ? -1 : html.indexOf('</script>', globalGlossaryStart);
if (globalGlossaryStart < 0 || globalGlossaryEnd < 0) throw new Error('Global glossary renderer anchor missing; refusing unsafe build.');
html = html.slice(0, globalGlossaryStart) + globalGlossaryPatch + html.slice(globalGlossaryEnd + '</script>'.length);

if (!html.includes('Sinusitis') || !html.includes('ch5-high-yield-immunity-metabolism')) {
  throw new Error('Preservation check failed. Refusing to publish.');
}

/* Final pass: dynamic glossary keys are built at runtime, after all chapter data is loaded. */
const questionGlossaryPatch = String.raw`<script id="questionGlossaryFinalPatch">
(function(){
  const blocked='button,a,script,style,textarea,input,select,option,.glossaryWord,[contenteditable="true"],#glossaryModal';
  function enhance(root){
    if(!root)return;
    const g=window.GLOSSARY||{};
    const keys=Object.keys(g).filter(k=>String(k).trim().length>1).sort((a,b)=>b.length-a.length);
    if(!keys.length)return;
    const esc=s=>String(s).split('').map(ch=>'.^$*+?()[]{}|\\'.includes(ch)?'\\'+ch:ch).join('');
    let re;
    try{re=new RegExp('(?<![A-Za-z0-9])('+keys.map(esc).join('|')+')(?![A-Za-z0-9])','gi');}
    catch(e){console.warn('Glossary regex unavailable',e);return;}
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode(n){
        if(!n.nodeValue||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;
        if(n.parentElement?.closest(blocked))return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      const value=n.nodeValue;re.lastIndex=0;if(!re.test(value))return;re.lastIndex=0;
      const frag=document.createDocumentFragment();let last=0,m;
      while((m=re.exec(value))){
        if(m.index>last)frag.appendChild(document.createTextNode(value.slice(last,m.index)));
        const b=document.createElement('button');b.type='button';b.className='glossaryWord';b.dataset.term=m[0];b.textContent=m[0];b.title='Click for definition';b.setAttribute('aria-label','Define '+m[0]);frag.appendChild(b);last=m.index+m[0].length;
      }
      if(last<value.length)frag.appendChild(document.createTextNode(value.slice(last)));
      n.parentNode?.replaceChild(frag,n);
    });
  }
  function refresh(){
    document.querySelectorAll('#quizPanel .question,#quizPanel .casebox,#quizPanel .rat,#reviewPanel .reviewCard,#reviewPanel .studyNote,#reviewPanel .notesCard,#reviewPanel .noteCard').forEach(enhance);
  }
  window.forceGlossaryEnhance=enhance;
  window.refreshStudyGlossary=refresh;
  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('.glossaryWord');if(!b)return;
    e.preventDefault();e.stopPropagation();window.showGlossary?.(b.dataset.term||b.textContent);
  },true);
  const quiz=document.getElementById('quizPanel');
  if(quiz)new MutationObserver(()=>queueMicrotask(refresh)).observe(quiz,{childList:true,subtree:true});
  const review=document.getElementById('reviewPanel');
  if(review)new MutationObserver(()=>queueMicrotask(refresh)).observe(review,{childList:true,subtree:true});
  if(typeof window.renderQuiz==='function'){
    const original=window.renderQuiz;
    window.renderQuiz=function(){const result=original.apply(this,arguments);refresh();return result;};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();
</script>`;
if (!html.includes('id="questionGlossaryFinalPatch"')) {
  html = html.replace('</body>', questionGlossaryPatch + '\\n</body>');
}
const finalCompactCss = `
/* Compact two-column category layout: each module section sits beside the next. */
#moduleSections{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;align-items:start!important;gap:18px!important}
#moduleSections>section{min-width:0!important;margin:0 0 8px!important}
#moduleSections .sectionHead{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
#moduleSections .sectionHead .sectionTitle{font-size:1.18rem!important;line-height:1.2!important;margin:10px 0 8px!important;min-width:0}
#moduleSections .sectionToggle{font-size:.68rem!important;white-space:nowrap;gap:5px;margin:0 0 7px auto}
#moduleSections .moduleGrid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:8px!important}
#moduleSections .moduleCard{min-width:0!important;width:100%!important;padding:12px!important;border-radius:15px!important;min-height:0!important}
#moduleSections .moduleCard h3{font-size:1.02rem!important;line-height:1.22!important;margin:6px 0!important}
#moduleSections .moduleCard p{font-size:.78rem!important;line-height:1.35!important;margin:5px 0 8px!important}
#moduleSections .moduleCard .metrics{gap:5px!important;margin:7px 0!important}
#moduleSections .moduleCard .metric{padding:6px 3px!important;font-size:.66rem!important}
#moduleSections .moduleCard .progress{margin:5px 0 8px!important}
#moduleSections .moduleCard .randomCheck{font-size:.68rem!important;margin:3px 0 6px!important}
#moduleSections .moduleCard .cardActions{gap:5px!important}
#moduleSections .moduleCard .cardActions .btn{flex:1 1 0!important;min-width:0!important;padding:7px 6px!important;font-size:.7rem!important}
@media(max-width:760px){
 #moduleSections{grid-template-columns:1fr!important;gap:12px!important}
 #moduleSections .sectionHead .sectionTitle{font-size:1.1rem!important}
 #moduleSections .moduleCard{padding:10px!important}
}
`;

if (!html.includes('Keep module cards in a compact two-column layout')) {
 html = html.replace('</head>', '<style>\\n'+finalCompactCss+'\\n</style>\\n</head>');
}

fs.writeFileSync(file, html);
fs.writeFileSync('index.html.gz', zlib.gzipSync(Buffer.from(html, 'utf8'), { level: 9, mtime: 0 }));
console.log('Built compact chapter selector and gzip HTML output.');

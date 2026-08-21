import{p as h,w as Q,s as V,r as Z,a as k,b as L,d as ee,i as D,c as M,e as te}from"./progress.dI47thGJ.js";const K=e=>e==="complete"||e==="skipped";function W(e,t){const r=t.units[h(e.order)];return r?.state==="complete"?"complete":r?.state==="skipped"?"skipped":e.requires.every(o=>K(t.units[h(o)]?.state))?r?"in-progress":"available":"locked"}function j(e,t){return e.requires.filter(r=>!K(t.units[h(r)]?.state))}function ne(e){return[e.ladder,...e.varied,e.transfer]}function se(e,t){return ne(e).every(r=>t.problems[r]?.solved===!0)}const T="___RESULTS___",re=`
const _RESULTS = [];
const _repr = (v) => {
  if (typeof v === 'string') return JSON.stringify(v);
  if (v instanceof Set) return 'Set(' + JSON.stringify([...v]) + ')';
  if (v instanceof Map) return 'Map(' + JSON.stringify([...v]) + ')';
  try { return JSON.stringify(v) ?? String(v); } catch { return String(v); }
};
const _same = (a, b) => {
  if (a === b) return true;
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((x, i) => _same(x, b[i]));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => _same(a[k], b[k]));
  }
  return false;
};
function expect(actual, expected, label) {
  _RESULTS.push({
    label,
    ok: _same(actual, expected),
    actual: _repr(actual).slice(0, 200),
    expected: _repr(expected).slice(0, 200),
  });
}
function under(seconds, label, fn) {
  const t0 = performance.now();
  fn();
  const dt = (performance.now() - t0) / 1000;
  _RESULTS.push({
    label,
    ok: dt < seconds,
    actual: dt.toFixed(3) + 's',
    expected: '< ' + seconds.toFixed(1) + 's',
  });
}
`,oe=`#include <bits/stdc++.h>
using namespace std;

static vector<string> _RESULTS;

static string _esc(const string& s) {
  string o;
  for (char c : s) {
    if (c == '"' || c == '\\\\') { o += '\\\\'; o += c; }
    else if (c == '\\n') o += "\\\\n";
    else if (c == '\\t') o += "\\\\t";
    else if ((unsigned char)c < 0x20) o += ' ';
    else o += c;
  }
  return o;
}

static string _repr(const string& v) { return "\\"" + v + "\\""; }
static string _repr(const char* v)   { return string("\\"") + v + "\\""; }
static string _repr(bool v)          { return v ? "true" : "false"; }
template <class T> static string _repr(const T& v) { ostringstream o; o << v; return o.str(); }
template <class T> static string _repr(const vector<T>& v) {
  string o = "[";
  for (size_t i = 0; i < v.size(); i++) { if (i) o += ", "; o += _repr(v[i]); }
  return o + "]";
}

template <class A, class B>
void expect(const A& actual, const B& expected, const string& label) {
  bool ok = (actual == expected);
  _RESULTS.push_back(string("{\\"label\\":\\"") + _esc(label) + "\\",\\"ok\\":" + (ok ? "true" : "false") +
                     ",\\"actual\\":\\"" + _esc(_repr(actual)) + "\\",\\"expected\\":\\"" + _esc(_repr(expected)) + "\\"}");
}

void under(double seconds, const string& label, const function<void()>& fn) {
  auto t0 = chrono::steady_clock::now();
  fn();
  double dt = chrono::duration<double>(chrono::steady_clock::now() - t0).count();
  ostringstream a, e;
  a << fixed << setprecision(3) << dt << "s";
  e << "< " << fixed << setprecision(1) << seconds << "s";
  _RESULTS.push_back(string("{\\"label\\":\\"") + _esc(label) + "\\",\\"ok\\":" + (dt < seconds ? "true" : "false") +
                     ",\\"actual\\":\\"" + a.str() + "\\",\\"expected\\":\\"" + e.str() + "\\"}");
}

static void _emit() {
  string o = "[";
  for (size_t i = 0; i < _RESULTS.size(); i++) { if (i) o += ","; o += _RESULTS[i]; }
  cout << "\\n${T}" << o << "]" << endl;
}
`,ae=e=>`
int main() {
${e}
  _emit();
  return 0;
}
`,ie=15e3,ce=45e3,le=e=>e==="cpp",B="/dsa-guide".replace(/\/$/,""),de={python:`${B}/py-worker.js`,javascript:`${B}/js-worker.js`},x={},_={};let $=!1;function z(e){let t=x[e];return t||(t=new Worker(de[e]),t.onmessage=r=>_[e]?.(r.data),t.onerror=()=>_[e]?.({type:"boot-error",message:"Could not start the worker."}),x[e]=t),t}function N(e){x[e]?.terminate(),delete x[e],e==="python"&&($=!1)}function ue(){$||z("python").postMessage({type:"preload"})}function pe(e){const t=e.lang;return new Promise(r=>{const s=n=>{window.clearTimeout(o),_[t]=void 0,r(n)},o=window.setTimeout(()=>{N(t),s({kind:"timeout"})},ie);_[t]=n=>{switch(n.type){case"ready":$=!0;break;case"out":e.onOutput(n.text,n.stream==="err");break;case"graded":s({kind:"graded",results:n.results,ms:n.ms});break;case"done":s({kind:"ran",ms:n.ms});break;case"error":s({kind:"error",message:n.message});break;case"boot-error":N(t),s({kind:"unavailable",message:n.message});break}},z(t).postMessage({type:e.tests?"grade":"run",code:e.code,tests:e.tests,harness:t==="javascript"?re:void 0})})}const fe="https://wandbox.org/api/compile.json";async function me(e){const t=e.tests?oe+`
`+e.code+`
`+ae(e.tests):e.code,r=new AbortController,s=window.setTimeout(()=>r.abort(),ce);e.signal?.addEventListener("abort",()=>r.abort());let o;try{const d=await fetch(fe,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:t,compiler:"gcc-head",options:"","compiler-option-raw":`-O2
-std=c++17`}),signal:r.signal});if(!d.ok)return{kind:"unavailable",message:`Compiler service returned ${d.status}.`};o=await d.json()}catch(d){return d?.name==="AbortError"?{kind:"timeout"}:{kind:"unavailable",message:"Could not reach the C++ compiler service. Python and JavaScript still run locally."}}finally{window.clearTimeout(s)}if(o.compiler_error)return{kind:"error",message:o.compiler_error.trim()};const n=o.program_output??"",a=o.program_error??"";a.trim()&&e.onOutput(a.trim(),!0);const i=n.indexOf(T),l=i>=0?n.slice(0,i):n;if(l.trim()&&e.onOutput(l.replace(/\n+$/,""),!1),!e.tests)return{kind:"ran",ms:0};if(i<0)return{kind:"error",message:a.trim()||"The program did not finish — it may have crashed or been stopped."};try{const d=n.slice(i+T.length).trim();return{kind:"graded",results:JSON.parse(d),ms:0}}catch{return{kind:"error",message:"Could not read the test results from the program output."}}}function A(e){return e.lang==="cpp"?me(e):pe(e)}function ge(e){e!=="cpp"&&N(e)}const H="dsa-course.lang",F=()=>{try{return localStorage.getItem(H)||""}catch{return""}},he=e=>{try{localStorage.setItem(H,e)}catch{}};function be(e,t){const r=()=>{e.style.height="auto",e.style.height=`${e.scrollHeight}px`};r(),e.addEventListener("input",r),e.addEventListener("keydown",s=>{if(s.key==="Tab"){s.preventDefault();const{selectionStart:o,selectionEnd:n,value:a}=e;if(s.shiftKey){const i=a.lastIndexOf(`
`,o-1)+1;a.slice(i,i+4)==="    "&&(e.value=a.slice(0,i)+a.slice(i+4),e.selectionStart=e.selectionEnd=Math.max(i,o-4))}else e.value=`${a.slice(0,o)}    ${a.slice(n)}`,e.selectionStart=e.selectionEnd=o+4;r()}else s.key==="Enter"&&(s.metaKey||s.ctrlKey)?(s.preventDefault(),t()):s.key==="Escape"&&e.blur()})}function ye(e,t,r){const s=JSON.parse(t.querySelector(".problem-data").textContent||"{}"),o=s.lang,n=t.querySelector(".problem-editor"),a=n.value,i=t.querySelector(".problem-out"),l=t.querySelector(".problem-results"),d=t.querySelector(".problem-status"),f=t.querySelector(".problem-hints"),m=t.querySelector(".problem-solution"),E=c=>t.querySelector(`[data-act="${c}"]`);let w=0;be(n,U),D(e)&&(m.hidden=!1);const v=c=>{E("submit").disabled=c,E("run").disabled=c,E("stop").hidden=!c||le(o)};function y(c,u){i.hidden=!1;const g=document.createElement("span");u&&(g.className="runner-err"),g.textContent=c+`
`,i.appendChild(g)}function C(){i.textContent="",i.hidden=!0,l.textContent="",l.hidden=!0}function q(){return o==="cpp"?"compiling remotely…":o==="python"?"starting Python…":"running…"}function R(c){c.kind==="timeout"?(y("⏱ stopped after the time limit — infinite loop?",!0),d.textContent="stopped"):c.kind==="error"?(y(c.message,!0),d.textContent="error"):c.kind==="unavailable"?(y(c.message,!0),d.textContent="unavailable"):c.kind==="ran"&&(d.textContent=c.ms?`ran in ${Math.max(1,Math.round(c.ms))} ms`:"ran")}async function Y(){C(),v(!0),d.textContent=q();const c=await A({lang:o,code:n.value,onOutput:y});v(!1),R(c)}async function U(){C(),v(!0),d.textContent=q();const c=await A({lang:o,code:n.value,tests:s.tests,onOutput:y});if(v(!1),c.kind!=="graded"){M(e,!1),R(c);return}l.hidden=!1;let u=0;for(const b of c.results){const S=document.createElement("li");if(S.className=b.ok?"test-row ok":"test-row bad",S.innerHTML=`<span class="test-mark">${b.ok?"✓":"✗"}</span><span class="test-label"></span>`,S.querySelector(".test-label").textContent=b.label,!b.ok){const O=document.createElement("div");O.className="test-detail",O.textContent=`expected ${b.expected} · got ${b.actual}`,S.appendChild(O)}l.appendChild(S),b.ok&&u++}const g=c.results.length>0&&u===c.results.length;M(e,g),d.textContent=g?`passed ${u}/${c.results.length}`:`${u}/${c.results.length} passed`,g&&(m.hidden=!1,r())}t.addEventListener("click",c=>{const u=c.target.closest("button")?.dataset.act;if(u==="submit")U();else if(u==="run")Y();else if(u==="reset")n.value=a,n.dispatchEvent(new Event("input")),C(),d.textContent="";else if(u==="stop")ge(o),v(!1),y("■ stopped",!0),d.textContent="stopped";else if(u==="hint"){if(w>=s.hints.length){d.textContent="no more hints";return}f.hidden=!1;const g=document.createElement("p");g.textContent=s.hints[w++],f.appendChild(g),w>=s.hints.length&&(E("hint").disabled=!0)}})}function G(e){document.querySelectorAll(".problem").forEach(t=>{JSON.parse(t.dataset.langs||"[]").includes(e)&&t.dispatchEvent(new CustomEvent("setlang",{detail:e}))}),document.querySelectorAll(".ladder").forEach(t=>{const r=[...t.querySelectorAll(".ladder-pane")];if(!r.length)return;const s=r.find(a=>a.dataset.lang===e),o=s??r[0];r.forEach(a=>{a.hidden=a!==o});const n=t.querySelector(".ladder-note");n&&(s?n.hidden=!0:(n.hidden=!1,n.textContent=`No ladder written in that language yet — showing ${o.dataset.langLabel}.`))})}function ke(e){const t=e.dataset.problemId,r=[...e.querySelectorAll(".lang-pane")],s=[...e.querySelectorAll(".langtab")],o=()=>{e.classList.add("is-solved"),X()};D(t)&&e.classList.add("is-solved"),r.forEach(l=>ye(t,l,o));const n=l=>{r.forEach(m=>{m.hidden=m.dataset.lang!==l}),s.forEach(m=>m.setAttribute("aria-selected",String(m.dataset.lang===l)));const f=r.find(m=>!m.hidden)?.querySelector(".problem-editor");f&&(f.style.height="auto",f.style.height=`${f.scrollHeight}px`),l==="python"&&ue()};s.forEach(l=>l.addEventListener("click",()=>{const d=l.dataset.lang;he(d),G(d)})),e.addEventListener("setlang",l=>n(l.detail));const a=JSON.parse(e.dataset.langs||"[]"),i=F();n(a.includes(i)?i:a[0])}function ve(e){const t=e.closest(".ladder-pane"),r=t?.dataset.lang||"python",s=t?.dataset.ladderDemo||"",o=(e.querySelector(".rung-code").textContent||"")+`
`+s,n=e.querySelector(".rung-out"),a=e.querySelector(".rung-status");e.querySelector('[data-act="run-rung"]').addEventListener("click",async()=>{n.hidden=!1,n.textContent="",a.textContent=r==="cpp"?"compiling remotely…":"running…";const i=await A({lang:r,code:o,onOutput:(l,d)=>{const f=document.createElement("span");d&&(f.className="runner-err"),f.textContent=l+`
`,n.appendChild(f)}});if(i.kind==="ran")a.textContent=i.ms?`${Math.max(1,Math.round(i.ms))} ms`:"done";else if(i.kind==="timeout")a.textContent="stopped at the time limit";else if(i.kind==="error"||i.kind==="unavailable"){a.textContent=i.kind==="error"?"error":"unavailable";const l=document.createElement("span");l.className="runner-err",l.textContent=i.message+`
`,n.appendChild(l)}})}let p=null;function X(){if(!p)return;const e=k(),t=se({ladder:p.ladder,varied:p.varied,transfer:p.transfer},e),r=h(p.order),s=e.units[r]?.state;t&&s!=="complete"?L(r,"complete"):!t&&!s&&L(r,"in-progress");const o=document.getElementById("unit-complete");o&&(o.hidden=!t)}function Se(){const e=document.getElementById("unit-root");if(!e)return;p=JSON.parse(e.dataset.unit);const t=k(),r=W({order:p.order,requires:p.requires},t),s=document.getElementById("unit-body"),o=document.getElementById("unit-locked");if(r==="locked"){o.hidden=!1;const n=j({order:p.order,requires:p.requires},t);o.querySelector(".locked-list").textContent=n.map(i=>`Unit ${h(i)}`).join(", ");const a=o.querySelector(".locked-link");n.length&&(a.href=`${"/dsa-guide".replace(/\/$/,"")}/learn/${h(n[0])}`)}else{s.hidden=!1,document.querySelectorAll(".problem").forEach(ke),document.querySelectorAll(".rung").forEach(ve);const n=F();n&&G(n),X()}o.querySelector('[data-act="skip"]')?.addEventListener("click",()=>{j({order:p.order,requires:p.requires},k()).forEach(a=>L(h(a),"skipped")),location.reload()})}function I(){const e=document.querySelectorAll("[data-unit-card]");if(!e.length)return;const t=k();e.forEach(s=>{const o=JSON.parse(s.dataset.unitCard),n=W(o,t);s.dataset.state=n;const a=s.querySelector(".state-pill");a&&(a.textContent=n==="in-progress"?"in progress":n),n==="locked"?s.setAttribute("aria-disabled","true"):s.removeAttribute("aria-disabled")});const r=document.getElementById("due-badge");if(r){const s=ee().length;r.textContent=s?`${s} due`:"nothing due",r.hidden=!1}}function J(){const e=document.querySelectorAll("[data-inv-unit]");if(!e.length)return;const t=k();e.forEach(r=>{const s=t.units[h(Number(r.dataset.invUnit))]?.state;r.dataset.state=s==="complete"?"known":s?"learning":"locked"})}function Ee(){if(k(),!te)return;const e=document.getElementById("storage-notice");e&&(e.hidden=!1)}function P(){Q(),V(()=>{I(),J()}),Se(),I(),J(),Ee(),document.getElementById("reset-progress")?.addEventListener("click",()=>{confirm("Reset all course progress? This cannot be undone.")&&(Z(),location.reload())})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",P,{once:!0}):P();

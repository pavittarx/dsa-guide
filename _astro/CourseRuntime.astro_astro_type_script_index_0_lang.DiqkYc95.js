import{p as g,w as X,s as Y,r as Q,a as y,b as L,d as V,i as D,c as M,e as Z}from"./progress.dI47thGJ.js";const K=e=>e==="complete"||e==="skipped";function W(e,t){const r=t.units[g(e.order)];return r?.state==="complete"?"complete":r?.state==="skipped"?"skipped":e.requires.every(o=>K(t.units[g(o)]?.state))?r?"in-progress":"available":"locked"}function j(e,t){return e.requires.filter(r=>!K(t.units[g(r)]?.state))}function ee(e){return[e.ladder,...e.varied,e.transfer]}function te(e,t){return ee(e).every(r=>t.problems[r]?.solved===!0)}const T="___RESULTS___",ne=`
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
`,se=`#include <bits/stdc++.h>
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
`,re=e=>`
int main() {
${e}
  _emit();
  return 0;
}
`,oe=15e3,ae=45e3,ie=e=>e==="cpp",B="/dsa-guide".replace(/\/$/,""),ce={python:`${B}/py-worker.js`,javascript:`${B}/js-worker.js`},E={},x={};let $=!1;function z(e){let t=E[e];return t||(t=new Worker(ce[e]),t.onmessage=r=>x[e]?.(r.data),t.onerror=()=>x[e]?.({type:"boot-error",message:"Could not start the worker."}),E[e]=t),t}function N(e){E[e]?.terminate(),delete E[e],e==="python"&&($=!1)}function le(){$||z("python").postMessage({type:"preload"})}function de(e){const t=e.lang;return new Promise(r=>{const n=s=>{window.clearTimeout(o),x[t]=void 0,r(s)},o=window.setTimeout(()=>{N(t),n({kind:"timeout"})},oe);x[t]=s=>{switch(s.type){case"ready":$=!0;break;case"out":e.onOutput(s.text,s.stream==="err");break;case"graded":n({kind:"graded",results:s.results,ms:s.ms});break;case"done":n({kind:"ran",ms:s.ms});break;case"error":n({kind:"error",message:s.message});break;case"boot-error":N(t),n({kind:"unavailable",message:s.message});break}},z(t).postMessage({type:e.tests?"grade":"run",code:e.code,tests:e.tests,harness:t==="javascript"?ne:void 0})})}const ue="https://wandbox.org/api/compile.json";async function pe(e){const t=e.tests?se+`
`+e.code+`
`+re(e.tests):e.code,r=new AbortController,n=window.setTimeout(()=>r.abort(),ae);e.signal?.addEventListener("abort",()=>r.abort());let o;try{const a=await fetch(ue,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:t,compiler:"gcc-head",options:"","compiler-option-raw":`-O2
-std=c++17`}),signal:r.signal});if(!a.ok)return{kind:"unavailable",message:`Compiler service returned ${a.status}.`};o=await a.json()}catch(a){return a?.name==="AbortError"?{kind:"timeout"}:{kind:"unavailable",message:"Could not reach the C++ compiler service. Python and JavaScript still run locally."}}finally{window.clearTimeout(n)}if(o.compiler_error)return{kind:"error",message:o.compiler_error.trim()};const s=o.program_output??"",l=o.program_error??"";l.trim()&&e.onOutput(l.trim(),!0);const i=s.indexOf(T),d=i>=0?s.slice(0,i):s;if(d.trim()&&e.onOutput(d.replace(/\n+$/,""),!1),!e.tests)return{kind:"ran",ms:0};if(i<0)return{kind:"error",message:l.trim()||"The program did not finish — it may have crashed or been stopped."};try{const a=s.slice(i+T.length).trim();return{kind:"graded",results:JSON.parse(a),ms:0}}catch{return{kind:"error",message:"Could not read the test results from the program output."}}}function A(e){return e.lang==="cpp"?pe(e):de(e)}function fe(e){e!=="cpp"&&N(e)}const H="dsa-course.lang",me=()=>{try{return localStorage.getItem(H)||""}catch{return""}},ge=e=>{try{localStorage.setItem(H,e)}catch{}};function he(e,t){const r=()=>{e.style.height="auto",e.style.height=`${e.scrollHeight}px`};r(),e.addEventListener("input",r),e.addEventListener("keydown",n=>{if(n.key==="Tab"){n.preventDefault();const{selectionStart:o,selectionEnd:s,value:l}=e;if(n.shiftKey){const i=l.lastIndexOf(`
`,o-1)+1;l.slice(i,i+4)==="    "&&(e.value=l.slice(0,i)+l.slice(i+4),e.selectionStart=e.selectionEnd=Math.max(i,o-4))}else e.value=`${l.slice(0,o)}    ${l.slice(s)}`,e.selectionStart=e.selectionEnd=o+4;r()}else n.key==="Enter"&&(n.metaKey||n.ctrlKey)?(n.preventDefault(),t()):n.key==="Escape"&&e.blur()})}function be(e,t,r){const n=JSON.parse(t.querySelector(".problem-data").textContent||"{}"),o=n.lang,s=t.querySelector(".problem-editor"),l=s.value,i=t.querySelector(".problem-out"),d=t.querySelector(".problem-results"),a=t.querySelector(".problem-status"),m=t.querySelector(".problem-hints"),_=t.querySelector(".problem-solution"),S=c=>t.querySelector(`[data-act="${c}"]`);let C=0;he(s,q),D(e)&&(_.hidden=!1);const k=c=>{S("submit").disabled=c,S("run").disabled=c,S("stop").hidden=!c||ie(o)};function b(c,u){i.hidden=!1;const f=document.createElement("span");u&&(f.className="runner-err"),f.textContent=c+`
`,i.appendChild(f)}function w(){i.textContent="",i.hidden=!0,d.textContent="",d.hidden=!0}function R(){return o==="cpp"?"compiling remotely…":o==="python"?"starting Python…":"running…"}function U(c){c.kind==="timeout"?(b("⏱ stopped after the time limit — infinite loop?",!0),a.textContent="stopped"):c.kind==="error"?(b(c.message,!0),a.textContent="error"):c.kind==="unavailable"?(b(c.message,!0),a.textContent="unavailable"):c.kind==="ran"&&(a.textContent=c.ms?`ran in ${Math.max(1,Math.round(c.ms))} ms`:"ran")}async function G(){w(),k(!0),a.textContent=R();const c=await A({lang:o,code:s.value,onOutput:b});k(!1),U(c)}async function q(){w(),k(!0),a.textContent=R();const c=await A({lang:o,code:s.value,tests:n.tests,onOutput:b});if(k(!1),c.kind!=="graded"){M(e,!1),U(c);return}d.hidden=!1;let u=0;for(const h of c.results){const v=document.createElement("li");if(v.className=h.ok?"test-row ok":"test-row bad",v.innerHTML=`<span class="test-mark">${h.ok?"✓":"✗"}</span><span class="test-label"></span>`,v.querySelector(".test-label").textContent=h.label,!h.ok){const O=document.createElement("div");O.className="test-detail",O.textContent=`expected ${h.expected} · got ${h.actual}`,v.appendChild(O)}d.appendChild(v),h.ok&&u++}const f=c.results.length>0&&u===c.results.length;M(e,f),a.textContent=f?`passed ${u}/${c.results.length}`:`${u}/${c.results.length} passed`,f&&(_.hidden=!1,r())}t.addEventListener("click",c=>{const u=c.target.closest("button")?.dataset.act;if(u==="submit")q();else if(u==="run")G();else if(u==="reset")s.value=l,s.dispatchEvent(new Event("input")),w(),a.textContent="";else if(u==="stop")fe(o),k(!1),b("■ stopped",!0),a.textContent="stopped";else if(u==="hint"){if(C>=n.hints.length){a.textContent="no more hints";return}m.hidden=!1;const f=document.createElement("p");f.textContent=n.hints[C++],m.appendChild(f),C>=n.hints.length&&(S("hint").disabled=!0)}})}function ye(e){const t=e.dataset.problemId,r=[...e.querySelectorAll(".lang-pane")],n=[...e.querySelectorAll(".langtab")],o=()=>{e.classList.add("is-solved"),F()};D(t)&&e.classList.add("is-solved"),r.forEach(d=>be(t,d,o));const s=d=>{r.forEach(a=>{a.hidden=a.dataset.lang!==d}),n.forEach(a=>a.setAttribute("aria-selected",String(a.dataset.lang===d))),d==="python"&&le()};n.forEach(d=>d.addEventListener("click",()=>{const a=d.dataset.lang;ge(a),document.querySelectorAll(".problem").forEach(m=>{JSON.parse(m.dataset.langs||"[]").includes(a)&&m.dispatchEvent(new CustomEvent("setlang",{detail:a}))})})),e.addEventListener("setlang",d=>s(d.detail));const l=JSON.parse(e.dataset.langs||"[]"),i=me();s(l.includes(i)?i:l[0])}function ke(e){const t=e.closest(".ladder"),r=t?.dataset.ladderLang||"python",n=t?.dataset.ladderDemo||"",o=(e.querySelector(".rung-code").textContent||"")+`
`+n,s=e.querySelector(".rung-out"),l=e.querySelector(".rung-status");e.querySelector('[data-act="run-rung"]').addEventListener("click",async()=>{s.hidden=!1,s.textContent="",l.textContent=r==="cpp"?"compiling remotely…":"running…";const i=await A({lang:r,code:o,onOutput:(d,a)=>{const m=document.createElement("span");a&&(m.className="runner-err"),m.textContent=d+`
`,s.appendChild(m)}});if(i.kind==="ran")l.textContent=i.ms?`${Math.max(1,Math.round(i.ms))} ms`:"done";else if(i.kind==="timeout")l.textContent="stopped at the time limit";else if(i.kind==="error"||i.kind==="unavailable"){l.textContent=i.kind==="error"?"error":"unavailable";const d=document.createElement("span");d.className="runner-err",d.textContent=i.message+`
`,s.appendChild(d)}})}let p=null;function F(){if(!p)return;const e=y(),t=te({ladder:p.ladder,varied:p.varied,transfer:p.transfer},e),r=g(p.order),n=e.units[r]?.state;t&&n!=="complete"?L(r,"complete"):!t&&!n&&L(r,"in-progress");const o=document.getElementById("unit-complete");o&&(o.hidden=!t)}function ve(){const e=document.getElementById("unit-root");if(!e)return;p=JSON.parse(e.dataset.unit);const t=y(),r=W({order:p.order,requires:p.requires},t),n=document.getElementById("unit-body"),o=document.getElementById("unit-locked");if(r==="locked"){o.hidden=!1;const s=j({order:p.order,requires:p.requires},t);o.querySelector(".locked-list").textContent=s.map(i=>`Unit ${g(i)}`).join(", ");const l=o.querySelector(".locked-link");s.length&&(l.href=`${"/dsa-guide".replace(/\/$/,"")}/learn/${g(s[0])}`)}else n.hidden=!1,document.querySelectorAll(".problem").forEach(ye),document.querySelectorAll(".rung").forEach(ke),F();o.querySelector('[data-act="skip"]')?.addEventListener("click",()=>{j({order:p.order,requires:p.requires},y()).forEach(l=>L(g(l),"skipped")),location.reload()})}function I(){const e=document.querySelectorAll("[data-unit-card]");if(!e.length)return;const t=y();e.forEach(n=>{const o=JSON.parse(n.dataset.unitCard),s=W(o,t);n.dataset.state=s;const l=n.querySelector(".state-pill");l&&(l.textContent=s==="in-progress"?"in progress":s),s==="locked"?n.setAttribute("aria-disabled","true"):n.removeAttribute("aria-disabled")});const r=document.getElementById("due-badge");if(r){const n=V().length;r.textContent=n?`${n} due`:"nothing due",r.hidden=!1}}function J(){const e=document.querySelectorAll("[data-inv-unit]");if(!e.length)return;const t=y();e.forEach(r=>{const n=t.units[g(Number(r.dataset.invUnit))]?.state;r.dataset.state=n==="complete"?"known":n?"learning":"locked"})}function Se(){if(y(),!Z)return;const e=document.getElementById("storage-notice");e&&(e.hidden=!1)}function P(){X(),Y(()=>{I(),J()}),ve(),I(),J(),Se(),document.getElementById("reset-progress")?.addEventListener("click",()=>{confirm("Reset all course progress? This cannot be undone.")&&(Q(),location.reload())})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",P,{once:!0}):P();

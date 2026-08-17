const N={"two-sum-brute":{after:`
nums, target = [2, 7, 11, 15, 1, 8], 23
print("indices:", two_sum(nums, target))`},"two-sum-hash":{after:`
nums, target = [2, 7, 11, 15, 1, 8], 23
print("indices:", two_sum(nums, target))`},"longest-unique":{after:`
for s in ["abcabb", "bbbbb", "pwwkew", ""]:
    print(f"{s!r:10} -> {longest_unique(s)}")`},"min-capacity":{after:`
weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
for days in (1, 5, 10):
    print(f"{days:2} days -> capacity {min_capacity(weights, days)}")`},"next-greater":{after:`
temps = [73, 74, 75, 71, 69, 72, 76, 73]
print("input: ", temps)
print("answer:", next_greater(temps))`},bfs:{after:`
graph = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []}
print("distances from 'a':", bfs("a", graph))`},"climb-naive":{after:`
import time

# Exponential. Nudge n up and watch the wall clock explode.
n = 30
start = time.perf_counter()
result = climb(n)
print(f"climb({n}) = {result}")
print(f"took {time.perf_counter() - start:.3f}s")`},"climb-cache":{after:`
import time

n = 30
start = time.perf_counter()
print(f"climb({n}) = {climb(n)}")
print(f"took {time.perf_counter() - start:.6f}s   <- same n as the naive version")

# Now a size the naive version could never reach.
print(f"climb(90) = {climb(90)}")`},"climb-mutable-default":{after:`
# The default is created ONCE, at definition time, and reused for every call.
def collect(x, acc=[]):
    acc.append(x)
    return acc

print(collect(1))
print(collect(2))   # <- still holding 1
print(collect(3))   # <- and 2

# The fix: a fresh object per call.
def collect_ok(x, acc=None):
    acc = [] if acc is None else acc
    acc.append(x)
    return acc

print(collect_ok(1), collect_ok(2), collect_ok(3))`},"climb-bottom-up":{after:`
print("climb(30) =", climb(30))
print("climb(90) =", climb(90))`},"climb-two-vars":{after:`
print("climb(30) =", climb(30))
print("climb(90) =", climb(90))`},"max-subarray":{after:`
print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))   # expect 6
print(max_subarray([-3, -1, -7]))                      # all negative -> -1`},"max-profit":{after:`
print(max_profit([7, 1, 5, 3, 6, 4]))   # expect 5
print(max_profit([7, 6, 4, 3, 1]))      # only losses -> 0`},"dfs-iterative":{after:`
graph = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []}
print(dfs("a", graph))
# None — this version only walks the graph. Add \`return seen\` to the
# function above and run again to see what it visited.`},"dupes-counter":{after:`
print(dupes([1, 2, 2, 3, 4, 4, 4, 5]))
print(dupes(["a", "b", "a", "c"]))`},"orm-n-plus-one":{before:`
# ---- stand-in for the ORM, counting every SELECT it issues ----
QUERIES = 0

class Customer:
    def __init__(self, name):
        self._name = name

    @property
    def name(self):
        global QUERIES
        QUERIES += 1          # lazy load: one SELECT per access
        return self._name

class Row:
    def __init__(self, i):
        self.customer = Customer(f"customer-{i}")

class _Manager:
    def filter(self, **kwargs):
        global QUERIES
        QUERIES += 1          # the initial SELECT
        return [Row(i) for i in range(8)]

class Order:
    objects = _Manager()

user = "u1"
# ---------------------------------------------------------------`,after:`
print(f"\\n{QUERIES} SQL queries for {len(orders)} orders  (1 + N)")`},"rate-limiter":{after:`
# limit=3 per 60s window
for t in (0, 1, 2, 3, 61):
    print(f"t={t:3}s -> {'allow' if allow(t, limit=3, span=60) else 'DENY '}   window={list(window)}")`}},S=15e3,I=`${"/dsa-guide".replace(/\/$/,"")}/py-worker.js`;let f=null,w=!1,y=null;function L(){return f||(f=new Worker(I),f.onmessage=t=>y?.(t.data),f.onerror=()=>y?.({type:"boot-error",message:"Could not start the Python worker."})),f}function v(){f?.terminate(),f=null,w=!1}function R(t){return(t.querySelector("code")?.textContent??"").replace(/\n+$/,"")}function O(t,u){const p=N[t.dataset.run??""]??{};return[p.before?.trim(),u,p.after?.trim()].filter(Boolean).join(`
`)}function q(t){const u=t.dataset.run??"",p=t.innerHTML,h=N[u]??{},a=document.createElement("div");a.className="runner",t.parentNode?.insertBefore(a,t),a.appendChild(t);const i=document.createElement("div");i.className="runner-bar",i.innerHTML=`
      <button class="runbtn primary" type="button" data-act="run">▸ Run</button>
      <button class="runbtn" type="button" data-act="edit">Edit</button>
      <button class="runbtn" type="button" data-act="reset" hidden>Reset</button>
      <button class="runbtn danger" type="button" data-act="stop" hidden>■ Stop</button>
      <span class="runner-status"></span>`,a.appendChild(i);const s=document.createElement("div");s.className="runner-out",s.hidden=!0,s.innerHTML='<pre class="runner-stream" tabindex="0"></pre>',a.appendChild(s);const E=s.querySelector(".runner-stream"),c=i.querySelector(".runner-status"),d=e=>i.querySelector(`[data-act="${e}"]`);let l=null;const T=()=>l?l.value:R(t);function _(e){e.style.height="auto",e.style.height=`${e.scrollHeight}px`}function k(){if(l)return l;const e=document.createElement("textarea");return e.className="runner-editor",e.spellcheck=!1,e.value=R(t),e.setAttribute("aria-label","Editable Python source"),e.addEventListener("input",()=>_(e)),e.addEventListener("keydown",n=>{if(n.key==="Tab"){n.preventDefault();const{selectionStart:r,selectionEnd:o,value:b}=e;if(n.shiftKey){const g=b.lastIndexOf(`
`,r-1)+1;b.slice(g,g+4)==="    "&&(e.value=b.slice(0,g)+b.slice(g+4),e.selectionStart=e.selectionEnd=Math.max(g,r-4))}else e.value=`${b.slice(0,r)}    ${b.slice(o)}`,e.selectionStart=e.selectionEnd=r+4}else n.key==="Enter"&&(n.metaKey||n.ctrlKey)?(n.preventDefault(),C()):n.key==="Escape"&&e.blur()}),t.hidden=!0,a.insertBefore(e,i),l=e,_(e),d("edit").hidden=!0,d("reset").hidden=!1,e}function $(){l?.remove(),l=null,t.hidden=!1,t.innerHTML=p,d("edit").hidden=!1,d("reset").hidden=!0,s.hidden=!0,E.textContent="",c.textContent=""}function m(e,n){const r=document.createElement("span");n&&(r.className=n),r.textContent=e,E.appendChild(r),s.hidden=!1}function x(e){d("run").disabled=e,d("stop").hidden=!e}function C(){const e=O(t,T());E.textContent="",s.hidden=!1,x(!0),c.textContent=w?"running…":"starting Python — first run downloads ~7 MB…";const n=window.setTimeout(()=>{r(),v(),m(`
⏱ stopped after ${S/1e3}s — infinite loop?
`,"runner-warn"),c.textContent="stopped"},S);function r(){window.clearTimeout(n),x(!1),y=null}y=o=>{switch(o.type){case"ready":w=!0,c.textContent="running…";break;case"out":m(o.text+`
`,o.stream==="err"?"runner-err":void 0);break;case"done":r(),c.textContent=`finished in ${o.ms<1?"<1":Math.round(o.ms)} ms`,E.textContent||m(`(no output — add a print())
`,"runner-dim");break;case"error":r(),m(`
${o.message}
`,"runner-err"),c.textContent="error";break;case"boot-error":r(),v(),m(`
Could not load Python: ${o.message}
Check your connection — the runtime loads from a CDN.
`,"runner-err"),c.textContent="failed to load";break}},L().postMessage({type:"run",code:e})}if(i.addEventListener("click",e=>{const n=e.target.closest("button")?.dataset.act;n==="run"?C():n==="edit"?k().focus():n==="reset"?$():n==="stop"&&(v(),y=null,x(!1),m(`
■ stopped
`,"runner-warn"),c.textContent="stopped")}),t.addEventListener("click",()=>{!l&&!window.getSelection()?.toString()&&k().focus()}),(h.before||h.after)&&(d("run").title="Runs this snippet with sample input added — press Edit to see it",!document.querySelector(".runner-hint"))){const e=document.createElement("p");e.className="runner-hint",e.textContent="Run adds sample input around the snippet — press Edit to see and change it. Ctrl/⌘+Enter runs.",a.appendChild(e)}}function M(){const t=document.querySelectorAll("pre[data-run]");if(!t.length)return;t.forEach(q);const u=navigator.connection;if(!u?.saveData&&!/2g/.test(u?.effectiveType??"")){const p=()=>{w||L().postMessage({type:"preload"})},h=new IntersectionObserver(a=>{a.some(i=>i.isIntersecting)&&(h.disconnect(),p())},{rootMargin:"600px"});h.observe(t[0])}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",M,{once:!0}):M();

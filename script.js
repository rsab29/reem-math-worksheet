const $=id=>document.getElementById(id);
const ar=n=>String(n).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
let score=0, lineChecked=false, barChecked=false, connected=false;
const lineValues=[50,54,75,98,100], linePoints=[...document.querySelectorAll(".line-point")];
const barValues=[33,17,21,8,7,4];

function setProgress(step){$("progressText").textContent=`السؤال ${ar(step)} من ٢`; $("progressBar").style.width=step===1?"50%":"100%"; $("score").textContent=ar(score)}

function lineY(value){
  // Grid area in IMG_8769.jpeg: roughly x 2%-53%, y 8%-94%.
  // y=100 at top grid, y=50 at bottom grid.
  const top=8, bottom=94, ratio=(100-value)/50;
  return top+ratio*(bottom-top);
}
function positionLinePoints(){
  const xs=[2.3,12.5,22.7,32.9,43.1];
  linePoints.forEach((p,i)=>{p.style.left=xs[i]+"%";p.style.top=lineY(lineValues[i])+"%";p.dataset.value=lineValues[i]});
}
positionLinePoints();

let drag=null;
linePoints.forEach((p,i)=>{
  const start=e=>{e.preventDefault();drag={p,i};p.setPointerCapture?.(e.pointerId)};
  const move=e=>{
    if(!drag||drag.p!==p)return;
    const r=$("lineStage").getBoundingClientRect(), y=Math.max(r.top+r.height*.08,Math.min(r.top+r.height*.94,e.clientY));
    const pct=(y-r.top)/r.height, value=Math.round((100-(8+pct*86))/2)*2;
    p.style.top=(8+((100-value)/50)*86)+"%";p.dataset.value=value;
  };
  const end=()=>drag=null;
  p.addEventListener("pointerdown",start);p.addEventListener("pointermove",move);p.addEventListener("pointerup",end);p.addEventListener("pointercancel",end);
});

$("connectBtn").onclick=()=>{
  const svg=$("lineSvg"), r=$("lineStage").getBoundingClientRect(); svg.innerHTML="";
  const ns="http://www.w3.org/2000/svg", poly=document.createElementNS(ns,"polyline");
  poly.setAttribute("fill","none");poly.setAttribute("stroke","#0f6b78");poly.setAttribute("stroke-width","0.6%");
  poly.setAttribute("stroke-linecap","round");poly.setAttribute("stroke-linejoin","round");
  poly.setAttribute("points",linePoints.map(p=>`${parseFloat(p.style.left)} ${parseFloat(p.style.top)}`).join(" "));
  svg.appendChild(poly);connected=true;
  $("lineFeedback").textContent="تم وصل النقاط، أحسنتِ! الآن اضغطي «تحقق من الإجابة»."; $("lineFeedback").className="feedback";
};
$("checkLine").onclick=()=>{
  const vals=linePoints.map(p=>Number(p.dataset.value));
  const ok=connected && vals.every((v,i)=>Math.abs(v-lineValues[i])<=2);
  lineChecked=true;
  if(ok){if(score<1)score++;$("lineFeedback").textContent="رائع! إجابة السؤال الأول صحيحة 🌟";$("lineFeedback").className="feedback good";$("toActivity2").disabled=false}
  else{$("lineFeedback").textContent="حاولي مرة أخرى: راجعي القيم في الجدول ثم اضبطي النقاط."; $("lineFeedback").className="feedback bad"}
  setProgress(1);
};
$("resetLine").onclick=()=>{connected=false;lineChecked=false;positionLinePoints();$("lineSvg").innerHTML="";$("lineFeedback").textContent="";$("toActivity2").disabled=true};
$("toActivity2").onclick=()=>{$("activity1").classList.remove("active");$("activity2").classList.add("active");setProgress(2);window.scrollTo({top:0,behavior:"smooth"});};

function makeBars(){
  const layer=$("barsLayer");layer.innerHTML="";
  const xs=[17,28,39,50,61,72];
  barValues.forEach((v,i)=>{
    const w=document.createElement("div");w.className="bar-wrap";w.style.left=xs[i]+"%";w.dataset.value=v;
    const fill=document.createElement("div");fill.className="bar-fill";
    const handle=document.createElement("div");handle.className="bar-handle";
    w.append(fill,handle);layer.appendChild(w);
    const update=val=>{val=Math.max(0,Math.min(40,Math.round(val)));w.dataset.value=val;fill.style.height=(val/40*100)+"%";handle.style.bottom=(val/40*100)+"%";};
    update(0);
    let active=false;
    const down=e=>{e.preventDefault();active=true;handle.setPointerCapture?.(e.pointerId)};
    const move=e=>{if(!active)return;const r=$("barStage").getBoundingClientRect();let val=((r.bottom-e.clientY)/(r.height*.72))*40;update(val)};
    const up=()=>active=false;
    handle.addEventListener("pointerdown",down);handle.addEventListener("pointermove",move);handle.addEventListener("pointerup",up);handle.addEventListener("pointercancel",up);
  });
}
makeBars();
$("checkBars").onclick=()=>{
  const vals=[...document.querySelectorAll(".bar-wrap")].map(x=>Number(x.dataset.value));
  const ok=vals.every((v,i)=>Math.abs(v-barValues[i])<=1);
  barChecked=true;
  if(ok){if(score<2)score++;$("barFeedback").textContent="ممتاز! إجابة السؤال الثاني صحيحة 🎉";$("barFeedback").className="feedback good";$("finishBtn").disabled=false}
  else{$("barFeedback").textContent="راجعي التكرارات في الجدول واضبطي ارتفاع الأعمدة.";$("barFeedback").className="feedback bad"}
  $("score").textContent=ar(score);
};
$("resetBars").onclick=()=>{barChecked=false;makeBars();$("finishBtn").disabled=true;$("barFeedback").textContent=""};

$("finishBtn").onclick=()=>{
  $("activity2").classList.remove("active");$("result").classList.add("show");
  const name=$("studentName").value.trim()||"بطلة النشاط";$("cardName").textContent=name;
  $("finalScore").textContent=ar(score);
  let title,msg,card,grade,icon;
  if(score===2){grade="ممتاز 🌟";title="أحسنتِ يا بطلة!";msg="أداء رائع وإتقان واضح. استمري بهذا التميز الجميل.";card="فخرٌ بإنجازكِ الجميل، واصلي التعلم والمثابرة، فأنتِ قادرة على المزيد من النجاح.";icon="🏆"}
  else if(score===1){grade="جيد جدًا 💐";title="أحسنتِ وتقدمتِ!";msg="بداية جميلة، ومع قليل من المراجعة ستصلين إلى الإتقان.";card="شكرًا لاجتهادكِ ومحاولتكِ. استمري في التدريب، فالخطوة القادمة نحو التميز قريبة.";icon="🌷"}
  else{grade="محاولة طيبة 🌱";title="أحسنتِ على المحاولة!";msg="المحاولة بداية النجاح. أعيدي النشاط وراجعي البيانات وستتحسن نتيجتكِ.";card="شكرًا لمحاولتكِ الجميلة. لا تتوقفي؛ بالتعلم والمثابرة نصل إلى الإتقان.";icon="💚"}
  $("resultTitle").textContent=title;$("resultMessage").textContent=msg;$("cardText").textContent=card;$("grade").textContent=grade;$("resultIcon").textContent=icon;
  window.scrollTo({top:0,behavior:"smooth"});
};
$("downloadCard").onclick=()=>window.print();
$("restart").onclick=()=>location.reload();
setProgress(1);

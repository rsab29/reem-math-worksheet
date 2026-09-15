const $=id=>document.getElementById(id);
const ar=n=>String(n).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
let score=0, lineChecked=false, barChecked=false, connected=false;

const lineValues=[50,54,75,98,100];
const linePoints=[...document.querySelectorAll(".line-point")];

// These are the five week positions on the full IMG_8769.jpeg question image.
const lineXs=[11.4,19.6,27.7,35.9,44.1];

function setProgress(step){
  $("progressText").textContent=`السؤال ${ar(step)} من ٢`;
  $("progressBar").style.width=step===1?"50%":"100%";
  $("score").textContent=ar(score);
}

function lineTopFromValue(v){
  // Grid in the full question image: approximately 13.5% to 85.3%.
  return 85.3-(v/100)*71.8;
}

function valueFromY(y, rect){
  const top=0.135, bottom=0.853;
  const pct=Math.max(top,Math.min(bottom,(y-rect.top)/rect.height));
  return Math.max(0,Math.min(100,Math.round((bottom-pct)/(bottom-top)*100)));
}

function positionLinePoints(){
  linePoints.forEach((p,i)=>{
    p.style.left=lineXs[i]+"%";
    p.style.top=lineTopFromValue(lineValues[i])+"%";
    p.dataset.value=lineValues[i];
  });
}
positionLinePoints();

let activePoint=null;
let activePointerId=null;

function movePoint(clientY){
  if(!activePoint)return;
  const rect=$("lineStage").getBoundingClientRect();
  const value=valueFromY(clientY,rect);
  activePoint.style.top=lineTopFromValue(value)+"%";
  activePoint.dataset.value=value;
}

linePoints.forEach(p=>{
  p.addEventListener("pointerdown",e=>{
    e.preventDefault();
    activePoint=p;
    activePointerId=e.pointerId;
    p.classList.add("dragging");
    try{p.setPointerCapture(e.pointerId)}catch(_){}
  });
});

document.addEventListener("pointermove",e=>{
  if(activePoint && (activePointerId===null || e.pointerId===activePointerId)){
    e.preventDefault();
    movePoint(e.clientY);
  }
},{passive:false});

function stopPoint(){
  if(activePoint)activePoint.classList.remove("dragging");
  activePoint=null;
  activePointerId=null;
}
document.addEventListener("pointerup",stopPoint);
document.addEventListener("pointercancel",stopPoint);

$("connectBtn").onclick=()=>{
  const svg=$("lineSvg");
  svg.innerHTML="";
  const ns="http://www.w3.org/2000/svg";
  const poly=document.createElementNS(ns,"polyline");
  poly.setAttribute("fill","none");
  poly.setAttribute("stroke","#0f6b78");
  poly.setAttribute("stroke-width","0.65%");
  poly.setAttribute("stroke-linecap","round");
  poly.setAttribute("stroke-linejoin","round");
  poly.setAttribute("points",linePoints.map(p=>`${parseFloat(p.style.left)} ${parseFloat(p.style.top)}`).join(" "));
  svg.appendChild(poly);
  connected=true;
  $("lineFeedback").textContent="تم وصل النقاط، أحسنتِ! الآن اضغطي «تحقق من الإجابة».";
  $("lineFeedback").className="feedback";
};

$("checkLine").onclick=()=>{
  const vals=linePoints.map(p=>Number(p.dataset.value));
  const ok=connected && vals.every((v,i)=>Math.abs(v-lineValues[i])<=2);
  lineChecked=true;
  if(ok){
    if(score<1)score++;
    $("lineFeedback").textContent="رائع! إجابة السؤال الأول صحيحة 🌟";
    $("lineFeedback").className="feedback good";
    $("toActivity2").disabled=false;
  }else{
    $("lineFeedback").textContent="حاولي مرة أخرى: راجعي القيم في الجدول ثم اضبطي النقاط.";
    $("lineFeedback").className="feedback bad";
  }
  setProgress(1);
};

$("resetLine").onclick=()=>{
  connected=false; lineChecked=false;
  positionLinePoints();
  $("lineSvg").innerHTML="";
  $("lineFeedback").textContent="";
  $("toActivity2").disabled=true;
};

$("toActivity2").onclick=()=>{
  $("activity1").classList.remove("active");
  $("activity2").classList.add("active");
  setProgress(2);
  window.scrollTo({top:0,behavior:"smooth"});
};

// Bars
const barValues=[33,17,21,8,7,4];
const barXs=[17,28,39,50,61,72];

function makeBars(){
  const layer=$("barsLayer");
  layer.innerHTML="";
  barValues.forEach((v,i)=>{
    const w=document.createElement("div");
    w.className="bar-wrap";
    w.style.left=barXs[i]+"%";
    w.dataset.value=0;

    const fill=document.createElement("div");
    fill.className="bar-fill";

    const handle=document.createElement("div");
    handle.className="bar-handle";
    handle.setAttribute("aria-label","مقبض ارتفاع العمود");

    w.append(fill,handle);
    layer.appendChild(w);

    const update=val=>{
      val=Math.max(0,Math.min(40,Math.round(val)));
      w.dataset.value=val;
      fill.style.height=(val/40*100)+"%";
      handle.style.bottom=(val/40*100)+"%";
    };

    let active=false, pid=null;
    handle.addEventListener("pointerdown",e=>{
      e.preventDefault(); active=true; pid=e.pointerId;
      try{handle.setPointerCapture(e.pointerId)}catch(_){}
    });
    handle.addEventListener("pointermove",e=>{
      if(!active || e.pointerId!==pid)return;
      const r=$("barStage").getBoundingClientRect();
      const pct=Math.max(0.15,Math.min(0.837,(r.bottom-e.clientY)/r.height));
      update(pct/0.687*40);
    });
    const stop=()=>{active=false;pid=null};
    handle.addEventListener("pointerup",stop);
    handle.addEventListener("pointercancel",stop);

    update(0);
  });
}
makeBars();

$("checkBars").onclick=()=>{
  const vals=[...document.querySelectorAll(".bar-wrap")].map(x=>Number(x.dataset.value));
  const ok=vals.every((v,i)=>Math.abs(v-barValues[i])<=1);
  barChecked=true;
  if(ok){
    if(score<2)score++;
    $("barFeedback").textContent="ممتاز! إجابة السؤال الثاني صحيحة 🎉";
    $("barFeedback").className="feedback good";
    $("finishBtn").disabled=false;
  }else{
    $("barFeedback").textContent="راجعي التكرارات في الجدول واضبطي ارتفاع الأعمدة.";
    $("barFeedback").className="feedback bad";
  }
  $("score").textContent=ar(score);
};

$("resetBars").onclick=()=>{
  barChecked=false; makeBars();
  $("finishBtn").disabled=true;
  $("barFeedback").textContent="";
};

$("finishBtn").onclick=()=>{
  $("activity2").classList.remove("active");
  $("result").classList.add("show");
  const name=$("studentName").value.trim()||"بطلة النشاط";
  $("cardName").textContent=name;
  $("finalScore").textContent=ar(score);

  let title,msg,card,grade,icon;
  if(score===2){
    grade="ممتاز 🌟"; title="أحسنتِ يا بطلة!";
    msg="أداء رائع وإتقان واضح. استمري بهذا التميز الجميل.";
    card="فخرٌ بإنجازكِ الجميل، واصلي التعلم والمثابرة، فأنتِ قادرة على المزيد من النجاح.";
    icon="🏆";
  }else if(score===1){
    grade="جيد جدًا 💐"; title="أحسنتِ وتقدمتِ!";
    msg="بداية جميلة، ومع قليل من المراجعة ستصلين إلى الإتقان.";
    card="شكرًا لاجتهادكِ ومحاولتكِ. استمري في التدريب، فالخطوة القادمة نحو التميز قريبة.";
    icon="🌷";
  }else{
    grade="محاولة طيبة 🌱"; title="أحسنتِ على المحاولة!";
    msg="المحاولة بداية النجاح. أعيدي النشاط وراجعي البيانات وستتحسن نتيجتكِ.";
    card="شكرًا لمحاولتكِ الجميلة. لا تتوقفي؛ بالتعلم والمثابرة نصل إلى الإتقان.";
    icon="💚";
  }
  $("resultTitle").textContent=title;
  $("resultMessage").textContent=msg;
  $("cardText").textContent=card;
  $("grade").textContent=grade;
  $("resultIcon").textContent=icon;
  window.scrollTo({top:0,behavior:"smooth"});
};

$("downloadCard").onclick=()=>window.print();
$("restart").onclick=()=>location.reload();
setProgress(1);

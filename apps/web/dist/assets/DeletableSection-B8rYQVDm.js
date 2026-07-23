import{u as _,_ as R}from"./chemistry-BhGXpMMg.js";import{r as J,b as P,o as v,e as y,f as c,t as x,u as f,k as w,z as k,Y as L,h as E,_ as $,i as V}from"./vendor-framework-Cw0bHWsf.js";function r(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function F(e,t,s){const n=Object.entries(t).filter(([,l])=>l);if(!n.length)return"";const o=n.map(([l,p])=>`<tr><td class="param-label">${r(l)}</td><td class="param-value">${r(p)}</td></tr>`).join("");return`
<div class="section">
  <h3 class="section-title">📋 ${r(s)}</h3>
  <table class="params-table"><tbody>${o}</tbody></table>
</div>`}function M(e){return Object.entries(e).map(([t,s])=>`<div><span class="meta-key">${r(t)}:</span> ${r(s)}</div>`).join("")}function Y(e,t,s){if(!(e!=null&&e.length))return"";const n=e.map(o=>`<tr><td class="param-label">${r(o.label)}</td><td class="param-value">${r(String(o.value))}${o.unit?` <span class="unit">${r(o.unit)}</span>`:""}</td></tr>`).join("");return`
<section class="sec">
  <h2 class="sec-heading params-heading">⚙️ ${r(t)}</h2>
  <table class="params-table"><tbody>${n}</tbody></table>
</section>`}function q(e,t){if(!(e!=null&&e.length))return"";const s=e.map(n=>`<div class="stat-card${n.highlight?" highlight":""}"><span class="stat-label">${r(n.label)}</span><span class="stat-value">${r(String(n.value))}${n.unit?`<span class="stat-unit"> ${r(n.unit)}</span>`:""}</span></div>`).join("");return`
<section class="sec">
  <h2 class="sec-heading results-heading">📊 ${r(t)}</h2>
  <div class="stats-row">${s}</div>
</section>`}function A(e){return e!=null&&e.length?e.map(t=>{const s=t.caption?`<h3 class="table-caption">${r(t.caption)}</h3>`:"",n=`<tr>${t.headers.map(l=>`<th>${r(String(l))}</th>`).join("")}</tr>`,o=t.rows.map(l=>`<tr>${l.map(p=>`<td>${r(p===void 0?"":String(p))}</td>`).join("")}</tr>`).join("");return`<section class="sec">${s}<table><thead>${n}</thead><tbody>${o}</tbody></table></section>`}).join(""):""}function K(e,t,s){const n=[];return t&&n.push({src:t,caption:s,fullWidth:!0}),n.push(...e??[]),n.filter(o=>o.src).map((o,l)=>{const p=o.src.replace(/"/g,"&quot;"),a=o.fullWidth?"img-full":"";return`<section class="sec${l>0?" print-break":""}"><p class="img-cap">${r(o.caption??"")}</p><img alt="" src="${p}" class="${a}"/></section>`}).join("")}function W(e){return e!=null&&e.length?e.map(t=>`<section class="sec html-block">${t.title?`<h2 class="sec-heading">${r(t.title)}</h2>`:""}${t.html}</section>`).join(""):""}function G(e){const t=e==="rtl"?"right":"left";return`
*{box-sizing:border-box;}
body{font-family:"Segoe UI",Cairo,Tajawal,sans-serif;padding:0;color:#1e293b;max-width:960px;margin:0 auto;line-height:1.6;background:#f8fafc;}
.report-header{background:linear-gradient(135deg,#4f46e5,#0891b2);color:#fff;padding:28px 32px;border-radius:0 0 1.5rem 1.5rem;margin-bottom:24px;}
.report-header h1{margin:0;font-size:1.6rem;font-weight:800;}
.report-header .subtitle{opacity:.85;font-size:.92rem;margin-top:6px;}
.meta{background:#fff;border:1px solid #e2e8f0;padding:14px 18px;border-radius:1rem;font-size:.85rem;margin:0 0 16px;display:flex;flex-wrap:wrap;gap:12px 28px;box-shadow:0 1px 4px rgba(0,0,0,.06);}
.meta-key{font-weight:700;color:#475569;}
.sec{margin:0 0 20px;}
.sec-heading{font-size:1rem;font-weight:700;margin:0 0 10px;padding:7px 14px;border-radius:.6rem;display:flex;align-items:center;gap:8px;}
.params-heading{background:#eef2ff;color:#3730a3;border-${t}:4px solid #6366f1;}
.results-heading{background:#ecfdf5;color:#065f46;border-${t}:4px solid #059669;}
.params-table{width:100%;border-collapse:collapse;font-size:.85rem;}
.params-table td{border:1px solid #e2e8f0;padding:7px 12px;}
.param-label{font-weight:600;color:#334155;width:55%;background:#f8fafc;}
.param-value{font-family:monospace;color:#1e3a8a;}
.unit{color:#64748b;font-weight:normal;font-family:inherit;}
.stats-row{display:flex;flex-wrap:wrap;gap:10px;}
.stat-card{background:#fff;border:1px solid #e2e8f0;border-radius:1rem;padding:10px 16px;min-width:140px;flex:1;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.06);}
.stat-card.highlight{border-color:#f97316;background:#fff7ed;}
.stat-label{display:block;font-size:.75rem;font-weight:600;color:#64748b;margin-bottom:4px;}
.stat-value{display:block;font-size:1.15rem;font-weight:800;font-family:monospace;color:#1e293b;}
.stat-unit{font-size:.78rem;color:#64748b;font-weight:normal;}
.table-caption{font-size:.92rem;font-weight:700;color:#334155;margin:0 0 6px;}
table{width:100%;border-collapse:collapse;margin:0;font-size:.8rem;}
th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:center;}
th{background:#e0e7ff;color:#3730a3;font-weight:700;}
tr:nth-child(even) td{background:#f8fafc;}
img{max-width:100%;border:1px solid #e2e8f0;border-radius:.75rem;display:block;margin:8px auto;box-shadow:0 2px 8px rgba(0,0,0,.08);}
img.img-full{width:100%;}
.img-cap{text-align:center;font-size:.82rem;color:#64748b;margin:0 0 4px;}
.html-block{background:#fff;border:1px solid #e2e8f0;padding:14px 18px;border-radius:1rem;font-size:.9rem;box-shadow:0 1px 4px rgba(0,0,0,.06);}
.footer{margin-top:32px;text-align:center;color:#94a3b8;font-size:.75rem;border-top:1px solid #e2e8f0;padding-top:12px;}
.actions{display:flex;justify-content:flex-end;gap:10px;margin:20px 0;}
.btn-print{background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;border:none;padding:10px 22px;border-radius:999px;cursor:pointer;font:inherit;font-weight:700;font-size:.92rem;}
.btn-close{background:#f1f5f9;color:#475569;border:1px solid #e2e8f0;padding:10px 22px;border-radius:999px;cursor:pointer;font:inherit;font-weight:700;font-size:.92rem;}
.btn-send-teacher{background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:none;padding:10px 22px;border-radius:999px;cursor:pointer;font:inherit;font-weight:700;font-size:.92rem;box-shadow:0 4px 12px rgba(79,70,229,.3);}
.btn-send-teacher:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(79,70,229,.4);}
.btn-sent{background:rgba(34,197,94,.1);color:#22c55e;border:1px solid rgba(34,197,94,.3);padding:10px 22px;border-radius:999px;font:inherit;font-weight:700;font-size:.92rem;cursor:default;}
.content{padding:0 24px 24px;}
@media print{
  .noprint{display:none!important;}
  body{background:#fff;}
  .report-header{border-radius:0;}
  .stat-card,.html-block{break-inside:avoid;}
  table{break-inside:avoid;}
  .print-break{page-break-before:always;padding-top:12px;}
  .print-break .img-cap{margin-top:4px;}
}`}function Q(e){const t={title:e.title,experimentName:e.experimentName||e.title,params:e.params||[],summaryStats:e.summaryStats||[],tables:e.tables||[],images:(e.images||[]).map(i=>({caption:i.caption||"",src:i.src.slice(0,100)})),htmlBlocks:(e.htmlBlocks||[]).map(i=>({title:i.title||"",html:i.html.slice(0,500)})),canvasSnapshot:e.canvasSnapshot?"[snapshot]":null,submittedAt:new Date().toISOString()},s=JSON.stringify(t).replace(/"/g,"&quot;"),n=e.strings||{},o=n.sendToTeacherBtn??"📤 Send to Teacher",l=n.guestStudent??"Guest Student",p=n.joinClassFirst??"You must join a class first",a=n.branchPhysics??"Physics",u=n.sentSuccessfully??"✅ Sent",m=n.reportSentSuccess??"Report sent to teacher successfully!",b=n.errorLabel??"Error: ";return`<button id="btn-send" class="btn-send-teacher" type="button" onclick="sendToTeacher()">${o}</button>
<script>
function sendToTeacher() {
  const btn = document.getElementById('btn-send');
  if (btn.disabled) return;
  try {
    const data = JSON.parse("${s}");
    const studentName = '${l}';
    const classInfoRaw = localStorage.getItem('auth_classes');
    const classes = classInfoRaw ? JSON.parse(classInfoRaw) : [];
    const classInfo = classes[0] || null;
    if (!classInfo || !classInfo.code) {
      alert('${p}');
      return;
    }
    const report = {
      id: 'guest-report-' + Date.now(),
      attemptId: Date.now(),
      experimentId: 0,
      experimentTitle: data.experimentName || data.title,
      branch: '${a}',
      studentName: studentName,
      classCode: classInfo.code,
      classId: classInfo.id,
      notes: data.htmlBlocks.map(b => (b.title || '') + '\\n' + b.html).join('\\n\\n'),
      readings: data.tables.flatMap(t => t.rows.map((row, i) => {
        const obj = { '#': i + 1 };
        t.headers.forEach((h, hi) => { obj[String(h)] = row[hi] !== undefined ? String(row[hi]) : ''; });
        return obj;
      })),
      completedSteps: [],
      status: 'submitted',
      submittedAt: data.submittedAt,
    };
    const reports = JSON.parse(localStorage.getItem('physlab_guest_reports') || '[]');
    reports.push(report);
    localStorage.setItem('physlab_guest_reports', JSON.stringify(reports));
    const teacherClasses = JSON.parse(localStorage.getItem('physlab_guest_classes') || '[]');
    const cls = teacherClasses.find(c => c.code === classInfo.code);
    if (cls && cls.students) {
      const stu = cls.students.find(s => s.name === studentName);
      if (stu) {
        if (!stu.reports) stu.reports = [];
        stu.reports.push(report);
        stu.reportCount = stu.reports.length;
        localStorage.setItem('physlab_guest_classes', JSON.stringify(teacherClasses));
      }
    }
    btn.disabled = true;
    btn.className = 'btn-sent';
    btn.textContent = '${u}';
    alert('${m}');
  } catch (e) {
    alert('${b}' + e.message);
  }
}
<\/script>`}function X(e){var H,T,C,N,j,B,z,D,O;const t=e.dir??"rtl",s=e.dateLocale??"ar",n={dateLabel:((H=e.strings)==null?void 0:H.dateLabel)??"Date",experimentLabel:((T=e.strings)==null?void 0:T.experimentLabel)??"Experiment",studentInfoHeading:((C=e.strings)==null?void 0:C.studentInfoHeading)??"Student Information",paramsHeading:((N=e.strings)==null?void 0:N.paramsHeading)??"Parameters",resultsHeading:((j=e.strings)==null?void 0:j.resultsHeading)??"Results",footerHint:((B=e.strings)==null?void 0:B.footerHint)??"This report was generated from the interactive simulation",printLabel:((z=e.strings)==null?void 0:z.printLabel)??"Print",closeLabel:((D=e.strings)==null?void 0:D.closeLabel)??"Close",simulationSnap:((O=e.strings)==null?void 0:O.simulationSnap)??"Simulation snapshot"},o=new Date().toLocaleString(s),l=e.sendToTeacher?Q(e):"",p=F(t,{},n.studentInfoHeading),a=M(e.meta??{}),u=Y(e.params,n.paramsHeading),m=q(e.summaryStats,n.resultsHeading),b=A(e.tables),i=K(e.images??[],e.canvasSnapshot,n.simulationSnap),h=W(e.htmlBlocks),d=G(t),g=`<!DOCTYPE html>
<html lang="${s}" dir="${t}">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${r(e.title)}</title><style>${d}</style></head>
<body>
<div class="report-header noprint"><h1>${e.icon?e.icon+" ":""}${r(e.title)}</h1><div class="subtitle">${e.experimentName?r(e.experimentName)+" • ":""}${r(o)}</div></div>
<div class="content">
<div class="meta"><div><span class="meta-key">${r(n.dateLabel)}:</span> ${r(o)}</div>${e.experimentName?`<div><span class="meta-key">${r(n.experimentLabel)}:</span> ${r(e.experimentName)}</div>`:""}${a}</div>
${p}${u}${m}${i}${b}${h}
<p class="footer noprint">${r(e.footerNote??n.footerHint)}</p>
<div class="actions noprint"><button class="btn-close" type="button" onclick="window.close()">${r(n.closeLabel)}</button>${l}<button class="btn-print" type="button" onclick="window.print()">${r(n.printLabel)}</button></div>
</div>
</body></html>`,U=new Blob([g],{type:"text/html; charset=utf-8"}),I=URL.createObjectURL(U),S=window.open(I,"_blank");return setTimeout(()=>URL.revokeObjectURL(I),6e4),S?(e.openPrintDialog&&S.addEventListener("load",()=>{setTimeout(()=>{try{S.focus(),S.print()}catch{}},450)}),S):null}function xe(e){const{t}=_(),s=J(null);function n(a){var u;if(a)try{const m=(u=a.captureSnapshot)==null?void 0:u.call(a);m&&(s.value=m)}catch{}}function o(a){s.value=a}function l(){const a={};try{const b=localStorage.getItem(e);if(b){const i=JSON.parse(b);i.name&&(a[t("experiments.nameLabel")]=i.name),i.email&&(a[t("experiments.emailLabel")]=i.email),i.class&&(a[t("experiments.classLabel")]=i.class),i.notes&&(a[t("experiments.notesLabel")]=i.notes)}}catch{}const u=Object.entries(a).filter(([,b])=>b).map(([b,i])=>`<tr><td style="font-weight:600;color:#334155;background:#f8fafc;width:30%">${b}</td><td style="font-family:monospace;color:#1e3a8a">${i}</td></tr>`).join("");if(!u)return null;const m=t("experiments.studentInfo");return{title:`📋 ${m}`,html:`<section class="sec"><h2 class="sec-heading params-heading">📋 ${m}</h2><table class="params-table"><tbody>${u}</tbody></table></section>`}}function p(a){const u=l(),m=[];u&&m.push(u),a.htmlBlocks&&m.push(...a.htmlBlocks),X({...a,htmlBlocks:m,canvasSnapshot:s.value||void 0,openPrintDialog:a.openPrintDialog??!0,sendToTeacher:a.sendToTeacher??!0,strings:{dateLabel:t("experiments.dateLabel"),experimentLabel:t("experiments.experimentLabel"),studentInfoHeading:t("experiments.studentInfo"),paramsHeading:t("experiments.paramsHeading"),resultsHeading:t("experiments.resultsHeading"),footerHint:t("experiments.footerHint"),printLabel:t("experiments.printLabel"),closeLabel:t("experiments.closeLabel"),simulationSnap:t("experiments.simulationSnap"),sendToTeacherBtn:t("experiments.sendToTeacherBtn"),guestStudent:t("experiments.guestStudent"),joinClassFirst:t("experiments.joinClassFirst"),branchPhysics:t("experiments.branchPhysics"),sentSuccessfully:t("experiments.sentSuccessfully"),reportSentSuccess:t("experiments.reportSentSuccess"),errorLabel:t("experiments.errorLabel")}})}return{canvasSnapshot:s,captureSnapshot:n,onSnapshot:o,openFullReport:p,buildStudentHtmlBlock:l}}const Z={id:"printable-report",class:"experiment-report-panel"},ee={class:"student-info"},te={class:"info-grid"},ne={class:"info-field"},se=["placeholder"],ae={class:"info-field"},re={class:"info-field"},oe=["placeholder"],le={class:"info-field notes"},ie=["placeholder"],ce={key:0,class:"print-bar"},de={key:1,class:"no-data"},pe=P({__name:"ExperimentReport",props:{studentStorageKey:{},hasData:{type:Boolean}},emits:["close","open-full-report"],setup(e,{emit:t}){const{t:s}=_(),n=e,o=t,l=$(""),p=$(""),a=$(""),u=$("");function m(){try{const h=localStorage.getItem(n.studentStorageKey);if(!h)return;const d=JSON.parse(h);l.value=d.name||"",p.value=d.email||"",a.value=d.class||"",u.value=d.notes||""}catch{}}function b(){localStorage.setItem(n.studentStorageKey,JSON.stringify({name:l.value,email:p.value,class:a.value,notes:u.value}))}m();function i(){const h=document.getElementById("printable-report");h&&(h.scrollTop=0),window.print()}return(h,d)=>(v(),y("div",Z,[c("button",{class:"close-btn",onClick:d[0]||(d[0]=g=>o("close"))},"âœ•"),c("section",ee,[c("h5",null,x(f(s)("experiments.studentInfo")),1),c("div",te,[c("div",ne,[c("label",null,x(f(s)("experiments.nameLabel"))+":",1),w(c("input",{"onUpdate:modelValue":d[1]||(d[1]=g=>l.value=g),onChange:b,placeholder:f(s)("experiments.nameLabel")},null,40,se),[[k,l.value]])]),c("div",ae,[c("label",null,x(f(s)("experiments.emailLabel"))+":",1),w(c("input",{"onUpdate:modelValue":d[2]||(d[2]=g=>p.value=g),onChange:b,placeholder:"email@example.com"},null,544),[[k,p.value]])]),c("div",re,[c("label",null,x(f(s)("experiments.classLabel"))+":",1),w(c("input",{"onUpdate:modelValue":d[3]||(d[3]=g=>a.value=g),onChange:b,placeholder:f(s)("experiments.classLabel")},null,40,oe),[[k,a.value]])])]),c("div",le,[c("label",null,x(f(s)("experiments.notesLabel"))+":",1),w(c("textarea",{"onUpdate:modelValue":d[4]||(d[4]=g=>u.value=g),onChange:b,placeholder:f(s)("experiments.enterExperimentNotes")},null,40,ie),[[k,u.value]])])]),L(h.$slots,"content",{},void 0),e.hasData?(v(),y("div",ce,[c("button",{class:"print-btn",onClick:i},"ðŸ–¨ï¸ "+x(f(s)("experiments.print")),1),c("button",{class:"print-btn primary",onClick:d[5]||(d[5]=g=>o("open-full-report"))},"ðŸ“‹ "+x(f(s)("experiments.fullReport")),1)])):E("",!0),e.hasData?E("",!0):(v(),y("div",de,[L(h.$slots,"no-data",{},()=>[V(x(f(s)("experiments.noRecordedDataPerformExperiment")),1)])]))]))}}),Se=R(pe,[["__scopeId","data-v-8ccddfc0"]]),ue={key:0,class:"deletable-section"},me=["title"],be=["title"],fe=P({__name:"DeletableSection",setup(e){const{t}=_(),s=$(!1);function n(){s.value=!1}return(o,l)=>s.value?(v(),y("div",{key:1,class:"restored-section",onClick:n,title:f(t)("experiments.restoreSection")},[c("span",null,"➕ "+x(f(t)("experiments.restoreDeletedSection")),1)],8,be)):(v(),y("section",ue,[c("button",{class:"delete-section-btn",onClick:l[0]||(l[0]=p=>s.value=!0),title:f(t)("experiments.removeSection")},"✕",8,me),L(o.$slots,"default",{},void 0)]))}}),$e=R(fe,[["__scopeId","data-v-cdb4af3e"]]);export{$e as D,Se as E,xe as u};

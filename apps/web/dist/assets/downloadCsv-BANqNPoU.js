function r(t,c){const n=c.map(a=>a.map(l=>`"${String(l).replace(/"/g,'""')}"`).join(",")).join(`
`),d=new Blob([n],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(d),e=document.createElement("a");e.href=o,e.download=t,document.body.appendChild(e),e.click(),document.body.removeChild(e),URL.revokeObjectURL(o)}export{r as d};

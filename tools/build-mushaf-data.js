// Builds mushaf-data1.js (Madinah print 1405, QPC V1) from the zonetecde/mushaf-layout repo.
// Run inside a clone of that repo:  node /path/to/build-mushaf-data.js 1   (pass 2 to verify it reproduces mushaf-data.js exactly)
const fs=require("fs");global.window={};eval(fs.readFileSync(require("path").join(__dirname,"../mushaf-data.js"),"utf8"));
const Q=window.QDATA,V=process.argv[2],key="qpcV"+V;
const AY=Q.surahs.map(s=>s[2]),VS=[];let acc=0;AY.forEach(n=>{VS.push(acc);acc+=n});
const vi=loc=>{const[s,a]=loc.split(":").map(Number);return VS[s-1]+a-1};
const pages=[],vp=new Array(6236).fill(0),last={};
for(let p=1;p<=604;p++){const j=JSON.parse(fs.readFileSync(`mushaf/QPC${V}/page-${String(p).padStart(3,"0")}.json`));
  for(const ln of j.lines)for(const w of ln.words||[]){const[s,a,k]=w.location.split(":").map(Number);const v=VS[s-1]+a-1;last[v]=Math.max(last[v]||0,k)}}
for(let p=1;p<=604;p++){
  const j=JSON.parse(fs.readFileSync(`mushaf/QPC${V}/page-${String(p).padStart(3,"0")}.json`));const l=[];let first=null;
  for(const ln of j.lines){
    if(ln.type==="surah-header"){l.push(["h",+ln.surah]);continue}
    if(ln.type==="basmala"){l.push(["b","ﭑﭒﭓ"]);continue}
    if(ln.type!=="text")throw new Error("type "+ln.type+" p"+p);
    const toks=[],runs=[],marks=[];
    for(const w of ln.words){const v=vi(w.location);if(first==null)first=w.location;
      if(!vp[v])vp[v]=p;
      const parts=w[key].split(" ");
      const endV=+w.location.split(":")[2]===last[v];parts.forEach((t,i)=>{if(endV&&i===parts.length-1)marks.push(toks.length);toks.push(t)});
      if(runs.length&&runs[runs.length-1][0]===v)runs[runs.length-1][1]+=parts.length;else runs.push([v,parts.length])}
    l.push(["t",toks.join(" "),runs,marks]);
  }
  pages.push({l,v:first.split(":").slice(0,2).join(":")});
}
const out={pages,surahs:Q.surahs,vp,q:Q.q,sj:Q.sj};
if(V==="2"){const a=JSON.stringify(out),b=JSON.stringify(Q);console.log("identical:",a===b);
  if(a!==b){for(let p=0;p<604;p++)if(JSON.stringify(out.pages[p])!==JSON.stringify(Q.pages[p])){console.log("page",p+1,JSON.stringify(out.pages[p]).slice(0,400),"\n",JSON.stringify(Q.pages[p]).slice(0,400));break}
   console.log("vp same",JSON.stringify(vp)===JSON.stringify(Q.vp))}}
else{fs.writeFileSync(require("path").join(__dirname,"../mushaf-data1.js"),"window.QDATA1="+JSON.stringify(out)+";\n");
  let d=0;for(let i=0;i<6236;i++)if(vp[i]!==Q.vp[i])d++;console.log("written; verses on a different page than 1421:",d,"zeros",vp.filter(x=>!x).length)}
if(V==="2"&&process.argv[3]){const b=Q;let n=0;for(let p=0;p<604;p++){const A=out.pages[p].l,B=b.pages[p].l;for(let i=0;i<Math.max(A.length,B.length);i++){const x=JSON.stringify(A[i]),y=JSON.stringify(B[i]);if(x!==y){n++;if(n<4)console.log(p+1,i,"\n",x,"\n",y)}}}console.log("difflines",n)}

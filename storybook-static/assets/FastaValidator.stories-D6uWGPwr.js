const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./FastaValidator-Dg7PIQYh.js","./template-CIKGjA4E.js","./runtime-CsLX-Eqq.js","./if-BJwBTplU.js","./store-CEga9lFI.js","./index-BJUjmB_L.js","./each--pBB4YgF.js","./class-BhzPnwhT.js","./input-e_bUZ-Vg.js","./props-ucnq1n3h.js","./select-BSQ0X8Fl.js","./index-client-C32oe8zx.js","./FastaValidator-f2DDXAZV.css"])))=>i.map(i=>d[i]);
import{_ as O}from"./iframe-q5ikvICN.js";const k={title:"Components/FastaValidator",component:null,parameters:{docs:{description:{component:"A comprehensive FASTA file validation component with repair functionality."}}},argTypes:{file:{control:"object"},autoValidate:{control:"boolean"},showRepair:{control:"boolean"}}},Y=`>sequence1
ATGCGTACGTACGTACGTACGTACGTACGTACGTACG
>sequence2
GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA
>sequence3
TACGTACGTACGTACGTACGTACGTACGTACGTACG`,c=`sequence1_no_header
ATGCGTACGTACGTACGTACGTACGTACGTACGTACG
>sequence2
GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA
>sequence3_invalid_chars
TACGTACXYZACGTACGTACGTACGTACGTACGTACG`,j=`>sequence1
ATGCGTACGTACGTACGTACGTACGTACGTACGTACG
>sequence2_short
GCTAGCTA
>sequence3_long
TACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACG`,a=(A,t)=>({name:A,text:()=>Promise.resolve(t),size:t.length,type:"text/plain"}),e=({file:A,autoValidate:t,showRepair:N})=>({Component:()=>O(()=>import("./FastaValidator-Dg7PIQYh.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12]),import.meta.url),props:{file:A,autoValidate:t,showRepair:N}}),o=e.bind({});o.args={file:null,autoValidate:!0,showRepair:!0};const r=e.bind({});r.args={file:a("valid.fasta",Y),autoValidate:!0,showRepair:!0};const n=e.bind({});n.args={file:a("invalid.fasta",c),autoValidate:!0,showRepair:!0};const i=e.bind({});i.args={file:a("mixed_length.fasta",j),autoValidate:!0,showRepair:!0};const s=e.bind({});s.args={file:a("manual.fasta",c),autoValidate:!1,showRepair:!0};const l=e.bind({});l.args={file:a("no_repair.fasta",c),autoValidate:!0,showRepair:!1};const p=e.bind({});p.args={file:a("protein.fasta",`>protein1
MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKAL
>protein2
PDGLAVLGIFLKVGSAKPGLQKVVDVLDSIKTKGKSADFTNFDPRGLLPESLDYWTYPGSLTT`),autoValidate:!0,showRepair:!0};const d=e.bind({});d.args={file:a("empty.fasta",""),autoValidate:!0,showRepair:!0};const u=e.bind({});u.args={file:a("large.fasta",Array.from({length:100},(A,t)=>`>sequence${t+1}
${"ATGC".repeat(250)}`).join(`
`)),autoValidate:!0,showRepair:!0};var C,G,T;o.parameters={...o.parameters,docs:{...(C=o.parameters)==null?void 0:C.docs,source:{originalSource:`({
  file,
  autoValidate,
  showRepair
}) => ({
  Component: () => import('../lib/FastaValidator.svelte'),
  props: {
    file,
    autoValidate,
    showRepair
  }
})`,...(T=(G=o.parameters)==null?void 0:G.docs)==null?void 0:T.source}}};var m,V,f;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`({
  file,
  autoValidate,
  showRepair
}) => ({
  Component: () => import('../lib/FastaValidator.svelte'),
  props: {
    file,
    autoValidate,
    showRepair
  }
})`,...(f=(V=r.parameters)==null?void 0:V.docs)==null?void 0:f.source}}};var h,R,F;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`({
  file,
  autoValidate,
  showRepair
}) => ({
  Component: () => import('../lib/FastaValidator.svelte'),
  props: {
    file,
    autoValidate,
    showRepair
  }
})`,...(F=(R=n.parameters)==null?void 0:R.docs)==null?void 0:F.source}}};var g,w,S;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`({
  file,
  autoValidate,
  showRepair
}) => ({
  Component: () => import('../lib/FastaValidator.svelte'),
  props: {
    file,
    autoValidate,
    showRepair
  }
})`,...(S=(w=i.parameters)==null?void 0:w.docs)==null?void 0:S.source}}};var b,L,v;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`({
  file,
  autoValidate,
  showRepair
}) => ({
  Component: () => import('../lib/FastaValidator.svelte'),
  props: {
    file,
    autoValidate,
    showRepair
  }
})`,...(v=(L=s.parameters)==null?void 0:L.docs)==null?void 0:v.source}}};var _,q,K;l.parameters={...l.parameters,docs:{...(_=l.parameters)==null?void 0:_.docs,source:{originalSource:`({
  file,
  autoValidate,
  showRepair
}) => ({
  Component: () => import('../lib/FastaValidator.svelte'),
  props: {
    file,
    autoValidate,
    showRepair
  }
})`,...(K=(q=l.parameters)==null?void 0:q.docs)==null?void 0:K.source}}};var P,E,D;p.parameters={...p.parameters,docs:{...(P=p.parameters)==null?void 0:P.docs,source:{originalSource:`({
  file,
  autoValidate,
  showRepair
}) => ({
  Component: () => import('../lib/FastaValidator.svelte'),
  props: {
    file,
    autoValidate,
    showRepair
  }
})`,...(D=(E=p.parameters)==null?void 0:E.docs)==null?void 0:D.source}}};var I,x,y;d.parameters={...d.parameters,docs:{...(I=d.parameters)==null?void 0:I.docs,source:{originalSource:`({
  file,
  autoValidate,
  showRepair
}) => ({
  Component: () => import('../lib/FastaValidator.svelte'),
  props: {
    file,
    autoValidate,
    showRepair
  }
})`,...(y=(x=d.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var Q,W,M;u.parameters={...u.parameters,docs:{...(Q=u.parameters)==null?void 0:Q.docs,source:{originalSource:`({
  file,
  autoValidate,
  showRepair
}) => ({
  Component: () => import('../lib/FastaValidator.svelte'),
  props: {
    file,
    autoValidate,
    showRepair
  }
})`,...(M=(W=u.parameters)==null?void 0:W.docs)==null?void 0:M.source}}};const z=["NoFile","ValidFile","InvalidFile","MixedLengthFile","WithoutAutoValidation","WithoutRepairOption","ProteinSequence","EmptyFile","LargeFile"];export{d as EmptyFile,n as InvalidFile,u as LargeFile,i as MixedLengthFile,o as NoFile,p as ProteinSequence,r as ValidFile,s as WithoutAutoValidation,l as WithoutRepairOption,z as __namedExportsOrder,k as default};

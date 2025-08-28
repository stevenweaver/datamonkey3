/* empty css            */import{a as i,t as f,c as Q}from"./template-CIKGjA4E.js";import{p as pt,l as X,a as mt,b as ft,c as y,f as Y,s as Z,h as wt,g as r,t as $,m as ee,e as he,d as te}from"./runtime-CsLX-Eqq.js";import{i as q,s as se}from"./if-BJwBTplU.js";import{e as ae,i as St}from"./each--pBB4YgF.js";import{i as gt,s as Ft,a as re}from"./store-CEga9lFI.js";import{p as G}from"./props-ucnq1n3h.js";import{o as ht}from"./index-client-C32oe8zx.js";import{a as N}from"./analyses-4ppeMcKn.js";import{c as vt,p as bt}from"./fileInfo-DmhC3Ja7.js";import{A as ve}from"./AnalysisCard-DzccarVw.js";import{w as ne}from"./index-BJUjmB_L.js";import"./class-BhzPnwhT.js";import"./html-ynStkv79.js";import"./event-modifiers-Bd-89TeU.js";var At=f('<div class="flex items-center justify-center p-4"><svg class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>Loading analyses...</span></div>'),_t=f('<div class="rounded border border-red-300 bg-red-50 p-3 text-red-800"><p> </p></div>'),Ct=f('<div class="rounded border border-gray-200 bg-gray-50 p-4 text-center text-gray-500"><div class="flex flex-col items-center"><svg class="mb-3 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg> <p class="font-medium"> </p> <p class="mt-2 text-sm">Run an analysis method (FEL, SLAC, etc.) to see results here.</p></div></div>'),Tt=f('<div class="mb-4"><h3 class="mb-2 bg-gray-100 p-2 text-sm font-semibold"> </h3> <div class="analysis-cards"></div></div>'),kt=f('<div class="analysis-cards"></div>'),xt=f('<div class="max-h-[500px] overflow-y-auto pr-1"><!></div>'),Dt=f('<div class="analysis-history"><!></div>');function le(s,t){pt(t,!1);const[F,$e]=Ft(),j=()=>re(vt,"$currentFile",F),p=()=>re(N,"$analysisStore",F),et=()=>re(bt,"$persistentFileStore",F),O=ee(),ie=ee();let oe=G(t,"onSelectAnalysis",8,e=>{}),z=G(t,"filterByCurrentFile",8,!1),ce=G(t,"compact",8,!1),de=G(t,"redirectToResults",8,!1),m=ee([]);function tt(e){const a=et().files.find(n=>n.id===e);return a?a.filename:"Unknown file"}function ue(e){const{analysisId:a}=e.detail;oe()(a),de()&&dispatchEvent(new CustomEvent("switchTab",{detail:{tabName:"results",analysisId:a},bubbles:!0}))}function ye(e){const{analysisId:a}=e.detail;oe()(a),de()&&dispatchEvent(new CustomEvent("switchTab",{detail:{tabName:"results",analysisId:a},bubbles:!0}))}function pe(e){e.detail}async function me(e){const{analysisId:a}=e.detail;if(confirm("Are you sure you want to cancel this analysis?"))try{await N.cancelAnalysis(a)}catch(n){console.error("Error cancelling analysis:",n),alert("Failed to cancel analysis: "+n.message)}}async function fe(e){const{analysisId:a}=e.detail;if(confirm("Are you sure you want to delete this analysis? This action cannot be undone."))try{await N.deleteAnalysis(a)}catch(n){console.error("Error deleting analysis:",n),alert("Failed to delete analysis: "+n.message)}}ht(async()=>{try{await N.loadAnalyses()}catch(e){console.error("Error loading analyses:",e)}}),X(()=>(wt(z()),j(),p()),()=>{Z(O,z()&&j()?p().analyses.filter(e=>e.fileId===j().id&&e.method!=="datareader"):p().analyses.filter(e=>e.method!=="datareader"))}),X(()=>(r(O),r(m)),()=>{console.log("AnalysisHistory: Got filteredAnalyses:",r(O).length,"analyses"),Z(m,[...r(O)].sort((e,a)=>a.createdAt-e.createdAt)),console.log("AnalysisHistory: Sorted analyses:",r(m).map(e=>`${e.id} (${e.method})`))}),X(()=>r(m),()=>{Z(ie,r(m).reduce((e,a)=>{const n=a.fileId;return e[n]||(e[n]=[]),e[n].push(a),e},{}))}),mt(),gt();var we=Dt(),st=y(we);{var at=e=>{var a=At();i(e,a)},rt=e=>{var a=Q(),n=Y(a);{var nt=w=>{var h=_t(),P=y(h),W=y(P);$(()=>se(W,`Error: ${p().error??""}`)),i(w,h)},lt=w=>{var h=Q(),P=Y(h);{var W=S=>{var v=Ct(),U=y(v),J=he(y(U),2),K=y(J);$(()=>se(K,`No analyses found${(z()?" for the current file":"")??""}.`)),i(S,v)},it=S=>{var v=xt(),U=y(v);{var J=g=>{var b=Q(),A=Y(b);ae(A,1,()=>Object.entries(r(ie)),St,(L,V)=>{let ot=()=>r(V)[0],ct=()=>r(V)[1];var Se=Tt(),ge=y(Se),dt=y(ge),ut=he(ge,2);ae(ut,5,ct,_=>_.id,(_,Fe)=>{const yt=te(()=>r(Fe).id===p().currentAnalysisId);ve(_,{get analysis(){return r(Fe)},get compact(){return ce()},get selected(){return r(yt)},$$events:{select:ue,view:ye,export:pe,cancel:me,delete:fe}})}),$(_=>se(dt,_),[()=>tt(ot())],te),i(L,Se)}),i(g,b)},K=g=>{var b=kt();ae(b,5,()=>r(m),A=>A.id,(A,L)=>{const V=te(()=>r(L).id===p().currentAnalysisId);ve(A,{get analysis(){return r(L)},get compact(){return ce()},get selected(){return r(V)},$$events:{select:ue,view:ye,export:pe,cancel:me,delete:fe}})}),i(g,b)};q(U,g=>{z()?g(K,!1):g(J)})}i(S,v)};q(P,S=>{r(m).length===0?S(W):S(it,!1)},!0)}i(w,h)};q(n,w=>{p().error?w(nt):w(lt,!1)},!0)}i(e,a)};q(st,e=>{p().isLoading?e(at):e(rt,!1)})}i(s,we),ft(),$e()}le.__docgen={version:3,name:"AnalysisHistory.svelte",data:[{name:"onSelectAnalysis",visibility:"public",keywords:[],kind:"let",type:{kind:"function",text:"(id: any) => void"},static:!1,readonly:!1,defaultValue:"function"},{name:"filterByCurrentFile",visibility:"public",keywords:[],kind:"let",type:{kind:"type",type:"boolean",text:"boolean"},static:!1,readonly:!1,defaultValue:"false"},{name:"compact",visibility:"public",keywords:[],kind:"let",type:{kind:"type",type:"boolean",text:"boolean"},static:!1,readonly:!1,defaultValue:"false"},{name:"redirectToResults",visibility:"public",keywords:[],kind:"let",type:{kind:"type",type:"boolean",text:"boolean"},static:!1,readonly:!1,defaultValue:"false"}],computed:[],methods:[],components:[],description:null,keywords:[],events:[],slots:[],refs:[]};const o=(s,t=!1,F=null)=>({subscribe:ne({analyses:s||[],isLoading:t,error:F,currentAnalysisId:null}).subscribe}),c=s=>({files:s||[],subscribe:ne(s||[]).subscribe}),d=s=>({subscribe:ne(s).subscribe}),l=[{id:"file-123",filename:"HIV1_env_sequences.fasta",name:"HIV1_env_sequences.fasta",size:125432,uploadedAt:new Date(Date.now()-864e5).toISOString()},{id:"file-456",filename:"influenza_ha_sequences.fasta",name:"influenza_ha_sequences.fasta",size:89432,uploadedAt:new Date(Date.now()-36e5).toISOString()},{id:"file-789",filename:"sars_cov2_spike.fasta",name:"sars_cov2_spike.fasta",size:45231,uploadedAt:new Date(Date.now()-1728e5).toISOString()}],H=[{id:"analysis-1",fileId:"file-123",method:"fel",status:"running",createdAt:new Date(Date.now()-12e4).getTime(),result:null},{id:"analysis-2",fileId:"file-123",method:"slac",status:"completed",createdAt:new Date(Date.now()-36e5).getTime(),completedAt:new Date(Date.now()-33e5).toISOString(),result:{tested:{sites:[{site:42,p:.023,alpha:.15,beta:.85}]}}},{id:"analysis-3",fileId:"file-456",method:"meme",status:"completed",createdAt:new Date(Date.now()-72e5).getTime(),completedAt:new Date(Date.now()-69e5).toISOString(),result:{tested:{sites:[{site:67,p:.011,alpha:.12,beta:.92}]}}},{id:"analysis-4",fileId:"file-456",method:"busted",status:"error",createdAt:new Date(Date.now()-18e5).getTime(),result:null},{id:"analysis-5",fileId:"file-789",method:"fubar",status:"pending",createdAt:new Date(Date.now()-6e4).getTime(),result:null},{id:"analysis-6",fileId:"file-123",method:"relax",status:"cancelled",createdAt:new Date(Date.now()-6e5).getTime(),result:null}];H.filter(s=>s.fileId==="file-123");const It=[{id:"analysis-running-1",fileId:"file-123",method:"fel",status:"running",createdAt:new Date(Date.now()-12e4).getTime(),result:null},{id:"analysis-running-2",fileId:"file-456",method:"slac",status:"pending",createdAt:new Date(Date.now()-6e4).getTime(),result:null}],Ze=[{id:"analysis-completed-1",fileId:"file-123",method:"fel",status:"completed",createdAt:new Date(Date.now()-36e5).getTime(),completedAt:new Date(Date.now()-33e5).toISOString(),result:{tested:{sites:[{site:42,p:.023,alpha:.15,beta:.85}]}}},{id:"analysis-completed-2",fileId:"file-456",method:"busted",status:"completed",createdAt:new Date(Date.now()-72e5).getTime(),completedAt:new Date(Date.now()-69e5).toISOString(),result:{test_results:{p:.0023}}}],Ut={title:"Progress Indicators/AnalysisHistory",component:le,parameters:{docs:{description:{component:`
          ## Analysis History Component
          
          Displays a list of analysis results with comprehensive progress indicators and state management.
          
          Features:
          - **Loading State**: Animated spinner while loading analyses from storage
          - **Error Handling**: Clear error messages with styled error states
          - **Empty State**: Informative message when no analyses are available
          - **Progress Indicators**: Shows running, pending, completed, error, and cancelled states
          - **File Grouping**: Groups analyses by file when not filtering
          - **Filtering**: Option to show only analyses for the current file
          - **Scrollable Lists**: Handles long lists with maximum height and scrolling
          - **Interactive Cards**: Each analysis is clickable with action buttons
          - **Compact Mode**: Streamlined view for smaller spaces
          
          The component manages complex async operations with proper loading and error states.
        `}}},argTypes:{onSelectAnalysis:{action:"analysis-selected"},filterByCurrentFile:{control:"boolean"},compact:{control:"boolean"},redirectToResults:{control:"boolean"}}},u=s=>({Component:le,props:s}),C=s=>(window.analysisStore=o([],!0,null),window.persistentFileStore=c(l),window.currentFile=d(null),u.bind({})({onSelectAnalysis:t=>console.log("Selected analysis:",t),filterByCurrentFile:!1,compact:!1,redirectToResults:!1}));C.parameters={docs:{description:{story:"Shows the loading state with animated spinner while analyses are being loaded."}}};const T=s=>(window.analysisStore=o([],!1,"Failed to connect to server"),window.persistentFileStore=c(l),window.currentFile=d(null),u.bind({})({onSelectAnalysis:t=>console.log("Selected analysis:",t),filterByCurrentFile:!1,compact:!1,redirectToResults:!1}));T.parameters={docs:{description:{story:"Shows the error state when loading analyses fails."}}};const k=s=>(window.analysisStore=o([],!1,null),window.persistentFileStore=c(l),window.currentFile=d(null),u.bind({})({onSelectAnalysis:t=>console.log("Selected analysis:",t),filterByCurrentFile:!1,compact:!1,redirectToResults:!1}));k.parameters={docs:{description:{story:"Shows the empty state when no analyses are available."}}};const x=s=>(window.analysisStore=o(H,!1,null),window.persistentFileStore=c(l),window.currentFile=d(null),u.bind({})({onSelectAnalysis:t=>console.log("Selected analysis:",t),filterByCurrentFile:!1,compact:!1,redirectToResults:!1}));x.parameters={docs:{description:{story:"Shows mixed analyses grouped by file with different status indicators (running, completed, error, cancelled)."}}};const D=s=>(window.analysisStore=o(H,!1,null),window.persistentFileStore=c(l),window.currentFile=d(l[0]),u.bind({})({onSelectAnalysis:t=>console.log("Selected analysis:",t),filterByCurrentFile:!0,compact:!1,redirectToResults:!1}));D.parameters={docs:{description:{story:"Shows analyses filtered by the current file, without file grouping headers."}}};const I=s=>(window.analysisStore=o(H,!1,null),window.persistentFileStore=c(l),window.currentFile=d(null),u.bind({})({onSelectAnalysis:t=>console.log("Selected analysis:",t),filterByCurrentFile:!1,compact:!0,redirectToResults:!1}));I.parameters={docs:{description:{story:"Shows the compact view suitable for smaller spaces or sidebar usage."}}};const R=s=>(window.analysisStore=o(It,!1,null),window.persistentFileStore=c(l),window.currentFile=d(null),u.bind({})({onSelectAnalysis:t=>console.log("Selected analysis:",t),filterByCurrentFile:!1,compact:!1,redirectToResults:!1}));R.parameters={docs:{description:{story:"Shows only running and pending analyses with animated progress indicators."}}};const B=s=>(window.analysisStore=o(Ze,!1,null),window.persistentFileStore=c(l),window.currentFile=d(null),u.bind({})({onSelectAnalysis:t=>console.log("Selected analysis:",t),filterByCurrentFile:!1,compact:!1,redirectToResults:!1}));B.parameters={docs:{description:{story:"Shows only completed analyses with result previews and export options."}}};const E=s=>(window.analysisStore=o(Ze,!1,null),window.persistentFileStore=c(l),window.currentFile=d(null),u.bind({})({onSelectAnalysis:t=>console.log("Selected analysis:",t),filterByCurrentFile:!1,compact:!1,redirectToResults:!0}));E.parameters={docs:{description:{story:"Shows the component configured to redirect to Results tab when selecting an analysis."}}};const M=s=>(window.analysisStore=o(H,!1,null),window.persistentFileStore=c(l),window.currentFile=d(l[2]),u.bind({})({onSelectAnalysis:t=>console.log("Selected analysis:",t),filterByCurrentFile:!0,compact:!1,redirectToResults:!1}));M.parameters={docs:{description:{story:"Shows empty state with specific message when filtering by current file but no analyses exist for it."}}};var be,Ae,_e;C.parameters={...C.parameters,docs:{...(be=C.parameters)==null?void 0:be.docs,source:{originalSource:`args => {
  // Mock loading state
  window.analysisStore = createAnalysisStore([], true, null);
  window.persistentFileStore = createFileStore(mockFiles);
  window.currentFile = createCurrentFileStore(null);
  return Template.bind({})({
    onSelectAnalysis: id => console.log('Selected analysis:', id),
    filterByCurrentFile: false,
    compact: false,
    redirectToResults: false
  });
}`,...(_e=(Ae=C.parameters)==null?void 0:Ae.docs)==null?void 0:_e.source}}};var Ce,Te,ke;T.parameters={...T.parameters,docs:{...(Ce=T.parameters)==null?void 0:Ce.docs,source:{originalSource:`args => {
  // Mock error state
  window.analysisStore = createAnalysisStore([], false, 'Failed to connect to server');
  window.persistentFileStore = createFileStore(mockFiles);
  window.currentFile = createCurrentFileStore(null);
  return Template.bind({})({
    onSelectAnalysis: id => console.log('Selected analysis:', id),
    filterByCurrentFile: false,
    compact: false,
    redirectToResults: false
  });
}`,...(ke=(Te=T.parameters)==null?void 0:Te.docs)==null?void 0:ke.source}}};var xe,De,Ie;k.parameters={...k.parameters,docs:{...(xe=k.parameters)==null?void 0:xe.docs,source:{originalSource:`args => {
  // Mock empty state
  window.analysisStore = createAnalysisStore([], false, null);
  window.persistentFileStore = createFileStore(mockFiles);
  window.currentFile = createCurrentFileStore(null);
  return Template.bind({})({
    onSelectAnalysis: id => console.log('Selected analysis:', id),
    filterByCurrentFile: false,
    compact: false,
    redirectToResults: false
  });
}`,...(Ie=(De=k.parameters)==null?void 0:De.docs)==null?void 0:Ie.source}}};var Re,Be,Ee;x.parameters={...x.parameters,docs:{...(Re=x.parameters)==null?void 0:Re.docs,source:{originalSource:`args => {
  // Mock mixed state with various analysis statuses
  window.analysisStore = createAnalysisStore(mixedAnalyses, false, null);
  window.persistentFileStore = createFileStore(mockFiles);
  window.currentFile = createCurrentFileStore(null);
  return Template.bind({})({
    onSelectAnalysis: id => console.log('Selected analysis:', id),
    filterByCurrentFile: false,
    compact: false,
    redirectToResults: false
  });
}`,...(Ee=(Be=x.parameters)==null?void 0:Be.docs)==null?void 0:Ee.source}}};var Me,He,Oe;D.parameters={...D.parameters,docs:{...(Me=D.parameters)==null?void 0:Me.docs,source:{originalSource:`args => {
  // Mock filtered state for current file
  window.analysisStore = createAnalysisStore(mixedAnalyses, false, null);
  window.persistentFileStore = createFileStore(mockFiles);
  window.currentFile = createCurrentFileStore(mockFiles[0]); // Set first file as current

  return Template.bind({})({
    onSelectAnalysis: id => console.log('Selected analysis:', id),
    filterByCurrentFile: true,
    compact: false,
    redirectToResults: false
  });
}`,...(Oe=(He=D.parameters)==null?void 0:He.docs)==null?void 0:Oe.source}}};var ze,Le,Ve;I.parameters={...I.parameters,docs:{...(ze=I.parameters)==null?void 0:ze.docs,source:{originalSource:`args => {
  // Mock compact mode
  window.analysisStore = createAnalysisStore(mixedAnalyses, false, null);
  window.persistentFileStore = createFileStore(mockFiles);
  window.currentFile = createCurrentFileStore(null);
  return Template.bind({})({
    onSelectAnalysis: id => console.log('Selected analysis:', id),
    filterByCurrentFile: false,
    compact: true,
    redirectToResults: false
  });
}`,...(Ve=(Le=I.parameters)==null?void 0:Le.docs)==null?void 0:Ve.source}}};var qe,Ge,Ne;R.parameters={...R.parameters,docs:{...(qe=R.parameters)==null?void 0:qe.docs,source:{originalSource:`args => {
  // Mock only running analyses
  window.analysisStore = createAnalysisStore(runningAnalyses, false, null);
  window.persistentFileStore = createFileStore(mockFiles);
  window.currentFile = createCurrentFileStore(null);
  return Template.bind({})({
    onSelectAnalysis: id => console.log('Selected analysis:', id),
    filterByCurrentFile: false,
    compact: false,
    redirectToResults: false
  });
}`,...(Ne=(Ge=R.parameters)==null?void 0:Ge.docs)==null?void 0:Ne.source}}};var je,Pe,We;B.parameters={...B.parameters,docs:{...(je=B.parameters)==null?void 0:je.docs,source:{originalSource:`args => {
  // Mock only completed analyses
  window.analysisStore = createAnalysisStore(completedAnalyses, false, null);
  window.persistentFileStore = createFileStore(mockFiles);
  window.currentFile = createCurrentFileStore(null);
  return Template.bind({})({
    onSelectAnalysis: id => console.log('Selected analysis:', id),
    filterByCurrentFile: false,
    compact: false,
    redirectToResults: false
  });
}`,...(We=(Pe=B.parameters)==null?void 0:Pe.docs)==null?void 0:We.source}}};var Ue,Je,Ke;E.parameters={...E.parameters,docs:{...(Ue=E.parameters)==null?void 0:Ue.docs,source:{originalSource:`args => {
  // Mock with redirect enabled
  window.analysisStore = createAnalysisStore(completedAnalyses, false, null);
  window.persistentFileStore = createFileStore(mockFiles);
  window.currentFile = createCurrentFileStore(null);
  return Template.bind({})({
    onSelectAnalysis: id => console.log('Selected analysis:', id),
    filterByCurrentFile: false,
    compact: false,
    redirectToResults: true
  });
}`,...(Ke=(Je=E.parameters)==null?void 0:Je.docs)==null?void 0:Ke.source}}};var Qe,Xe,Ye;M.parameters={...M.parameters,docs:{...(Qe=M.parameters)==null?void 0:Qe.docs,source:{originalSource:`args => {
  // Mock empty state when filtering by current file
  window.analysisStore = createAnalysisStore(mixedAnalyses, false, null);
  window.persistentFileStore = createFileStore(mockFiles);
  window.currentFile = createCurrentFileStore(mockFiles[2]); // File with no analyses

  return Template.bind({})({
    onSelectAnalysis: id => console.log('Selected analysis:', id),
    filterByCurrentFile: true,
    compact: false,
    redirectToResults: false
  });
}`,...(Ye=(Xe=M.parameters)==null?void 0:Xe.docs)==null?void 0:Ye.source}}};const Jt=["LoadingState","ErrorState","EmptyState","MixedAnalyses","FilteredByFile","CompactMode","RunningAnalyses","CompletedAnalyses","WithRedirect","EmptyCurrentFile"];export{I as CompactMode,B as CompletedAnalyses,M as EmptyCurrentFile,k as EmptyState,T as ErrorState,D as FilteredByFile,C as LoadingState,x as MixedAnalyses,R as RunningAnalyses,E as WithRedirect,Jt as __namedExportsOrder,Ut as default};

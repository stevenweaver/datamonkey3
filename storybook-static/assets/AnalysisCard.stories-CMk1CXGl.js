/* empty css            */import{A as re}from"./AnalysisCard-DzccarVw.js";import"./template-CIKGjA4E.js";import"./runtime-CsLX-Eqq.js";import"./if-BJwBTplU.js";import"./store-CEga9lFI.js";import"./index-BJUjmB_L.js";import"./html-ynStkv79.js";import"./class-BhzPnwhT.js";import"./event-modifiers-Bd-89TeU.js";import"./props-ucnq1n3h.js";import"./index-client-C32oe8zx.js";import"./fileInfo-DmhC3Ja7.js";const s=e=>({files:e||[]}),t=[{id:"file-123",filename:"HIV1_env_sequences.fasta",name:"HIV1_env_sequences.fasta",size:125432,uploadedAt:new Date(Date.now()-864e5).toISOString()},{id:"file-456",filename:"influenza_ha_sequences.fasta",name:"influenza_ha_sequences.fasta",size:89432,uploadedAt:new Date(Date.now()-36e5).toISOString()}],h={id:"analysis-running-123",fileId:"file-123",method:"fel",status:"running",createdAt:new Date(Date.now()-12e4).toISOString(),result:null},f={id:"analysis-completed-fel",fileId:"file-123",method:"fel",status:"completed",createdAt:new Date(Date.now()-36e5).toISOString(),completedAt:new Date(Date.now()-3e6).toISOString(),result:{tested:{sites:[{site:42,p:.023,alpha:.15,beta:.85},{site:67,p:.011,alpha:.12,beta:.92},{site:89,p:.045,alpha:.18,beta:.78},{site:102,p:.008,alpha:.11,beta:.95},{site:134,p:.031,alpha:.14,beta:.82}]}}},ie={id:"analysis-completed-busted",fileId:"file-456",method:"busted",status:"completed",createdAt:new Date(Date.now()-72e5).toISOString(),completedAt:new Date(Date.now()-69e5).toISOString(),result:{test_results:{p:.0023}}},oe={id:"analysis-busted-ns",fileId:"file-123",method:"busted",status:"completed",createdAt:new Date(Date.now()-864e5).toISOString(),completedAt:new Date(Date.now()-861e5).toISOString(),result:{test_results:{p:.127}}},le={id:"analysis-error-123",fileId:"file-123",method:"meme",status:"error",createdAt:new Date(Date.now()-18e5).toISOString(),result:null},ce={id:"analysis-pending-123",fileId:"file-456",method:"slac",status:"pending",createdAt:new Date(Date.now()-6e4).toISOString(),result:null},de={id:"analysis-cancelled-123",fileId:"file-123",method:"fubar",status:"cancelled",createdAt:new Date(Date.now()-6e5).toISOString(),result:null},pe={id:"analysis-old-123",fileId:"file-123",method:"fel",status:"completed",createdAt:new Date(Date.now()-864e5*8).toISOString(),completedAt:new Date(Date.now()-864e5*8+36e5).toISOString(),result:{tested:{sites:[{site:23,p:.034,alpha:.16,beta:.81}]}}},Ce={title:"Progress Indicators/AnalysisCard",component:re,parameters:{docs:{description:{component:`
          ## Analysis Card Component
          
          Displays individual analysis results in both compact and detailed views with progress indicators.
          
          Features:
          - **Multiple Status States**: Running (with spinner), completed, error, cancelled, pending
          - **Result Previews**: Intelligent preview generation for different analysis methods  
          - **Loading Indicators**: Shows loading state while processing result previews
          - **Action Buttons**: Context-aware actions based on analysis status
          - **Time Display**: Smart relative time formatting (just now, 5 min ago, 2 days ago)
          - **Method Icons**: Visual method identification with SVG icons
          - **Compact Mode**: Streamlined view for list contexts
          
          The component includes progress indicators for various states and follows the premium design system.
        `}}},argTypes:{analysis:{control:"object"},compact:{control:"boolean"},selected:{control:"boolean"}}},a=e=>({Component:re,props:e}),n=e=>(window.persistentFileStore=s(t),a.bind({})({analysis:h,compact:!1,selected:!1}));n.parameters={docs:{description:{story:"Shows a running analysis with animated spinner in the status badge and progress indicators."}}};const r=e=>(window.persistentFileStore=s(t),a.bind({})({analysis:ce,compact:!1,selected:!1}));r.parameters={docs:{description:{story:"Shows an analysis in pending state with spinner animation."}}};const i=e=>(window.persistentFileStore=s(t),a.bind({})({analysis:f,compact:!1,selected:!1}));i.parameters={docs:{description:{story:"Shows a completed FEL analysis with result preview showing positive selection sites."}}};const o=e=>(window.persistentFileStore=s(t),a.bind({})({analysis:ie,compact:!1,selected:!1}));o.parameters={docs:{description:{story:"Shows a completed BUSTED analysis with significant positive selection detected."}}};const l=e=>(window.persistentFileStore=s(t),a.bind({})({analysis:oe,compact:!1,selected:!1}));l.parameters={docs:{description:{story:"Shows a completed BUSTED analysis with no significant selection detected."}}};const c=e=>(window.persistentFileStore=s(t),a.bind({})({analysis:le,compact:!1,selected:!1}));c.parameters={docs:{description:{story:"Shows an analysis that encountered an error during execution."}}};const d=e=>(window.persistentFileStore=s(t),a.bind({})({analysis:de,compact:!1,selected:!1}));d.parameters={docs:{description:{story:"Shows an analysis that was cancelled by the user."}}};const p=e=>(window.persistentFileStore=s(t),a.bind({})({analysis:pe,compact:!1,selected:!1}));p.parameters={docs:{description:{story:"Shows an older analysis with full date formatting instead of relative time."}}};const m=e=>(window.persistentFileStore=s(t),a.bind({})({analysis:f,compact:!1,selected:!0}));m.parameters={docs:{description:{story:"Shows a selected analysis card with highlighted border and background."}}};const u=e=>(window.persistentFileStore=s(t),a.bind({})({analysis:h,compact:!0,selected:!1}));u.parameters={docs:{description:{story:"Shows the compact version of the card suitable for list views."}}};const w=e=>(window.persistentFileStore=s(t),a.bind({})({analysis:f,compact:!0,selected:!0}));w.parameters={docs:{description:{story:"Shows a compact selected card without action buttons or result preview."}}};const g=e=>{const y={...f,id:"analysis-loading-preview"};return window.persistentFileStore=s(t),a.bind({})({analysis:y,compact:!1,selected:!1})};g.parameters={docs:{description:{story:"Shows the card while result preview is loading (demonstrates isLoading state)."}}};const S=e=>{const y={...h,fileId:"nonexistent-file-id"};return window.persistentFileStore=s(t),a.bind({})({analysis:y,compact:!1,selected:!1})};S.parameters={docs:{description:{story:"Shows how the card handles missing file information gracefully."}}};var F,A,b;n.parameters={...n.parameters,docs:{...(F=n.parameters)==null?void 0:F.docs,source:{originalSource:`args => {
  // Mock the persistent file store
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: runningAnalysis,
    compact: false,
    selected: false
  });
}`,...(b=(A=n.parameters)==null?void 0:A.docs)==null?void 0:b.source}}};var D,I,C;r.parameters={...r.parameters,docs:{...(D=r.parameters)==null?void 0:D.docs,source:{originalSource:`args => {
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: pendingAnalysis,
    compact: false,
    selected: false
  });
}`,...(C=(I=r.parameters)==null?void 0:I.docs)==null?void 0:C.source}}};var v,T,O;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`args => {
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: completedAnalysisFel,
    compact: false,
    selected: false
  });
}`,...(O=(T=i.parameters)==null?void 0:T.docs)==null?void 0:O.source}}};var k,_,B;o.parameters={...o.parameters,docs:{...(k=o.parameters)==null?void 0:k.docs,source:{originalSource:`args => {
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: completedAnalysisBusted,
    compact: false,
    selected: false
  });
}`,...(B=(_=o.parameters)==null?void 0:_.docs)==null?void 0:B.source}}};var N,x,E;l.parameters={...l.parameters,docs:{...(N=l.parameters)==null?void 0:N.docs,source:{originalSource:`args => {
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: bustedNotSignificant,
    compact: false,
    selected: false
  });
}`,...(E=(x=l.parameters)==null?void 0:x.docs)==null?void 0:E.source}}};var M,P,R;c.parameters={...c.parameters,docs:{...(M=c.parameters)==null?void 0:M.docs,source:{originalSource:`args => {
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: errorAnalysis,
    compact: false,
    selected: false
  });
}`,...(R=(P=c.parameters)==null?void 0:P.docs)==null?void 0:R.source}}};var L,q,z;d.parameters={...d.parameters,docs:{...(L=d.parameters)==null?void 0:L.docs,source:{originalSource:`args => {
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: cancelledAnalysis,
    compact: false,
    selected: false
  });
}`,...(z=(q=d.parameters)==null?void 0:q.docs)==null?void 0:z.source}}};var V,j,H;p.parameters={...p.parameters,docs:{...(V=p.parameters)==null?void 0:V.docs,source:{originalSource:`args => {
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: oldAnalysis,
    compact: false,
    selected: false
  });
}`,...(H=(j=p.parameters)==null?void 0:j.docs)==null?void 0:H.source}}};var U,W,G;m.parameters={...m.parameters,docs:{...(U=m.parameters)==null?void 0:U.docs,source:{originalSource:`args => {
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: completedAnalysisFel,
    compact: false,
    selected: true
  });
}`,...(G=(W=m.parameters)==null?void 0:W.docs)==null?void 0:G.source}}};var J,K,Q;u.parameters={...u.parameters,docs:{...(J=u.parameters)==null?void 0:J.docs,source:{originalSource:`args => {
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: runningAnalysis,
    compact: true,
    selected: false
  });
}`,...(Q=(K=u.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};var X,Y,Z;w.parameters={...w.parameters,docs:{...(X=w.parameters)==null?void 0:X.docs,source:{originalSource:`args => {
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: completedAnalysisFel,
    compact: true,
    selected: true
  });
}`,...(Z=(Y=w.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var $,ee,se;g.parameters={...g.parameters,docs:{...($=g.parameters)==null?void 0:$.docs,source:{originalSource:`args => {
  // Create an analysis that will trigger loading state
  const loadingAnalysis = {
    ...completedAnalysisFel,
    id: 'analysis-loading-preview'
  };
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: loadingAnalysis,
    compact: false,
    selected: false
  });
}`,...(se=(ee=g.parameters)==null?void 0:ee.docs)==null?void 0:se.source}}};var te,ae,ne;S.parameters={...S.parameters,docs:{...(te=S.parameters)==null?void 0:te.docs,source:{originalSource:`args => {
  // Create an analysis with no matching file
  const analysisNoFile = {
    ...runningAnalysis,
    fileId: 'nonexistent-file-id'
  };
  window.persistentFileStore = createFileStore(mockFiles);
  return Template.bind({})({
    analysis: analysisNoFile,
    compact: false,
    selected: false
  });
}`,...(ne=(ae=S.parameters)==null?void 0:ae.docs)==null?void 0:ne.source}}};const ve=["RunningAnalysis","PendingAnalysis","CompletedWithResults","CompletedBustedSignificant","CompletedBustedNotSignificant","ErrorAnalysis","CancelledAnalysis","OldAnalysis","SelectedCard","CompactMode","CompactSelected","LoadingPreview","NoFileInfo"];export{d as CancelledAnalysis,u as CompactMode,w as CompactSelected,l as CompletedBustedNotSignificant,o as CompletedBustedSignificant,i as CompletedWithResults,c as ErrorAnalysis,g as LoadingPreview,S as NoFileInfo,p as OldAnalysis,r as PendingAnalysis,n as RunningAnalysis,m as SelectedCard,ve as __namedExportsOrder,Ce as default};

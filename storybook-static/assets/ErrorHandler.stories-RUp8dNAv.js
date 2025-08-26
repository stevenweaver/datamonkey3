const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./ErrorHandler-Ck4OH7b-.js","./template-Bf37FghY.js","./runtime-D_5eIJdB.js","./if-qkq15gDy.js","./store-DSaKCGfv.js","./index-BzKHlfNo.js","./each-BHgmS7vF.js","./class-BhzPnwhT.js","./html-CxodrJdO.js","./props-Byy7dS6_.js","./index-client-DTALjsIX.js"])))=>i.map(i=>d[i]);
import{_ as O}from"./iframe-DguC3KV7.js";const G={title:"Components/ErrorHandler",component:null,parameters:{docs:{description:{component:"A comprehensive error handling component with dismissal, details, and suggestions."}}},argTypes:{error:{control:"object"},level:{control:"select",options:["error","warning","info"]},dismissable:{control:"boolean"},autoDismiss:{control:"boolean"},dismissAfter:{control:"number"},showDetails:{control:"boolean"},suggestions:{control:"object"}}},s=({error:I,level:R,dismissable:W,autoDismiss:F,dismissAfter:L,showDetails:j,suggestions:N})=>({Component:()=>O(()=>import("./ErrorHandler-Ck4OH7b-.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10]),import.meta.url),props:{error:I,level:R,dismissable:W,autoDismiss:F,dismissAfter:L,showDetails:j,suggestions:N}}),e=s.bind({});e.args={error:"File upload failed. Please try again.",level:"error",dismissable:!0,autoDismiss:!1,dismissAfter:5e3,showDetails:!1,suggestions:[]};const r=s.bind({});r.args={error:{message:"Invalid FASTA format detected",details:'Line 15: Expected sequence identifier starting with ">" but found "ATGC". Please ensure all sequences have proper headers.'},level:"error",dismissable:!0,autoDismiss:!1,dismissAfter:5e3,showDetails:!0,suggestions:[]};const i=s.bind({});i.args={error:"Connection to server failed",level:"error",dismissable:!0,autoDismiss:!1,dismissAfter:5e3,showDetails:!1,suggestions:[{label:"Retry",action:"retry"},{label:"Check network",action:"network"},{label:"Use local mode",action:"offline"}]};const o=s.bind({});o.args={error:"Large file detected. Analysis may take longer than usual.",level:"warning",dismissable:!0,autoDismiss:!1,dismissAfter:5e3,showDetails:!1,suggestions:[{label:"Continue anyway",action:"continue"},{label:"Split file",action:"split"}]};const n=s.bind({});n.args={error:"Analysis completed successfully. Results are ready for download.",level:"info",dismissable:!0,autoDismiss:!0,dismissAfter:3e3,showDetails:!1,suggestions:[]};const t=s.bind({});t.args={error:"File saved successfully",level:"info",dismissable:!0,autoDismiss:!0,dismissAfter:2e3,showDetails:!1,suggestions:[]};const a=s.bind({});a.args={error:"Critical system error. Please contact support.",level:"error",dismissable:!1,autoDismiss:!1,dismissAfter:5e3,showDetails:!1,suggestions:[{label:"Contact support",action:"support"},{label:"Report bug",action:"report"}]};const l=s.bind({});l.args={error:{message:"Phylogenetic analysis failed",details:"Error in tree construction: Maximum likelihood estimation failed to converge after 1000 iterations. This may be due to insufficient sequence variation or inappropriate substitution model selection. Consider using a different model or checking sequence alignment quality."},level:"error",dismissable:!0,autoDismiss:!1,dismissAfter:5e3,showDetails:!0,suggestions:[{label:"Try different model",action:"change_model"},{label:"Check alignment",action:"check_alignment"},{label:"Use simpler method",action:"simple_method"}]};var m,d,u;e.parameters={...e.parameters,docs:{...(m=e.parameters)==null?void 0:m.docs,source:{originalSource:`({
  error,
  level,
  dismissable,
  autoDismiss,
  dismissAfter,
  showDetails,
  suggestions
}) => ({
  Component: () => import('../lib/ErrorHandler.svelte'),
  props: {
    error,
    level,
    dismissable,
    autoDismiss,
    dismissAfter,
    showDetails,
    suggestions
  }
})`,...(u=(d=e.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var c,p,g;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`({
  error,
  level,
  dismissable,
  autoDismiss,
  dismissAfter,
  showDetails,
  suggestions
}) => ({
  Component: () => import('../lib/ErrorHandler.svelte'),
  props: {
    error,
    level,
    dismissable,
    autoDismiss,
    dismissAfter,
    showDetails,
    suggestions
  }
})`,...(g=(p=r.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var f,b,D;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`({
  error,
  level,
  dismissable,
  autoDismiss,
  dismissAfter,
  showDetails,
  suggestions
}) => ({
  Component: () => import('../lib/ErrorHandler.svelte'),
  props: {
    error,
    level,
    dismissable,
    autoDismiss,
    dismissAfter,
    showDetails,
    suggestions
  }
})`,...(D=(b=i.parameters)==null?void 0:b.docs)==null?void 0:D.source}}};var h,v,A;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`({
  error,
  level,
  dismissable,
  autoDismiss,
  dismissAfter,
  showDetails,
  suggestions
}) => ({
  Component: () => import('../lib/ErrorHandler.svelte'),
  props: {
    error,
    level,
    dismissable,
    autoDismiss,
    dismissAfter,
    showDetails,
    suggestions
  }
})`,...(A=(v=o.parameters)==null?void 0:v.docs)==null?void 0:A.source}}};var w,E,C;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`({
  error,
  level,
  dismissable,
  autoDismiss,
  dismissAfter,
  showDetails,
  suggestions
}) => ({
  Component: () => import('../lib/ErrorHandler.svelte'),
  props: {
    error,
    level,
    dismissable,
    autoDismiss,
    dismissAfter,
    showDetails,
    suggestions
  }
})`,...(C=(E=n.parameters)==null?void 0:E.docs)==null?void 0:C.source}}};var y,S,_;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`({
  error,
  level,
  dismissable,
  autoDismiss,
  dismissAfter,
  showDetails,
  suggestions
}) => ({
  Component: () => import('../lib/ErrorHandler.svelte'),
  props: {
    error,
    level,
    dismissable,
    autoDismiss,
    dismissAfter,
    showDetails,
    suggestions
  }
})`,...(_=(S=t.parameters)==null?void 0:S.docs)==null?void 0:_.source}}};var H,k,T;a.parameters={...a.parameters,docs:{...(H=a.parameters)==null?void 0:H.docs,source:{originalSource:`({
  error,
  level,
  dismissable,
  autoDismiss,
  dismissAfter,
  showDetails,
  suggestions
}) => ({
  Component: () => import('../lib/ErrorHandler.svelte'),
  props: {
    error,
    level,
    dismissable,
    autoDismiss,
    dismissAfter,
    showDetails,
    suggestions
  }
})`,...(T=(k=a.parameters)==null?void 0:k.docs)==null?void 0:T.source}}};var x,P,q;l.parameters={...l.parameters,docs:{...(x=l.parameters)==null?void 0:x.docs,source:{originalSource:`({
  error,
  level,
  dismissable,
  autoDismiss,
  dismissAfter,
  showDetails,
  suggestions
}) => ({
  Component: () => import('../lib/ErrorHandler.svelte'),
  props: {
    error,
    level,
    dismissable,
    autoDismiss,
    dismissAfter,
    showDetails,
    suggestions
  }
})`,...(q=(P=l.parameters)==null?void 0:P.docs)==null?void 0:q.source}}};const M=["SimpleError","DetailedError","ErrorWithSuggestions","Warning","Info","AutoDismiss","NonDismissable","ComplexError"];export{t as AutoDismiss,l as ComplexError,r as DetailedError,i as ErrorWithSuggestions,n as Info,a as NonDismissable,e as SimpleError,o as Warning,M as __namedExportsOrder,G as default};

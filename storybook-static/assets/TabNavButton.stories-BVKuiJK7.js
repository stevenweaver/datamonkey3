const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./TabNavButton-Bx6gnLaZ.js","./template-Bf37FghY.js","./runtime-D_5eIJdB.js","./if-qkq15gDy.js","./store-DSaKCGfv.js","./index-BzKHlfNo.js","./attributes-OnZxMmlQ.js","./class-BhzPnwhT.js","./props-Byy7dS6_.js"])))=>i.map(i=>d[i]);
import{_ as I}from"./iframe-DguC3KV7.js";const M={title:"Components/TabNavButton",component:null,parameters:{docs:{description:{component:"A navigation button component with directional styling and step indicators."}}},argTypes:{direction:{control:"select",options:["forward","back"]},label:{control:"text"},disabled:{control:"boolean"},tooltip:{control:"text"},step:{control:"select",options:[null,1,2,3]}}},o=({direction:R,label:W,disabled:A,tooltip:O,step:U,onClick:q})=>({Component:()=>I(()=>import("./TabNavButton-Bx6gnLaZ.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8]),import.meta.url),props:{direction:R,label:W,disabled:A,tooltip:O,step:U,onClick:q||(()=>console.log("Button clicked"))}}),e=o.bind({});e.args={direction:"forward",label:"Continue",disabled:!1,tooltip:"Proceed to next step",step:null};const n=o.bind({});n.args={direction:"back",label:"Back",disabled:!1,tooltip:"Return to previous step",step:null};const t=o.bind({});t.args={direction:"forward",label:"Upload Files",disabled:!1,tooltip:"Step 1: Upload your sequence files",step:1};const l=o.bind({});l.args={direction:"forward",label:"Continue",disabled:!0,tooltip:"Complete current step to continue",step:null};const i=o.bind({});i.args={direction:"back",label:"Back",disabled:!0,tooltip:"Cannot go back from first step",step:null};const s=o.bind({});s.args={direction:"forward",label:"Select Method",disabled:!1,tooltip:"Step 2: Choose analysis method",step:2};const a=o.bind({});a.args={direction:"forward",label:"Run Analysis",disabled:!1,tooltip:"Step 3: Execute analysis",step:3};const r=o.bind({});r.args={direction:"back",label:"Previous Step",disabled:!1,tooltip:"Return to step 1",step:2};var c,p,d;e.parameters={...e.parameters,docs:{...(c=e.parameters)==null?void 0:c.docs,source:{originalSource:`({
  direction,
  label,
  disabled,
  tooltip,
  step,
  onClick
}) => ({
  Component: () => import('../lib/TabNavButton.svelte'),
  props: {
    direction,
    label,
    disabled,
    tooltip,
    step,
    onClick: onClick || (() => console.log('Button clicked'))
  }
})`,...(d=(p=e.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var b,u,m;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`({
  direction,
  label,
  disabled,
  tooltip,
  step,
  onClick
}) => ({
  Component: () => import('../lib/TabNavButton.svelte'),
  props: {
    direction,
    label,
    disabled,
    tooltip,
    step,
    onClick: onClick || (() => console.log('Button clicked'))
  }
})`,...(m=(u=n.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var k,C,B;t.parameters={...t.parameters,docs:{...(k=t.parameters)==null?void 0:k.docs,source:{originalSource:`({
  direction,
  label,
  disabled,
  tooltip,
  step,
  onClick
}) => ({
  Component: () => import('../lib/TabNavButton.svelte'),
  props: {
    direction,
    label,
    disabled,
    tooltip,
    step,
    onClick: onClick || (() => console.log('Button clicked'))
  }
})`,...(B=(C=t.parameters)==null?void 0:C.docs)==null?void 0:B.source}}};var g,v,S;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`({
  direction,
  label,
  disabled,
  tooltip,
  step,
  onClick
}) => ({
  Component: () => import('../lib/TabNavButton.svelte'),
  props: {
    direction,
    label,
    disabled,
    tooltip,
    step,
    onClick: onClick || (() => console.log('Button clicked'))
  }
})`,...(S=(v=l.parameters)==null?void 0:v.docs)==null?void 0:S.source}}};var f,T,w;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`({
  direction,
  label,
  disabled,
  tooltip,
  step,
  onClick
}) => ({
  Component: () => import('../lib/TabNavButton.svelte'),
  props: {
    direction,
    label,
    disabled,
    tooltip,
    step,
    onClick: onClick || (() => console.log('Button clicked'))
  }
})`,...(w=(T=i.parameters)==null?void 0:T.docs)==null?void 0:w.source}}};var N,_,h;s.parameters={...s.parameters,docs:{...(N=s.parameters)==null?void 0:N.docs,source:{originalSource:`({
  direction,
  label,
  disabled,
  tooltip,
  step,
  onClick
}) => ({
  Component: () => import('../lib/TabNavButton.svelte'),
  props: {
    direction,
    label,
    disabled,
    tooltip,
    step,
    onClick: onClick || (() => console.log('Button clicked'))
  }
})`,...(h=(_=s.parameters)==null?void 0:_.docs)==null?void 0:h.source}}};var x,y,D;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`({
  direction,
  label,
  disabled,
  tooltip,
  step,
  onClick
}) => ({
  Component: () => import('../lib/TabNavButton.svelte'),
  props: {
    direction,
    label,
    disabled,
    tooltip,
    step,
    onClick: onClick || (() => console.log('Button clicked'))
  }
})`,...(D=(y=a.parameters)==null?void 0:y.docs)==null?void 0:D.source}}};var F,E,P;r.parameters={...r.parameters,docs:{...(F=r.parameters)==null?void 0:F.docs,source:{originalSource:`({
  direction,
  label,
  disabled,
  tooltip,
  step,
  onClick
}) => ({
  Component: () => import('../lib/TabNavButton.svelte'),
  props: {
    direction,
    label,
    disabled,
    tooltip,
    step,
    onClick: onClick || (() => console.log('Button clicked'))
  }
})`,...(P=(E=r.parameters)==null?void 0:E.docs)==null?void 0:P.source}}};const V=["ForwardButton","BackButton","WithStepNumber","DisabledForward","DisabledBack","StepTwo","StepThree","BackWithStep"];export{n as BackButton,r as BackWithStep,i as DisabledBack,l as DisabledForward,e as ForwardButton,a as StepThree,s as StepTwo,t as WithStepNumber,V as __namedExportsOrder,M as default};

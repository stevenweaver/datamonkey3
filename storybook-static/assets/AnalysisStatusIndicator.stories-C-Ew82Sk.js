/* empty css            */import{c as Se,a as d,t as A}from"./template-CIKGjA4E.js";import{p as _e,l as I,a as be,f as xe,b as ke,g as e,m as D,e as m,s as C,c as n,t as T}from"./runtime-CsLX-Eqq.js";import{i as v,s as L}from"./if-BJwBTplU.js";import{i as Ie,s as De,e as Ce,a as ze}from"./store-CEga9lFI.js";import{p as Oe}from"./props-ucnq1n3h.js";import{w as u}from"./index-BJUjmB_L.js";var We=A('<div class="flex items-center svelte-1h0lz1g"><span class="inline-flex items-center justify-center text-sm svelte-1h0lz1g"><span class="pulse-animation mr-1 h-2 w-2 rounded-full bg-blue-500 svelte-1h0lz1g"></span> <span class="font-medium text-blue-600 svelte-1h0lz1g"> </span></span></div>'),Ee=A('<span class="mx-1.5 text-gray-300 svelte-1h0lz1g">•</span>'),Te=A('<div class="flex items-center svelte-1h0lz1g"><!> <span class="inline-flex items-center justify-center text-sm svelte-1h0lz1g"><span class="mr-1 text-green-500 svelte-1h0lz1g">✓</span> <span class="font-medium text-green-600 svelte-1h0lz1g"> </span></span></div>'),Le=A('<span class="mx-1.5 text-gray-300 svelte-1h0lz1g">•</span>'),Ne=A('<div class="flex items-center svelte-1h0lz1g"><!> <span class="inline-flex items-center justify-center text-sm svelte-1h0lz1g"><span class="mr-1 text-red-500 svelte-1h0lz1g">⚠</span> <span class="font-medium text-red-600 svelte-1h0lz1g"> </span></span></div>'),Fe=A('<button class="flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm transition-shadow duration-200 hover:shadow-md svelte-1h0lz1g" aria-label="View all analyses"><!> <!> <!></button>');function i(s,N){_e(N,!1);const[ce,pe]=De(),r=()=>ze(ue,"$activeAnalyses",ce),l=D(),y=D(),g=D(),F=D();let de=Oe(N,"mockActiveAnalyses",8,null);const me=u([]),ue=de()||me;function ye(){console.log("Navigate to results tab")}const M=new Date;M.setHours(0,0,0,0),I(()=>r(),()=>{C(l,r()?r().filter(t=>t.status!=="completed"&&t.status!=="error"&&t.method!=="datareader").length:0)}),I(()=>r(),()=>{C(y,r()?r().filter(t=>t.status==="completed"&&t.completedAt&&new Date(t.completedAt)>=M&&t.method!=="datareader").length:0)}),I(()=>r(),()=>{C(g,r()?r().filter(t=>t.status==="error"&&t.method!=="datareader").length:0)}),I(()=>(e(l),e(y),e(g)),()=>{C(F,e(l)>0||e(y)>0||e(g)>0)}),be(),Ie();var R=Se(),ve=xe(R);{var Ae=t=>{var z=Fe(),$=n(z);{var ge=a=>{var o=We(),c=n(o),h=m(n(c),2),f=n(h);T(()=>L(f,e(l))),d(a,o)};v($,a=>{e(l)>0&&a(ge)})}var j=m($,2);{var he=a=>{var o=Te(),c=n(o);{var h=p=>{var E=Ee();d(p,E)};v(c,p=>{e(l)>0&&p(h)})}var f=m(c,2),O=m(n(f),2),W=n(O);T(()=>L(W,e(y))),d(a,o)};v(j,a=>{e(y)>0&&a(he)})}var fe=m(j,2);{var we=a=>{var o=Ne(),c=n(o);{var h=p=>{var E=Le();d(p,E)};v(c,p=>{(e(l)>0||e(y)>0)&&p(h)})}var f=m(c,2),O=m(n(f),2),W=n(O);T(()=>L(W,e(g))),d(a,o)};v(fe,a=>{e(g)>0&&a(we)})}Ce("click",z,ye),d(t,z)};v(ve,t=>{e(F)&&t(Ae)})}d(s,R),ke(),pe()}i.__docgen={version:3,name:"AnalysisStatusIndicatorWrapper.svelte",data:[{name:"mockActiveAnalyses",visibility:"public",keywords:[],kind:"let",type:{kind:"type",type:"other",text:"null"},static:!1,readonly:!1,defaultValue:"null"}],computed:[],methods:[],components:[],description:null,keywords:[],events:[],slots:[],refs:[]};const re=[{id:"1",status:"running",method:"FEL",startTime:new Date().toISOString()},{id:"2",status:"mounting",method:"SLAC",startTime:new Date().toISOString()}],oe=[{id:"3",status:"completed",method:"MEME",completedAt:new Date().toISOString()},{id:"4",status:"completed",method:"BUSTED",completedAt:new Date().toISOString()},{id:"5",status:"completed",method:"FEL",completedAt:new Date().toISOString()}],ie=[{id:"6",status:"error",method:"FEL",completedAt:new Date().toISOString()},{id:"7",status:"error",method:"SLAC",completedAt:new Date().toISOString()}],le=[...re,...oe,...ie],Me=[...le,{id:"8",status:"running",method:"datareader",startTime:new Date().toISOString()},{id:"9",status:"completed",method:"datareader",completedAt:new Date().toISOString()}],Ve={title:"Progress Indicators/AnalysisStatusIndicator",component:i,parameters:{docs:{description:{component:`
          ## Analysis Status Indicator
          
          A streamlined status indicator that displays in the navigation bar, showing:
          - Number of running analyses with a blue pulsing dot
          - Number of completed analyses today with a green checkmark (✓)
          - Number of failed analyses with a warning symbol (⚠)
          
          This component follows Dieter Rams design principles:
          - Good Design Is Unobtrusive: Simple counter that doesn't distract
          - Good Design Is Honest: Shows exactly what's happening without decoration
          - Good Design Is As Little Design As Possible: Minimal UI with only essential information
        `}}},argTypes:{}},w=()=>{const s=u(re);return{Component:i,props:{mockActiveAnalyses:s}}};w.parameters={docs:{description:{story:"Shows only running analyses with a blue pulsing dot."}}};const S=()=>{const s=u(oe);return{Component:i,props:{mockActiveAnalyses:s}}};S.parameters={docs:{description:{story:"Shows only completed analyses with a green checkmark."}}};const _=()=>{const s=u(ie);return{Component:i,props:{mockActiveAnalyses:s}}};_.parameters={docs:{description:{story:"Shows only failed analyses with a warning symbol."}}};const b=()=>{const s=u(le);return{Component:i,props:{mockActiveAnalyses:s}}};b.parameters={docs:{description:{story:"Shows all types of analyses with their respective indicators: 2 running, 3 completed today, and 2 failed."}}};const x=()=>{const s=u(Me);return{Component:i,props:{mockActiveAnalyses:s}}};x.parameters={docs:{description:{story:"Shows that datareader analyses are correctly filtered out and not displayed in the counts."}}};const k=()=>{const s=u([]);return{Component:i,props:{mockActiveAnalyses:s}}};k.parameters={docs:{description:{story:"Component behavior when there are no analyses to display (indicator should be hidden)."}}};var G,U,H;w.parameters={...w.parameters,docs:{...(G=w.parameters)==null?void 0:G.docs,source:{originalSource:`() => {
  const mockActiveAnalyses = writable(runningAnalyses);
  return {
    Component: AnalysisStatusIndicatorWrapper,
    props: {
      mockActiveAnalyses
    }
  };
}`,...(H=(U=w.parameters)==null?void 0:U.docs)==null?void 0:H.source}}};var P,V,B;S.parameters={...S.parameters,docs:{...(P=S.parameters)==null?void 0:P.docs,source:{originalSource:`() => {
  const mockActiveAnalyses = writable(completedAnalyses);
  return {
    Component: AnalysisStatusIndicatorWrapper,
    props: {
      mockActiveAnalyses
    }
  };
}`,...(B=(V=S.parameters)==null?void 0:V.docs)==null?void 0:B.source}}};var q,J,K;_.parameters={..._.parameters,docs:{...(q=_.parameters)==null?void 0:q.docs,source:{originalSource:`() => {
  const mockActiveAnalyses = writable(failedAnalyses);
  return {
    Component: AnalysisStatusIndicatorWrapper,
    props: {
      mockActiveAnalyses
    }
  };
}`,...(K=(J=_.parameters)==null?void 0:J.docs)==null?void 0:K.source}}};var Q,X,Y;b.parameters={...b.parameters,docs:{...(Q=b.parameters)==null?void 0:Q.docs,source:{originalSource:`() => {
  const mockActiveAnalyses = writable(mixedAnalyses);
  return {
    Component: AnalysisStatusIndicatorWrapper,
    props: {
      mockActiveAnalyses
    }
  };
}`,...(Y=(X=b.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,ee,te;x.parameters={...x.parameters,docs:{...(Z=x.parameters)==null?void 0:Z.docs,source:{originalSource:`() => {
  const mockActiveAnalyses = writable(withDatareaderAnalyses);
  return {
    Component: AnalysisStatusIndicatorWrapper,
    props: {
      mockActiveAnalyses
    }
  };
}`,...(te=(ee=x.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var se,ae,ne;k.parameters={...k.parameters,docs:{...(se=k.parameters)==null?void 0:se.docs,source:{originalSource:`() => {
  const mockActiveAnalyses = writable([]);
  return {
    Component: AnalysisStatusIndicatorWrapper,
    props: {
      mockActiveAnalyses
    }
  };
}`,...(ne=(ae=k.parameters)==null?void 0:ae.docs)==null?void 0:ne.source}}};const Be=["Running","Completed","Failed","Mixed","WithDatareader","NoAnalyses"];export{S as Completed,_ as Failed,b as Mixed,k as NoAnalyses,w as Running,x as WithDatareader,Be as __namedExportsOrder,Ve as default};

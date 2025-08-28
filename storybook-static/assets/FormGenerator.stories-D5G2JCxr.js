var bs=_=>{throw TypeError(_)};var tn=(_,y,D)=>y.has(_)||bs("Cannot "+D);var O=(_,y,D)=>(tn(_,y,"read from private field"),D?D.call(_):y.get(_)),le=(_,y,D)=>y.has(_)?bs("Cannot add the same private member more than once"):y instanceof WeakSet?y.add(_):y.set(_,D);/* empty css            */import{a as H,t as ae,c as _t}from"./template-CIKGjA4E.js";import{ag as fe,g,s as pe,p as sn,m as xs,b as rn,ad as Ne,e as De,c as Ie,f as He,t as Ve,ac as nn}from"./runtime-CsLX-Eqq.js";import{i as de,s as At}from"./if-BJwBTplU.js";import{e as _s,i as an}from"./each--pBB4YgF.js";import{s as Pt}from"./attributes-DOIZIB14.js";import{i as ln,e as ft}from"./store-CEga9lFI.js";import{b as on}from"./input-e_bUZ-Vg.js";import{b as cn}from"./select-BSQ0X8Fl.js";import{p as As}from"./props-ucnq1n3h.js";import{o as Nt}from"./index-client-C32oe8zx.js";import{T as un}from"./TreeSelector-43ZCUCrB.js";import{w as Dt}from"./index-BJUjmB_L.js";import{g as fn}from"./_commonjsHelpers-CqkleIqs.js";import"./class-BhzPnwhT.js";import"./this-BvMMnuCv.js";import"./phylotree-CJOXszaR.js";import"./GardVisualization-BErLMUnZ.js";import"./html-ynStkv79.js";const pn="1756410164648";var Ns;const dn=((Ns=globalThis.__sveltekit_qyqygs)==null?void 0:Ns.base)??"";var Ds;const hn=((Ds=globalThis.__sveltekit_qyqygs)==null?void 0:Ds.assets)??dn,vn="sveltekit:snapshot",mn="sveltekit:scroll";function Ps(_){const y=Dt(_);let D=!0;function c(){D=!0,y.update(A=>A)}function j(A){D=!1,y.set(A)}function r(A){let V;return y.subscribe(E=>{(V===void 0||D&&E!==V)&&A(V=E)})}return{notify:c,set:j,subscribe:r}}const Rs={v:()=>{}};function gn(){const{set:_,subscribe:y}=Dt(!1);let D;async function c(){clearTimeout(D);try{const j=await fetch(`${hn}/_app/version.json`,{headers:{pragma:"no-cache","cache-control":"no-cache"}});if(!j.ok)return!1;const A=(await j.json()).version!==pn;return A&&(_(!0),Rs.v(),clearTimeout(D)),A}catch{return!1}}return{subscribe:y,check:c}}let oe,pt;const yn=Nt.toString().includes("$$")||/function \w+\(\) \{\}/.test(Nt.toString());var We,Je,Ke,Xe,Qe,et,tt,st,Es,rt,Fs;yn?(oe={data:{},form:null,error:null,params:{},route:{id:null},state:{},status:-1,url:new URL("https://example.com")},pt={current:!1}):(oe=new(Es=class{constructor(){le(this,We,fe({}));le(this,Je,fe(null));le(this,Ke,fe(null));le(this,Xe,fe({}));le(this,Qe,fe({id:null}));le(this,et,fe({}));le(this,tt,fe(-1));le(this,st,fe(new URL("https://example.com")))}get data(){return g(O(this,We))}set data(y){pe(O(this,We),y)}get form(){return g(O(this,Je))}set form(y){pe(O(this,Je),y)}get error(){return g(O(this,Ke))}set error(y){pe(O(this,Ke),y)}get params(){return g(O(this,Xe))}set params(y){pe(O(this,Xe),y)}get route(){return g(O(this,Qe))}set route(y){pe(O(this,Qe),y)}get state(){return g(O(this,et))}set state(y){pe(O(this,et),y)}get status(){return g(O(this,tt))}set status(y){pe(O(this,tt),y)}get url(){return g(O(this,st))}set url(y){pe(O(this,st),y)}},We=new WeakMap,Je=new WeakMap,Ke=new WeakMap,Xe=new WeakMap,Qe=new WeakMap,et=new WeakMap,tt=new WeakMap,st=new WeakMap,Es),pt=new(Fs=class{constructor(){le(this,rt,fe(!1))}get current(){return g(O(this,rt))}set current(y){pe(O(this,rt),y)}},rt=new WeakMap,Fs),Rs.v=()=>pt.current=!0);new URL("sveltekit-internal://");const $n=window.fetch;window.fetch=(_,y)=>((_ instanceof Request?_.method:(y==null?void 0:y.method)||"GET")!=="GET"&&bn.delete(xn(_)),$n(_,y));const bn=new Map;function xn(_,y){return`script[data-sveltekit-fetched][data-url=${JSON.stringify(_ instanceof Request?_.url:_)}]`}function Us(_,y=JSON.parse){try{return y(sessionStorage[_])}catch{}}const js=new Set(["load","prerender","csr","ssr","trailingSlash","config"]);[...js];const _n=new Set([...js]);[..._n];Us(mn);Us(vn);const An={url:Ps({}),page:Ps({}),navigating:Dt(null),updated:gn()},Pn={get data(){return oe.data},get error(){return oe.error},get form(){return oe.form},get params(){return oe.params},get route(){return oe.route},get state(){return oe.state},get status(){return oe.status},get url(){return oe.url}};An.updated.check;const kn=Pn;var kt,ks;function wn(){return ks||(ks=1,kt=function(){function _(c,j){function r(){this.constructor=c}r.prototype=j.prototype,c.prototype=new r}function y(c,j,r,A,V,E){this.message=c,this.expected=j,this.found=r,this.offset=A,this.line=V,this.column=E,this.name="SyntaxError"}_(y,Error);function D(c){var j=arguments.length>1?arguments[1]:{},r={},A={start:Qt},V=Qt,E=function(){return ys},l=r,be="#",xe={type:"literal",value:"#",description:'"#"'},B=void 0,X={type:"any",description:"any character"},re="[",Q={type:"literal",value:"[",description:'"["'},ne="]",P={type:"literal",value:"]",description:'"]"'},$=function(e){bt(Y("ObjectPath",e,M,z))},b=function(e){bt(Y("ArrayPath",e,M,z))},C=function(e,s){return e.concat(s)},w=function(e){return[e]},L=function(e){return e},R=".",G={type:"literal",value:".",description:'"."'},T="=",q={type:"literal",value:"=",description:'"="'},Z=function(e,s){bt(Y("Assign",s,M,z,e))},nt=function(e){return e.join("")},it=function(e){return e.value},he='"""',_e={type:"literal",value:'"""',description:'"\\"\\"\\""'},F=null,Ae=function(e){return Y("String",e.join(""),M,z)},Ee='"',Re={type:"literal",value:'"',description:'"\\""'},ve="'''",Ue={type:"literal",value:"'''",description:`"'''"`},Pe="'",Fe={type:"literal",value:"'",description:`"'"`},je=function(e){return e},dt=function(e){return e},ht="\\",me={type:"literal",value:"\\",description:'"\\\\"'},ce=function(){return""},ue="e",ge={type:"literal",value:"e",description:'"e"'},ye="E",ie={type:"literal",value:"E",description:'"E"'},W=function(e,s){return Y("Float",parseFloat(e+"e"+s),M,z)},ke=function(e){return Y("Float",parseFloat(e),M,z)},qe="+",we={type:"literal",value:"+",description:'"+"'},Oe=function(e){return e.join("")},Ce="-",Me={type:"literal",value:"-",description:'"-"'},Ft=function(e){return"-"+e.join("")},qs=function(e){return Y("Integer",parseInt(e,10),M,z)},St="true",Os={type:"literal",value:"true",description:'"true"'},Ms=function(){return Y("Boolean",!0,M,z)},Tt="false",zs={type:"literal",value:"false",description:'"false"'},Ys=function(){return Y("Boolean",!1,M,z)},Ls=function(){return Y("Array",[],M,z)},Bs=function(e){return Y("Array",e?[e]:[],M,z)},Gs=function(e){return Y("Array",e,M,z)},Hs=function(e,s){return Y("Array",e.concat(s),M,z)},It=function(e){return e},Rt=",",Ut={type:"literal",value:",",description:'","'},Vs="{",Zs={type:"literal",value:"{",description:'"{"'},Ws="}",Js={type:"literal",value:"}",description:'"}"'},Ks=function(e){return Y("InlineTable",e,M,z)},jt=function(e,s){return Y("InlineTableValue",s,M,z,e)},Xs=function(e){return"."+e},Qs=function(e){return e.join("")},ze=":",Ye={type:"literal",value:":",description:'":"'},qt=function(e){return e.join("")},Ot="T",Mt={type:"literal",value:"T",description:'"T"'},er="Z",tr={type:"literal",value:"Z",description:'"Z"'},sr=function(e,s){return Y("Date",new Date(e+"T"+s+"Z"),M,z)},rr=function(e,s){return Y("Date",new Date(e+"T"+s),M,z)},nr=/^[ \t]/,ir={type:"class",value:"[ \\t]",description:"[ \\t]"},zt=`
`,Yt={type:"literal",value:`
`,description:'"\\n"'},ar="\r",lr={type:"literal",value:"\r",description:'"\\r"'},or=/^[0-9a-f]/i,cr={type:"class",value:"[0-9a-f]i",description:"[0-9a-f]i"},ur=/^[0-9]/,fr={type:"class",value:"[0-9]",description:"[0-9]"},pr="_",dr={type:"literal",value:"_",description:'"_"'},hr=function(){return""},vr=/^[A-Za-z0-9_\-]/,mr={type:"class",value:"[A-Za-z0-9_\\-]",description:"[A-Za-z0-9_\\-]"},gr=function(e){return e.join("")},Lt='\\"',yr={type:"literal",value:'\\"',description:'"\\\\\\""'},$r=function(){return'"'},Bt="\\\\",br={type:"literal",value:"\\\\",description:'"\\\\\\\\"'},xr=function(){return"\\"},Gt="\\b",_r={type:"literal",value:"\\b",description:'"\\\\b"'},Ar=function(){return"\b"},Ht="\\t",Pr={type:"literal",value:"\\t",description:'"\\\\t"'},kr=function(){return"	"},Vt="\\n",wr={type:"literal",value:"\\n",description:'"\\\\n"'},Cr=function(){return`
`},Zt="\\f",Nr={type:"literal",value:"\\f",description:'"\\\\f"'},Dr=function(){return"\f"},Wt="\\r",Er={type:"literal",value:"\\r",description:'"\\\\r"'},Fr=function(){return"\r"},Jt="\\U",Sr={type:"literal",value:"\\U",description:'"\\\\U"'},Kt=function(e){return Qr(e.join(""))},Xt="\\u",Tr={type:"literal",value:"\\u",description:'"\\\\u"'},t=0,m=0,Le=0,vt={line:1,column:1,seenCR:!1},at=0,mt=[],f=0,p={},lt;if("startRule"in j){if(!(j.startRule in A))throw new Error(`Can't start parsing from rule "`+j.startRule+'".');V=A[j.startRule]}function M(){return gt(m).line}function z(){return gt(m).column}function gt(e){function s(n,i,a){var o,u;for(o=i;o<a;o++)u=c.charAt(o),u===`
`?(n.seenCR||n.line++,n.column=1,n.seenCR=!1):u==="\r"||u==="\u2028"||u==="\u2029"?(n.line++,n.column=1,n.seenCR=!0):(n.column++,n.seenCR=!1)}return Le!==e&&(Le>e&&(Le=0,vt={line:1,column:1,seenCR:!1}),s(vt,Le,e),Le=e),vt}function d(e){t<at||(t>at&&(at=t,mt=[]),mt.push(e))}function Ir(e,s,n){function i(h){var x=1;for(h.sort(function(S,k){return S.description<k.description?-1:S.description>k.description?1:0});x<h.length;)h[x-1]===h[x]?h.splice(x,1):x++}function a(h,x){function S(Te){function $e(K){return K.charCodeAt(0).toString(16).toUpperCase()}return Te.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\x08/g,"\\b").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\f/g,"\\f").replace(/\r/g,"\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g,function(K){return"\\x0"+$e(K)}).replace(/[\x10-\x1F\x80-\xFF]/g,function(K){return"\\x"+$e(K)}).replace(/[\u0180-\u0FFF]/g,function(K){return"\\u0"+$e(K)}).replace(/[\u1080-\uFFFF]/g,function(K){return"\\u"+$e(K)})}var k=new Array(h.length),I,U,J;for(J=0;J<h.length;J++)k[J]=h[J].description;return I=h.length>1?k.slice(0,-1).join(", ")+" or "+k[h.length-1]:k[0],U=x?'"'+S(x)+'"':"end of input","Expected "+I+" but "+U+" found."}var o=gt(n),u=n<c.length?c.charAt(n):null;return s!==null&&i(s),new y(a(s,u),s,u,n,o.line,o.column)}function Qt(){var e,s,n,i=t*49+0,a=p[i];if(a)return t=a.nextPos,a.result;for(e=t,s=[],n=es();n!==r;)s.push(n),n=es();return s!==r&&(m=e,s=E()),e=s,p[i]={nextPos:t,result:e},e}function es(){var e,s,n,i,a,o,u,h=t*49+1,x=p[h];if(x)return t=x.nextPos,x.result;for(e=t,s=[],n=v();n!==r;)s.push(n),n=v();if(s!==r)if(n=Rr(),n!==r){for(i=[],a=v();a!==r;)i.push(a),a=v();if(i!==r){for(a=[],o=ot();o!==r;)a.push(o),o=ot();if(a!==r){if(o=[],u=te(),u!==r)for(;u!==r;)o.push(u),u=te();else o=l;o===r&&(o=ut()),o!==r?(s=[s,n,i,a,o],e=s):(t=e,e=l)}else t=e,e=l}else t=e,e=l}else t=e,e=l;else t=e,e=l;if(e===r){if(e=t,s=[],n=v(),n!==r)for(;n!==r;)s.push(n),n=v();else s=l;if(s!==r){if(n=[],i=te(),i!==r)for(;i!==r;)n.push(i),i=te();else n=l;n===r&&(n=ut()),n!==r?(s=[s,n],e=s):(t=e,e=l)}else t=e,e=l;e===r&&(e=te())}return p[h]={nextPos:t,result:e},e}function Rr(){var e,s=t*49+2,n=p[s];return n?(t=n.nextPos,n.result):(e=ot(),e===r&&(e=Ur(),e===r&&(e=jr(),e===r&&(e=qr()))),p[s]={nextPos:t,result:e},e)}function ot(){var e,s,n,i,a,o,u=t*49+3,h=p[u];if(h)return t=h.nextPos,h.result;if(e=t,c.charCodeAt(t)===35?(s=be,t++):(s=r,f===0&&d(xe)),s!==r){for(n=[],i=t,a=t,f++,o=te(),o===r&&(o=ut()),f--,o===r?a=B:(t=a,a=l),a!==r?(c.length>t?(o=c.charAt(t),t++):(o=r,f===0&&d(X)),o!==r?(a=[a,o],i=a):(t=i,i=l)):(t=i,i=l);i!==r;)n.push(i),i=t,a=t,f++,o=te(),o===r&&(o=ut()),f--,o===r?a=B:(t=a,a=l),a!==r?(c.length>t?(o=c.charAt(t),t++):(o=r,f===0&&d(X)),o!==r?(a=[a,o],i=a):(t=i,i=l)):(t=i,i=l);n!==r?(s=[s,n],e=s):(t=e,e=l)}else t=e,e=l;return p[u]={nextPos:t,result:e},e}function Ur(){var e,s,n,i,a,o,u=t*49+4,h=p[u];if(h)return t=h.nextPos,h.result;if(e=t,c.charCodeAt(t)===91?(s=re,t++):(s=r,f===0&&d(Q)),s!==r){for(n=[],i=v();i!==r;)n.push(i),i=v();if(n!==r)if(i=ts(),i!==r){for(a=[],o=v();o!==r;)a.push(o),o=v();a!==r?(c.charCodeAt(t)===93?(o=ne,t++):(o=r,f===0&&d(P)),o!==r?(m=e,s=$(i),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;else t=e,e=l}else t=e,e=l;return p[u]={nextPos:t,result:e},e}function jr(){var e,s,n,i,a,o,u,h,x=t*49+5,S=p[x];if(S)return t=S.nextPos,S.result;if(e=t,c.charCodeAt(t)===91?(s=re,t++):(s=r,f===0&&d(Q)),s!==r)if(c.charCodeAt(t)===91?(n=re,t++):(n=r,f===0&&d(Q)),n!==r){for(i=[],a=v();a!==r;)i.push(a),a=v();if(i!==r)if(a=ts(),a!==r){for(o=[],u=v();u!==r;)o.push(u),u=v();o!==r?(c.charCodeAt(t)===93?(u=ne,t++):(u=r,f===0&&d(P)),u!==r?(c.charCodeAt(t)===93?(h=ne,t++):(h=r,f===0&&d(P)),h!==r?(m=e,s=b(a),e=s):(t=e,e=l)):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;else t=e,e=l}else t=e,e=l;else t=e,e=l;return p[x]={nextPos:t,result:e},e}function ts(){var e,s,n,i=t*49+6,a=p[i];if(a)return t=a.nextPos,a.result;if(e=t,s=[],n=rs(),n!==r)for(;n!==r;)s.push(n),n=rs();else s=l;return s!==r?(n=ss(),n!==r?(m=e,s=C(s,n),e=s):(t=e,e=l)):(t=e,e=l),e===r&&(e=t,s=ss(),s!==r&&(m=e,s=w(s)),e=s),p[i]={nextPos:t,result:e},e}function ss(){var e,s,n,i,a,o=t*49+7,u=p[o];if(u)return t=u.nextPos,u.result;for(e=t,s=[],n=v();n!==r;)s.push(n),n=v();if(s!==r)if(n=Be(),n!==r){for(i=[],a=v();a!==r;)i.push(a),a=v();i!==r?(m=e,s=L(n),e=s):(t=e,e=l)}else t=e,e=l;else t=e,e=l;if(e===r){for(e=t,s=[],n=v();n!==r;)s.push(n),n=v();if(s!==r)if(n=yt(),n!==r){for(i=[],a=v();a!==r;)i.push(a),a=v();i!==r?(m=e,s=L(n),e=s):(t=e,e=l)}else t=e,e=l;else t=e,e=l}return p[o]={nextPos:t,result:e},e}function rs(){var e,s,n,i,a,o,u,h=t*49+8,x=p[h];if(x)return t=x.nextPos,x.result;for(e=t,s=[],n=v();n!==r;)s.push(n),n=v();if(s!==r)if(n=Be(),n!==r){for(i=[],a=v();a!==r;)i.push(a),a=v();if(i!==r)if(c.charCodeAt(t)===46?(a=R,t++):(a=r,f===0&&d(G)),a!==r){for(o=[],u=v();u!==r;)o.push(u),u=v();o!==r?(m=e,s=L(n),e=s):(t=e,e=l)}else t=e,e=l;else t=e,e=l}else t=e,e=l;else t=e,e=l;if(e===r){for(e=t,s=[],n=v();n!==r;)s.push(n),n=v();if(s!==r)if(n=yt(),n!==r){for(i=[],a=v();a!==r;)i.push(a),a=v();if(i!==r)if(c.charCodeAt(t)===46?(a=R,t++):(a=r,f===0&&d(G)),a!==r){for(o=[],u=v();u!==r;)o.push(u),u=v();o!==r?(m=e,s=L(n),e=s):(t=e,e=l)}else t=e,e=l;else t=e,e=l}else t=e,e=l;else t=e,e=l}return p[h]={nextPos:t,result:e},e}function qr(){var e,s,n,i,a,o,u=t*49+9,h=p[u];if(h)return t=h.nextPos,h.result;if(e=t,s=Be(),s!==r){for(n=[],i=v();i!==r;)n.push(i),i=v();if(n!==r)if(c.charCodeAt(t)===61?(i=T,t++):(i=r,f===0&&d(q)),i!==r){for(a=[],o=v();o!==r;)a.push(o),o=v();a!==r?(o=Se(),o!==r?(m=e,s=Z(s,o),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;else t=e,e=l}else t=e,e=l;if(e===r)if(e=t,s=yt(),s!==r){for(n=[],i=v();i!==r;)n.push(i),i=v();if(n!==r)if(c.charCodeAt(t)===61?(i=T,t++):(i=r,f===0&&d(q)),i!==r){for(a=[],o=v();o!==r;)a.push(o),o=v();a!==r?(o=Se(),o!==r?(m=e,s=Z(s,o),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;else t=e,e=l}else t=e,e=l;return p[u]={nextPos:t,result:e},e}function Be(){var e,s,n,i=t*49+10,a=p[i];if(a)return t=a.nextPos,a.result;if(e=t,s=[],n=ms(),n!==r)for(;n!==r;)s.push(n),n=ms();else s=l;return s!==r&&(m=e,s=nt(s)),e=s,p[i]={nextPos:t,result:e},e}function yt(){var e,s,n=t*49+11,i=p[n];return i?(t=i.nextPos,i.result):(e=t,s=ns(),s!==r&&(m=e,s=it(s)),e=s,e===r&&(e=t,s=is(),s!==r&&(m=e,s=it(s)),e=s),p[n]={nextPos:t,result:e},e)}function Se(){var e,s=t*49+12,n=p[s];return n?(t=n.nextPos,n.result):(e=Or(),e===r&&(e=Jr(),e===r&&(e=Lr(),e===r&&(e=Br(),e===r&&(e=Gr(),e===r&&(e=Hr(),e===r&&(e=Vr())))))),p[s]={nextPos:t,result:e},e)}function Or(){var e,s=t*49+13,n=p[s];return n?(t=n.nextPos,n.result):(e=Mr(),e===r&&(e=ns(),e===r&&(e=zr(),e===r&&(e=is()))),p[s]={nextPos:t,result:e},e)}function Mr(){var e,s,n,i,a,o=t*49+14,u=p[o];if(u)return t=u.nextPos,u.result;if(e=t,c.substr(t,3)===he?(s=he,t+=3):(s=r,f===0&&d(_e)),s!==r)if(n=te(),n===r&&(n=F),n!==r){for(i=[],a=os();a!==r;)i.push(a),a=os();i!==r?(c.substr(t,3)===he?(a=he,t+=3):(a=r,f===0&&d(_e)),a!==r?(m=e,s=Ae(i),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;else t=e,e=l;return p[o]={nextPos:t,result:e},e}function ns(){var e,s,n,i,a=t*49+15,o=p[a];if(o)return t=o.nextPos,o.result;if(e=t,c.charCodeAt(t)===34?(s=Ee,t++):(s=r,f===0&&d(Re)),s!==r){for(n=[],i=as();i!==r;)n.push(i),i=as();n!==r?(c.charCodeAt(t)===34?(i=Ee,t++):(i=r,f===0&&d(Re)),i!==r?(m=e,s=Ae(n),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;return p[a]={nextPos:t,result:e},e}function zr(){var e,s,n,i,a,o=t*49+16,u=p[o];if(u)return t=u.nextPos,u.result;if(e=t,c.substr(t,3)===ve?(s=ve,t+=3):(s=r,f===0&&d(Ue)),s!==r)if(n=te(),n===r&&(n=F),n!==r){for(i=[],a=cs();a!==r;)i.push(a),a=cs();i!==r?(c.substr(t,3)===ve?(a=ve,t+=3):(a=r,f===0&&d(Ue)),a!==r?(m=e,s=Ae(i),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;else t=e,e=l;return p[o]={nextPos:t,result:e},e}function is(){var e,s,n,i,a=t*49+17,o=p[a];if(o)return t=o.nextPos,o.result;if(e=t,c.charCodeAt(t)===39?(s=Pe,t++):(s=r,f===0&&d(Fe)),s!==r){for(n=[],i=ls();i!==r;)n.push(i),i=ls();n!==r?(c.charCodeAt(t)===39?(i=Pe,t++):(i=r,f===0&&d(Fe)),i!==r?(m=e,s=Ae(n),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;return p[a]={nextPos:t,result:e},e}function as(){var e,s,n,i=t*49+18,a=p[i];return a?(t=a.nextPos,a.result):(e=gs(),e===r&&(e=t,s=t,f++,c.charCodeAt(t)===34?(n=Ee,t++):(n=r,f===0&&d(Re)),f--,n===r?s=B:(t=s,s=l),s!==r?(c.length>t?(n=c.charAt(t),t++):(n=r,f===0&&d(X)),n!==r?(m=e,s=je(n),e=s):(t=e,e=l)):(t=e,e=l)),p[i]={nextPos:t,result:e},e)}function ls(){var e,s,n,i=t*49+19,a=p[i];return a?(t=a.nextPos,a.result):(e=t,s=t,f++,c.charCodeAt(t)===39?(n=Pe,t++):(n=r,f===0&&d(Fe)),f--,n===r?s=B:(t=s,s=l),s!==r?(c.length>t?(n=c.charAt(t),t++):(n=r,f===0&&d(X)),n!==r?(m=e,s=je(n),e=s):(t=e,e=l)):(t=e,e=l),p[i]={nextPos:t,result:e},e)}function os(){var e,s,n,i=t*49+20,a=p[i];return a?(t=a.nextPos,a.result):(e=gs(),e===r&&(e=Yr(),e===r&&(e=t,s=t,f++,c.substr(t,3)===he?(n=he,t+=3):(n=r,f===0&&d(_e)),f--,n===r?s=B:(t=s,s=l),s!==r?(c.length>t?(n=c.charAt(t),t++):(n=r,f===0&&d(X)),n!==r?(m=e,s=dt(n),e=s):(t=e,e=l)):(t=e,e=l))),p[i]={nextPos:t,result:e},e)}function Yr(){var e,s,n,i,a,o=t*49+21,u=p[o];if(u)return t=u.nextPos,u.result;if(e=t,c.charCodeAt(t)===92?(s=ht,t++):(s=r,f===0&&d(me)),s!==r)if(n=te(),n!==r){for(i=[],a=vs();a!==r;)i.push(a),a=vs();i!==r?(m=e,s=ce(),e=s):(t=e,e=l)}else t=e,e=l;else t=e,e=l;return p[o]={nextPos:t,result:e},e}function cs(){var e,s,n,i=t*49+22,a=p[i];return a?(t=a.nextPos,a.result):(e=t,s=t,f++,c.substr(t,3)===ve?(n=ve,t+=3):(n=r,f===0&&d(Ue)),f--,n===r?s=B:(t=s,s=l),s!==r?(c.length>t?(n=c.charAt(t),t++):(n=r,f===0&&d(X)),n!==r?(m=e,s=je(n),e=s):(t=e,e=l)):(t=e,e=l),p[i]={nextPos:t,result:e},e)}function Lr(){var e,s,n,i,a=t*49+23,o=p[a];return o?(t=o.nextPos,o.result):(e=t,s=us(),s===r&&(s=$t()),s!==r?(c.charCodeAt(t)===101?(n=ue,t++):(n=r,f===0&&d(ge)),n===r&&(c.charCodeAt(t)===69?(n=ye,t++):(n=r,f===0&&d(ie))),n!==r?(i=$t(),i!==r?(m=e,s=W(s,i),e=s):(t=e,e=l)):(t=e,e=l)):(t=e,e=l),e===r&&(e=t,s=us(),s!==r&&(m=e,s=ke(s)),e=s),p[a]={nextPos:t,result:e},e)}function us(){var e,s,n,i,a,o,u=t*49+24,h=p[u];return h?(t=h.nextPos,h.result):(e=t,c.charCodeAt(t)===43?(s=qe,t++):(s=r,f===0&&d(we)),s===r&&(s=F),s!==r?(n=t,i=Ge(),i!==r?(c.charCodeAt(t)===46?(a=R,t++):(a=r,f===0&&d(G)),a!==r?(o=Ge(),o!==r?(i=[i,a,o],n=i):(t=n,n=l)):(t=n,n=l)):(t=n,n=l),n!==r?(m=e,s=Oe(n),e=s):(t=e,e=l)):(t=e,e=l),e===r&&(e=t,c.charCodeAt(t)===45?(s=Ce,t++):(s=r,f===0&&d(Me)),s!==r?(n=t,i=Ge(),i!==r?(c.charCodeAt(t)===46?(a=R,t++):(a=r,f===0&&d(G)),a!==r?(o=Ge(),o!==r?(i=[i,a,o],n=i):(t=n,n=l)):(t=n,n=l)):(t=n,n=l),n!==r?(m=e,s=Ft(n),e=s):(t=e,e=l)):(t=e,e=l)),p[u]={nextPos:t,result:e},e)}function Br(){var e,s,n=t*49+25,i=p[n];return i?(t=i.nextPos,i.result):(e=t,s=$t(),s!==r&&(m=e,s=qs(s)),e=s,p[n]={nextPos:t,result:e},e)}function $t(){var e,s,n,i,a,o=t*49+26,u=p[o];if(u)return t=u.nextPos,u.result;if(e=t,c.charCodeAt(t)===43?(s=qe,t++):(s=r,f===0&&d(we)),s===r&&(s=F),s!==r){if(n=[],i=N(),i!==r)for(;i!==r;)n.push(i),i=N();else n=l;n!==r?(i=t,f++,c.charCodeAt(t)===46?(a=R,t++):(a=r,f===0&&d(G)),f--,a===r?i=B:(t=i,i=l),i!==r?(m=e,s=Oe(n),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;if(e===r)if(e=t,c.charCodeAt(t)===45?(s=Ce,t++):(s=r,f===0&&d(Me)),s!==r){if(n=[],i=N(),i!==r)for(;i!==r;)n.push(i),i=N();else n=l;n!==r?(i=t,f++,c.charCodeAt(t)===46?(a=R,t++):(a=r,f===0&&d(G)),f--,a===r?i=B:(t=i,i=l),i!==r?(m=e,s=Ft(n),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;return p[o]={nextPos:t,result:e},e}function Gr(){var e,s,n=t*49+27,i=p[n];return i?(t=i.nextPos,i.result):(e=t,c.substr(t,4)===St?(s=St,t+=4):(s=r,f===0&&d(Os)),s!==r&&(m=e,s=Ms()),e=s,e===r&&(e=t,c.substr(t,5)===Tt?(s=Tt,t+=5):(s=r,f===0&&d(zs)),s!==r&&(m=e,s=Ys()),e=s),p[n]={nextPos:t,result:e},e)}function Hr(){var e,s,n,i,a,o=t*49+28,u=p[o];if(u)return t=u.nextPos,u.result;if(e=t,c.charCodeAt(t)===91?(s=re,t++):(s=r,f===0&&d(Q)),s!==r){for(n=[],i=ee();i!==r;)n.push(i),i=ee();n!==r?(c.charCodeAt(t)===93?(i=ne,t++):(i=r,f===0&&d(P)),i!==r?(m=e,s=Ls(),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;if(e===r&&(e=t,c.charCodeAt(t)===91?(s=re,t++):(s=r,f===0&&d(Q)),s!==r?(n=fs(),n===r&&(n=F),n!==r?(c.charCodeAt(t)===93?(i=ne,t++):(i=r,f===0&&d(P)),i!==r?(m=e,s=Bs(n),e=s):(t=e,e=l)):(t=e,e=l)):(t=e,e=l),e===r)){if(e=t,c.charCodeAt(t)===91?(s=re,t++):(s=r,f===0&&d(Q)),s!==r){if(n=[],i=ct(),i!==r)for(;i!==r;)n.push(i),i=ct();else n=l;n!==r?(c.charCodeAt(t)===93?(i=ne,t++):(i=r,f===0&&d(P)),i!==r?(m=e,s=Gs(n),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;if(e===r)if(e=t,c.charCodeAt(t)===91?(s=re,t++):(s=r,f===0&&d(Q)),s!==r){if(n=[],i=ct(),i!==r)for(;i!==r;)n.push(i),i=ct();else n=l;n!==r?(i=fs(),i!==r?(c.charCodeAt(t)===93?(a=ne,t++):(a=r,f===0&&d(P)),a!==r?(m=e,s=Hs(n,i),e=s):(t=e,e=l)):(t=e,e=l)):(t=e,e=l)}else t=e,e=l}return p[o]={nextPos:t,result:e},e}function fs(){var e,s,n,i,a,o=t*49+29,u=p[o];if(u)return t=u.nextPos,u.result;for(e=t,s=[],n=ee();n!==r;)s.push(n),n=ee();if(s!==r)if(n=Se(),n!==r){for(i=[],a=ee();a!==r;)i.push(a),a=ee();i!==r?(m=e,s=It(n),e=s):(t=e,e=l)}else t=e,e=l;else t=e,e=l;return p[o]={nextPos:t,result:e},e}function ct(){var e,s,n,i,a,o,u,h=t*49+30,x=p[h];if(x)return t=x.nextPos,x.result;for(e=t,s=[],n=ee();n!==r;)s.push(n),n=ee();if(s!==r)if(n=Se(),n!==r){for(i=[],a=ee();a!==r;)i.push(a),a=ee();if(i!==r)if(c.charCodeAt(t)===44?(a=Rt,t++):(a=r,f===0&&d(Ut)),a!==r){for(o=[],u=ee();u!==r;)o.push(u),u=ee();o!==r?(m=e,s=It(n),e=s):(t=e,e=l)}else t=e,e=l;else t=e,e=l}else t=e,e=l;else t=e,e=l;return p[h]={nextPos:t,result:e},e}function ee(){var e,s=t*49+31,n=p[s];return n?(t=n.nextPos,n.result):(e=v(),e===r&&(e=te(),e===r&&(e=ot())),p[s]={nextPos:t,result:e},e)}function Vr(){var e,s,n,i,a,o,u=t*49+32,h=p[u];if(h)return t=h.nextPos,h.result;if(e=t,c.charCodeAt(t)===123?(s=Vs,t++):(s=r,f===0&&d(Zs)),s!==r){for(n=[],i=v();i!==r;)n.push(i),i=v();if(n!==r){for(i=[],a=ps();a!==r;)i.push(a),a=ps();if(i!==r){for(a=[],o=v();o!==r;)a.push(o),o=v();a!==r?(c.charCodeAt(t)===125?(o=Ws,t++):(o=r,f===0&&d(Js)),o!==r?(m=e,s=Ks(i),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l}else t=e,e=l}else t=e,e=l;return p[u]={nextPos:t,result:e},e}function ps(){var e,s,n,i,a,o,u,h,x,S,k,I=t*49+33,U=p[I];if(U)return t=U.nextPos,U.result;for(e=t,s=[],n=v();n!==r;)s.push(n),n=v();if(s!==r)if(n=Be(),n!==r){for(i=[],a=v();a!==r;)i.push(a),a=v();if(i!==r)if(c.charCodeAt(t)===61?(a=T,t++):(a=r,f===0&&d(q)),a!==r){for(o=[],u=v();u!==r;)o.push(u),u=v();if(o!==r)if(u=Se(),u!==r){for(h=[],x=v();x!==r;)h.push(x),x=v();if(h!==r)if(c.charCodeAt(t)===44?(x=Rt,t++):(x=r,f===0&&d(Ut)),x!==r){for(S=[],k=v();k!==r;)S.push(k),k=v();S!==r?(m=e,s=jt(n,u),e=s):(t=e,e=l)}else t=e,e=l;else t=e,e=l}else t=e,e=l;else t=e,e=l}else t=e,e=l;else t=e,e=l}else t=e,e=l;else t=e,e=l;if(e===r){for(e=t,s=[],n=v();n!==r;)s.push(n),n=v();if(s!==r)if(n=Be(),n!==r){for(i=[],a=v();a!==r;)i.push(a),a=v();if(i!==r)if(c.charCodeAt(t)===61?(a=T,t++):(a=r,f===0&&d(q)),a!==r){for(o=[],u=v();u!==r;)o.push(u),u=v();o!==r?(u=Se(),u!==r?(m=e,s=jt(n,u),e=s):(t=e,e=l)):(t=e,e=l)}else t=e,e=l;else t=e,e=l}else t=e,e=l;else t=e,e=l}return p[I]={nextPos:t,result:e},e}function ds(){var e,s,n,i=t*49+34,a=p[i];return a?(t=a.nextPos,a.result):(e=t,c.charCodeAt(t)===46?(s=R,t++):(s=r,f===0&&d(G)),s!==r?(n=Ge(),n!==r?(m=e,s=Xs(n),e=s):(t=e,e=l)):(t=e,e=l),p[i]={nextPos:t,result:e},e)}function hs(){var e,s,n,i,a,o,u,h,x,S,k,I,U=t*49+35,J=p[U];return J?(t=J.nextPos,J.result):(e=t,s=t,n=N(),n!==r?(i=N(),i!==r?(a=N(),a!==r?(o=N(),o!==r?(c.charCodeAt(t)===45?(u=Ce,t++):(u=r,f===0&&d(Me)),u!==r?(h=N(),h!==r?(x=N(),x!==r?(c.charCodeAt(t)===45?(S=Ce,t++):(S=r,f===0&&d(Me)),S!==r?(k=N(),k!==r?(I=N(),I!==r?(n=[n,i,a,o,u,h,x,S,k,I],s=n):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l),s!==r&&(m=e,s=Qs(s)),e=s,p[U]={nextPos:t,result:e},e)}function Zr(){var e,s,n,i,a,o,u,h,x,S,k,I=t*49+36,U=p[I];return U?(t=U.nextPos,U.result):(e=t,s=t,n=N(),n!==r?(i=N(),i!==r?(c.charCodeAt(t)===58?(a=ze,t++):(a=r,f===0&&d(Ye)),a!==r?(o=N(),o!==r?(u=N(),u!==r?(c.charCodeAt(t)===58?(h=ze,t++):(h=r,f===0&&d(Ye)),h!==r?(x=N(),x!==r?(S=N(),S!==r?(k=ds(),k===r&&(k=F),k!==r?(n=[n,i,a,o,u,h,x,S,k],s=n):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l),s!==r&&(m=e,s=qt(s)),e=s,p[I]={nextPos:t,result:e},e)}function Wr(){var e,s,n,i,a,o,u,h,x,S,k,I,U,J,Te,$e,K,$s=t*49+37,xt=p[$s];return xt?(t=xt.nextPos,xt.result):(e=t,s=t,n=N(),n!==r?(i=N(),i!==r?(c.charCodeAt(t)===58?(a=ze,t++):(a=r,f===0&&d(Ye)),a!==r?(o=N(),o!==r?(u=N(),u!==r?(c.charCodeAt(t)===58?(h=ze,t++):(h=r,f===0&&d(Ye)),h!==r?(x=N(),x!==r?(S=N(),S!==r?(k=ds(),k===r&&(k=F),k!==r?(c.charCodeAt(t)===45?(I=Ce,t++):(I=r,f===0&&d(Me)),I===r&&(c.charCodeAt(t)===43?(I=qe,t++):(I=r,f===0&&d(we))),I!==r?(U=N(),U!==r?(J=N(),J!==r?(c.charCodeAt(t)===58?(Te=ze,t++):(Te=r,f===0&&d(Ye)),Te!==r?($e=N(),$e!==r?(K=N(),K!==r?(n=[n,i,a,o,u,h,x,S,k,I,U,J,Te,$e,K],s=n):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l)):(t=s,s=l),s!==r&&(m=e,s=qt(s)),e=s,p[$s]={nextPos:t,result:e},e)}function Jr(){var e,s,n,i,a,o=t*49+38,u=p[o];return u?(t=u.nextPos,u.result):(e=t,s=hs(),s!==r?(c.charCodeAt(t)===84?(n=Ot,t++):(n=r,f===0&&d(Mt)),n!==r?(i=Zr(),i!==r?(c.charCodeAt(t)===90?(a=er,t++):(a=r,f===0&&d(tr)),a!==r?(m=e,s=sr(s,i),e=s):(t=e,e=l)):(t=e,e=l)):(t=e,e=l)):(t=e,e=l),e===r&&(e=t,s=hs(),s!==r?(c.charCodeAt(t)===84?(n=Ot,t++):(n=r,f===0&&d(Mt)),n!==r?(i=Wr(),i!==r?(m=e,s=rr(s,i),e=s):(t=e,e=l)):(t=e,e=l)):(t=e,e=l)),p[o]={nextPos:t,result:e},e)}function v(){var e,s=t*49+39,n=p[s];return n?(t=n.nextPos,n.result):(nr.test(c.charAt(t))?(e=c.charAt(t),t++):(e=r,f===0&&d(ir)),p[s]={nextPos:t,result:e},e)}function te(){var e,s,n,i=t*49+40,a=p[i];return a?(t=a.nextPos,a.result):(c.charCodeAt(t)===10?(e=zt,t++):(e=r,f===0&&d(Yt)),e===r&&(e=t,c.charCodeAt(t)===13?(s=ar,t++):(s=r,f===0&&d(lr)),s!==r?(c.charCodeAt(t)===10?(n=zt,t++):(n=r,f===0&&d(Yt)),n!==r?(s=[s,n],e=s):(t=e,e=l)):(t=e,e=l)),p[i]={nextPos:t,result:e},e)}function vs(){var e,s=t*49+41,n=p[s];return n?(t=n.nextPos,n.result):(e=te(),e===r&&(e=v()),p[s]={nextPos:t,result:e},e)}function ut(){var e,s,n=t*49+42,i=p[n];return i?(t=i.nextPos,i.result):(e=t,f++,c.length>t?(s=c.charAt(t),t++):(s=r,f===0&&d(X)),f--,s===r?e=B:(t=e,e=l),p[n]={nextPos:t,result:e},e)}function se(){var e,s=t*49+43,n=p[s];return n?(t=n.nextPos,n.result):(or.test(c.charAt(t))?(e=c.charAt(t),t++):(e=r,f===0&&d(cr)),p[s]={nextPos:t,result:e},e)}function N(){var e,s,n=t*49+44,i=p[n];return i?(t=i.nextPos,i.result):(ur.test(c.charAt(t))?(e=c.charAt(t),t++):(e=r,f===0&&d(fr)),e===r&&(e=t,c.charCodeAt(t)===95?(s=pr,t++):(s=r,f===0&&d(dr)),s!==r&&(m=e,s=hr()),e=s),p[n]={nextPos:t,result:e},e)}function ms(){var e,s=t*49+45,n=p[s];return n?(t=n.nextPos,n.result):(vr.test(c.charAt(t))?(e=c.charAt(t),t++):(e=r,f===0&&d(mr)),p[s]={nextPos:t,result:e},e)}function Ge(){var e,s,n,i=t*49+46,a=p[i];if(a)return t=a.nextPos,a.result;if(e=t,s=[],n=N(),n!==r)for(;n!==r;)s.push(n),n=N();else s=l;return s!==r&&(m=e,s=gr(s)),e=s,p[i]={nextPos:t,result:e},e}function gs(){var e,s,n=t*49+47,i=p[n];return i?(t=i.nextPos,i.result):(e=t,c.substr(t,2)===Lt?(s=Lt,t+=2):(s=r,f===0&&d(yr)),s!==r&&(m=e,s=$r()),e=s,e===r&&(e=t,c.substr(t,2)===Bt?(s=Bt,t+=2):(s=r,f===0&&d(br)),s!==r&&(m=e,s=xr()),e=s,e===r&&(e=t,c.substr(t,2)===Gt?(s=Gt,t+=2):(s=r,f===0&&d(_r)),s!==r&&(m=e,s=Ar()),e=s,e===r&&(e=t,c.substr(t,2)===Ht?(s=Ht,t+=2):(s=r,f===0&&d(Pr)),s!==r&&(m=e,s=kr()),e=s,e===r&&(e=t,c.substr(t,2)===Vt?(s=Vt,t+=2):(s=r,f===0&&d(wr)),s!==r&&(m=e,s=Cr()),e=s,e===r&&(e=t,c.substr(t,2)===Zt?(s=Zt,t+=2):(s=r,f===0&&d(Nr)),s!==r&&(m=e,s=Dr()),e=s,e===r&&(e=t,c.substr(t,2)===Wt?(s=Wt,t+=2):(s=r,f===0&&d(Er)),s!==r&&(m=e,s=Fr()),e=s,e===r&&(e=Kr()))))))),p[n]={nextPos:t,result:e},e)}function Kr(){var e,s,n,i,a,o,u,h,x,S,k,I=t*49+48,U=p[I];return U?(t=U.nextPos,U.result):(e=t,c.substr(t,2)===Jt?(s=Jt,t+=2):(s=r,f===0&&d(Sr)),s!==r?(n=t,i=se(),i!==r?(a=se(),a!==r?(o=se(),o!==r?(u=se(),u!==r?(h=se(),h!==r?(x=se(),x!==r?(S=se(),S!==r?(k=se(),k!==r?(i=[i,a,o,u,h,x,S,k],n=i):(t=n,n=l)):(t=n,n=l)):(t=n,n=l)):(t=n,n=l)):(t=n,n=l)):(t=n,n=l)):(t=n,n=l)):(t=n,n=l),n!==r?(m=e,s=Kt(n),e=s):(t=e,e=l)):(t=e,e=l),e===r&&(e=t,c.substr(t,2)===Xt?(s=Xt,t+=2):(s=r,f===0&&d(Tr)),s!==r?(n=t,i=se(),i!==r?(a=se(),a!==r?(o=se(),o!==r?(u=se(),u!==r?(i=[i,a,o,u],n=i):(t=n,n=l)):(t=n,n=l)):(t=n,n=l)):(t=n,n=l),n!==r?(m=e,s=Kt(n),e=s):(t=e,e=l)):(t=e,e=l)),p[I]={nextPos:t,result:e},e)}var ys=[];function Xr(e,s,n){var i=new Error(e);throw i.line=s,i.column=n,i}function bt(e){ys.push(e)}function Y(e,s,n,i,a){var o={type:e,value:s,line:n(),column:i()};return a&&(o.key=a),o}function Qr(e,s,n){var i=parseInt("0x"+e);if(!isFinite(i)||Math.floor(i)!=i||i<0||i>1114111||i>55295&&i<57344)Xr("Invalid Unicode escape code: "+e,s,n);else return en(i)}function en(){var e=16384,s=[],n,i,a=-1,o=arguments.length;if(!o)return"";for(var u="";++a<o;){var h=Number(arguments[a]);h<=65535?s.push(h):(h-=65536,n=(h>>10)+55296,i=h%1024+56320,s.push(n,i)),(a+1==o||s.length>e)&&(u+=String.fromCharCode.apply(null,s),s.length=0)}return u}if(lt=V(),lt!==r&&t===c.length)return lt;throw lt!==r&&t<c.length&&d({type:"end",description:"end of input"}),Ir(null,mt,at)}return{SyntaxError:y,parse:D}}()),kt}var wt,ws;function Cn(){if(ws)return wt;ws=1;function _(y){var D=[],c=[],j="",r=Object.create(null),A=r;return V(y);function V($){for(var b,C=0;C<$.length;C++)switch(b=$[C],b.type){case"Assign":l(b);break;case"ObjectPath":X(b);break;case"ArrayPath":re(b);break}return r}function E($,b,C){var w=new Error($);throw w.line=b,w.column=C,w}function l($){var b=$.key,C=$.value,w=$.line,L=$.column,R;j?R=j+"."+b:R=b,typeof A[b]<"u"&&E("Cannot redefine existing key '"+R+"'.",w,L),A[b]=xe(C),be(R)||(D.push(R),c.push(R))}function be($){return D.indexOf($)!==-1}function xe($){return $.type==="Array"?ne($.value):$.type==="InlineTable"?B($.value):$.value}function B($){for(var b=Object.create(null),C=0;C<$.length;C++){var w=$[C];w.value.type==="InlineTable"?b[w.key]=B(w.value.value):w.type==="InlineTableValue"&&(b[w.key]=xe(w.value))}return b}function X($){var b=$.value,C=b.map(P).join("."),w=$.line,L=$.column;be(C)&&E("Cannot redefine existing key '"+b+"'.",w,L),D.push(C),A=Q(r,b,Object.create(null),w,L),j=b}function re($){var b=$.value,C=b.map(P).join("."),w=$.line,L=$.column;if(be(C)||D.push(C),D=D.filter(function(G){return G.indexOf(C)!==0}),D.push(C),A=Q(r,b,[],w,L),j=C,A instanceof Array){var R=Object.create(null);A.push(R),A=R}else E("Cannot redefine existing key '"+b+"'.",w,L)}function Q($,b,C,w,L){var R=[],G="";b.join(".");for(var T=$,q=0;q<b.length;q++){var Z=b[q];R.push(Z),G=R.join("."),typeof T[Z]>"u"?q===b.length-1?T[Z]=C:T[Z]=Object.create(null):q!==b.length-1&&c.indexOf(G)>-1&&E("Cannot redefine existing key '"+G+"'.",w,L),T=T[Z],T instanceof Array&&T.length&&q<b.length-1&&(T=T[T.length-1])}return T}function ne($){for(var b=null,C=0;C<$.length;C++){var w=$[C];b===null?b=w.type:w.type!==b&&E("Cannot add value of type "+w.type+" to array of type "+b+".",w.line,w.column)}return $.map(xe)}function P($){return $.indexOf(".")>-1?'"'+$+'"':$}}return wt={compile:_},wt}var Ct,Cs;function Nn(){if(Cs)return Ct;Cs=1;var _=wn(),y=Cn();return Ct={parse:function(D){var c=_.parse(D.toString());return y.compile(c)}},Ct}var Dn=Nn();const En=fn(Dn),Fn=`[fel]
description = "FEL (Fixed Effects Likelihood) estimates site-wise synonymous (α) and non-synonymous (β) rates, and uses a likelihood ratio test to determine if beta ≠ alpha at a site."

[[fel.options]]
name = "code"
description = "Which genetic code should be used"
takes_value = true
type = "string"
default = "Universal"
choices = [
    { value = "Universal", description = "Universal code" },
    { value = "Vertebrate mtDNA", description = "Vertebrate mitochondrial DNA code" },
    { value = "Yeast mtDNA", description = "Yeast mitochondrial DNA code" },
    { value = "Mold/Protozoan mtDNA", description = "Mold, Protozoan and Coelenterate mt; Mycoplasma/Spiroplasma" },
    { value = "Invertebrate mtDNA", description = "Invertebrate mitochondrial DNA code" },
    { value = "Ciliate Nuclear", description = "Ciliate, Dasycladacean and Hexamita Nuclear code" },
    { value = "Echinoderm mtDNA", description = "Echinoderm mitochondrial DNA code" },
    { value = "Euplotid Nuclear", description = "Euplotid Nuclear code" },
    { value = "Alt. Yeast Nuclear", description = "Alternative Yeast Nuclear code" },
    { value = "Ascidian mtDNA", description = "Ascidian mitochondrial DNA code" },
    { value = "Flatworm mtDNA", description = "Flatworm mitochondrial DNA code" },
    { value = "Blepharisma Nuclear", description = "Blepharisma Nuclear code" },
]

[[fel.options]]
name = "alignment"
description = "An in-frame codon alignment in one of the formats supported by HyPhy"
takes_value = true
type = "file"
choices = []

[[fel.options]]
name = "tree"
description = "A phylogenetic tree (optionally annotated with {})"
takes_value = true
type = "tree"
default = ""
choices = []

[[fel.options]]
name = "branches"
description = "Branches to test"
takes_value = true
type = "branch-set"
default = "All"
choices = []

[[fel.options]]
name = "srv"
description = "Include synonymous rate variation in the model"
takes_value = true
type = "string"
default = "Yes"
choices = [
    { value = "Yes", description = "[Recommended] Consider synonymous rate variation (dS varies across sites)." },
    { value = "No", description = "Ignore synonymous rate variation (dS := 1 at each site)." },
]

[[fel.options]]
name = "multiple-hits"
description = "Include support for multiple nucleotide substitutions"
takes_value = true
type = "string"
default = "None"
choices = [
    { value = "Double", description = "Include branch-specific rates for double nucleotide substitutions" },
    { value = "Double+Triple", description = "Include branch-specific rates for double and triple nucleotide substitutions" },
    { value = "None", description = "[Default] Use standard models which permit only single nucleotide changes to occur instantly" },
]

[[fel.options]]
name = "pvalue"
description = "The p-value threshold to use when testing for selection"
takes_value = true
type = "number"
default = 0.1
choices = []

[[fel.options]]
name = "ci"
description = "Compute profile likelihood confidence intervals for each variable site"
takes_value = true
type = "string"
default = "No"
choices = [
    { value = "Yes", description = "Compute profile likelihood confidence intervals for dN/dS at each site (~2x slower)." },
    { value = "No", description = "[Default] Do not compute likelihood confidence intervals" },
]

[[fel.options]]
name = "resample"
description = "[Advanced setting, will result in MUCH SLOWER run time] Perform parametric bootstrap resampling to derive site-level null LRT distributions up to this many replicates per site. Recommended use for small to medium (<30 sequences) datasets"
takes_value = true
type = "number"
default = 0
minimum = 0
maximum = 1000

[[fel.options]]
name = "site-multihit"
description = "Estimate multiple hit rates for each site"
takes_value = true
type = "string"
default = "Estimate"
choices = [
    { value = "Estimate", description = "Include branch-specific rates for double nucleotide substitutions" },
    { value = "Global", description = "Use a plug-in estimate derived from the global model fit" },
]

[[fel.options]]
name = "precision"
description = "Optimization precision settings for preliminary fits"
takes_value = true
type = "string"
default = "standard"
choices = [
    { value = "standard", description = "[Default] Use standard optimization settings." },
    { value = "reduced", description = "Cruder optimizations settings for faster fitting of preliminary models" },
]

[[fel.options]]
name = "full-model"
description = "Perform branch length re-optimization under the full codon model"
takes_value = true
type = "string"
default = "Yes"
choices = [
    { value = "Yes", description = "[Default] Perform branch length re-optimization under the full codon model" },
    { value = "No", description = "Skip branch length re-optimization under the full codon model (faster but less precise)" },
]

[slac]
description = "SLAC (Single-Likelihood Ancestor Counting) uses a combination of maximum-likelihood and counting approaches to infer nonsynonymous (dN) and synonymous (dS) substitution rates on a per-site basis."

[[slac.options]]
name = "code"
description = "Which genetic code should be used"
takes_value = true
type = "string"
default = "Universal"
choices = [
    { value = "Universal", description = "Universal code" },
    { value = "Vertebrate mtDNA", description = "Vertebrate mitochondrial DNA code" },
    { value = "Yeast mtDNA", description = "Yeast mitochondrial DNA code" },
    { value = "Mold/Protozoan mtDNA", description = "Mold, Protozoan and Coelenterate mt; Mycoplasma/Spiroplasma" },
    { value = "Invertebrate mtDNA", description = "Invertebrate mitochondrial DNA code" },
    { value = "Ciliate Nuclear", description = "Ciliate, Dasycladacean and Hexamita Nuclear code" },
    { value = "Echinoderm mtDNA", description = "Echinoderm mitochondrial DNA code" },
    { value = "Euplotid Nuclear", description = "Euplotid Nuclear code" },
    { value = "Alt. Yeast Nuclear", description = "Alternative Yeast Nuclear code" },
    { value = "Ascidian mtDNA", description = "Ascidian mitochondrial DNA code" },
    { value = "Flatworm mtDNA", description = "Flatworm mitochondrial DNA code" },
    { value = "Blepharisma Nuclear", description = "Blepharisma Nuclear code" },
]

[[slac.options]]
name = "alignment"
description = "An in-frame codon alignment in one of the formats supported by HyPhy"
takes_value = true
type = "file"
choices = []

[[slac.options]]
name = "tree"
description = "A phylogenetic tree (optionally annotated with {})"
takes_value = true
type = "tree"
default = ""
choices = []

[[slac.options]]
name = "branches"
description = "Branches to test"
takes_value = true
type = "branch-set"
default = "All"
choices = []

[[slac.options]]
name = "samples"
description = "The number of samples used to assess ancestral reconstruction uncertainty"
takes_value = true
type = "number"
default = 100
choices = []

[[slac.options]]
name = "pvalue"
description = "The p-value threshold to use when testing for selection"
takes_value = true
type = "number"
default = 0.1
choices = []

[meme]
description = "MEME (Mixed Effects Model of Evolution) tests for episodic positive selection at individual sites, allowing the selective pressure to vary across branches."

[[meme.options]]
name = "code"
description = "Which genetic code should be used"
takes_value = true
type = "string"
default = "Universal"
choices = []

[[meme.options]]
name = "alignment"
description = "An in-frame codon alignment in one of the formats supported by HyPhy"
takes_value = false
type = "string"
choices = []

[[meme.options]]
name = "tree"
description = "A phylogenetic tree (optionally annotated with {})"
takes_value = false
applies_to = "Please select a tree file for the data:"
type = "string"
choices = []

[[meme.options]]
name = "branches"
description = "Branches to test"
takes_value = true
type = "string"
default = "All"
choices = []

[[meme.options]]
name = "pvalue"
description = "The p-value threshold to use when testing for selection"
takes_value = true
type = "string"
default = "0.1"
choices = []

[[meme.options]]
name = "resample"
description = "[Advanced setting, will result in MUCH SLOWER run time] Perform parametric bootstrap resampling to derive site-level null LRT distributions up to this many replicates per site. Recommended use for small to medium (<30 sequences) datasets"
takes_value = true
type = "number"
default = "50"
choices = []

[[meme.options]]
name = "rates"
description = "The number omega rate classes to include in the model [2-4]"
takes_value = true
type = "number"
default = "2"
choices = []

[[meme.options]]
name = "multiple-hits"
description = "Include support for multiple nucleotide substitutions"
takes_value = true
type = "string"
default = "None"
choices = [
    { value = "Double", description = "Include branch-specific rates for double nucleotide substitutions" },
    { value = "Double+Triple", description = "Include branch-specific rates for double and triple nucleotide substitutions" },
    { value = "None", description = "[Default] Use standard models which permit only single nucleotide changes to occur instantly" },
]

[[meme.options]]
name = "site-multihit"
description = "Estimate multiple hit rates for each site"
takes_value = true
type = "string"
default = "Estimate"
choices = [
    { value = "Estimate", description = "Include branch-specific rates for double nucleotide substitutions" },
    { value = "Global", description = "Use a plug-in estimate derived from the global model fit" },
]

[[meme.options]]
name = "impute-states"
description = "Use site-level model fits to impute likely character states for each sequence"
takes_value = true
type = "string"
default = "No"
choices = [
    { value = "Yes", description = "Impute marginal likelihoods for each codon at each sequence and each site" },
    { value = "No", description = "Do not impute marginal likelihoods for each codon at each sequence and each site" },
]

[[meme.options]]
name = "precision"
description = "Optimization precision settings for preliminary fits"
takes_value = true
type = "string"
default = "standard"
choices = [
    { value = "standard", description = "[Default] Use standard optimization settings" },
    { value = "reduced", description = "Cruder optimizations settings for faster fitting of preliminary models" },
]

[[meme.options]]
name = "full-model"
description = "Perform branch length re-optimization under the full codon model"
takes_value = true
type = "string"
default = "Yes"
choices = [
    { value = "Yes", description = "[Default] Perform branch length re-optimization under the full codon model" },
    { value = "No", description = "Skip branch length re-optimization under the full codon model (faster but less precise)" },
]
`;var Sn=ae("<p>Method not found</p>"),Tn=ae('<p class="mb-4"> </p>'),In=ae("<p>No options available for this method</p>"),Rn=ae("<option> </option>"),Un=ae('<select class="w-full rounded border border-gray-300 p-2"></select>'),jn=ae('<input type="number" class="w-full rounded border border-gray-300 p-2">'),qn=ae('<input type="file" class="w-full rounded border border-gray-300 p-2">'),On=ae('<div class="mb-4"><label class="mb-1 block text-gray-700"> </label> <!></div>'),Mn=ae('<!> <!> <div class="mb-4"><button class="w-full rounded bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600">Run Analysis</button></div>',1),zn=ae("<!> <!> <!>",1),Yn=ae('<div id="method-options" class="rounded-lg bg-white p-6 shadow-md"><h3 class="mb-4 text-xl font-semibold">Analysis Options</h3> <!> <!></div>');function Et(_,y){sn(y,!1);let D=As(y,"runMethod",8),c=As(y,"trees",24,()=>({})),j=kn.params.method,r=En.parse(Fn),A=xs(r[j]),V="nj",E=xs({});Nt(()=>{g(A)&&(g(A).options.forEach(P=>{P.default!==void 0?Ne(E,g(E)[P.name]=P.default):P.takes_value&&P.type==="number"&&Ne(E,g(E)[P.name]=P.minimum||0)}),Ne(A,g(A).options=g(A).options.filter(P=>P.type!=="branch-set"&&P.type!=="tree")))});function l(P,$){const{value:b}=P.target;Ne(E,g(E)[$]=b)}function be(P,$,b){P&&(V=P),b&&b.length&&console.log("Received parsed tags:",b)}function xe(){Ne(E,g(E).tree=c()[V]),D()(g(E))}ln();var B=Yn(),X=De(Ie(B),2);{var re=P=>{var $=Sn();H(P,$)};de(X,P=>{g(A)||P(re)})}var Q=De(X,2);{var ne=P=>{var $=zn(),b=He($);{var C=T=>{var q=Tn(),Z=Ie(q);Ve(()=>At(Z,g(A).description)),H(T,q)};de(b,T=>{g(A).description&&T(C)})}var w=De(b,2);{var L=T=>{var q=In();H(T,q)};de(w,T=>{g(A).options.length===0&&T(L)})}var R=De(w,2);{var G=T=>{var q=Mn(),Z=He(q);un(Z,{get trees(){return c()},onChange:be});var nt=De(Z,2);_s(nt,1,()=>g(A).options,_e=>_e.name,(_e,F)=>{var Ae=On(),Ee=Ie(Ae),Re=Ie(Ee),ve=De(Ee,2);{var Ue=Pe=>{var Fe=_t(),je=He(Fe);{var dt=me=>{var ce=Un();Ve(()=>{g(E),nn(()=>{g(F)})}),_s(ce,5,()=>g(F).choices?g(F).choices:[{value:g(F).default,description:g(F).default}],an,(ue,ge)=>{var ye=Rn(),ie={},W=Ie(ye);Ve(()=>{ie!==(ie=g(ge).value)&&(ye.value=(ye.__value=g(ge).value)==null?"":g(ge).value),At(W,g(ge).description)}),H(ue,ye)}),cn(ce,()=>g(E)[g(F).name],ue=>Ne(E,g(E)[g(F).name]=ue)),ft("change",ce,ue=>l(ue,g(F).name)),H(me,ce)},ht=me=>{var ce=_t(),ue=He(ce);{var ge=ie=>{var W=jn();Ve(()=>{Pt(W,"min",g(F).minimum||0),Pt(W,"max",g(F).maximum||void 0),Pt(W,"placeholder",g(F).default)}),on(W,()=>g(E)[g(F).name],ke=>Ne(E,g(E)[g(F).name]=ke)),ft("input",W,ke=>l(ke,g(F).name)),H(ie,W)},ye=ie=>{var W=_t(),ke=He(W);{var qe=we=>{var Oe=qn();ft("change",Oe,Ce=>l(Ce,g(F).name)),H(we,Oe)};de(ke,we=>{g(F).type==="file"&&g(F).name!=="alignment"&&we(qe)},!0)}H(ie,W)};de(ue,ie=>{g(F).type==="number"?ie(ge):ie(ye,!1)},!0)}H(me,ce)};de(je,me=>{g(F).type==="string"?me(dt):me(ht,!1)})}H(Pe,Fe)};de(ve,Pe=>{g(F).takes_value&&Pe(Ue)})}Ve(()=>At(Re,g(F).description)),H(_e,Ae)});var it=De(nt,2),he=Ie(it);ft("click",he,xe),H(T,q)};de(R,T=>{g(A).options.length>0&&T(G)})}H(P,$)};de(Q,P=>{g(A)&&P(ne)})}H(_,B),rn()}Et.__docgen={version:3,name:"FormGenerator.svelte",data:[{name:"runMethod",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"any",text:"any"},static:!1,readonly:!1},{name:"trees",visibility:"public",keywords:[],kind:"let",type:{kind:"type",type:"object",text:"{}"},static:!1,readonly:!1,defaultValue:"{}"}],computed:[],methods:[],components:[],description:null,keywords:[],events:[],slots:[],refs:[]};const pi={title:"Form Analysis/FormOptions",component:Et},Ln=_=>({Component:Et,props:_}),Ze=Ln.bind({});Ze.args={runMethod:()=>{console.log("Running Form Analysis:")}};var Ss,Ts,Is;Ze.parameters={...Ze.parameters,docs:{...(Ss=Ze.parameters)==null?void 0:Ss.docs,source:{originalSource:`args => ({
  Component: FormOptions,
  props: args
})`,...(Is=(Ts=Ze.parameters)==null?void 0:Ts.docs)==null?void 0:Is.source}}};const di=["Default"];export{Ze as Default,di as __namedExportsOrder,pi as default};

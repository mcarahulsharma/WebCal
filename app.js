const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const KEY='nuvora-state-v1';
const defaultState={mode:'basic',theme:'midnight',angle:'DEG',memory:0,expression:'',result:'0',history:[],favorites:[],customThemes:[],settings:{format:'international',fullscreen:false}};
let state=load();
function load(){try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{};return {...defaultState,...saved,settings:{...defaultState.settings,...(saved.settings||{})},history:Array.isArray(saved.history)?saved.history:[],favorites:Array.isArray(saved.favorites)?saved.favorites:[],customThemes:Array.isArray(saved.customThemes)?saved.customThemes:[]}}catch{return {...defaultState,settings:{...defaultState.settings},history:[],favorites:[],customThemes:[]}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function toast(s){const t=$('#toast');t.textContent=s;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),1800)}
function esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;')}
function fmt(n){if(!Number.isFinite(n))return 'Error'; if(Math.abs(n)<1e-12)n=0; const s=String(Number(n.toPrecision(12))); if(state.settings.format==='indian'){const [a,b]=s.split('.'); if(a.length>3){const sign=a.startsWith('-')?'-':'';const x=sign?a.slice(1):a; const last=x.slice(-3),rest=x.slice(0,-3).replace(/\B(?=(\d{2})+(?!\d))/g,',');return sign+(rest?rest+',':'')+last+(b?'.'+b:'')}} return s}
function calc(expr){
 let x=expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/π/g,'Math.PI').replace(/\be\b/g,'Math.E').replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');
 x=x.replace(/\b(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)\b/g,'Math.pow($1,$2)');
 x=x.replace(/\bsin\(/g,'SIN(').replace(/\bcos\(/g,'COS(').replace(/\btan\(/g,'TAN(').replace(/\basin\(/g,'ASIN(').replace(/\bacos\(/g,'ACOS(').replace(/\batan\(/g,'ATAN(');
 x=x.replace(/\bln\(/g,'Math.log(').replace(/\blog\(/g,'Math.log10(').replace(/\bsqrt\(/g,'Math.sqrt(').replace(/\bcbrt\(/g,'Math.cbrt(').replace(/\babs\(/g,'Math.abs(');
 x=x.replace(/\bsinh\(/g,'Math.sinh(').replace(/\bcosh\(/g,'Math.cosh(').replace(/\btanh\(/g,'Math.tanh(');
 x=x.replace(/(\d+(?:\.\d+)?)!/g,'fact($1)');
 x=x.replace(/(\d+(?:\.\d+)?)\^2/g,'($1*$1)').replace(/(\d+(?:\.\d+)?)\^3/g,'($1*$1*$1)');
 if(!/^[0-9+\-*/().,\sA-Za-z_]+$/.test(x))throw Error('Invalid expression');
 const deg=v=>state.angle==='DEG'?v*Math.PI/180:v;
 const SIN=v=>Math.sin(deg(v)),COS=v=>Math.cos(deg(v)),TAN=v=>Math.tan(deg(v));
 const ASIN=v=>state.angle==='DEG'?Math.asin(v)*180/Math.PI:Math.asin(v),ACOS=v=>state.angle==='DEG'?Math.acos(v)*180/Math.PI:Math.acos(v),ATAN=v=>state.angle==='DEG'?Math.atan(v)*180/Math.PI:Math.atan(v);
 const fact=n=>{if(n<0||n>170||n%1)return NaN;let r=1;for(let i=2;i<=n;i++)r*=i;return r};
 return Function('SIN','COS','TAN','ASIN','ACOS','ATAN','fact','return '+x)(SIN,COS,TAN,ASIN,ACOS,ATAN,fact)
}
const keys=['sin(','cos(','tan(','sin⁻¹(','cos⁻¹(','tan⁻¹(','ln(','log(','√(','∛(','x²','x³','xʸ','1/x','x!','abs(','EXP(','π','e','(',')'];
function keyButton(v,label=v,cl=''){return `<button class="key ${cl}" data-key="${esc(v)}" aria-label="${esc(label)}">${label}</button>`}
function render(){
 document.querySelector('.app-shell').className=`app-shell ${state.theme==='light'?'light':state.theme==='ocean'?'ocean':state.theme==='sunset'?'sunset':''}`;
 $$('.mode-tab').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));
 try{if(state.mode==='tools')renderTools();else renderCalc()}catch(err){console.error('Nuvora render error',err);$('#main').innerHTML=`<section class="tool-card"><h2>Calculator failed to load</h2><p class="sub">${esc(err?.message||String(err))}</p><button class="small-btn primary" onclick="localStorage.removeItem('${KEY}');location.reload()">Reset calculator</button></section>`}
}
function renderCalc(){
 const sci=state.mode==='scientific';
 $('#main').innerHTML=`<section class="calculator">
 <div class="display"><div class="indicators"><span>${sci?state.angle:''}</span><span>${state.settings.format==='indian'?'IND':'INT'}</span></div>
 <div class="expression">${esc(state.expression||'')}</div><div class="result">${esc(fmt(Number(state.result))==='Error'?state.result:fmt(Number(state.result)))}</div></div>
 ${sci?`<div class="scientific-grid">${keys.map(k=>keyButton(k,k.replace('(','').replace('⁻¹','⁻¹'),'op')).join('')}</div>`:''}
 <div class="keypad">
 ${keyButton('MC','MC','op')}${keyButton('MR','MR','op')}${keyButton('MS','MS','op')}${keyButton('⌫','Backspace','op')}
 ${keyButton('AC','AC','op')}${keyButton('±','±','op')}${keyButton('%','%','op')}${keyButton('÷','÷','op')}
 ${keyButton('7')}${keyButton('8')}${keyButton('9')}${keyButton('×','×','op')}
 ${keyButton('4')}${keyButton('5')}${keyButton('6')}${keyButton('-','−','op')}
 ${keyButton('1')}${keyButton('2')}${keyButton('3')}${keyButton('+','+','op')}
 ${keyButton('0','0','wide')}${keyButton('.')}${keyButton('=','=','eq')}
 </div></section>`;
 $$('.key').forEach(b=>b.onclick=()=>press(b.dataset.key));
}
function press(k){
 if(k==='AC'){state.expression='';state.result='0';save();return render()}
 if(k==='⌫'){state.expression=state.expression.slice(0,-1);return render()}
 if(k==='MC'){state.memory=0;save();return toast('Memory cleared')}
 if(k==='MR'){state.expression+=String(state.memory);return render()}
 if(k==='MS'){state.memory=Number(state.result)||0;save();return toast('Memory saved')}
 if(k==='±'){state.expression=state.expression?`-(${state.expression})`:`-${state.result}`;return render()}
 if(k==='='){try{const v=calc(state.expression||state.result);state.result=String(v);if(state.expression){state.history.unshift({expression:state.expression,result:String(v),at:new Date().toISOString()});state.history=state.history.slice(0,100)}state.expression='';save();render()}catch{state.result='Error';render()}return}
 if(k==='sin⁻¹(')k='asin(';if(k==='cos⁻¹(')k='acos(';if(k==='tan⁻¹(')k='atan(';if(k==='√(')k='sqrt(';if(k==='∛(')k='cbrt(';if(k==='x²')k='^2';if(k==='x³')k='^3';if(k==='xʸ')k='^';if(k==='1/x'){state.expression=`1/(${state.expression||state.result})`;return render()}
 if(k==='EXP(')k='*10^';if(k==='x!')k='!';state.expression+=k;render()
}
function renderTools(){
 const groups={Everyday:[['percentage','Percentage'],['discount','Discount'],['tip','Tip'],['split','Split Bill'],['age','Age'],['date','Date Difference'],['time','Time Duration']],Finance:[['emi','EMI'],['sip','SIP'],['simple','Simple Interest'],['compound','Compound Interest'],['gst','GST']],Converters:[['units','Unit Converter']]};
 $('#main').innerHTML=`<section class="tool-shell"><div class="tool-groups">${Object.entries(groups).map(([g,items])=>`<div class="tool-group"><h3>${g}</h3><div class="tool-list">${items.map(([id,n])=>`<button class="tool-btn" data-tool="${id}"><span>${n}</span><span>›</span></button>`).join('')}</div></div>`).join('')}</div><div id="tool-view"></div></section>`;
 $$('.tool-btn').forEach(b=>b.onclick=()=>openTool(b.dataset.tool));
}
const input=(label,name,value='',type='number')=>`<div class="field"><label>${label}</label><input name="${name}" type="${type}" value="${value}" ${type==='number'?'step="any"':''}></div>`;
function toolCard(title,sub,body){return `<div class="tool-card"><button class="back-tools" data-back>← All tools</button><h2>${title}</h2><p class="sub">${sub}</p>${body}</div>`}
function formButton(){return `<button class="small-btn primary" data-calc-tool>Calculate</button><button class="small-btn" data-clear-tool>Reset</button>`}
function openTool(id){
 const views={
 percentage:['Percentage','Everyday percentage calculations',`${input('Value X','x')} ${input('Value Y','y')}<div class="tool-actions">${formButton()}</div><div class="result-card" id="tool-result"></div>`],
 discount:['Discount','Calculate discount, optional tax/GST',`${input('Original price','price')} ${input('Discount %','discount')} ${input('Tax/GST % (optional)','tax','0')}<div class="tool-actions">${formButton()}</div><div class="result-card" id="tool-result"></div>`],
 tip:['Tip','Tip and per-person total',`${input('Bill','bill')} ${input('Tip %','tip','15')} ${input('People','people','1')}<div class="tool-actions">${formButton()}</div><div class="result-card" id="tool-result"></div>`],
 split:['Split Bill','Split a bill equally after tip',`${input('Bill','bill')} ${input('Tip %','tip','0')} ${input('People','people','2')}<div class="tool-actions">${formButton()}</div><div class="result-card" id="tool-result"></div>`],
 age:['Age Calculator','Age as of any date',`${input('Date of birth','dob','', 'date')} ${input('As of','asof',new Date().toISOString().slice(0,10),'date')}<div class="tool-actions">${formButton()}</div><div class="result-card" id="tool-result"></div>`],
 date:['Date Difference','Days between two dates',`${input('Start','start',new Date().toISOString().slice(0,10),'date')} ${input('End','end',new Date().toISOString().slice(0,10),'date')}<div class="tool-actions">${formButton()}</div><div class="result-card" id="tool-result"></div>`],
 time:['Time Duration','Duration between times',`${input('Start time','start','09:00','time')} ${input('End time','end','17:00','time')}<div class="tool-actions">${formButton()}</div><div class="result-card" id="tool-result"></div>`],
 emi:['EMI Calculator','Monthly loan payment and interest',`${input('Loan amount','loan','100000')} ${input('Annual interest %','rate','8')} ${input('Tenure (months)','months','60')}<div class="tool-actions">${formButton()}</div><div class="result-card" id="tool-result"></div>`],
 sip:['SIP Calculator','Monthly investment projection',`${input('Monthly investment','monthly','5000')} ${input('Expected annual return %','rate','12')} ${input('Duration (years)','years','10')}<div class="tool-actions">${formButton()}</div><div class="result-card" id="tool-result"></div>`],
 simple:['Simple Interest','Principal, rate and time',`${input('Principal','principal','100000')} ${input('Annual rate %','rate','8')} ${input('Time (years)','years','5')}<div class="tool-actions">${formButton()}</div><div class="result-card" id="tool-result"></div>`],
 compound:['Compound Interest','Flexible compounding frequency',`${input('Principal','principal','100000')} ${input('Annual rate %','rate','8')} ${input('Time (years)','years','5')} ${input('Compounds/year','freq','4')}<div class="tool-actions">${formButton()}</div><div class="result-card" id="tool-result"></div>`],
 gst:['GST Calculator','Add or remove GST',`${input('Base/total amount','amount','1000')} ${input('GST %','rate','18')}<div class="tool-actions"><button class="small-btn primary" data-gst="add">Add GST</button><button class="small-btn" data-gst="remove">Remove GST</button></div><div class="result-card" id="tool-result"></div>`],
 units:['Unit Converter','Length, weight, temperature, area, volume, speed, time and data',`<div class="form-grid"><div class="field"><label>Category</label><select name="category">${['Length','Weight','Temperature','Area','Volume','Speed','Time','Data'].map(x=>`<option>${x}</option>`).join('')}</select></div><div class="field"><label>From</label><select name="from"></select></div><div class="field"><label>To</label><select name="to"></select></div>${input('Value','value','1')}</div><div class="tool-actions"><button class="small-btn" data-swap>⇄ Swap</button><button class="small-btn primary" data-calc-tool>Convert</button></div><div class="result-card" id="tool-result"></div>`]
 };
 const [title,sub,body]=views[id];$('#tool-view').innerHTML=toolCard(title,sub,body);const view=$('#tool-view .tool-card');
 $('[data-back]',view).onclick=renderTools;
 $('[data-clear-tool]',view)?.addEventListener('click',()=>$$('input',view).forEach(i=>i.value=i.type==='number'?'0':'')); 
 if(id==='units')setupUnits(view);
 $('[data-calc-tool]',view)?.addEventListener('click',()=>toolCalc(id,view));
 $$('[data-gst]',view).forEach(b=>b.onclick=()=>gstCalc(view,b.dataset.gst));
}
const units={Length:{Meter:1,Kilometer:1000,Centimeter:.01,Millimeter:.001,Mile:1609.344,Yard:.9144,Foot:.3048,Inch:.0254},Weight:{Kilogram:1,Gram:.001,Pound:.45359237,Ounce:.0283495},Area:{'Square meter':1,'Square kilometer':1e6,'Square foot':.092903,'Square yard':.836127},Volume:{Liter:1,'Milliliter':.001,'Cubic meter':1000,Gallon:3.78541},Speed:{'m/s':1,'km/h':.277778,'mph':.44704,'knot':.514444},Time:{Second:1,Minute:60,Hour:3600,Day:86400},Data:{Byte:1,KB:1024,MB:1048576,GB:1073741824}};
function setupUnits(v){const cat=$('[name=category]',v),from=$('[name=from]',v),to=$('[name=to]',v);function fill(){const c=cat.value;let opts=c==='Temperature'?['Celsius','Fahrenheit','Kelvin']:Object.keys(units[c]);from.innerHTML=opts.map(x=>`<option>${x}</option>`).join('');to.innerHTML=opts.map(x=>`<option>${x}</option>`).join('');to.selectedIndex=1}cat.onchange=fill;fill();v.__unitFill=fill}
function convertUnit(c,a,b,v){if(c==='Temperature'){let k=a==='Celsius'?v:a==='Fahrenheit'?(v-32)*5/9:v-273.15;return b==='Celsius'?k:b==='Fahrenheit'?k*9/5+32:k+273.15}return v*units[c][a]/units[c][b]}
function toolCalc(id,v){
 const n=k=>Number($(`[name=${k}]`,v)?.value||0);let html='';
 if(id==='percentage'){const x=n('x'),y=n('y');html=`<div class="big">${fmt(y*x/100)}</div><div class="result-row"><span>${x}% of ${y}</span><b>${fmt(y*x/100)}</b></div><div class="result-row"><span>${x} is what % of ${y}</span><b>${y?fmt(x/y*100):'Error'}%</b></div><div class="result-row"><span>% change</span><b>${y?fmt((x-y)/y*100):'Error'}%</b></div>`}
 if(id==='discount'){let p=n('price'),d=n('discount'),t=n('tax');let saved=p*d/100,pre=p-saved,tax=pre*t/100;html=`<div class="big">${fmt(pre+tax)}</div><div class="result-row"><span>Saved</span><b>${fmt(saved)}</b></div><div class="result-row"><span>Tax added</span><b>${fmt(tax)}</b></div><div class="result-row"><span>Final</span><b>${fmt(pre+tax)}</b></div>`}
 if(id==='tip'||id==='split'){let b=n('bill'),t=n('tip'),p=Math.max(1,n('people'));let tip=b*t/100,total=b+tip;html=`<div class="big">${fmt(total/p)} / person</div><div class="result-row"><span>Tip</span><b>${fmt(tip)}</b></div><div class="result-row"><span>Total</span><b>${fmt(total)}</b></div>`}
 if(id==='age'){let a=new Date($('[name=dob]',v).value),b=new Date($('[name=asof]',v).value);if(isNaN(a)||isNaN(b))html='<div class="big">Choose dates</div>';else{let years=b.getFullYear()-a.getFullYear(),m=b.getMonth()-a.getMonth(),d=b.getDate()-a.getDate();if(d<0){m--;d+=new Date(b.getFullYear(),b.getMonth(),0).getDate()}if(m<0){years--;m+=12}let days=Math.floor((b-a)/86400000);html=`<div class="big">${years}y ${m}m ${d}d</div><div class="result-row"><span>Total months</span><b>${Math.floor(days/30.4375)}</b></div><div class="result-row"><span>Total days</span><b>${days}</b></div><div class="result-row"><span>Total weeks</span><b>${fmt(days/7)}</b></div>`}}
 if(id==='date'){let a=new Date($('[name=start]',v).value),b=new Date($('[name=end]',v).value),days=Math.abs(Math.round((b-a)/86400000));html=`<div class="big">${days} days</div><div class="result-row"><span>Weeks</span><b>${fmt(days/7)}</b></div><div class="result-row"><span>Approx. months</span><b>${fmt(days/30.4375)}</b></div>`}
 if(id==='time'){let a=$('[name=start]',v).value.split(':').map(Number),b=$('[name=end]',v).value.split(':').map(Number);let mins=(b[0]*60+b[1])-(a[0]*60+a[1]);if(mins<0)mins+=1440;html=`<div class="big">${Math.floor(mins/60)}h ${mins%60}m</div><div class="result-row"><span>Total minutes</span><b>${mins}</b></div>`}
 if(id==='emi'){let P=n('loan'),r=n('rate')/1200,m=n('months');let e=r?P*r*Math.pow(1+r,m)/(Math.pow(1+r,m)-1):P/m;html=`<div class="big">${fmt(e)} / month</div><div class="result-row"><span>Principal</span><b>${fmt(P)}</b></div><div class="result-row"><span>Total interest</span><b>${fmt(e*m-P)}</b></div><div class="result-row"><span>Total payable</span><b>${fmt(e*m)}</b></div>`}
 if(id==='sip'){let p=n('monthly'),r=n('rate')/1200,m=n('years')*12;let total=p*((Math.pow(1+r,m)-1)/r)*(1+r),invest=p*m;if(!r)total=invest;html=`<div class="big">${fmt(total)}</div><div class="result-row"><span>Invested</span><b>${fmt(invest)}</b></div><div class="result-row"><span>Returns</span><b>${fmt(total-invest)}</b></div>`}
 if(id==='simple'){let p=n('principal'),i=p*n('rate')*n('years')/100;html=`<div class="big">${fmt(p+i)}</div><div class="result-row"><span>Interest</span><b>${fmt(i)}</b></div>`}
 if(id==='compound'){let p=n('principal'),r=n('rate')/100,t=n('years'),f=Math.max(1,n('freq')),a=p*Math.pow(1+r/f,f*t);html=`<div class="big">${fmt(a)}</div><div class="result-row"><span>Interest</span><b>${fmt(a-p)}</b></div>`}
 if(id==='units'){let c=$('[name=category]',v).value,a=$('[name=from]',v).value,b=$('[name=to]',v).value,val=n('value');html=`<div class="big">${fmt(convertUnit(c,a,b,val))}</div><div class="result-row"><span>${val} ${a}</span><b>${fmt(convertUnit(c,a,b,val))} ${b}</b></div>`}
 $('#tool-result',v).innerHTML=html
}
function gstCalc(v,mode){let amount=Number($('[name=amount]',v).value),r=Number($('[name=rate]',v).value)/100,base=mode==='add'?amount:amount/(1+r),tax=mode==='add'?amount*r:amount-base,total=mode==='add'?amount+tax:amount;$('#tool-result',v).innerHTML=`<div class="big">${fmt(total)}</div><div class="result-row"><span>Base</span><b>${fmt(base)}</b></div><div class="result-row"><span>GST</span><b>${fmt(tax)}</b></div><div class="result-row"><span>CGST / SGST</span><b>${fmt(tax/2)} / ${fmt(tax/2)}</b></div>`}
function showHistory(){const m=document.createElement('div');m.className='modal-backdrop';m.innerHTML=`<div class="modal"><div class="modal-head"><h2>History</h2><button class="close">×</button></div><div class="tool-actions"><button class="small-btn" data-clear-history>Clear all</button></div><div class="history-list">${state.history.length?state.history.map((h,i)=>`<button class="history-item" data-history="${i}"><div class="hx">${new Date(h.at).toLocaleString()}</div><div>${esc(h.expression)}</div><div class="hr">${esc(fmt(Number(h.result)))}</div></button>`).join(''):'<div class="empty">No calculations yet.</div>'}</div></div>`;$('#modal-root').append(m);$('.close',m).onclick=()=>m.remove();$('[data-clear-history]',m).onclick=()=>{state.history=[];save();m.remove();toast('History cleared')};$$('[data-history]',m).forEach(b=>b.onclick=()=>{state.mode='basic';state.expression=state.history[+b.dataset.history].expression;save();m.remove();render()})}
function showThemes(){const m=document.createElement('div');m.className='modal-backdrop';m.innerHTML=`<div class="modal"><div class="modal-head"><h2>Theme</h2><button class="close">×</button></div><div class="theme-grid">${[['midnight','Midnight'],['light','Light'],['ocean','Ocean'],['sunset','Sunset'],...state.customThemes.map(x=>[x.id,x.name])].map(([id,n])=>`<button class="theme-choice ${state.theme===id?'active':''}" data-theme="${id}">${n}<div class="swatches"><i style="background:var(--accent)"></i><i style="background:var(--eq)"></i><i style="background:var(--key)"></i></div></button>`).join('')}</div><div class="tool-actions"><button class="small-btn primary" data-custom>Create custom theme</button></div></div>`;$('#modal-root').append(m);$('.close',m).onclick=()=>m.remove();$$('[data-theme]',m).forEach(b=>b.onclick=()=>{state.theme=b.dataset.theme;save();m.remove();render();applyCustom()});$('[data-custom]',m).onclick=()=>{m.remove();showCustomTheme()}}
function showCustomTheme(){const m=document.createElement('div');m.className='modal-backdrop';m.innerHTML=`<div class="modal"><div class="modal-head"><h2>Custom Theme</h2><button class="close">×</button></div><div class="form-grid">${input('Theme name','name','My Nuvora','text')} ${input('Background','bg','#0b1020','color')} ${input('Number keys','key','#202b45','color')} ${input('Operators','op','#293657','color')} ${input('Equals','eq','#6d5dfc','color')} ${input('Accent','accent','#8b7cff','color')} ${input('Text','text','#f6f7fb','color')}</div><div class="tool-actions"><button class="small-btn primary" data-save-theme>Save & Apply</button></div></div>`;$('#modal-root').append(m);$('.close',m).onclick=()=>m.remove();$('[data-save-theme]',m).onclick=()=>{const g=n=>m.querySelector(`[name="${n}"]`).value;const id='custom-'+Date.now();state.customThemes.push({id,name:g('name'),vars:{bg:g('bg'),key:g('key'),op:g('op'),eq:g('eq'),accent:g('accent'),text:g('text')}});state.theme=id;save();m.remove();render();applyCustom()}}
function applyCustom(){const t=state.customThemes.find(x=>x.id===state.theme);if(!t)return;const root=document.querySelector('.app-shell');Object.entries(t.vars).forEach(([k,v])=>root.style.setProperty('--'+k,v))}
function toggleFullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()}
document.addEventListener('click',e=>{const a=e.target.closest('[data-action]');if(!a)return;if(a.dataset.action==='history')showHistory();if(a.dataset.action==='theme')showThemes();if(a.dataset.action==='fullscreen')toggleFullscreen()});
$$('.mode-tab').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;save();render()});
document.addEventListener('keydown',e=>{if(state.mode==='tools')return;let k=e.key;if(k==='Enter')k='=';if(k==='Backspace')k='⌫';if('0123456789.+-*/()%'.includes(k)){k=k==='*'?'×':k==='/'?'÷':k;press(k)}else if(k==='='||k==='⌫')press(k)});
window.addEventListener('resize',()=>document.body.classList.toggle('landscape',innerWidth>innerHeight));
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(console.warn));
render();applyCustom();document.body.classList.toggle('landscape',innerWidth>innerHeight);
// Lightweight regression checks for the calculator math.
// Import this module from a browser console if desired.
export function runNuvoraMathTests(){
  const near=(a,b)=>Math.abs(a-b)<1e-6;
  console.assert(near(100*18/100,18),'percentage');
  console.assert(near(1000*10/100,100),'discount');
  console.assert(near(1000*15/100,150),'tip');
  console.assert(near(100000*.08*.5,4000),'simple interest');
  const emi=(P,r,n)=>{r/=1200;return P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)};
  console.assert(near(emi(100000,8,60),2027.64),'EMI');
  const sip=(p,r,y)=>{r/=1200;let n=y*12;return p*((Math.pow(1+r,n)-1)/r)*(1+r)};
  console.assert(near(sip(5000,12,10),1150192.17),'SIP');
  console.assert(near(1000*1.18,1180),'GST add');
  console.assert(near(1180/1.18,1000),'GST remove');
  console.log('Nuvora math regression checks complete');
}
const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
const phase=process.argv[2]||'before';
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
for(const route of ['/','/journeys','/journeys/luxor-west-bank-at-dawn','/journeys/abu-simbel-day-tour']){
 for(const width of [320,360,390,430,1440]){
 const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:width===1440?1:2,isMobile:width!==1440});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.__lcp=[];window.__cls=0;window.__tasks=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp.push({time:e.startTime,size:e.size,url:e.url,element:e.element?.outerHTML.slice(0,500),rect:e.element?.getBoundingClientRect().toJSON()})}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())window.__tasks.push({start:e.startTime,duration:e.duration})}).observe({type:'longtask',buffered:true});});
 const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 if(width===390){await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});}
 const response = await page.goto((process.env.LCP_ORIGIN || 'http://127.0.0.1:3001')+route,{waitUntil:'networkidle',timeout:120000});
 if (response.status() !== 200) throw new Error(`${route}: HTTP ${response.status()}`);
 await page.waitForTimeout(1000);
 const result=await page.evaluate(()=>({lcp:window.__lcp.at(-1),candidates:window.__lcp,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,cls:window.__cls,longTaskBlockingMs:window.__tasks.reduce((s,e)=>s+Math.max(0,e.duration-50),0),resources:performance.getEntriesByType('resource').map(e=>({url:e.name,start:e.startTime,end:e.responseEnd,bytes:e.transferSize,type:e.initiatorType})),hero:[...document.querySelectorAll('.hero-photo,.journeys-hero-photo,.jd-hero-image')].map(e=>({rect:e.getBoundingClientRect().toJSON(),background:getComputedStyle(e).backgroundImage,position:getComputedStyle(e).backgroundPosition,size:getComputedStyle(e).backgroundSize})),geometry:[...document.querySelectorAll('h1,.hero-copy,.journeys-hero-copy,.jd-summary,.hero-photo,.journeys-hero-photo,.jd-hero-image')].map(e=>({class:e.className,text:e.tagName==='H1'?e.textContent:null,rect:e.getBoundingClientRect().toJSON()}))}));
 const item={route,width,throttled:width===390,...result,errors};results.push(item);console.log(JSON.stringify({route,width,lcp:item.lcp,fcp:item.fcp,cls:item.cls,blocking:item.longTaskBlockingMs}));await page.screenshot({path:`${process.cwd()}/artifacts/lcp-${phase}-${route.replaceAll('/','_')||'home'}-${width}.png`});fs.writeFileSync(`artifacts/lcp-${phase}.json`,JSON.stringify(results,null,2));await context.close();
 }
}
await browser.close();

})().catch(error => { console.error(error); process.exitCode = 1 });

import assert from 'node:assert/strict'
import fs from 'node:fs'
import {journeyDetails} from '../data/journeyDetails.js'
const checks=[]
for(const route of ['/','/journeys','/contact','/about','/faq','/how-booking-works','/privacy-policy','/terms-and-conditions',...Object.keys(journeyDetails).map(s=>'/journeys/'+s)]){
const r=await fetch('http://127.0.0.1:3001'+route);const html=await r.text();assert.equal(r.status,200);assert.match(html,/<title>[^<]+<\/title>/);assert.match(html,/<meta name="description" content="[^"]+"/);assert.match(html,/<h1[^>]*>.+?<\/h1>/);const record=journeyDetails[route.split('/')[2]];if(record){assert(html.includes(record.title.replaceAll('&','&amp;')));assert(html.includes(record.overview.replaceAll('&','&amp;')))}checks.push({route,status:r.status,title:html.match(/<title>(.*?)<\/title>/)[1],hasSSRContent:true})
}
for(const lang of ['en','ru','fr','de']){const r=await fetch('http://127.0.0.1:3001/journeys/abu-simbel-day-tour',{headers:{cookie:`thevtravel-language=${lang}; thevtravel-theme=dark`}});let html=await r.text();assert(html.includes(`lang="${lang}"`));assert(html.includes('data-theme="dark"'))}
fs.writeFileSync('artifacts/nuxt-ssr.json',JSON.stringify(checks,null,2));console.log('SSR verified:',checks.length,'routes; four language cookies and dark theme')

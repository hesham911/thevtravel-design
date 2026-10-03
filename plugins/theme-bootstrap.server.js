export default defineNuxtPlugin(() => {
  // Before paint: preserve the existing system-theme and legacy storage behavior.
  useHead({ script: [{ key: 'theme-bootstrap', innerHTML: `(function(){try{var saved=localStorage.getItem('thevtravel-theme');var cookie=document.cookie.match(/(?:^|; )thevtravel-theme=([^;]*)/);var theme=saved==='dark'||saved==='light'?saved:cookie?decodeURIComponent(cookie[1]):window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='dark'?'#001122':'#faf6f2'}catch(e){}})();` }] })
})

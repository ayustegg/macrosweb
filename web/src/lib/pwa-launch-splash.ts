/** Runs before paint to avoid flashing app chrome on each PWA open. */
export const PWA_SPLASH_PENDING_SCRIPT = `(function(){try{var pwa=window.matchMedia("(display-mode: standalone)").matches||window.matchMedia("(display-mode: fullscreen)").matches||(window.navigator.standalone===true);if(pwa)document.documentElement.classList.add("pwa-splash-pending")}catch(e){}})();`;

(function() {
  class ScriptDelay extends HTMLElement {
    init() {
      const delayedScripts = this.querySelectorAll("script");
 
        for (const script of delayedScripts){
          const scriptTag = document.createElement('script');
          scriptTag.src = script.dataset.src;
          scriptTag.setAttribute('async', '');

          for(const name of script.getAttributeNames()) {
            name !== 'data-src' && scriptTag.setAttribute(name, script.getAttribute(name));
          }

          document.body.appendChild(scriptTag);
        }

        console.log('Script delay - scripts ready')
    }

    connectedCallback() {
      setTimeout(this.init.bind(this), this.getAttribute('ms') || 1000);
    }
  }

  window.customElements.define('script-delay', ScriptDelay);
})();
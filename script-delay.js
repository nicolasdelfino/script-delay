(function() {
  class ScriptDelay extends HTMLElement {
    constructor() {
      super();
      // scripts array worked through by rICb
      this.scripts = [];
      this.hasDelayed = false;
    }

    // https://developers.google.com/web/updates/2015/08/using-requestidlecallback
    setupRequestIdleCallback() {
      window.requestIdleCallback =
      window.requestIdleCallback ||
      function (cb) {
        var start = Date.now();
        return setTimeout(function () {
          cb({
            didTimeout: false,
            timeRemaining: function () {
              return Math.max(0, 50 - (Date.now() - start));
            }
          });
        }, 1);
      }

      window.cancelIdleCallback =
      window.cancelIdleCallback ||
      function (id) {
        clearTimeout(id);
      }
    }

    load(deadline) {
      if(!this.hasDelayed) {
        return setTimeout(() => {
          this.hasDelayed = true;
          requestIdleCallback(this.load.bind(this));
        }, this.getAttribute('delay-ms') || 500);
      }

      // If there is no deadline, just run as long as necessary.
      // This will be the case if requestIdleCallback doesn’t exist.
      if (typeof deadline === 'undefined') {
        deadline = { 
          timeRemaining: function () { 
            return Number.MAX_VALUE 
          } 
        };
      }

      while (deadline.timeRemaining() > 0 && this.scripts.length > 0) {
        for (let x = 0; x <= this.scripts.length; x++) {
          const scriptTag = document.createElement('script');
          const script = this.scripts[0];
          // for data-set src
          if(script.dataset && script.dataset.src) {
            scriptTag.src = script.dataset.src;
          }
          // copy all attribtues
          for(const name of script.getAttributeNames()) {
            name !== 'data-src' && scriptTag.setAttribute(name, script.getAttribute(name));
          }
          // copy innerHTML in case of inline scripts
          if(script.innerHTML.length > 0) {
            scriptTag.innerHTML = script.innerHTML;
          }
          // inject script to body
          document.body.appendChild(scriptTag);
          // remove first script from script array
          this.scripts.shift();
          // console.log('Scripts left', this.scripts.length)
        }
      }

      if (this.scripts.length > 0) {
        requestIdleCallback(this.load.bind(this));
      }
    }

    connectedCallback() {
      // wait for children in custom element container to register
      setTimeout(() => {
        // get all scripts
        this.scripts = [].slice.call(this.querySelectorAll("script-idle-delay script"));
        // setup request idle callback / shim
        this.setupRequestIdleCallback();
        // load scripts
        window.requestIdleCallback(this.load.bind(this));
      }, 0);
    }
  }

  window.customElements.define('script-idle-delay', ScriptDelay);
})();
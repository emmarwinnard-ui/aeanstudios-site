/* ============================================
   AEAN STUDIOS — COOKIE CONSENT
   Google Analytics (G-641HELB9WF) is not loaded until the visitor
   accepts. Choice is remembered in localStorage. "Manage cookies"
   links in the footer reopen the banner so the choice can be changed.
   ============================================ */
(function () {
  var GA_ID = "G-641HELB9WF";
  var STORAGE_KEY = "aean-consent"; // "granted" | "denied"

  function loadAnalytics() {
    if (window.__aeanGaLoaded) return;
    window.__aeanGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  function getChoice() {
    try { return window.localStorage.getItem(STORAGE_KEY); }
    catch (e) { return null; }
  }
  function setChoice(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value); }
    catch (e) { /* private browsing / storage blocked: banner will just reappear */ }
  }

  function buildBanner() {
    var wrap = document.createElement("div");
    wrap.className = "cookie-banner";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Cookie consent");
    wrap.innerHTML =
      '<p class="cookie-banner-text">This site uses Google Analytics to see how it&rsquo;s used. It only runs if you say yes, and you can change your mind any time from the link in the footer.</p>' +
      '<div class="cookie-banner-actions">' +
        '<button type="button" class="cookie-btn cookie-btn-deny">Deny</button>' +
        '<button type="button" class="cookie-btn cookie-btn-accept">Accept</button>' +
      "</div>";
    document.body.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add("is-visible"); });

    wrap.querySelector(".cookie-btn-accept").addEventListener("click", function () {
      setChoice("granted");
      loadAnalytics();
      hideBanner(wrap);
    });
    wrap.querySelector(".cookie-btn-deny").addEventListener("click", function () {
      setChoice("denied");
      hideBanner(wrap);
    });
    return wrap;
  }

  function hideBanner(wrap) {
    wrap.classList.remove("is-visible");
    window.setTimeout(function () {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, 400);
  }

  function showBanner() {
    if (document.querySelector(".cookie-banner")) return;
    buildBanner();
  }

  function init() {
    var choice = getChoice();
    if (choice === "granted") {
      loadAnalytics();
    } else if (choice !== "denied") {
      showBanner();
    }

    // Any element with data-open-cookie-prefs (e.g. the footer link)
    // reopens the banner so the choice can be revisited or changed.
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest && e.target.closest("[data-open-cookie-prefs]");
      if (!trigger) return;
      e.preventDefault();
      showBanner();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

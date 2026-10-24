/* ============================================
   AEAN STUDIOS, NEWSLETTER
   Handles the dedicated signup page form and the sitewide popup.
   Each sign-up goes to MailerLite (which starts the welcome sequence)
   and is also saved in Netlify Forms (form name: "newsletter") as a backup.
   ============================================ */
(function () {
  /* PASTE YOUR MAILERLITE FORM ACTION URL HERE.
     MailerLite > Forms > your embedded form > Embed > HTML code,
     then copy the value of action="..." on the <form> tag.
     It looks like https://assets.mailerlite.com/jsonp/123456/forms/123456789012345678/subscribe */
  var MAILERLITE_ACTION = "https://assets.mailerlite.com/jsonp/2733678/forms/202140388220208941/subscribe";

  function field(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : "";
  }

  function postToMailerLite(email, name) {
    var params = new URLSearchParams();
    params.append("fields[email]", email);
    if (name) params.append("fields[name]", name);
    params.append("ml-submit", "1");
    params.append("anticsrf", "true");
    return fetch(MAILERLITE_ACTION, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || data.success !== true) throw new Error("MailerLite rejected the sign-up");
        return data;
      });
  }

  function sendToMailerLite(form) {
    if (MAILERLITE_ACTION.indexOf("https://") !== 0) {
      return Promise.reject(new Error("MailerLite action URL not set"));
    }
    var email = field(form, "email");
    var name = field(form, "name");
    // If MailerLite won't accept the name field, try again with the email alone
    return postToMailerLite(email, name).catch(function (err) {
      if (!name) throw err;
      return postToMailerLite(email, "");
    });
  }

  function sendToNetlify(form) {
    var params = new URLSearchParams();
    new FormData(form).forEach(function (value, key) { params.append(key, value); });
    return fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }).then(function (res) {
      if (!res.ok) throw new Error("Netlify form error");
      return res;
    });
  }

  function showError(form, text) {
    var el = form.querySelector(".nl-error");
    if (!el) {
      el = document.createElement("p");
      el.className = "nl-error";
      el.setAttribute("role", "alert");
      el.style.cssText = "margin:0.75rem 0 0;font-size:0.85rem;line-height:1.5;color:#C2AD83;";
      form.appendChild(el);
    }
    el.innerHTML = text;
  }

  function clearError(form) {
    var el = form.querySelector(".nl-error");
    if (el) el.parentNode.removeChild(el);
  }

  function wireForm(form, onSuccess) {
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Honeypot: bots fill the hidden field, people don't
      if (field(form, "bot-field")) { onSuccess(); return; }
      clearError(form);
      var btn = form.querySelector("button[type=submit]");
      if (btn) btn.disabled = true;

      var ml = sendToMailerLite(form).then(function () { return true; }, function (err) {
        if (window.console) console.warn("[AEAN newsletter]", err.message);
        return false;
      });
      var nf = sendToNetlify(form).then(function () { return true; }, function () { return false; });

      Promise.all([ml, nf])
        .then(function (results) {
          if (results[0] || results[1]) {
            try { window.localStorage.setItem("aean-newsletter-subscribed", "true"); } catch (err) {}
            onSuccess();
          } else {
            showError(form, 'That didn\'t go through. Please try again, or email <a href="mailto:hello@aeanstudios.com" style="color:inherit;text-decoration:underline;">hello@aeanstudios.com</a> and I\'ll add you myself.');
          }
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  }

  /* With double opt-in on, people need to confirm by email before the
     welcome sequence starts, so the success message tells them that. */
  function setConfirmMessage(msg) {
    if (!msg) return;
    var h = msg.querySelector("h3");
    var t = msg.querySelector("p");
    if (h) h.textContent = "Check your inbox";
    if (t) t.textContent = "I've sent you a link to confirm your subscription. Click it and your first letter will follow. If it isn't there in a few minutes, have a look in your junk folder.";
  }

  /* ---------- Dedicated page form ---------- */
  var pageCard = document.querySelector(".newsletter-card");
  if (pageCard) {
    var pageForm = pageCard.querySelector("form");
    wireForm(pageForm, function () {
      pageCard.classList.add("is-success");
      var msg = pageCard.querySelector(".success-msg");
      setConfirmMessage(msg);
      if (msg) msg.classList.add("show");
    });
  }

  /* ---------- Sitewide popup ---------- */
  var modal = document.querySelector(".newsletter-modal");
  var backdrop = document.querySelector(".newsletter-modal-backdrop");
  if (modal && backdrop) {
    var popupForm = modal.querySelector("form");

    function openPopup() {
      modal.classList.add("is-open");
      backdrop.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function closePopup() {
      modal.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closePopup();
    });

    wireForm(popupForm, function () {
      modal.classList.add("is-success");
      var msg = modal.querySelector(".success-msg");
      setConfirmMessage(msg);
      if (msg) msg.classList.add("show");
      window.setTimeout(closePopup, 7000);
    });

    modal.querySelectorAll("[data-close-newsletter]").forEach(function (el) {
      el.addEventListener("click", function () {
        try {
          var until = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days
          window.localStorage.setItem("aean-newsletter-dismissed-until", String(until));
        } catch (e) {}
        closePopup();
      });
    });
    backdrop.addEventListener("click", function () {
      modal.querySelectorAll("[data-close-newsletter]")[0] &&
        modal.querySelectorAll("[data-close-newsletter]")[0].click();
    });

    document.querySelectorAll("[data-open-newsletter]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        modal.classList.remove("is-success");
        var msg = modal.querySelector(".success-msg");
        if (msg) msg.classList.remove("show");
        openPopup();
      });
    });

    var alreadySubscribed = false;
    var dismissedUntil = 0;
    try {
      alreadySubscribed = window.localStorage.getItem("aean-newsletter-subscribed") === "true";
      dismissedUntil = parseInt(window.localStorage.getItem("aean-newsletter-dismissed-until") || "0", 10);
    } catch (e) {}

    // Never show on the dedicated signup page itself, or if already
    // subscribed, or if dismissed recently.
    var onNewsletterPage = !!pageCard;
    var eligible = !onNewsletterPage && !alreadySubscribed && Date.now() > dismissedUntil;

    if (eligible) {
      var shown = false;
      function openWhenClear(attemptsLeft) {
        if (shown) return;
        if (document.querySelector(".cookie-banner") && attemptsLeft > 0) {
          window.setTimeout(function () { openWhenClear(attemptsLeft - 1); }, 2000);
          return;
        }
        shown = true;
        openPopup();
      }
      function maybeShow() { openWhenClear(15); } // retry for up to ~30s if the cookie banner is still up
      window.setTimeout(maybeShow, 16000);
      window.addEventListener("scroll", function () {
        var scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        if (scrolled > 0.5) maybeShow();
      }, { passive: true });
    }
  }
})();

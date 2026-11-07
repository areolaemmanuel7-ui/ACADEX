/* ACADEX — frontend behaviour
   Supabase configuration is intentionally kept separate from source code.
   Set window.ACADEX_SUPABASE_URL and window.ACADEX_SUPABASE_ANON_KEY
   in a private local config file before enabling real authentication.
   Never use a Supabase service_role key in browser code.
*/
(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const toast = $("#toast");
  let toastTimer;
  let authMode = "signup";
  let supabaseClient = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function initializeSupabase() {
    const url = window.ACADEX_SUPABASE_URL;
    const anonKey = window.ACADEX_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      console.info("ACADEX: Supabase is not configured. Preview mode remains available.");
      return;
    }
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      console.error("ACADEX: Supabase library did not load.");
      return;
    }
    try {
      supabaseClient = window.supabase.createClient(url, anonKey);
      console.info("ACADEX: Supabase client initialized.");
    } catch (error) {
      console.error("ACADEX: Supabase initialization failed.", error);
    }
  }

  function setAuthMode(mode) {
    authMode = mode === "login" ? "login" : "signup";
    const isSignup = authMode === "signup";
    $("#authTitle").textContent = isSignup ? "Join the ecosystem" : "Welcome back";
    $("#authIntro").textContent = isSignup
      ? "Create your student account to get started."
      : "Log in to your ACADEX student account.";
    $("#nameLabel").hidden = !isSignup;
    $("#universityLabel").hidden = !isSignup;
    $("#fullName").required = isSignup;
    $("#university").required = isSignup;
    $("#password").autocomplete = isSignup ? "new-password" : "current-password";
    $("#authSubmit").textContent = isSignup ? "Create account" : "Log in";
    $("#authSwitch").innerHTML = isSignup
      ? 'Already registered? <button type="button" data-switch-auth="login">Log in</button>'
      : 'New to ACADEX? <button type="button" data-switch-auth="signup">Create an account</button>';
    $("#authMessage").textContent = "";
  }

  function openAuth(mode) {
    setAuthMode(mode);
    $("#authModal").hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#email").focus(), 50);
  }

  function closeAuth() {
    $("#authModal").hidden = true;
    document.body.style.overflow = "";
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    const message = $("#authMessage");
    const submit = $("#authSubmit");
    const email = $("#email").value.trim();
    const password = $("#password").value;
    message.textContent = "";

    if (!supabaseClient) {
      message.textContent = "Account services are not configured yet. This site is currently in preview mode.";
      return;
    }

    submit.disabled = true;
    submit.textContent = authMode === "signup" ? "Creating account…" : "Logging in…";
    try {
      if (authMode === "signup") {
        const fullName = $("#fullName").value.trim();
        const university = $("#university").value.trim();
        if (!fullName || !university) throw new Error("Please complete your name and institution.");
        const { error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, university } }
        });
        if (error) throw error;
        message.textContent = "Registration submitted. Check your email if confirmation is enabled.";
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        message.textContent = "Login successful.";
        showToast("Welcome back to ACADEX.");
      }
    } catch (error) {
      message.textContent = error.message || "Something went wrong. Please try again.";
    } finally {
      submit.disabled = false;
      submit.textContent = authMode === "signup" ? "Create account" : "Log in";
    }
  }

  function setupNavigation() {
    const toggle = $("#menuToggle");
    const nav = $("#mainNav");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "×" : "☰";
    });
    $$("#mainNav a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    }));
  }

  function setupEvents() {
    document.addEventListener("click", event => {
      const openButton = event.target.closest("[data-open-auth]");
      const switchButton = event.target.closest("[data-switch-auth]");
      if (openButton) openAuth(openButton.dataset.openAuth);
      if (switchButton) setAuthMode(switchButton.dataset.switchAuth);
    });
    $("#closeAuth").addEventListener("click", closeAuth);
    $("#authModal").addEventListener("click", event => {
      if (event.target === $("#authModal")) closeAuth();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !$("#authModal").hidden) closeAuth();
    });
    $("#authForm").addEventListener("submit", handleAuthSubmit);
    $("#year").textContent = new Date().getFullYear();
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js")
          .then(() => console.info("ACADEX: service worker registered."))
          .catch(error => console.warn("ACADEX: service worker registration failed.", error));
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initializeSupabase();
    setupNavigation();
    setupEvents();
    registerServiceWorker();
  });
})();

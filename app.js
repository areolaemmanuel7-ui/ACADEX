(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const welcomePage = $("#welcomePage");
  const dashboard = $("#studentDashboard");
  const moduleView = $("#moduleView");
  const moduleContent = $("#moduleContent");
  const authModal = $("#authModal");
  const authForm = $("#authForm");
  const authMessage = $("#authMessage");
  const authSubmit = $("#authSubmit");
  let authMode = "signup";
  let currentUser = null;
  let supabaseClient = null;
  let toastTimer;

  const toast = (message) => {
    const node = $("#toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 3200);
  };
  const safeText = (value, fallback = "—") => (typeof value === "string" && value.trim()) ? value.trim() : fallback;
  const config = window.ACADEX_CONFIG || {};
  const hasConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase?.createClient);

  if (hasConfig) {
    try {
      supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    } catch (error) {
      console.error("ACADEX Supabase setup error:", error);
    }
  }

  const modules = {
    library: {title:"Academic Library",intro:"Find course materials, past questions, research guides and educational resources organised around institutions, departments and courses.",tools:["All resources","Course notes","Past questions","Research","Videos","Study guides"],cards:[
      ["Course notes","Course materials","Organise lecture notes and learning materials by institution, department and course code.","Learning"],
      ["Past questions","Past questions bank","Discover and share revision materials for your courses.","Revision"],
      ["Research","Research resources","Explore research guides, project references and academic writing resources.","Research"],
      ["Videos","Educational videos","Discover video lessons and explainers for difficult topics.","Video"],
      ["Study guides","Study guides","Explore topic summaries, reading lists and revision guides.","Study"]]},
    opportunities:{title:"Opportunity Hub",intro:"Find scholarships, grants, internships, jobs, competitions and training programmes.",tools:["All opportunities","Scholarships","Grants","Internships","Jobs","Competitions","Bootcamps"],cards:[
      ["Scholarships","Scholarship opportunities","Discover funding opportunities and check official eligibility requirements and deadlines.","Funding"],
      ["Grants","Student project grants","Explore support for research, innovation and student-led projects.","Funding"],
      ["Internships","Internship opportunities","Build practical experience through internships and placements.","Experience"],
      ["Jobs","Student-friendly jobs","Explore flexible, graduate and entry-level work opportunities.","Work"],
      ["Competitions","Competitions & challenges","Find academic, technology, business and creative competitions.","Challenge"],
      ["Bootcamps","Bootcamps & training","Discover skills programmes, workshops and professional training.","Learning"]]},
    talent:{title:"Talent Exchange",intro:"Showcase skills, build portfolios, find collaborators and discover student-led services.",tools:["All talents","Developers","Designers","Writers","Researchers","Creators","Tutors"],cards:[
      ["Developers","Coders & developers","Showcase projects and connect around software and technology.","Technology"],
      ["Designers","Graphic designers","Display creative work and connect with people who need design support.","Creative"],
      ["Writers","Writers & researchers","Build a portfolio and collaborate on writing and research projects.","Writing"],
      ["Creators","Content creators","Share educational content and connect with other creators.","Media"],
      ["Tutors","Peer tutors","Support other students with subject knowledge and learning assistance.","Learning"]]},
    innovation:{title:"Innovation & Research",intro:"Turn ideas into projects. Share research interests, discover collaborators and showcase student innovation.",tools:["All projects","Technology","Research","Entrepreneurship","Creative"],cards:[
      ["Technology","Student technology projects","Showcase software, engineering, robotics and technology ideas.","Projects"],
      ["Research","Research collaboration","Find peers interested in research topics and academic projects.","Research"],
      ["Entrepreneurship","Student ventures","Present student business ideas, prototypes and early-stage ventures.","Startups"],
      ["Creative","Creative innovation","Share design, media, arts and creative problem-solving projects.","Creative"]]},
    marketplace:{title:"Campus Marketplace",intro:"Discover student businesses, products and services within the campus community.",tools:["All listings","Products","Services","Businesses"],cards:[
      ["Products","Student products","A catalogue for products offered by student businesses.","Marketplace"],
      ["Services","Student services","Discover design, tutoring, repairs and creative support.","Services"],
      ["Businesses","Student businesses","Give student entrepreneurs a place to introduce their businesses.","Business"]]},
    events:{title:"Events & Communities",intro:"Stay connected to campus groups, student communities, workshops, conferences and events.",tools:["All","Events","Communities","Workshops","Clubs"],cards:[
      ["Events","Campus events","Discover academic, social, professional and cultural events.","Campus"],
      ["Communities","Student communities","Find groups built around courses, interests, skills and shared goals.","Connect"],
      ["Workshops","Workshops & seminars","Explore learning sessions, talks and practical workshops.","Learning"],
      ["Clubs","Clubs & associations","Discover student clubs, societies and campus associations.","Groups"]]},
    campus:{title:"Campus Connect",intro:"Meet students at your institution and discover connections across nearby universities. Matching uses the student profile information you choose to provide.",tools:["All connections","Same university","Nearby universities","Same department"],cards:[
      ["Same university","Your campus community","Prioritise connections from your selected university.","Campus"],
      ["Nearby universities","Nearby campus network","Discover students at surrounding institutions as the network grows.","Network"],
      ["Same department","Department connections","Find peers studying related subjects and courses.","Academic"],
      ["Shared interests","Interest-based connections","Connect with students who share your skills and interests.","Community"]]},
    career:{title:"Career Centre",intro:"Prepare for work with career resources, portfolio development, mentorship and employment readiness.",tools:["All resources","CV & portfolio","Interview prep","Mentorship","Career skills"],cards:[
      ["CV & portfolio","Build your CV and portfolio","Present your education, projects, experience and skills.","Career"],
      ["Interview prep","Interview preparation","Prepare for interviews with practice prompts and practical guidance.","Career"],
      ["Mentorship","Mentorship network","A future space to connect students with experienced professionals and alumni.","Network"],
      ["Career skills","Workplace skills","Explore communication, teamwork, digital and professional skills.","Skills"]]}
  };

  function openAuth(mode) {
    authMode = mode === "login" ? "login" : "signup";
    authMessage.textContent = "";
    $("#authTitle").textContent = authMode === "login" ? "Welcome back" : "Join the ecosystem";
    $("#authIntro").textContent = authMode === "login" ? "Log in to continue to your student dashboard." : "Create your ACADEX student account.";
    $("#signupFields").classList.toggle("hidden", authMode === "login");
    ["fullName","university","department","academicLevel"].forEach(id => {
      const field = document.getElementById(id);
      if (field) field.required = authMode === "signup";
    });
    $("#password").setAttribute("autocomplete", authMode === "login" ? "current-password" : "new-password");
    $("#password").setAttribute("minlength", authMode === "login" ? "1" : "8");
    authSubmit.textContent = authMode === "login" ? "Log in" : "Create account";
    $("#authSwitch").innerHTML = authMode === "login"
      ? 'New to ACADEX? <button type="button" data-switch-auth="signup">Create an account</button>'
      : 'Already registered? <button type="button" data-switch-auth="login">Log in</button>';
    authModal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#email").focus(), 50);
  }
  function closeAuth() {
    authModal.hidden = true;
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-open-auth]").forEach(button => button.addEventListener("click", () => openAuth(button.dataset.openAuth)));
  document.addEventListener("click", event => {
    const switchButton = event.target.closest("[data-switch-auth]");
    if (switchButton) openAuth(switchButton.dataset.switchAuth);
  });
  $("#closeAuth").addEventListener("click", closeAuth);
  authModal.addEventListener("click", event => { if (event.target === authModal) closeAuth(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !authModal.hidden) closeAuth(); });

  function showWelcome() {
    currentUser = null;
    dashboard.classList.add("hidden");
    moduleView.classList.add("hidden");
    welcomePage.classList.remove("hidden");
    $("#publicNav").classList.remove("hidden");
    $("#studentNav").classList.add("hidden");
    window.scrollTo({top:0,behavior:"instant"});
  }
  function showDashboard(user) {
    currentUser = user;
    welcomePage.classList.add("hidden");
    moduleView.classList.add("hidden");
    dashboard.classList.remove("hidden");
    $("#publicNav").classList.add("hidden");
    $("#studentNav").classList.remove("hidden");
    const meta = user.user_metadata || {};
    const fullName = safeText(meta.full_name, user.email?.split("@")[0] || "Student");
    const university = safeText(meta.university, "University not added");
    const department = safeText(meta.department, "Not provided");
    const level = safeText(meta.academic_level, "Not provided");
    $("#dashboardName").textContent = fullName.split(" ")[0];
    $("#navUserName").textContent = fullName;
    $("#dashboardUniversity").textContent = university + " · Your university ecosystem starts here.";
    $("#profileUniversity").textContent = university;
    $("#profileDepartment").textContent = department;
    $("#profileLevel").textContent = level;
    const emailVerified = Boolean(user.email_confirmed_at || user.confirmed_at);
    $("#emailStatus").textContent = emailVerified ? "Email verified" : "Email verification pending";
    $("#emailStatusDot").classList.toggle("verified", emailVerified);
    $("#studentStatus").textContent = "Student enrolment: not independently verified";
    $("#matchingMessage").textContent = `Your selected institution is ${university}. ACADEX will prioritise same-university connections, then nearby institutions, as student profiles become available.`;
    window.scrollTo({top:0,behavior:"instant"});
    loadMatches();
  }

  function renderModule(key) {
    const data = modules[key];
    if (!data || !currentUser) return;
    dashboard.classList.add("hidden");
    moduleView.classList.remove("hidden");
    moduleContent.innerHTML = `
      <p class="eyebrow">LEARN · DISCOVER · BUILD</p>
      <h1 class="module-title">${data.title}</h1>
      <p class="module-description">${data.intro}</p>
      <div class="module-toolbar"><input class="module-search" id="moduleSearch" type="search" placeholder="Search ${data.title.toLowerCase()}..." aria-label="Search module"><select class="module-filter" id="moduleFilter" aria-label="Filter module">${data.tools.map(x => `<option>${x}</option>`).join("")}</select></div>
      <div class="content-grid" id="contentGrid"></div>
      <p class="small-note">ACADEX preview: these are sample categories, not verified live listings. Live submissions and transactions will be introduced in later phases.</p>`;
    const grid = $("#contentGrid"), search = $("#moduleSearch"), filter = $("#moduleFilter");
    function draw() {
      const q = search.value.toLowerCase().trim(), selected = filter.value;
      const allFilters = ["All","All opportunities","All resources","All talents","All projects","All listings","All connections"];
      const results = data.cards.filter(card => {
        const textMatch = card.join(" ").toLowerCase().includes(q);
        const filterMatch = allFilters.includes(selected) || card[0].toLowerCase().includes(selected.toLowerCase().split(" ")[0]) || card[1].toLowerCase().includes(selected.toLowerCase());
        return textMatch && filterMatch;
      });
      grid.innerHTML = results.length ? results.map(card => `<article class="content-card"><span class="tag">${card[0]}</span><h3>${card[1]}</h3><p>${card[2]}</p><div class="card-foot">${card[3]} · Preview</div></article>`).join("") : '<div class="empty-state">No matching items in this preview. Try another search or category.</div>';
    }
    search.addEventListener("input",draw); filter.addEventListener("change",draw); draw();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  document.querySelectorAll("[data-module]").forEach(button => button.addEventListener("click", () => renderModule(button.dataset.module)));
  $("#backToDashboard").addEventListener("click", () => { moduleView.classList.add("hidden"); dashboard.classList.remove("hidden"); window.scrollTo({top:0,behavior:"smooth"}); });

  async function loadMatches() {
    const list = $("#matchesList");
    list.innerHTML = '<p class="small-note">Checking available student connections…</p>';
    if (!supabaseClient || !currentUser) {
      list.innerHTML = '<p class="small-note">Connect the Supabase student_profiles table to enable matching.</p>';
      return;
    }
    try {
      const { data, error } = await supabaseClient.rpc("find_student_matches", { result_limit: 6 });
      if (error) throw error;
      if (!data || !data.length) {
        list.innerHTML = '<p class="small-note">No matching student profiles are available yet. As more students join, ACADEX will suggest same-university and nearby connections.</p>';
        return;
      }
      list.innerHTML = data.map(item => `<article class="match-card"><strong>${escapeHtml(item.full_name)}</strong><span>${escapeHtml(item.department || "Department not provided")} · ${escapeHtml(item.university || "University")}</span><span>${escapeHtml(item.match_reason || "Student connection")}</span></article>`).join("");
    } catch (error) {
      console.info("Student matching is not configured yet:", error.message);
      list.innerHTML = '<p class="small-note">Student matching is not active yet. Complete the included Supabase SQL setup to enable it.</p>';
    }
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  }
  $("#refreshMatches").addEventListener("click", loadMatches);

  async function logout() {
    if (!supabaseClient) { showWelcome(); return; }
    const { error } = await supabaseClient.auth.signOut();
    if (error) { toast(error.message || "Could not log out."); return; }
    showWelcome(); toast("You have logged out.");
  }
  $("#logoutBtn").addEventListener("click", logout);
  $("#dashboardLogout").addEventListener("click", logout);

  authForm.addEventListener("submit", async event => {
    event.preventDefault();
    authMessage.textContent = "";
    if (!supabaseClient) {
      authMessage.textContent = "Supabase is not connected. Check that config.js contains your project URL and public publishable key.";
      return;
    }
    const email = $("#email").value.trim();
    const password = $("#password").value;
    authSubmit.disabled = true;
    authSubmit.textContent = authMode === "login" ? "Logging in…" : "Creating account…";
    try {
      if (authMode === "login") {
        const { data, error } = await supabaseClient.auth.signInWithPassword({email,password});
        if (error) throw error;
        if (data.user) { closeAuth(); showDashboard(data.user); toast("Welcome back to ACADEX."); }
      } else {
        const fullName = $("#fullName").value.trim();
        const university = $("#university").value.trim();
        const department = $("#department").value.trim();
        const academicLevel = $("#academicLevel").value;
        if (!fullName || !university || !department || !academicLevel) throw new Error("Complete all student profile fields.");
        const redirectTo = `${window.location.origin}${window.location.pathname}`;
        const { data, error } = await supabaseClient.auth.signUp({
          email,password,
          options:{ emailRedirectTo:redirectTo, data:{full_name:fullName,university,department,academic_level:academicLevel} }
        });
        if (error) throw error;
        if (data.session && data.user) {
          closeAuth(); showDashboard(data.user);
          toast("Account created. Your email is confirmed.");
        } else {
          authMessage.textContent = "Account created. Check your email and click the verification link before logging in. You can use any valid email address.";
        }
      }
    } catch (error) {
      authMessage.textContent = error.message || "The request could not be completed.";
    } finally {
      authSubmit.disabled = false;
      authSubmit.textContent = authMode === "login" ? "Log in" : "Create account";
    }
  });

  $("#menuToggle").addEventListener("click", () => {
    const nav = $("#mainNav");
    const open = nav.classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded",String(open));
  });
  document.querySelectorAll("#mainNav a").forEach(link => link.addEventListener("click",() => $("#mainNav").classList.remove("open")));
  $("#year").textContent = new Date().getFullYear();

  async function initialiseAuth() {
    if (!supabaseClient) {
      showWelcome();
      return;
    }
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) console.warn("Could not restore ACADEX session:",error.message);
    if (data?.session?.user) showDashboard(data.session.user);
    else showWelcome();
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) showWelcome();
      else if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") showDashboard(session.user);
    });
  }
  initialiseAuth();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load",() => navigator.serviceWorker.register("./sw.js").catch(error => console.info("Service worker not registered:",error)));
  }
})();
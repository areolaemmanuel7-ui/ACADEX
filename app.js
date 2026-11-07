(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const moduleView = $("#moduleView");
  const moduleContent = $("#moduleContent");
  const homeSections = ["#home .hero", "#ecosystem", "#start", "#register"];
  const toast = (message) => {
    const node = $("#toast");
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3000);
  };

  const modules = {
    opportunities: {
      title: "Opportunity Hub",
      intro: "Find opportunities that can move your education, skills and career forward. Explore scholarships, grants, internships, jobs and competitions.",
      tools: ["All opportunities", "Scholarships", "Grants", "Internships", "Jobs", "Competitions"],
      cards: [
        ["Scholarships", "Scholarship opportunities", "Discover funding opportunities for eligible students. Check each provider's official requirements and deadline.", "Funding"],
        ["Grants", "Student project grants", "Explore grants and support programmes for research, innovation and student-led projects.", "Funding"],
        ["Internships", "Internship opportunities", "Build practical experience through internships and entry-level placements.", "Experience"],
        ["Jobs", "Student-friendly jobs", "Explore flexible, graduate and entry-level work opportunities.", "Work"],
        ["Competitions", "Competitions & challenges", "Find academic, technology, business and creative competitions.", "Challenge"],
        ["Bootcamps", "Bootcamps & training", "Discover skills programmes, workshops and professional training.", "Learning"]
      ]
    },
    library: {
      title: "Campus Library",
      intro: "A structured academic resource directory for students across Nigerian institutions. Find course materials, past questions, research guides and educational videos.",
      tools: ["All resources", "Course notes", "Past questions", "Research", "Videos", "Study guides"],
      cards: [
        ["Course notes", "Course materials", "Organise lecture notes and learning materials by institution, department and course code.", "Learning"],
        ["Past questions", "Past questions bank", "A dedicated place for students to discover and share revision materials.", "Revision"],
        ["Research", "Research resources", "Explore research guides, project references, citation support and academic writing resources.", "Research"],
        ["Videos", "Educational videos", "Discover video lessons and explainers for difficult topics and course concepts.", "Video"],
        ["Study guides", "Study guides", "Build better study habits with topic summaries, reading lists and revision guides.", "Study"],
        ["Course directory", "Course directory", "Browse academic departments and course categories as the library expands.", "Directory"]
      ]
    },
    talent: {
      title: "Talent Exchange",
      intro: "A place for students to showcase skills, build portfolios, find collaborators and discover student-led services.",
      tools: ["All talents", "Developers", "Designers", "Writers", "Researchers", "Creators"],
      cards: [
        ["Developers", "Coders & developers", "Showcase projects, build collaborations and connect around software and technology.", "Technology"],
        ["Designers", "Graphic designers", "Display creative work and connect with people who need design support.", "Creative"],
        ["Writers", "Writers & researchers", "Build a portfolio and collaborate on writing and research projects.", "Writing"],
        ["Creators", "Content creators", "Share educational content and connect with other creators.", "Media"],
        ["Tutors", "Peer tutors", "Support other students with subject knowledge and learning assistance.", "Learning"],
        ["Collaborators", "Find collaborators", "Meet students with complementary skills for projects and competitions.", "Community"]
      ]
    },
    innovation: {
      title: "Innovation & Research",
      intro: "Turn ideas into projects. Share research interests, discover collaborators and showcase student innovation.",
      tools: ["All projects", "Technology", "Research", "Entrepreneurship", "Creative"],
      cards: [
        ["Technology", "Student technology projects", "Showcase software, engineering, robotics and technology ideas.", "Projects"],
        ["Research", "Research collaboration", "Find peers interested in research topics and academic projects.", "Research"],
        ["Entrepreneurship", "Student ventures", "Present student business ideas, prototypes and early-stage ventures.", "Startups"],
        ["Creative", "Creative innovation", "Share design, media, arts and other creative problem-solving projects.", "Creative"]
      ]
    },
    marketplace: {
      title: "Campus Marketplace",
      intro: "Discover student businesses, products and services within the campus community.",
      tools: ["All listings", "Products", "Services", "Student businesses"],
      cards: [
        ["Products", "Student products", "A future-ready catalogue for products offered by student businesses.", "Marketplace"],
        ["Services", "Student services", "Discover services such as design, tutoring, repairs and creative support.", "Services"],
        ["Businesses", "Student businesses", "Give student entrepreneurs a place to introduce their businesses.", "Business"],
        ["Safety", "Marketplace guidelines", "Use clear descriptions, verify sellers independently and agree on safe exchange arrangements.", "Guidance"]
      ]
    },
    events: {
      title: "Events & Communities",
      intro: "Stay connected to campus groups, student communities, workshops, conferences and events.",
      tools: ["All", "Events", "Communities", "Workshops", "Clubs"],
      cards: [
        ["Events", "Campus events", "Discover academic, social, professional and cultural events.", "Campus"],
        ["Communities", "Student communities", "Find groups built around courses, interests, skills and shared goals.", "Connect"],
        ["Workshops", "Workshops & seminars", "Explore learning sessions, talks and practical workshops.", "Learning"],
        ["Clubs", "Clubs & associations", "Discover student clubs, societies and campus associations.", "Groups"]
      ]
    },
    career: {
      title: "Career Centre",
      intro: "Prepare for work with career resources, portfolio development, mentorship and employment readiness.",
      tools: ["All resources", "CV & portfolio", "Interview prep", "Mentorship", "Career skills"],
      cards: [
        ["CV & portfolio", "Build your CV and portfolio", "Learn how to present your education, projects, experience and skills.", "Career"],
        ["Interview prep", "Interview preparation", "Prepare for interviews with practice prompts and practical guidance.", "Career"],
        ["Mentorship", "Mentorship network", "A future space to connect students with experienced professionals and alumni.", "Network"],
        ["Career skills", "Workplace skills", "Explore communication, teamwork, digital and professional skills.", "Skills"]
      ]
    }
  };

  function renderModule(key) {
    const data = modules[key];
    if (!data) return;
    $("#home").classList.add("hidden");
    moduleView.classList.remove("hidden");
    moduleContent.innerHTML = `
      <p class="eyebrow">LEARN · DISCOVER · BUILD</p>
      <h1 class="module-title">${data.title}</h1>
      <p class="module-description">${data.intro}</p>
      <div class="module-toolbar">
        <input class="module-search" id="moduleSearch" type="search" placeholder="Search ${data.title.toLowerCase()}..." aria-label="Search module">
        <select class="module-filter" id="moduleFilter" aria-label="Filter module">${data.tools.map(x => `<option>${x}</option>`).join("")}</select>
      </div>
      <div class="content-grid" id="contentGrid"></div>
      <p class="form-note module-disclaimer">ACADEX preview: these are module categories and sample descriptions, not verified live listings. Live submissions, accounts and transactions require further backend development.</p>`;
    const grid = $("#contentGrid");
    const search = $("#moduleSearch");
    const filter = $("#moduleFilter");
    function draw() {
      const q = search.value.toLowerCase().trim();
      const selected = filter.value;
      const results = data.cards.filter(card => {
        const matchesText = card.join(" ").toLowerCase().includes(q);
        const matchesFilter = selected === "All" || selected === "All opportunities" || selected === "All resources" || selected === "All talents" || selected === "All projects" || selected === "All listings" || selected === "All" || card[0].toLowerCase().includes(selected.replace(" & ", " ").toLowerCase().split(" ")[0]) || card[1].toLowerCase().includes(selected.toLowerCase());
        return matchesText && matchesFilter;
      });
      grid.innerHTML = results.length ? results.map(card => `<article class="content-card"><span class="tag">${card[0]}</span><h3>${card[1]}</h3><p>${card[2]}</p><div class="card-foot">${card[3]} · Preview</div></article>`).join("") : `<div class="empty-state">No matching items in this preview. Try another search or category.</div>`;
    }
    search.addEventListener("input", draw);
    filter.addEventListener("change", draw);
    draw();
    window.scrollTo({top: 0, behavior: "smooth"});
  }

  document.querySelectorAll("[data-module]").forEach(button => button.addEventListener("click", () => renderModule(button.dataset.module)));
  $("#backToHome").addEventListener("click", () => {
    moduleView.classList.add("hidden");
    $("#home").classList.remove("hidden");
    window.location.hash = "ecosystem";
    window.scrollTo({top: $("#ecosystem").offsetTop - 20, behavior: "smooth"});
  });

  $("#menuToggle").addEventListener("click", () => {
    const nav = $("#mainNav");
    const open = nav.classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll("#mainNav a").forEach(link => link.addEventListener("click", () => $("#mainNav").classList.remove("open")));
  $("#navLogin").addEventListener("click", () => {
    $("#email").focus();
    document.querySelector("#register").scrollIntoView({behavior:"smooth"});
  });
  $("#loginBtn").addEventListener("click", () => {
    $("#authMessage").textContent = "Login is available after ACADEX authentication is securely configured.";
    $("#password").setAttribute("autocomplete","current-password");
    $("#registerBtn").textContent = "Create account";
    toast("Connect the secure authentication backend to enable login.");
  });

  // Optional Supabase setup. Leave empty until a Supabase project and RLS policies are configured.
  const config = window.ACADEX_CONFIG || {};
  const hasConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase?.createClient);
  let supabaseClient = null;
  if (hasConfig) {
    try { supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey); }
    catch (error) { console.error("ACADEX backend setup error:", error); }
  }
  $("#authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = $("#authMessage");
    const button = $("#registerBtn");
    if (!hasConfig || !supabaseClient) {
      message.textContent = "Preview mode: registration is not active yet. Configure Supabase URL, public anon key and database security policies first.";
      toast("ACADEX preview is running. Registration is not connected yet.");
      return;
    }
    const fullName = $("#fullName").value.trim();
    const university = $("#university").value.trim();
    const email = $("#email").value.trim();
    const password = $("#password").value;
    if (!email || password.length < 6) { message.textContent = "Enter a valid email and a password of at least 6 characters."; return; }
    button.disabled = true;
    button.textContent = "Please wait...";
    try {
      const { data, error } = await supabaseClient.auth.signUp({email, password, options:{data:{full_name:fullName, university}}});
      if (error) throw error;
      message.textContent = data.user?.identities?.length === 0 ? "An account may already exist with this email. Try logging in." : "Registration request submitted. Check your email if confirmation is enabled.";
    } catch (error) {
      message.textContent = error.message || "Registration could not be completed.";
    } finally {
      button.disabled = false;
      button.textContent = "Register";
    }
  });

  const year = new Date().getFullYear();
  document.title = "ACADEX — Discover more. Do more.";
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();

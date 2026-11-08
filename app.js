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
  let studentProfile = null;
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
    library: {title:"Academic Library",intro:"One academic discovery space connecting course resources, Google Books, Open Library and the Directory of Open Access Books.",tools:["All resources","Google Books","Open Library","Open Access Books","Course notes","Past questions","Research","Videos"],cards:[
      ["Course notes","Course materials","Organise lecture notes and learning materials by institution, department and course code.","Learning"],
      ["Past questions","Past questions bank","Discover and share revision materials for your courses.","Revision"],
      ["Research","Research resources","Explore research guides, project references and academic writing resources.","Research"],
      ["Videos","Educational videos","Discover video lessons and explainers for difficult topics.","Video"]]},
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
    loadStudentProfile();
    loadMatches();
  }

  function renderProfileSummary(profile) {
    const fullName = safeText(profile.full_name, currentUser?.email?.split("@")[0] || "Student");
    const university = safeText(profile.university, "University not added");
    const department = safeText(profile.department, "Not provided");
    const level = safeText(profile.academic_level, "Not provided");
    const faculty = safeText(profile.faculty, "Not added");
    const campus = safeText(profile.campus_location, "Not added");
    const interests = Array.isArray(profile.interests) && profile.interests.length
      ? profile.interests.join(", ") : "Not added";

    $("#dashboardName").textContent = fullName.split(" ")[0];
    $("#navUserName").textContent = fullName;
    $("#dashboardUniversity").textContent = university + " · Your university ecosystem starts here.";
    $("#profileUniversity").textContent = university;
    $("#profileFaculty").textContent = faculty;
    $("#profileDepartment").textContent = department;
    $("#profileLevel").textContent = level;
    $("#profileCampus").textContent = campus;
    $("#profileInterests").textContent = interests;
    $("#matchingMessage").textContent = `Your selected institution is ${university}. ACADEX will prioritise same-university connections; nearby-campus matching will be added when the campus directory is available.`;
  }

  async function loadStudentProfile() {
    if (!supabaseClient || !currentUser) return;
    const requestedUserId = currentUser.id;
    const { data, error } = await supabaseClient
      .from("student_profiles")
      .select("user_id, full_name, university, faculty, department, academic_level, campus_location, interests")
      .eq("user_id", requestedUserId)
      .maybeSingle();
    if (error) {
      console.warn("Could not load ACADEX student profile:", error.message);
      toast("Your profile could not be loaded. Please try again.");
      return;
    }
    if (!data || currentUser?.id !== requestedUserId) return;
    studentProfile = data;
    renderProfileSummary(data);
  }

  function openProfileEditor() {
    if (!studentProfile) {
      toast("Your student profile is still loading. Please try again.");
      loadStudentProfile();
      return;
    }
    $("#editFullName").value = studentProfile.full_name || "";
    $("#editUniversity").value = studentProfile.university || "";
    $("#editFaculty").value = studentProfile.faculty || "";
    $("#editDepartment").value = studentProfile.department || "";
    $("#editAcademicLevel").value = studentProfile.academic_level || "";
    $("#editCampusLocation").value = studentProfile.campus_location || "";
    $("#editInterests").value = Array.isArray(studentProfile.interests) ? studentProfile.interests.join(", ") : "";
    $("#profileMessage").textContent = "";
    $("#profileEditor").classList.remove("hidden");
    $("#profileEditor").scrollIntoView({behavior:"smooth",block:"start"});
  }

  $("#editProfileBtn").addEventListener("click", openProfileEditor);
  $("#cancelProfileBtn").addEventListener("click", () => $("#profileEditor").classList.add("hidden"));
  $("#profileForm").addEventListener("submit", async event => {
    event.preventDefault();
    if (!supabaseClient || !currentUser) return;
    const saveButton = $("#saveProfileBtn");
    const message = $("#profileMessage");
    const interests = $("#editInterests").value.split(",").map(value => value.trim()).filter(Boolean).slice(0,20);
    const updated = {
      user_id: currentUser.id,
      full_name: $("#editFullName").value.trim(),
      university: $("#editUniversity").value.trim(),
      faculty: $("#editFaculty").value.trim() || null,
      department: $("#editDepartment").value.trim(),
      academic_level: $("#editAcademicLevel").value,
      campus_location: $("#editCampusLocation").value.trim() || null,
      interests,
      updated_at: new Date().toISOString()
    };
    if (!updated.full_name || !updated.university || !updated.department || !updated.academic_level) {
      message.textContent = "Complete your name, university, department and academic level.";
      return;
    }
    saveButton.disabled = true;
    saveButton.textContent = "Saving…";
    message.textContent = "";
    try {
      const { data, error } = await supabaseClient
        .from("student_profiles")
        .upsert(updated, {onConflict:"user_id"})
        .select("user_id, full_name, university, faculty, department, academic_level, campus_location, interests")
        .single();
      if (error) throw error;
      studentProfile = data;
      renderProfileSummary(data);
      $("#profileEditor").classList.add("hidden");
      toast("Student profile updated successfully.");
    } catch (error) {
      console.error("ACADEX profile update failed:", error);
      message.textContent = error.message || "Could not save your profile. Please try again.";
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Save profile";
    }
  });

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
      ${key === "library" ? `
        <section class="academic-library" aria-label="Unified academic library">
          <div class="library-hero"><span class="eyebrow">ACADEX KNOWLEDGE DESK</span><h2>Explore knowledge. <span class="gold">One search.</span></h2><p>Search across trusted book catalogues and open-access academic collections from one place.</p>
            <form id="academicSearchForm" class="academic-search"><input id="academicQuery" type="search" placeholder="Search a book, author, subject or ISBN…" required><button class="button button-gold" type="submit">Search library ↗</button></form>
            <div class="library-source-pills"><span>Google Books</span><span>Open Library</span><span>DOAB · Open Access</span></div>
          </div>
          <div class="library-results-head"><div><p class="eyebrow">DISCOVERY SOURCES</p><h3>Academic collections</h3></div><span class="small-note">External sources · access depends on publisher/licence</span></div>
          <div id="academicResults" class="academic-results"><article class="academic-source"><b>Google Books</b><p>Search books, previews and bibliographic details across a broad catalogue.</p><a href="https://books.google.com/" target="_blank" rel="noopener">Explore Google Books ↗</a></article><article class="academic-source"><b>Open Library</b><p>Discover book records and editions, including titles available to borrow or read.</p><a href="https://openlibrary.org/" target="_blank" rel="noopener">Explore Open Library ↗</a></article><article class="academic-source"><b>Directory of Open Access Books</b><p>Find peer-reviewed open-access books and check each title’s reuse/download licence.</p><a href="https://www.doabooks.org/" target="_blank" rel="noopener">Explore DOAB ↗</a></article></div>
          <p class="small-note">ACADEX links to the source provider. A preview is not a download right: only download or share a book when the publisher or licence expressly permits it.</p>
        </section>` : ""}
      ${key === "marketplace" ? `
        <section class="marketplace-preview" aria-labelledby="marketplacePreviewTitle">
          <div class="marketplace-heading"><div><p class="eyebrow">STUDENT-TO-STUDENT EXCHANGE</p><h2 id="marketplacePreviewTitle">Campus Marketplace</h2><p class="small-note">Demo listings illustrate how students can agree on a sale or service.</p></div><span class="preview-chip">DIRECT AGREEMENT</span></div>
          <div class="marketplace-products">
            <article class="product-preview"><span class="product-icon">✎</span><span class="tag">DIGITAL SERVICE</span><h3>CV & document formatting</h3><p>Student-friendly document formatting and CV layout assistance.</p><div class="product-meta"><strong>₦2,500</strong><span>Sample seller · YABATECH</span></div><button class="button button-gold" data-mou-item="CV & document formatting" data-mou-price="2500" data-mou-seller="Sample seller">Prepare seller–buyer MOU</button></article>
            <article class="product-preview"><span class="product-icon">▤</span><span class="tag">STUDY RESOURCE</span><h3>Surveying study pack</h3><p>A sample study pack listing for learning and revision.</p><div class="product-meta"><strong>₦1,500</strong><span>Sample seller · YABATECH</span></div><button class="button button-gold" data-mou-item="Surveying study pack" data-mou-price="1500" data-mou-seller="Sample seller">Prepare seller–buyer MOU</button></article>
            <article class="product-preview"><span class="product-icon">◇</span><span class="tag">CREATIVE SERVICE</span><h3>Simple social media design</h3><p>A sample creative service listing for campus businesses.</p><div class="product-meta"><strong>₦3,000</strong><span>Sample seller · Lagos</span></div><button class="button button-gold" data-mou-item="Simple social media design" data-mou-price="3000" data-mou-seller="Sample seller">Prepare seller–buyer MOU</button></article>
          </div>
          <p class="preview-warning">No checkout or Flutterwave. Buyers and sellers arrange payment directly using the payment instructions they mutually verify. ACADEX does not collect, hold or guarantee funds.</p>
        </section>
        <div class="modal-backdrop" id="mouModal" hidden><section class="auth-modal mou-modal" role="dialog" aria-modal="true" aria-labelledby="mouTitle"><button class="modal-close" type="button" data-close-modal="mouModal" aria-label="Close">×</button><p class="eyebrow">ACADEX MARKETPLACE · AGREEMENT BUILDER</p><h2 id="mouTitle">Seller–Buyer MOU</h2><p class="small-note">Complete the proposed terms together. This creates a downloadable draft; it is not legal advice or proof of payment.</p><form id="mouForm" class="mou-form"><label>Item / service<input id="mouItem" required></label><div class="mou-two"><label>Seller name<input id="mouSeller" required></label><label>Buyer name<input id="mouBuyer" required></label></div><label>Agreed amount (₦)<input id="mouAmount" type="number" min="0" step="1" required></label><label>Seller’s payment details / transfer instructions<textarea id="mouPayment" rows="3" placeholder="Seller may provide verified bank name, account name, account number and transfer reference here."></textarea></label><label>Delivery / completion terms<textarea id="mouDelivery" rows="3" placeholder="Describe what will be delivered and when…" required></textarea></label><label>Additional conditions<textarea id="mouConditions" rows="2" placeholder="Optional conditions, cancellation or revision terms"></textarea></label><label class="mou-check"><input id="mouAgree" type="checkbox" required> Both parties have reviewed these details and agree to create this draft.</label><button class="button button-gold auth-submit" type="submit">Download MOU draft</button></form><p class="small-note">Never share your PIN, password, OTP or card security code. Verify payment details directly with the seller and confirm receipt with your bank. ACADEX does not process this payment.</p></section></div>` : ""}`;
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

  // ACADEX 2.3: unified library discovery and direct seller–buyer agreement (no checkout/provider).
  document.addEventListener("submit", async event => {
    if (event.target.id === "academicSearchForm") {
      event.preventDefault();
      const query = $("#academicQuery").value.trim();
      const results = $("#academicResults");
      if (!query) return;
      results.innerHTML = '<p class="small-note">Searching Google Books and Open Library…</p>';
      const googleUrl = "https://www.googleapis.com/books/v1/volumes?q=" + encodeURIComponent(query) + "&maxResults=8";
      const openUrl = "https://openlibrary.org/search.json?q=" + encodeURIComponent(query) + "&limit=8";
      const doabUrl = "https://www.doabooks.org/en/search?query=" + encodeURIComponent(query);
      const tasks = await Promise.allSettled([fetch(googleUrl).then(r=>{if(!r.ok)throw new Error("Google Books unavailable");return r.json()}),fetch(openUrl).then(r=>{if(!r.ok)throw new Error("Open Library unavailable");return r.json()})]);
      const cards = [];
      if (tasks[0].status === "fulfilled") (tasks[0].value.items || []).forEach(book => { const v=book.volumeInfo||{}; const link=v.infoLink||book.selfLink; cards.push(`<article class="book-result"><span class="tag">GOOGLE BOOKS</span><h4>${escapeHtml(v.title||"Untitled")}</h4><p>${escapeHtml((v.authors||[]).join(", ")||"Author not listed")} · ${escapeHtml(v.publishedDate||"Date unavailable")}</p><a href="${escapeHtml(link||"https://books.google.com/")}" target="_blank" rel="noopener">View book / preview ↗</a></article>`); });
      if (tasks[1].status === "fulfilled") (tasks[1].value.docs || []).forEach(book => { const link=book.key?"https://openlibrary.org"+book.key:"https://openlibrary.org/"; cards.push(`<article class="book-result"><span class="tag">OPEN LIBRARY</span><h4>${escapeHtml(book.title||"Untitled")}</h4><p>${escapeHtml((book.author_name||[]).slice(0,3).join(", ")||"Author not listed")} · ${escapeHtml(String(book.first_publish_year||"Year unavailable"))}</p><a href="${escapeHtml(link)}" target="_blank" rel="noopener">View book record ↗</a></article>`); });
      cards.push(`<article class="book-result book-result-doab"><span class="tag">DOAB · OPEN ACCESS</span><h4>Search open-access academic books</h4><p>Open the Directory of Open Access Books to find scholarly titles and inspect their individual licences.</p><a href="${doabUrl}" target="_blank" rel="noopener">Search DOAB for “${escapeHtml(query)}” ↗</a></article>`);
      results.innerHTML = cards.length ? cards.join("") : '<p class="small-note">No results returned. Try another title, author or subject, or open the source catalogues above.</p>';
      if (tasks.every(t=>t.status==="rejected")) toast("Catalogue search is unavailable right now. Try the source links below.");
    }
    if (event.target.id === "mouForm") {
      event.preventDefault();
      const fields = {item:$("#mouItem").value.trim(),seller:$("#mouSeller").value.trim(),buyer:$("#mouBuyer").value.trim(),amount:$("#mouAmount").value,payment:$("#mouPayment").value.trim(),delivery:$("#mouDelivery").value.trim(),conditions:$("#mouConditions").value.trim()};
      const amount = new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(Number(fields.amount));
      const documentText = `ACADEX SELLER–BUYER MEMORANDUM OF UNDERSTANDING (DRAFT)\n\nDate: ${new Date().toLocaleDateString("en-NG")}\nItem/service: ${fields.item}\nSeller: ${fields.seller}\nBuyer: ${fields.buyer}\nAgreed amount: ${amount}\n\nPAYMENT DETAILS / INSTRUCTIONS\n${fields.payment||"To be mutually confirmed by the parties."}\n\nDELIVERY / COMPLETION TERMS\n${fields.delivery}\n\nADDITIONAL CONDITIONS\n${fields.conditions||"None stated."}\n\nPARTY CONFIRMATION\nThe parties confirm that they have reviewed the details above and voluntarily agree to these proposed terms. Each party should retain a copy and independently verify identity, item/service quality, delivery and payment details.\n\nIMPORTANT NOTICE\nThis is a user-generated draft for discussion, not legal advice, a payment receipt, escrow arrangement or guarantee by ACADEX. ACADEX does not receive, hold, transfer or refund funds. The parties should seek appropriate advice for significant transactions. Never disclose PINs, passwords or OTPs.\n\nSeller signature: ____________________  Date: __________\nBuyer signature: _____________________  Date: __________\n`;
      const blob = new Blob([documentText],{type:"text/plain;charset=utf-8"});
      const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="ACADEX_Seller_Buyer_MOU_Draft.txt"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast("MOU draft prepared. No payment was made.");
    }
  });
  document.addEventListener("click", event => {
    const mou = event.target.closest("[data-mou-item]");
    if (mou) {
      $("#mouItem").value=mou.dataset.mouItem; $("#mouSeller").value=mou.dataset.mouSeller||""; $("#mouBuyer").value=""; $("#mouAmount").value=mou.dataset.mouPrice||""; $("#mouPayment").value=""; $("#mouDelivery").value=""; $("#mouConditions").value=""; $("#mouAgree").checked=false; $("#mouModal").hidden=false;
    }
    const legal = event.target.closest("[data-legal]");
    if (legal) openLegal(legal.dataset.legal);
    const close = event.target.closest("[data-close-modal]");
    if (close) { const modal=document.getElementById(close.dataset.closeModal); if(modal) modal.hidden=true; }
  });

  function openLegal(type) {
    const content = {
      privacy: `<h3>1. Information ACADEX may collect</h3><p>ACADEX may process account details, student profile information, content users submit, and basic technical information needed to operate and protect the service.</p><h3>2. How information is used</h3><p>Information is used to provide accounts, student profiles, learning resources, campus connections, marketplace features, support and platform security.</p><h3>3. Visibility and control</h3><p>Some profile details may be visible to signed-in students where the feature requires it. Users should not publish home addresses, passwords, payment credentials or sensitive identity documents. Profile information should be kept accurate and users should contact support to request corrections or account assistance.</p><h3>4. Service providers and security</h3><p>ACADEX may rely on hosting and database providers. Appropriate safeguards and access controls should be applied. No online service can promise absolute security.</p><h3>5. Retention and contact</h3><p>Information should be retained only as needed for platform purposes and applicable obligations. Contact AE&amp;co. through the official ACADEX support channel for privacy requests.</p><p><strong>Preview notice:</strong> This draft must be reviewed and adapted by a qualified Nigerian privacy professional before public launch. It is not legal advice.</p>`,
      terms: `<h3>1. Eligibility and accounts</h3><p>Users must provide accurate information, protect their login credentials and use ACADEX lawfully. Email confirmation confirms control of an email address; it does not prove student enrolment.</p><h3>2. Acceptable use</h3><p>Do not upload unlawful, misleading, stolen, infringing, harmful or unauthorised material. Do not impersonate another student, misuse personal information, or interfere with the platform.</p><h3>3. Academic resources</h3><p>Users must have permission to share materials. ACADEX is not a substitute for official course guidance, and users remain responsible for academic integrity.</p><h3>4. Marketplace</h3><p>Listings must be truthful and lawful. Buyers and sellers should verify details before agreeing to a transaction. Buyers and sellers arrange payment directly and must independently verify payment instructions. ACADEX does not collect, hold, transfer or refund funds.</p><h3>5. Fees and disputes</h3><p>ACADEX does not process marketplace payments. Any buyer–seller payment is a direct arrangement between the parties, outside ACADEX. Parties should document delivery, cancellation and dispute terms before proceeding.</p><h3>6. Availability and changes</h3><p>Features may change as ACADEX develops. Access may be restricted to protect users, comply with law or maintain platform security.</p><p><strong>Preview notice:</strong> These draft terms require legal review and acceptance-flow implementation before public launch. They are not legal advice.</p>`
    };
    $("#legalTitle").textContent = type === "privacy" ? "Privacy Policy" : "Terms of Service";
    $("#legalContent").innerHTML = content[type] || content.privacy;
    $("#legalModal").hidden = false;
  }

  const supportPanel = $("#supportPanel");
  $("#supportLaunch").addEventListener("click", () => {
    const opening = supportPanel.classList.contains("hidden");
    supportPanel.classList.toggle("hidden", !opening);
    $("#supportLaunch").setAttribute("aria-expanded", String(opening));
  });
  $("#supportClose").addEventListener("click", () => {
    supportPanel.classList.add("hidden");
    $("#supportLaunch").setAttribute("aria-expanded", "false");
  });
  $("#supportForm").addEventListener("submit", event => {
    event.preventDefault();
    const input = $("#supportInput"), question = input.value.trim();
    if (!question) return;
    const messages = $("#supportMessages");
    const userBubble = document.createElement("p"); userBubble.className = "support-bubble support-user"; userBubble.textContent = question; messages.appendChild(userBubble);
    const q = question.toLowerCase();
    let answer = "Thanks for reaching out. This preview assistant covers common questions only. For account-specific help, use the official ACADEX support contact once published.";
    if (/login|log in|password|account|register|sign up/.test(q)) answer = "For an account, use Join ACADEX or Log in. Confirm your email if confirmation is enabled. Never share your password or verification code with anyone.";
    else if (/profile|department|university|edit/.test(q)) answer = "After logging in, open Edit student profile on your dashboard. Update your academic details and save. Email confirmation is not proof of enrolment.";
    else if (/payment|pay|checkout|money|refund|seller/.test(q)) answer = "ACADEX has no checkout or Flutterwave integration. Buyers and sellers may agree payment instructions directly and document them in a seller–buyer MOU. ACADEX does not collect or hold funds. Never share your PIN, password or OTP.";
    else if (/privacy|data|delete/.test(q)) answer = "Open Privacy Policy in the website footer for the current draft. For a real privacy request, contact ACADEX through its official support channel when published.";
    else if (/term|rule|marketplace|sell|buy/.test(q)) answer = "Marketplace listings in this preview are examples. Use lawful, accurate listings and only share content you have permission to distribute.";
    const botBubble = document.createElement("p"); botBubble.className = "support-bubble"; botBubble.textContent = answer; messages.appendChild(botBubble);
    input.value = ""; messages.scrollTop = messages.scrollHeight;
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") ["mouModal","legalModal"].forEach(id => { const el=document.getElementById(id); if(el) el.hidden=true; });
  });

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
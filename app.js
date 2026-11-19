(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toast = message => { const el=$('toast'); el.textContent=message; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2600); };
  let client=null, user=null, authMode='signup';
  const tables={opportunity:'opportunities',resource:'library_resources',marketplace:'marketplace_listings',event:'campus_events',talent:'talent_profiles',innovation:'innovation_posts',advertisement:'advertisements'};
  const feeds={opportunity:'opportunityFeed',resource:'resourceFeed',marketplace:'marketFeed',event:'eventFeed',talent:'talentFeed',innovation:'innovationFeed',advertisement:'adFeed'};
  const titles={opportunity:'Post an opportunity',resource:'Share a library resource',marketplace:'List a student business',event:'Create a campus event',talent:'Create a talent profile',innovation:'Share an innovation',advertisement:'Submit an advertisement'};
  function openModal(id){$(id).classList.remove('hidden');} function closeModals(){document.querySelectorAll('.overlay').forEach(x=>x.classList.add('hidden'));}
  function setAuth(mode){authMode=mode; $('authTitle').textContent=mode==='signup'?'Join the ecosystem':'Welcome back'; $('authSubmit').textContent=mode==='signup'?'Create account':'Log in'; $('signupFields').classList.toggle('hidden',mode!=='signup'); $('authSwitch').innerHTML=mode==='signup'?'Already registered? <button type="button" data-switch="login">Log in</button>':'New to ACADEX? <button type="button" data-switch="signup">Create account</button>'; $('authMessage').textContent=''; openModal('authModal'); }
  async function init(){
    try{
      if(window.supabase && window.ACADEX_CONFIG?.supabaseUrl && window.ACADEX_CONFIG?.supabaseAnonKey){
        client=window.supabase.createClient(window.ACADEX_CONFIG.supabaseUrl,window.ACADEX_CONFIG.supabaseAnonKey);
        const {data,error}=await client.auth.getSession();
        if(error)throw error;
        user=data.session?.user||null;
        client.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;refreshShell();loadAll();});
      }else toast('Supabase configuration is missing. Add the project URL and publishable key in config.js.');
    }catch(error){console.error('ACADEX startup error:',error);toast('ACADEX could not connect. Check config.js and Supabase availability.');}
    refreshShell();loadAll();
    if('serviceWorker' in navigator && location.protocol!=='file:') window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('Service worker unavailable:',error)));
  }
  function refreshShell(){ $('userLabel').textContent=user?(user.user_metadata?.full_name||user.email||'Student'):'Guest'; $('logoutBtn').classList.toggle('hidden',!user); document.querySelectorAll('[data-auth="login"]').forEach(b=>b.classList.toggle('hidden',!!user)); document.querySelectorAll('[data-auth="signup"]').forEach(b=>b.classList.toggle('hidden',!!user)); renderProfile(); }
  async function submitAuth(e){
    e.preventDefault();
    if(!client){$('authMessage').textContent='Supabase is not configured. Check config.js.';return;}
    const email=$('email').value.trim(),password=$('password').value;
    try{
      let result;
      if(authMode==='signup'){
        const metadata={full_name:$('fullName').value.trim(),university:$('university').value.trim(),department:$('department').value.trim(),academic_level:$('level').value.trim()};
        if(!metadata.full_name||!metadata.university){$('authMessage').textContent='Full name and institution are required.';return;}
        result=await client.auth.signUp({email,password,options:{data:metadata}});
        if(!result.error)$('authMessage').textContent='Account created. Check your email if confirmation is enabled.';
      }else{
        result=await client.auth.signInWithPassword({email,password});
        if(!result.error){closeModals();toast('Welcome back to ACADEX.');}
      }
      if(result?.error)$('authMessage').textContent=result.error.message;
    }catch(error){$('authMessage').textContent=error.message||'Authentication failed. Please try again.';}
  }
  function openPost(kind){if(!user){toast('Please log in to contribute.');setAuth('login');return;} $('postKind').value=kind;$('postTitle').textContent=titles[kind]||'Create post';$('postForm').reset();$('postKind').value=kind;$('dateWrap').classList.toggle('hidden',kind!=='event');$('priceWrap').classList.toggle('hidden',kind!=='marketplace');$('marketTermsWrap').classList.toggle('hidden',kind!=='marketplace');$('postMessage').textContent='';openModal('postModal');}
  async function submitPost(e){
    e.preventDefault();
    if(!user||!client){$('postMessage').textContent='Please log in before submitting.';return;}
    try{
      const kind=$('postKind').value,table=tables[kind];if(!table)return;
      const payload={user_id:user.id,title:$('postName').value.trim(),description:$('postDescription').value.trim(),category:$('postCategory').value.trim()||null,link_or_contact:$('postLink').value.trim()||null,location:$('postLocation').value.trim()||null,status:'pending'};
      if(kind==='event')payload.event_date=$('postDate').value||null;
      if(kind==='marketplace'){payload.price=$('postPrice').value.trim()||null;payload.agreement_terms=$('postAgreement').value.trim()||null;payload.payment_instructions=$('postPaymentInstructions').value.trim()||null;}
      const {error}=await client.from(table).insert(payload);
      if(error){$('postMessage').textContent=error.message;return;}
      closeModals();toast('Submitted. Your post will appear after review.');loadFeed(kind);
    }catch(error){$('postMessage').textContent=error.message||'Submission failed. Please try again.';}
  }
  function card(item,kind){const status=item.status==='approved'?'':' · Under review';const date=item.event_date?new Date(item.event_date).toLocaleString():'';const actions=`<div class="post-actions"><button data-like="${esc(item.id)}" data-kind="${kind}">♡ Like</button><button data-comment="${esc(item.id)}" data-kind="${kind}">Comment</button><button data-save="${esc(item.id)}" data-kind="${kind}">Save</button>${item.link_or_contact?`<a class="btn outline" href="${esc(safeUrl(item.link_or_contact))}" target="_blank" rel="noopener">Open / Contact ↗</a>`:''}</div>`;
    return `<article class="post-card"><div class="post-meta"><span class="tag">${esc(item.category||kind)}</span><span>${esc(item.location||'ACADEX community')}</span><span>${esc(date||'')}</span></div><h3>${esc(item.title)}${status}</h3><p>${esc(item.description)}</p>${kind==='marketplace'&&item.price?`<b class="gold">${esc(item.price)}</b>`:''}${kind==='marketplace'&&item.agreement_terms?`<p><b>Buyer–seller terms:</b> ${esc(item.agreement_terms)}</p>`:''}${kind==='marketplace'&&item.payment_instructions?`<p><b>Payment instructions:</b> ${esc(item.payment_instructions)}</p>`:''}${actions}<div class="comment-area" id="comments-${esc(item.id)}"></div></article>`;}
  function safeUrl(value){try{const u=new URL(value);return ['http:','https:','mailto:','tel:'].includes(u.protocol)?u.href:'#';}catch{return '#';}}
  async function loadFeed(kind){const target=$(feeds[kind]);if(!target||!client){if(target)target.innerHTML='<div class="empty">Connect ACADEX to Supabase to load live posts.</div>';return;}const table=tables[kind];let query=client.from(table).select('*').order('created_at',{ascending:false}).limit(30);if(kind!=='advertisement')query=query.eq('status','approved');else query=query.eq('status','approved');const {data,error}=await query;if(error){target.innerHTML=`<div class="empty">${esc(error.message)}</div>`;return;}target.innerHTML=data?.length?data.map(x=>card(x,kind)).join(''):'<div class="empty">No approved posts yet. Be the first to contribute.</div>';}
  async function loadAll(){Object.keys(tables).forEach(loadFeed);}
  async function renderProfile(){const panel=$('profilePanel');if(!panel)return;if(!user){panel.innerHTML='<p>Log in to view your profile and activity.</p><button class="btn gold" data-auth="login">Log in</button>';return;}const {data,error}=await client.from('profiles').select('id,full_name,university,department,academic_level,avatar_url,bio,created_at,updated_at').eq('id',user.id).maybeSingle(); if(error){panel.innerHTML=`<p class="message">Could not load profile: ${esc(error.message)}</p>`;return;}panel.innerHTML=`<div><h3>${esc(data?.full_name||user.email)}</h3><p>${esc(data?.university||'Institution not set')} · ${esc(data?.department||'Department not set')} · ${esc(data?.academic_level||'Level not set')}</p><p>${esc(user.email)}</p></div><button class="btn outline" id="editProfile">Edit profile</button>`;$('editProfile')?.addEventListener('click',editProfile);}
  async function editProfile(){const full_name=prompt('Full name',user.user_metadata?.full_name||'');if(full_name===null)return;const university=prompt('University / institution','')||'';const department=prompt('Department','')||'';const academic_level=prompt('Academic level','')||'';const values={full_name:full_name.trim(),university:university.trim(),department:department.trim(),academic_level:academic_level.trim(),updated_at:new Date().toISOString()};let result=await client.from('profiles').update(values).eq('id',user.id).select('id').maybeSingle();if(!result.error&&!result.data){const {updated_at,...insertValues}=values;result=await client.from('profiles').insert({id:user.id,...insertValues}).select('id').maybeSingle();}if(result.error)toast(result.error.message);else{await renderProfile();toast('Profile updated.');}}
  async function handleFeedAction(e){const like=e.target.closest('[data-like]'),save=e.target.closest('[data-save]'),comment=e.target.closest('[data-comment]');if(!like&&!save&&!comment)return;if(!user){toast('Log in to interact with posts.');setAuth('login');return;}const button=like||save||comment,id=button.dataset.like||button.dataset.save||button.dataset.comment,kind=button.dataset.kind,table=tables[kind];if(like){const {error}=await client.from('post_reactions').upsert({user_id:user.id,post_table:table,post_id:id,reaction:'like'},{onConflict:'user_id,post_table,post_id'});toast(error?error.message:'Liked.');}else if(save){const {error}=await client.from('saved_posts').upsert({user_id:user.id,post_table:table,post_id:id},{onConflict:'user_id,post_table,post_id'});toast(error?error.message:'Saved to your list.');}else{const area=$('comments-'+id);if(area.dataset.loaded!=='yes'){const {data,error}=await client.from('post_comments').select('id,user_id,body,parent_id,created_at').eq('post_table',table).eq('post_id',id).eq('status','visible').order('created_at');if(error){toast(error.message);return;}const ids=[...new Set((data||[]).map(c=>c.user_id))];const {data:people}=ids.length?await client.from('profiles').select('id,full_name').in('id',ids):{data:[]};const names=Object.fromEntries((people||[]).map(p=>[p.id,p.full_name]));area.innerHTML=(data||[]).map(c=>`<div class="comment ${c.parent_id?'reply':''}"><b>${esc(names[c.user_id]||'Student')}</b><p>${esc(c.body)}</p><button data-reply="${esc(c.id)}" data-postid="${esc(id)}" data-kind="${kind}">Reply</button></div>`).join('')||'<p class="micro">No comments yet.</p>';area.dataset.loaded='yes';}const replyTo=e.target.dataset.reply||null;const text=prompt(replyTo?'Write your reply':'Write a comment');if(!text?.trim())return;const {error}=await client.from('post_comments').insert({user_id:user.id,post_table:table,post_id:id,parent_id:replyTo,body:text.trim()});if(error)toast(error.message);else{area.dataset.loaded='no';toast(replyTo?'Reply added.':'Comment added.');}}}
  async function searchBooks(){
    const q=$('bookSearch').value.trim(),box=$('bookResults');
    if(!q){box.innerHTML='<div class="empty">Enter a title, author or subject to search the worldwide catalogue.</div>';return;}
    box.innerHTML='<div class="empty">Searching the worldwide book catalogue…</div>';
    try{
      const url='https://openlibrary.org/search.json?q='+encodeURIComponent(q)+'&limit=12&fields=key,title,author_name,cover_i,first_publish_year,edition_count';
      const response=await fetch(url,{headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error('Catalogue request failed ('+response.status+').');
      const data=await response.json();
      const books=(data.docs||[]).filter(b=>b.title&&b.key);
      box.innerHTML=books.length?books.map(b=>`<article class="book">${b.cover_i?`<img src="https://covers.openlibrary.org/b/id/${Number(b.cover_i)}-M.jpg" alt="Cover of ${esc(b.title)}" loading="lazy">`:''}<h4>${esc(b.title)}</h4><p>${esc(b.author_name?.slice(0,3).join(', ')||'Author not listed')}</p><p>${b.first_publish_year?`First published ${esc(b.first_publish_year)}`:'Publication year unavailable'}</p><a href="https://openlibrary.org${esc(b.key)}" target="_blank" rel="noopener noreferrer">View catalogue record ↗</a></article>`).join(''):'<div class="empty">No matching catalogue records found. Try a different title, author or subject.</div>';
    }catch(error){box.innerHTML=`<div class="empty">${esc(error.message||'The worldwide catalogue could not be reached. Check your connection and try again.')}</div>`;}
  }
  document.addEventListener('click',e=>{const auth=e.target.closest('[data-auth]'),post=e.target.closest('[data-post]'),sw=e.target.closest('[data-switch]');if(auth)setAuth(auth.dataset.auth);if(post)openPost(post.dataset.post);if(sw)setAuth(sw.dataset.switch);if(e.target.closest('[data-close]'))closeModals();if(e.target.classList.contains('overlay'))closeModals();});
  document.addEventListener('click',e=>{const r=e.target.closest('[data-reply]');if(r){const id=r.dataset.postid,kind=r.dataset.kind;const area=$('comments-'+id);const text=prompt('Write your reply');if(text?.trim())client.from('post_comments').insert({user_id:user.id,post_table:tables[kind],post_id:id,parent_id:r.dataset.reply,body:text.trim()}).then(({error})=>{if(error)toast(error.message);else{area.dataset.loaded='no';toast('Reply added.');}});}});document.addEventListener('click',handleFeedAction);$('authForm').addEventListener('submit',submitAuth);$('postForm').addEventListener('submit',submitPost);$('logoutBtn').addEventListener('click',async()=>{if(client)await client.auth.signOut();toast('You have logged out.');});$('bookSearchBtn').addEventListener('click',searchBooks);$('bookSearch').addEventListener('keydown',e=>{if(e.key==='Enter')searchBooks();});$('menuBtn').addEventListener('click',()=>$('mainNav').classList.toggle('open'));
  [['opSearch','opportunityFeed','opType'],['marketSearch','marketFeed','marketType'],['eventSearch','eventFeed',null]].forEach(([input,feed,select])=>{const apply=()=>{const q=$(input).value.toLowerCase(),type=select?$(select).value.toLowerCase():'';document.querySelectorAll('#'+feed+' .post-card').forEach(card=>card.classList.toggle('hidden',!(card.innerText.toLowerCase().includes(q)&&(!type||card.innerText.toLowerCase().includes(type)))));};$(input).addEventListener('input',apply);if(select)$(select).addEventListener('change',apply);});
  init();
})();

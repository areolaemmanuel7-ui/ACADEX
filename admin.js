(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tables=['opportunities','library_resources','marketplace_listings','campus_events','talent_profiles','innovation_posts','advertisements'];
  let db=null;
  async function start(){
    try{
      if(!window.supabase||!window.ACADEX_CONFIG?.supabaseUrl||!window.ACADEX_CONFIG?.supabaseAnonKey){$('adminStatus').textContent='Supabase configuration unavailable. Check config.js.';return;}
      db=window.supabase.createClient(window.ACADEX_CONFIG.supabaseUrl,window.ACADEX_CONFIG.supabaseAnonKey);
      const {data,error}=await db.auth.getSession();if(error)throw error;
      if(!data.session){$('adminStatus').textContent='Log in to the main ACADEX site first, then reload this page.';return;}
      const {data:admin,error:adminError}=await db.from('admin_users').select('user_id').eq('user_id',data.session.user.id).maybeSingle();
      if(adminError)throw adminError;
      if(!admin){$('adminStatus').textContent='Access denied. This account is not an ACADEX administrator.';return;}
      $('adminStatus').textContent='Administrator access confirmed.';
      for(const table of tables){
        const {data:rows,error:queueError}=await db.from(table).select('*').eq('status','pending').order('created_at').limit(50);
        const section=document.createElement('section');section.className='section';
        section.innerHTML=`<h2>${esc(table.replaceAll('_',' '))}</h2>${queueError?`<p class="message">${esc(queueError.message)}</p>`:(rows?.length?rows.map(row=>`<article class="post-card" data-table="${table}" data-id="${esc(row.id)}"><h3>${esc(row.title)}</h3><p>${esc(row.description)}</p><div class="post-actions"><button data-action="approved">Approve</button><button data-action="rejected">Reject</button></div></article>`).join(''):'<div class="empty">No pending submissions.</div>')}`;
        $('queues').append(section);
      }
    }catch(error){console.error('ACADEX admin error:',error);$('adminStatus').textContent='Could not load moderation dashboard: '+(error.message||'Unknown error');}
  }
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-action]');if(!button||!db)return;
    const card=button.closest('[data-table]');if(!card)return;
    button.disabled=true;
    const {error}=await db.from(card.dataset.table).update({status:button.dataset.action}).eq('id',card.dataset.id);
    if(error){alert(error.message);button.disabled=false;}else card.remove();
  });
  start();
})();

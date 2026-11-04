// Initialize Supabase Client
const SUPABASE_URL = 'https://zhfgmtqmufbzbwgobqms.supabase.co';
const SUPABASE_ANON_KEY = 'Sb_publishable_I5iocb3hwmgPGH-2eM78OQ_ghUHJNZP';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Existing functionality: Notification button and toast
const button = document.getElementById('notifyBtn');
const toast = document.getElementById('toast');

button?.addEventListener('click', () => {
  toast.textContent = 'Thanks for believing in ACADEX. More features are coming.';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
});

// Existing functionality: Service Worker registration
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

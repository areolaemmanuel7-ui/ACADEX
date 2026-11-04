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

// ACADEX Authentication Logic
const signUpBtn = document.getElementById('signUpBtn');
const signInBtn = document.getElementById('signInBtn');
const authMessage = document.getElementById('authMessage');

// Register Handler
signUpBtn?.addEventListener('click', async () => {
  const fullName = document.getElementById('authName').value.trim();
  const university = document.getElementById('authUniversity').value.trim();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value.trim();

  if (!fullName || !university || !email || !password) {
    authMessage.style.color = '#ff4d4d';
    authMessage.textContent = 'Please fill in all fields.';
    return;
  }

  authMessage.style.color = '#d4af37';
  authMessage.textContent = 'Registering account...';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        university: university
      }
    }
  });

  if (error) {
    authMessage.style.color = '#ff4d4d';
    authMessage.textContent = error.message;
  } else {
    authMessage.style.color = '#4bb543';
    authMessage.textContent = 'Registration successful! Please check your email to confirm.';
  }
});

// Login Handler
signInBtn?.addEventListener('click', async () => {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value.trim();

  if (!email || !password) {
    authMessage.style.color = '#ff4d4d';
    authMessage.textContent = 'Please enter your email and password.';
    return;
  }

  authMessage.style.color = '#d4af37';
  authMessage.textContent = 'Logging in...';

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    authMessage.style.color = '#ff4d4d';
    authMessage.textContent = error.message;
  } else {
    authMessage.style.color = '#4bb543';
    authMessage.textContent = 'Login successful! Welcome back to ACADEX.';
  }
});

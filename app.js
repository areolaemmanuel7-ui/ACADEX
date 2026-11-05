// ACADEX - Supabase Auth Initialization
const SUPABASE_URL = 'https://zhfgmtqmufbzbwgobqms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZmdtdHFtdWZiemJ3Z29icW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MjU5MjYsImV4cCI6MjEwOTQwMTkyNn0.KDx9irzgQuFp7LFmcum4t6WoFjpURD7DjE55CtmP1k4';

let supabase = null;

try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.error('Supabase CDN library not loaded properly.');
  }
} catch (err) {
  console.error('Error initializing Supabase:', err);
}

// Existing Toast Functionality
const button = document.getElementById('notifyBtn');
const toast = document.getElementById('toast');

button?.addEventListener('click', () => {
  toast.textContent = 'Thanks for believing in ACADEX. More features are coming.';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
});

// Existing Service Worker Registration
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// Auth Event Handlers
const signUpBtn = document.getElementById('signUpBtn');
const signInBtn = document.getElementById('signInBtn');
const authMessage = document.getElementById('authMessage');

signUpBtn?.addEventListener('click', async () => {
  if (!supabase) {
    if (authMessage) {
      authMessage.style.color = '#ff4d4d';
      authMessage.textContent = 'Error: Supabase client initialization failed. Check API key.';
    }
    alert('Supabase client failed to initialize. Please verify your API key.');
    return;
  }

  const fullName = document.getElementById('authName')?.value.trim();
  const university = document.getElementById('authUniversity')?.value.trim();
  const email = document.getElementById('authEmail')?.value.trim();
  const password = document.getElementById('authPassword')?.value.trim();

  if (!fullName || !university || !email || !password) {
    authMessage.style.color = '#ff4d4d';
    authMessage.textContent = 'Please fill in all fields.';
    return;
  }

  authMessage.style.color = '#d4af37';
  authMessage.textContent = 'Registering account...';

  try {
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
  } catch (err) {
    authMessage.style.color = '#ff4d4d';
    authMessage.textContent = 'Network or Request Error: ' + err.message;
  }
});

signInBtn?.addEventListener('click', async () => {
  if (!supabase) {
    if (authMessage) {
      authMessage.style.color = '#ff4d4d';
      authMessage.textContent = 'Error: Supabase client initialization failed.';
    }
    return;
  }

  const email = document.getElementById('authEmail')?.value.trim();
  const password = document.getElementById('authPassword')?.value.trim();

  if (!email || !password) {
    authMessage.style.color = '#ff4d4d';
    authMessage.textContent = 'Please enter your email and password.';
    return;
  }

  authMessage.style.color = '#d4af37';
  authMessage.textContent = 'Logging in...';

  try {
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
  } catch (err) {
    authMessage.style.color = '#ff4d4d';
    authMessage.textContent = 'Network Error: ' + err.message;
  }
});

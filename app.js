// ACADEX - Diagnostic Build v3
console.log("ACADEX script starting...");

const SUPABASE_URL = 'https://zhfgmtqmufbzbwgobqms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZmdtcXFtdWZiemJ3Z29icW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzQyMzAsImV4cCI6MjA3NzMxMDIzMH0.JpC3RI0JZxBNhWFZsInJ1Zz16InpoZmdtcXFtdWZiemJ3Z29icW1z';

// Safe initialization check
let supabase = null;
try {
  if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase initialized successfully.");
  } else {
    console.error("window.supabase is missing!");
  }
} catch (e) {
  console.error("Supabase init error:", e);
}

// Global execution wrapper
document.addEventListener('DOMContentLoaded', () => {
  const notifyBtn = document.getElementById('notifyBtn');
  const toast = document.getElementById('toast');
  const signUpBtn = document.getElementById('signUpBtn');
  const signInBtn = document.getElementById('signInBtn');
  const authMessage = document.getElementById('authMessage');

  // Visually verify script loaded on screen
  if (authMessage) {
    authMessage.style.color = '#d4af37';
    authMessage.textContent = 'System ready. Enter details to register.';
  }

  if (notifyBtn && toast) {
    notifyBtn.addEventListener('click', () => {
      toast.textContent = 'Thanks for believing in ACADEX. More features are coming.';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2800);
    });
  }

  if (signUpBtn) {
    signUpBtn.addEventListener('click', async () => {
      console.log("Register button clicked");
      
      if (!supabase) {
        authMessage.style.color = '#ff4d4d';
        authMessage.textContent = 'Error: Supabase client not loaded.';
        return;
      }

      const nameEl = document.getElementById('authName');
      const uniEl = document.getElementById('authUniversity');
      const emailEl = document.getElementById('authEmail');
      const passEl = document.getElementById('authPassword');

      if (!nameEl || !uniEl || !emailEl || !passEl) {
        authMessage.style.color = '#ff4d4d';
        authMessage.textContent = 'Error: Form input elements missing in DOM.';
        return;
      }

      const fullName = nameEl.value.trim();
      const university = uniEl.value.trim();
      const email = emailEl.value.trim();
      const password = passEl.value.trim();

      if (!fullName || !university || !email || !password) {
        authMessage.style.color = '#ff4d4d';
        authMessage.textContent = 'Please fill in all fields.';
        return;
      }

      authMessage.style.color = '#d4af37';
      authMessage.textContent = 'Connecting to Supabase...';

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, university: university }
          }
        });

        if (error) {
          authMessage.style.color = '#ff4d4d';
          authMessage.textContent = 'Supabase Error: ' + error.message;
        } else {
          authMessage.style.color = '#4bb543';
          authMessage.textContent = 'Success! Check your email to confirm.';
        }
      } catch (err) {
        authMessage.style.color = '#ff4d4d';
        authMessage.textContent = 'Exception: ' + err.message;
      }
    });
  }
});

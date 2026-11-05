// Initialize Supabase Client
const SUPABASE_URL = 'https://zhfgmtqmufbzbwgobqms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZmdtcXFtdWZiemJ3Z29icW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzQyMzAsImV4cCI6MjA3NzMxMDIzMH0.JpC3RI0JZxBNhWFZsInJ1Zz16InpoZmdtcXFtdWZiemJ3Z29icW1z';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Notification Button
const notifyBtn = document.getElementById('notifyBtn');
const toast = document.getElementById('toast');

if (notifyBtn && toast) {
  notifyBtn.addEventListener('click', () => {
    toast.textContent = 'Thanks for believing in ACADEX. More features are coming.';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  });
}

// Authentication Handlers
window.addEventListener('DOMContentLoaded', () => {
  const signUpBtn = document.getElementById('signUpBtn');
  const signInBtn = document.getElementById('signInBtn');
  const authMessage = document.getElementById('authMessage');

  if (signUpBtn) {
    signUpBtn.addEventListener('click', async () => {
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
          authMessage.textContent = 'Registration successful! Check your email to confirm.';
        }
      } catch (err) {
        authMessage.style.color = '#ff4d4d';
        authMessage.textContent = 'Error: ' + err.message;
      }
    });
  }

  if (signInBtn) {
    signInBtn.addEventListener('click', async () => {
      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value.trim();

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
          authMessage.textContent = 'Login successful! Welcome back.';
        }
      } catch (err) {
        authMessage.style.color = '#ff4d4d';
        authMessage.textContent = 'Error: ' + err.message;
      }
    });
  }
});

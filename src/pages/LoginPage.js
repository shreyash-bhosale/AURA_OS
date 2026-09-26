/**
 * AURA — Login Page
 * Apple-inspired authentication gateway with demo exploration.
 */

import { signIn, signInAsDemo, isAuthenticated } from '../data/authService.js';
import { loadProfile, createProfile } from '../data/userProfile.js';
import { navigate } from '../router.js';

export function renderLoginPage() {
  return `
    <div class="auth-viewport">
      <div class="auth-container">
        <!-- Brand Header -->
        <a href="/" class="auth-brand" aria-label="Return to AURA Home">
          <div class="auth-brand-glyph">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5">
              <circle cx="12" cy="12" r="9"></circle>
              <circle cx="12" cy="12" r="3" fill="#38BDF8"></circle>
            </svg>
          </div>
          <span class="auth-brand-text">AURA</span>
        </a>

        <!-- Auth Card -->
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">Welcome back.</h1>
            <p class="auth-subtitle">Continue building your workspace.</p>
          </div>

          <div id="auth-alert" style="display: none;"></div>

          <form id="login-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="login-email" class="form-label">Email</label>
              <div class="form-input-wrap">
                <input 
                  type="email" 
                  id="login-email" 
                  class="form-input" 
                  placeholder="name@example.com" 
                  autocomplete="email"
                  required 
                />
              </div>
              <div id="email-error" class="form-inline-error" style="display: none;"></div>
            </div>

            <div class="form-group">
              <div class="form-label">
                <label for="login-password">Password</label>
                <a href="#" id="btn-forgot-password">Forgot password?</a>
              </div>
              <div class="form-input-wrap">
                <input 
                  type="password" 
                  id="login-password" 
                  class="form-input" 
                  placeholder="••••••••" 
                  autocomplete="current-password"
                  required 
                />
              </div>
              <div id="password-error" class="form-inline-error" style="display: none;"></div>
            </div>

            <button type="submit" id="btn-login-submit" class="btn-auth-submit">
              <span>Sign In</span>
            </button>
          </form>

          <div class="auth-divider">or</div>

          <div class="auth-social-buttons">
            <button type="button" id="btn-google-auth" class="btn-auth-social">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button type="button" id="btn-demo-auth" class="btn-auth-social btn-auth-demo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Explore Demo Workspace <span class="demo-badge-pill">Instant</span></span>
            </button>
          </div>

          <div class="auth-footer">
            <span>New to AURA?</span>
            <a href="/signup">Create an account</a>
          </div>
        </div>

        <p class="auth-prototype-note">
          Prototype Mode: Accounts are securely simulated locally for evaluation. No credentials leave your device.
        </p>
      </div>
    </div>
  `;
}

export function initLoginPage() {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const submitBtn = document.getElementById('btn-login-submit');
  const alertEl = document.getElementById('auth-alert');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const demoBtn = document.getElementById('btn-demo-auth');
  const googleBtn = document.getElementById('btn-google-auth');
  const forgotBtn = document.getElementById('btn-forgot-password');

  function showAlert(msg, isError = true) {
    if (!alertEl) return;
    alertEl.className = isError ? 'auth-alert auth-alert-error' : 'auth-alert auth-alert-success';
    alertEl.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${isError 
          ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' 
          : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'}
      </svg>
      <span>${msg}</span>
    `;
    alertEl.style.display = 'flex';
  }

  function clearAlerts() {
    if (alertEl) alertEl.style.display = 'none';
    if (emailError) { emailError.style.display = 'none'; emailError.textContent = ''; }
    if (passwordError) { passwordError.style.display = 'none'; passwordError.textContent = ''; }
    if (emailInput) emailInput.classList.remove('input-error');
    if (passwordInput) passwordInput.classList.remove('input-error');
  }

  // Handle Form Submission (async — signIn is async/await)
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlerts();

    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';

    let hasError = false;
    if (!email) {
      if (emailError) { emailError.textContent = 'Please enter your email.'; emailError.style.display = 'block'; }
      emailInput?.classList.add('input-error');
      hasError = true;
    }
    if (!password) {
      if (passwordError) { passwordError.textContent = 'Please enter your password.'; passwordError.style.display = 'block'; }
      passwordInput?.classList.add('input-error');
      hasError = true;
    }

    if (hasError) return;

    // Loading State
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="auth-spinner"></div><span>Signing In...</span>';
    }

    try {
      const res = await signIn({ email, password });

      if (res.error) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Sign In</span>';
        }
        showAlert(res.error, true);
        return;
      }

      // Check profile & onboarding status
      let profile = loadProfile(res.user.id);
      if (!profile) {
        profile = createProfile(res.user);
      }

      showAlert('Signed in successfully. Opening AURA...', false);

      setTimeout(() => {
        if (!res.user.onboardingCompleted && !profile.onboardingCompleted) {
          navigate('/onboarding');
        } else {
          navigate('/');
        }
      }, 350);
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In</span>';
      }
      showAlert(err.message || 'Sign in failed. Please try again.', true);
    }
  });

  // Handle Demo Mode (async — signInAsDemo is async)
  demoBtn?.addEventListener('click', async () => {
    clearAlerts();
    demoBtn.disabled = true;
    demoBtn.innerHTML = '<div class="auth-spinner" style="border-top-color: var(--accent-cyan);"></div><span>Preparing Demo...</span>';

    try {
      const res = await signInAsDemo();
      let profile = loadProfile(res.user.id);
      if (!profile) {
        profile = createProfile(res.user);
      }

      showAlert('Welcome to AURA Demo Mode.', false);
      setTimeout(() => {
        if (!profile.onboardingCompleted) {
          navigate('/onboarding');
        } else {
          navigate('/');
        }
      }, 400);
    } catch (err) {
      demoBtn.disabled = false;
      demoBtn.innerHTML = '<span>Explore Demo Workspace</span>';
      showAlert('Failed to start demo. Please try again.', true);
    }
  });

  // Simulated Google Auth
  googleBtn?.addEventListener('click', () => {
    showAlert('Google OAuth simulation: signing in as Google user...', false);
    setTimeout(() => {
      const demoUser = {
        name: 'Google User',
        email: 'alex@google.workspace',
        password: 'password123',
        confirmPassword: 'password123'
      };
      // Try sign in or sign up
      let res = signIn({ email: demoUser.email, password: demoUser.password });
      if (res.error) {
        import('../data/authService.js').then(({ signUp }) => {
          const upRes = signUp(demoUser);
          if (upRes.user) {
            createProfile(upRes.user);
            navigate('/onboarding');
          }
        });
      } else {
        navigate('/');
      }
    }, 600);
  });

  // Forgot password — real Supabase reset email flow
  forgotBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    const emailVal = emailInput?.value.trim() || '';
    if (!emailVal || !emailVal.includes('@')) {
      if (emailInput) { emailInput.classList.add('input-error'); emailInput.focus(); }
      if (emailError) { emailError.textContent = 'Enter your email above first.'; emailError.style.display = 'block'; }
      return;
    }

    forgotBtn.style.pointerEvents = 'none';
    forgotBtn.style.opacity = '0.6';

    try {
      const { supabase, isSupabaseConfigured } = await import('../data/supabaseClient.js');
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(emailVal, {
          redirectTo: `${window.location.origin}/login`
        });
        if (error) throw error;
        showAlert('Password reset email sent. Check your inbox.', false);
      } else {
        showAlert('Password reset email sent to ' + emailVal + ' (simulated in local mode).', false);
      }
    } catch (err) {
      showAlert(err.message || 'Failed to send reset email. Please try again.', true);
    } finally {
      forgotBtn.style.pointerEvents = '';
      forgotBtn.style.opacity = '';
    }
  });

  return () => {
    // Cleanup if needed
  };
}

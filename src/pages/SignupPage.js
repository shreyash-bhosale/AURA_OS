/**
 * AURA — Sign Up Page
 * Elegant account creation with real-time validation and seamless onboarding transition.
 */

import { signUp, signInAsDemo } from '../data/authService.js';
import { createProfile } from '../data/userProfile.js';
import { navigate } from '../router.js';

export function renderSignupPage() {
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
            <h1 class="auth-title">Create your AURA.</h1>
            <p class="auth-subtitle">Your personal workspace starts here.</p>
          </div>

          <div id="auth-alert" style="display: none;"></div>

          <form id="signup-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="signup-name" class="form-label">Full Name</label>
              <div class="form-input-wrap">
                <input 
                  type="text" 
                  id="signup-name" 
                  class="form-input" 
                  placeholder="Alex Chen" 
                  autocomplete="name"
                  required 
                />
              </div>
              <div id="name-error" class="form-inline-error" style="display: none;"></div>
            </div>

            <div class="form-group">
              <label for="signup-email" class="form-label">Email</label>
              <div class="form-input-wrap">
                <input 
                  type="email" 
                  id="signup-email" 
                  class="form-input" 
                  placeholder="alex@example.com" 
                  autocomplete="email"
                  required 
                />
              </div>
              <div id="email-error" class="form-inline-error" style="display: none;"></div>
            </div>

            <div class="form-group">
              <label for="signup-password" class="form-label">Password</label>
              <div class="form-input-wrap">
                <input 
                  type="password" 
                  id="signup-password" 
                  class="form-input" 
                  placeholder="At least 8 characters" 
                  autocomplete="new-password"
                  required 
                />
              </div>
              <div id="password-error" class="form-inline-error" style="display: none;"></div>
            </div>

            <div class="form-group">
              <label for="signup-confirm-password" class="form-label">Confirm Password</label>
              <div class="form-input-wrap">
                <input 
                  type="password" 
                  id="signup-confirm-password" 
                  class="form-input" 
                  placeholder="Re-enter password" 
                  autocomplete="new-password"
                  required 
                />
              </div>
              <div id="confirm-error" class="form-inline-error" style="display: none;"></div>
            </div>

            <label class="form-checkbox-label">
              <input type="checkbox" id="signup-terms" class="form-checkbox" required />
              <span>I agree to the <a href="#" id="terms-link">Terms of Service</a> and <a href="#" id="privacy-link">Privacy Policy</a></span>
            </label>
            <div id="terms-error" class="form-inline-error" style="display: none;"></div>

            <button type="submit" id="btn-signup-submit" class="btn-auth-submit">
              <span>Create Account</span>
            </button>
          </form>

          <div class="auth-divider">or</div>

          <div class="auth-social-buttons">
            <button type="button" id="btn-demo-auth" class="btn-auth-social btn-auth-demo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Instant Demo Account <span class="demo-badge-pill">Skip Sign Up</span></span>
            </button>
          </div>

          <div class="auth-footer">
            <span>Already have an account?</span>
            <a href="/login">Sign In</a>
          </div>
        </div>

        <p class="auth-prototype-note">
          Your workspace data is stored privately on your device.
        </p>
      </div>
    </div>
  `;
}

export function initSignupPage() {
  const form = document.getElementById('signup-form');
  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const confirmInput = document.getElementById('signup-confirm-password');
  const termsCheckbox = document.getElementById('signup-terms');
  const submitBtn = document.getElementById('btn-signup-submit');
  const alertEl = document.getElementById('auth-alert');
  const demoBtn = document.getElementById('btn-demo-auth');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const confirmError = document.getElementById('confirm-error');
  const termsError = document.getElementById('terms-error');

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
    [nameError, emailError, passwordError, confirmError, termsError].forEach(el => {
      if (el) { el.style.display = 'none'; el.textContent = ''; }
    });
    [nameInput, emailInput, passwordInput, confirmInput].forEach(inp => {
      if (inp) inp.classList.remove('input-error');
    });
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlerts();

    const name = nameInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';
    const confirmPassword = confirmInput?.value || '';
    const agreed = termsCheckbox?.checked;

    let hasError = false;

    if (!name) {
      if (nameError) { nameError.textContent = 'Please enter your name.'; nameError.style.display = 'block'; }
      nameInput?.classList.add('input-error');
      hasError = true;
    }

    if (!email) {
      if (emailError) { emailError.textContent = 'Please enter your email.'; emailError.style.display = 'block'; }
      emailInput?.classList.add('input-error');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (emailError) { emailError.textContent = 'Please enter a valid email format.'; emailError.style.display = 'block'; }
      emailInput?.classList.add('input-error');
      hasError = true;
    }

    if (!password) {
      if (passwordError) { passwordError.textContent = 'Please choose a password.'; passwordError.style.display = 'block'; }
      passwordInput?.classList.add('input-error');
      hasError = true;
    } else if (password.length < 8) {
      if (passwordError) { passwordError.textContent = 'Password must be at least 8 characters.'; passwordError.style.display = 'block'; }
      passwordInput?.classList.add('input-error');
      hasError = true;
    }

    if (password !== confirmPassword) {
      if (confirmError) { confirmError.textContent = 'Passwords do not match.'; confirmError.style.display = 'block'; }
      confirmInput?.classList.add('input-error');
      hasError = true;
    }

    if (!agreed) {
      if (termsError) { termsError.textContent = 'Please agree to the Terms and Privacy Policy.'; termsError.style.display = 'block'; }
      hasError = true;
    }

    if (hasError) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="auth-spinner"></div><span>Creating Account...</span>';
    }

    try {
      const res = await signUp({ name, email, password, confirmPassword });

      if (res.error) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Create Account</span>';
        }
        showAlert(res.error, true);
        return;
      }

      // Initialize fresh user profile
      createProfile(res.user);

      showAlert('Account created! Preparing your personalized onboarding...', false);

      setTimeout(() => {
        navigate('/onboarding');
      }, 400);
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Create Account</span>';
      }
      showAlert(err.message || 'Account creation failed. Please try again.', true);
    }
  });

  // Demo shortcut button (async — signInAsDemo is async)
  demoBtn?.addEventListener('click', async () => {
    clearAlerts();
    demoBtn.disabled = true;
    demoBtn.innerHTML = '<div class="auth-spinner" style="border-top-color: var(--accent-cyan);"></div><span>Preparing Demo...</span>';

    try {
      const res = await signInAsDemo();
      createProfile(res.user);
      navigate('/onboarding');
    } catch (err) {
      demoBtn.disabled = false;
      demoBtn.innerHTML = '<span>Explore Demo Workspace</span>';
      showAlert(err.message || 'Failed to start demo.', true);
    }
  });

  return () => {};
}

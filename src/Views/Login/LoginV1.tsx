import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import brandLogo from '../../assets/SizeWellIcon/SZC22_Primary Logo_Print-nostrap.png';
import heroImage from '../../assets/Login/sizewellLoginV1.png';
import './LoginV1.scss';

function LoginV1() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <main className="lv1-page">
      <section
        className="lv1-visual"
        aria-label="Sizewell C visual"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <button
          type="button"
          className="lv1-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back
        </button>

        <div className="lv1-sheen" />

        <div className="lv1-forecast-lines" aria-hidden="true">
          <svg viewBox="0 0 620 250" preserveAspectRatio="none">
            <path
              className="lv1-line-secondary"
              d="M0,185 C60,140 110,210 170,160 C245,92 310,122 380,75 C455,26 515,62 620,20"
            />
            <path
              className="lv1-line-main"
              d="M0,198 C42,175 75,182 118,206 C178,240 230,184 282,150 C335,116 378,137 416,91 C455,48 494,58 535,78 C570,94 594,62 620,38"
            />
            <circle className="lv1-dot" cx="282" cy="150" r="6" />
            <circle className="lv1-dot lv1-dot--d2" cx="416" cy="91" r="6" />
            <circle className="lv1-dot lv1-dot--d3" cx="535" cy="78" r="6" />
            <circle className="lv1-dot lv1-dot--d4" cx="620" cy="38" r="6" />
          </svg>
          <div className="lv1-tracking-dot" />
        </div>

        <div className="lv1-pulse" />

        <div className="lv1-particles" aria-hidden="true">
          <span className="lv1-particle" />
          <span className="lv1-particle lv1-particle--2" />
          <span className="lv1-particle lv1-particle--3" />
          <span className="lv1-particle lv1-particle--4" />
          <span className="lv1-particle lv1-particle--5" />
        </div>

        <div className="lv1-visual-brand">
          <img src={brandLogo} alt="Sizewell C" />
          <p>Forecasting Portal</p>
        </div>
      </section>

      <section className="lv1-form-panel">
        <form className="lv1-card" onSubmit={e => e.preventDefault()}>
          <div className="lv1-eyebrow">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 18V9M9 18V5M14 18v-7M19 18V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Operational Forecasting
          </div>

          <h1>Welcome Back</h1>
          <p className="lv1-subtitle">Sign in to access the Sizewell C Forecasting Portal.</p>

          <div className="lv1-field-group">
            <div className="lv1-field-row">
              <label htmlFor="lv1-email">Email or Username</label>
            </div>
            <div className="lv1-input-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                id="lv1-email"
                name="email"
                type="email"
                placeholder="e.g. john.doe@sizewellc.com"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="lv1-field-group">
            <div className="lv1-field-row">
              <label htmlFor="lv1-password">Password</label>
              <a href="#">Forgot password?</a>
            </div>
            <div className="lv1-input-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <input
                id="lv1-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                className="lv1-pw-toggle"
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(p => !p)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

          <label className="lv1-options" htmlFor="lv1-remember">
            <input id="lv1-remember" name="remember" type="checkbox" />
            Keep me logged in
          </label>

          <button className="lv1-submit" type="submit">
            <span className="lv1-btn-content">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              Log in to portal
            </span>
          </button>

          <div className="lv1-secure">
            <div className="lv1-secure-line">Secure access</div>
            <div className="lv1-secure-note">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3 20 6v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3Z" stroke="currentColor" strokeWidth="2" />
                <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Your connection is secure and encrypted
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

export default LoginV1;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import brandLogo from '../../assets/SizeWellIcon/SZC22_Primary Logo_Print-nostrap.png';
import './LoginV4.scss';

const HERO_VIDEO = 'https://www.sizewellc.com/wp-content/uploads/2026/03/UpdatedHomePage_NoDrone_v02_1500kbps.mp4';

function LoginV4() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <main className="lv4-page">
      <video className="lv4-video" src={HERO_VIDEO} autoPlay muted loop playsInline />
      <div className="lv4-overlay" />

      <button type="button" className="lv4-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        Back
      </button>

      <div className="lv4-brand">
        <img src={brandLogo} alt="Sizewell C" />
        <p>Forecasting Portal</p>
      </div>

      <div className="lv4-glass-card">
        <form className="lv4-form" onSubmit={e => e.preventDefault()}>
          <div className="lv4-eyebrow">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 18V9M9 18V5M14 18v-7M19 18V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Operational Forecasting
          </div>

          <h1>Welcome Back</h1>
          <p className="lv4-subtitle">Sign in to access the Sizewell C Forecasting Portal.</p>

          <div className="lv4-field-group">
            <div className="lv4-field-row"><label htmlFor="lv4-email">Email or Username</label></div>
            <div className="lv4-input-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input id="lv4-email" name="email" type="email" placeholder="e.g. john.doe@sizewellc.com" autoComplete="username" />
            </div>
          </div>

          <div className="lv4-field-group">
            <div className="lv4-field-row">
              <label htmlFor="lv4-password">Password</label>
              <a href="#">Forgot password?</a>
            </div>
            <div className="lv4-input-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <input id="lv4-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" autoComplete="current-password" />
              <button className="lv4-pw-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(p => !p)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

          <label className="lv4-options" htmlFor="lv4-remember">
            <input id="lv4-remember" name="remember" type="checkbox" />
            Keep me logged in
          </label>

          <button className="lv4-submit" type="submit">
            <span className="lv4-btn-content">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              Log in to portal
            </span>
          </button>

          <div className="lv4-secure">
            <div className="lv4-secure-line">Secure access</div>
            <div className="lv4-secure-note">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3 20 6v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3Z" stroke="currentColor" strokeWidth="2" />
                <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Your connection is secure and encrypted
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

export default LoginV4;

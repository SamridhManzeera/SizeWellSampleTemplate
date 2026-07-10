import { useState, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import brandLogo from '../../assets/SizeWellIcon/SZC22_Primary Logo_Print-nostrap.png';
import { useLoginMutation } from '../../Services/Api/module/authApi';
import { updateAuthTokenRedux } from '../../Store/Common';
import { ROUTES } from '../../Shared/Constants';
import './Login.scss';

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 6.6C4 8.3 2 11 2 11s3.5 6 10 6c1.2 0 2.3-.2 3.3-.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const { token } = await login({ email, password }).unwrap();
      dispatch(updateAuthTokenRedux({ token }));
      navigate(ROUTES.HOMEPAGE);
    } catch {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <img className="login-logo" src={brandLogo} alt="Sizewell C" />
        <h1>Sign in</h1>
        <p className="login-subtitle">
          Enter your credentials to access the portal.
        </p>

        <div className="login-field">
          <label htmlFor="login-email">
            Username
            <input
              id="login-email"
              name="email"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="login-field">
          <label htmlFor="login-password">
            Password
            <div className="login-password-box">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </label>
        </div>

        {error && <p className="login-error">{error}</p>}

        <button className="login-submit" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

export default Login;

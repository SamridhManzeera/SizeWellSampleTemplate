import { useState, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import brandLogo from '../../assets/SizeWellIcon/SZC22_Primary Logo_Print-nostrap.png';
import { useLoginMutation } from '../../Services/Api/module/authApi';
import { updateAuthTokenRedux } from '../../Store/Common';
import { ROUTES } from '../../Shared/Constants';
import './Login.scss';

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
            Email
            <input
              id="login-email"
              name="email"
              type="email"
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
                {showPassword ? 'Hide' : 'Show'}
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

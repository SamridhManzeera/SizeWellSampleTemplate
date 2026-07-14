function ProfileHero() {
  return (
    <div className="pf__hero-wrap">
      <div className="pf__hero">
        <svg
          className="pf__hero-wave"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M320,190 C500,70 650,60 750,120 C830,165 900,150 1000,110"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M340,215 C520,100 670,90 770,145 C840,185 905,175 1000,140"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M360,240 C540,130 690,120 790,170 C850,210 910,200 1000,170"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        <div className="pf__hero-left">
          <div>
            <span className="pf__hero-eyebrow">Settings</span>
            <h1 className="pf__hero-title">Profile</h1>
            <p className="pf__hero-sub">
              Manage your personal information, security settings, and
              notification preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHero;

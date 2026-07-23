import { ReactNode } from 'react';
import './PageHero.scss';

interface PageHeroProps {
  icon: ReactNode | null;
  title: ReactNode;
  subtitle: string;
  eyebrow: string | null;
  actions: ReactNode;
  backAction?: { label: ReactNode; onClick: () => void };
}

function PageHero({
  icon,
  title,
  subtitle,
  eyebrow,
  actions,
  backAction,
}: PageHeroProps) {
  return (
    <div className="page-hero-wrap">
      <div className="page-hero">
        <svg
          className="page-hero__wave"
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

        {backAction && (
          <button
            type="button"
            className="page-hero__back"
            onClick={backAction.onClick}
          >
            {backAction.label}
          </button>
        )}

        <div className="page-hero__main">
          <div className="page-hero__left">
            {icon && <div className="page-hero__icon">{icon}</div>}
            <div>
              {eyebrow && <span className="page-hero__eyebrow">{eyebrow}</span>}
              <h1 className="page-hero__title">{title}</h1>
              <p className="page-hero__sub">{subtitle}</p>
            </div>
          </div>

          {actions && <div className="page-hero__actions">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export default PageHero;

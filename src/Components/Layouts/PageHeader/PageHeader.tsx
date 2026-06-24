import sizewellLogo from '../../../assets/SizewellIcon/SZC-nostrap-white.png';
import { HamburgerButton } from '../Sidebar/Sidebar';
import './PageHeader.scss';

interface PageHeaderProps {
  right?: React.ReactNode;
}

function PageHeader({ right }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header__left">
        <HamburgerButton />
        <img src={sizewellLogo} alt="Sizewell C" className="page-header__logo" />
      </div>
      {right && <div className="page-header__right">{right}</div>}
    </div>
  );
}

export default PageHeader;

import { MoveUpRight } from 'lucide-react';
import BrandMark from '@/components/BrandMark';

function SiteHeader() {
  return (
    <header className="site-header site-shell">
      <BrandMark />
      <div className="header-note">
        <span className="status-dot" /> SOUTHERN CALIFORNIA, BY ROAD
      </div>
      <a className="about-link" href="#about" data-testid="link-about">
        THE IDEA <MoveUpRight size={13} strokeWidth={1.6} />
      </a>
    </header>
  );
}

export default SiteHeader;

import BrandMark from '@/components/BrandMark';
import DrivePlanner from '@/components/DrivePlanner';
import MapPlaceholder from '@/components/MapPlaceholder';
import PurposeIntro from '@/components/PurposeIntro';
import SiteHeader from '@/components/SiteHeader';

function HomePage() {
  return (
    <main className="page">
      <SiteHeader />
      <section className="hero site-shell">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-rule" /> A BETTER KIND OF DETOUR
          </p>
          <h1>
            Take the long
            <br />
            way <i>home.</i>
          </h1>
          <p className="hero-description">
            Good roads are out there. Sunday Drive helps you find the ones worth
            taking, from a quick escape to a whole day off course.
          </p>
          <DrivePlanner />
        </div>
        <MapPlaceholder />
        <div className="hero-side-note">
          THE SCENIC ROUTE IS NEVER THE WRONG ONE <span>—</span>
        </div>
      </section>
      <PurposeIntro />
      <footer className="site-footer site-shell">
        <BrandMark />
        <span>MADE FOR THE MILES BETWEEN</span>
        <span>LOS ANGELES, CALIFORNIA &nbsp; · &nbsp; 2026</span>
      </footer>
    </main>
  );
}

export default HomePage;

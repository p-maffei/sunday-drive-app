import { Compass } from 'lucide-react';

function PurposeIntro() {
  return (
    <section className="about-section" id="about" data-testid="section-about">
      <div className="site-shell about-inner">
        <div className="about-index">
          01 <span>/</span> THE REASON
        </div>
        <p>
          Made for the moments between <i>here</i> and <i>there.</i>
        </p>
        <div className="about-copy">
          <span className="about-rule" />
          <p>
            Sunday Drive is a little tool for getting out of your routine. Tell
            us where you’re starting, how long you have, and we’ll help you make
            a day of the drive.
          </p>
        </div>
        <div className="about-signoff">
          <Compass size={15} strokeWidth={1.4} /> THE ROAD IS THE PLAN
        </div>
      </div>
    </section>
  );
}

export default PurposeIntro;

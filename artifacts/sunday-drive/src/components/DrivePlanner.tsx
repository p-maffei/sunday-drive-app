import { useState, type FormEvent } from 'react';
import { ArrowDownRight, ArrowUpRight, MapPin } from 'lucide-react';

function DrivePlanner() {
  // React state keeps each controlled input's value in sync with the form.
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(2);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Prevent a page reload; route discovery will be added in a later milestone.
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form className="planner" onSubmit={handleSubmit} data-testid="form-drive-planner">
      <div className="field-block">
        <label className="field-label" htmlFor="start-location">
          <span>01</span> STARTING NEAR
        </label>
        <div className="input-wrap">
          <MapPin
            className="input-icon"
            size={17}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            id="start-location"
            type="text"
            value={start}
            onChange={(event) => {
              setStart(event.target.value);
              setSubmitted(false);
            }}
            placeholder="City, neighborhood, or zip"
            autoComplete="address-level2"
            data-testid="input-start-location"
          />
        </div>
      </div>

      <div className="field-block">
        <label className="field-label" htmlFor="destination">
          <span>02</span> HEADED TOWARD <em>OPTIONAL</em>
        </label>
        <div className="input-wrap">
          <ArrowDownRight
            className="input-icon"
            size={17}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(event) => {
              setDestination(event.target.value);
              setSubmitted(false);
            }}
            placeholder="Somewhere on the horizon"
            data-testid="input-destination"
          />
        </div>
      </div>

      <div className="duration-block">
        <div className="duration-heading">
          <label className="field-label" htmlFor="drive-duration">
            <span>03</span> TIME TO WANDER
          </label>
          <output
            className="duration-value"
            htmlFor="drive-duration"
            data-testid="text-drive-duration"
          >
            {duration} <span>{duration === 1 ? 'HOUR' : 'HOURS'}</span>
          </output>
        </div>
        <input
          id="drive-duration"
          className="duration-range"
          type="range"
          min="1"
          max="6"
          step="1"
          value={duration}
          onChange={(event) => {
            setDuration(Number(event.target.value));
            setSubmitted(false);
          }}
          aria-label="Driving duration in hours"
          data-testid="input-drive-duration"
        />
        <div className="range-labels">
          <span>AN EASY AFTERNOON</span>
          <span>ALL DAY OUT</span>
        </div>
      </div>

      <button
        className="submit-button"
        type="submit"
        data-testid="button-find-drive"
      >
        <span>Find My Drive</span>
        <ArrowUpRight size={18} strokeWidth={1.6} />
      </button>
      <p className="form-footnote">
        No itinerary yet. Just a direction and a little daylight.
      </p>
      {submitted && (
        <p
          className="form-message"
          role="status"
          aria-live="polite"
          data-testid="status-route-discovery"
        >
          Route discovery is planned for a later milestone. This planner is a
          preview for now.
        </p>
      )}
    </form>
  );
}

export default DrivePlanner;

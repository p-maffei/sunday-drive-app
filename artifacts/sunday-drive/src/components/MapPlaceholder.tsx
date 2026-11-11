import { useState } from 'react';
import { ArrowUpRight, MapPin, Minus, Plus } from 'lucide-react';

function MapPlaceholder() {
  const [zoomLevel, setZoomLevel] = useState(0);
  const mapZoom = 1 + zoomLevel * 0.08;

  return (
    <section
      className="map-panel"
      aria-label="Illustrated Southern California map placeholder"
      data-testid="map-placeholder"
    >
      <div className="map-grid map-art">
        <div
          className="map-illustration"
          style={{ transform: `scale(${mapZoom})` }}
        >
          <div className="map-contour map-layer" />
          <svg
            className="map-roads"
            viewBox="0 0 1000 700"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className="road-secondary"
              d="M-40 544C100 505 154 443 257 429s152 38 247-5 91-132 184-166 177-31 352-116"
            />
            <path
              className="road-secondary"
              d="M139-25c60 113 78 178 48 266s-9 167 70 232 93 111 90 253"
            />
            <path
              className="road-secondary"
              d="M562-16c-27 98-29 159 24 213s83 135 60 205 2 159 114 317"
            />
            <path
              className="road-main-under"
              d="M40 637c115-104 189-192 261-193s129 83 207 41 92-183 185-225 184-75 272-164"
            />
            <path
              className="road-main"
              d="M40 637c115-104 189-192 261-193s129 83 207 41 92-183 185-225 184-75 272-164"
            />
            <path
              className="road-dash"
              d="M40 637c115-104 189-192 261-193s129 83 207 41 92-183 185-225 184-75 272-164"
            />
            <path
              className="coastline"
              d="M-14 115c81 73 64 131 119 193s35 126 95 190 58 129 103 208 78 88 71 121"
            />
          </svg>
          <div className="map-label label-pasadena">PASADENA</div>
          <div className="map-label label-angeles">ANGELES NATIONAL FOREST</div>
          <div className="map-label label-coast">PACIFIC OCEAN</div>
          <div className="map-label label-ridge">SAN GABRIEL MOUNTAINS</div>
          <div className="map-road-label">ANGELES CREST HWY</div>
          <div className="map-compass" aria-label="North">
            <span>N</span>
            <ArrowUpRight size={14} strokeWidth={1.4} />
          </div>
          <div className="map-scale">
            <span /> 10 MI
          </div>
          <div className="map-coordinate">34°12′ N&nbsp; / &nbsp;118°10′ W</div>
          <div className="map-pin pin-one">
            <MapPin size={16} />
            <span>THE OPEN ROAD</span>
          </div>
          <div className="map-pin pin-two">
            <span className="pin-small" />
          </div>
          <div className="map-caption">A PLACE TO BEGIN</div>
        </div>

        <div className="map-controls" aria-label="Map preview controls">
          <button
            type="button"
            aria-label="Zoom in on map preview"
            onClick={() => setZoomLevel((level) => Math.min(level + 1, 4))}
            disabled={zoomLevel === 4}
            data-testid="button-map-zoom-in"
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            aria-label="Zoom out on map preview"
            onClick={() => setZoomLevel((level) => Math.max(level - 1, 0))}
            disabled={zoomLevel === 0}
            data-testid="button-map-zoom-out"
          >
            <Minus size={15} />
          </button>
        </div>
      </div>
      <div className="map-footer">
        <span>
          <span className="map-live-dot" /> A LITTLE ROOM TO ROAM
        </span>
        <span>34° 12′ 08″ N &nbsp; 118° 10′ 21″ W</span>
      </div>
    </section>
  );
}

export default MapPlaceholder;

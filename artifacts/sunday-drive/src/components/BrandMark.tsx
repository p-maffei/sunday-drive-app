function BrandMark() {
  return (
    <a
      className="brand"
      href="/"
      aria-label="Sunday Drive home"
      data-testid="link-home"
    >
      <span className="brand-symbol" aria-hidden="true">
        <svg viewBox="0 0 40 28" fill="none">
          <path
            d="M4 19.5h32l-2.4-7.3a3.7 3.7 0 0 0-3.5-2.5H12a4.2 4.2 0 0 0-3.8 2.5L4 19.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M7 19.5v3.2h4.2v-3.2m17.6 0v3.2H33v-3.2M11 15h18M15 9.7l2.3-4h5.5l2.4 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12.2" cy="19.5" r="1.2" fill="currentColor" />
          <circle cx="27.8" cy="19.5" r="1.2" fill="currentColor" />
        </svg>
      </span>
      <span className="brand-type">
        SUNDAY <span>DRIVE</span>
      </span>
    </a>
  );
}

export default BrandMark;

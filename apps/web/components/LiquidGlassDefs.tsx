export default function LiquidGlassDefs() {
  return (
    <svg
      className="liquid-filter-defs"
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="fairscore-liquid-glass" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.012"
            numOctaves="2"
            seed="11"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="18s"
              values="0.008 0.012;0.012 0.008;0.008 0.012"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="11"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}

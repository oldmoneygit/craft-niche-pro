export function GridGradientBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: -1,
      }}
    >
      {/* Background Sólido (dark/light) */}
      <div
        className="absolute inset-0 bg-transition"
        style={{
          backgroundColor: 'var(--hub-bg-primary)',
          transition: 'background-color 0.3s ease',
        }}
      />

      {/* Gradient Layer */}
      <div
        className="absolute inset-0 gradient-layer"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent 60%),
            radial-gradient(ellipse 60% 50% at 50% 120%, rgba(139, 92, 246, 0.1), transparent 50%)
          `,
          transition: 'opacity 0.7s ease',
        }}
      />

      {/* Grid Layer */}
      <div
        className="absolute inset-0 grid-layer"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 100% at 50% 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 100% at 50% 0%, black 40%, transparent 100%)',
          transition: 'opacity 0.7s ease',
        }}
      />
    </div>
  );
}

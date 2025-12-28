export default function BackgroundPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, hsl(var(--primary)/0.03 ) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary)/0.03 ) 1px, transparent 1px)",
        backgroundSize: "2rem 2rem",
      }}
    />
  );
}

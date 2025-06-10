export default function ControlButton({ layout, onClick }) {
  return (
    <div
      onClick={onClick}
      className="h-[4dvh] w-[4dvh] flex justify-center items-center text-amber-700"
      style={{ pointerEvents: "auto", zIndex: 20 }}
    >
      <p
        className="text-4xl"
        style={{
          color: "#fef3c7", // amber-100
          WebkitTextStroke: "2px #b45309", // amber-700
          textShadow: "2px 2px 4px rgba(74, 4, 78, 0.4)",
        }}
      >
        {layout}
      </p>
    </div>
  );
}

export default function ToggleCheckbox({ checked, onChange, colors, size }) {
  const defaultSize = 100;
  const scale = size ? size / defaultSize : 1;

  return (
    <button
      onClick={async () => await onChange(checked)}
      className={`rounded-[4rem] relative transition-all border`}
      style={{
        backgroundColor: checked ? colors.bg.yes : colors.bg.no,
        height: `${2.7 * scale}rem`,
        width: `${5 * scale}rem`,
        WebkitTapHighlightColor: "transparent",
        borderColor: checked ? colors.border.yes : colors.border.no,
      }}
    >
      <div
        className={`bg-white rounded-[4rem] absolute transition-all border`}
        style={{
          height: `${2.3 * scale}rem`,
          width: `${2.3 * scale}rem`,
          top: `${0.11 * scale}rem`,
          left: checked ? `${0.11 * scale}rem` : `${2.45 * scale}rem`,
          borderColor: checked ? colors.border.yes : colors.border.no,
          backgroundColor: checked ? colors.border.yes : colors.border.no,
        }}
      />
    </button>
  );
}

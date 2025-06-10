"use client";

export default function Input({
  input,
  openKeyboard,
  active,
  placeholder,
  deactivated,
  outlineColor = { unactive: "#44403c", active: "#b45309" }, // stone-700 amber-700
  backgroundColor = {
    deactivated: "#a8a29e",
    unactive: "#f5f5f4",
    active: "#fef3c7",
  }, // stone-400 stone-100 // amber-100
  placeholderColor = {
    unactive: "#a8a29e",
    active: "#38bdf8",
  }, // stone-400 sky-400
  inputColor = { unactive: "#44403c", active: "#b45309" }, // stone-700 amber-700
  font,
  rounded = "",
  minHeight = "2rem",
}) {
  let bgColor;
  if (deactivated) {
    bgColor = backgroundColor.deactivated;
  } else if (!active) {
    bgColor = backgroundColor.unactive;
  } else {
    bgColor = backgroundColor.active;
  }

  return (
    <div
      onClick={() => !deactivated && openKeyboard()}
      className={`w-full rounded${rounded} flex justify-center items-center relative ${font?.className}`}
      style={{
        backgroundColor: bgColor,
        outlineStyle: outlineColor !== null ? "solid" : "",
        outlineColor: outlineColor
          ? !active
            ? outlineColor.unactive
            : outlineColor.active
          : "",
        minHeight,
      }}
    >
      <span
        className="z-10 p-1 text-amber-700 rounded-full text-center"
        style={{
          backgroundColor: bgColor,
          color: !active ? inputColor.unactive : inputColor.active,
        }}
      >
        {input}
      </span>
      <div
        className="absolute right-0 bottom-0 text-sm z-0 pr-1"
        style={{
          color: !active ? placeholderColor.unactive : placeholderColor.active,
        }}
      >
        {placeholder}
      </div>
    </div>
  );
}

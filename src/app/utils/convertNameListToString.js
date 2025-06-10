export default function convertNameListToString(nameList) {
  return (
    <span>
      {nameList.map((name, i) => (
        <span key={i}>
          {i > 0 ? (i === nameList.length - 1 ? "et " : ", ") : ""}
          <span className="font-semibold">{name}</span>
          &nbsp;
        </span>
      ))}
    </span>
  );
}

const TombstoneIcon = (
  { size = 24, primaryColor = "#030712", secondaryColor = "#6b7280" } // gray-950 gray-500
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    width={size}
    height={size}
  >
    <path
      d="M48 192C48 94.8 126.8 16 224 16s176 78.8 176 176v272H48V192z"
      fill={secondaryColor}
    />
    <path
      d="M400 192v272h16V192C416 86 330 0 224 0S32 86 32 192v272h16V192C48 94.8 126.8 16 224 16s176 78.8 176 176zM8 496c-4.4 0-8 3.6-8 8s3.6 8 8 8h432c4.4 0 8-3.6 8-8s-3.6-8-8-8H8z"
      fill={primaryColor}
    />
  </svg>
);

export default TombstoneIcon;

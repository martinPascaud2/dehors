import { StageItem } from "./StageItem";

export const generatePreview = (props) => {
  const { item, style } = props;
  const newStyle = {
    ...style,
  };

  return (
    <div style={newStyle}>
      <StageItem {...item} />
    </div>
  );
};

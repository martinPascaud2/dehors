import { useRef } from "react";
import { useDrop, useDrag } from "react-dnd";

import { StyledCards } from "./StyledCards";
import useTypes from "./ITEM_TYPES/useTypes";

export const StageItem = ({
  type,
  id,
  index,
  data,
  moveItem,
  isNewItemAdding,
  onNewAddingItemProps,
  onClick,
  gameName,
}) => {
  const itemRef = useRef(null);
  const itemTypes = useTypes({ gameName });

  const [{ handlerId }, drop] = useDrop({
    accept: itemTypes || [],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!itemRef.current && !itemRef.current?.getBoundingClientRect) {
        return;
      }

      const { top, bottom, height } = itemRef.current.getBoundingClientRect();
      const { y } = monitor.getClientOffset();
      const hoverIndex = index;
      const dragIndex = item.index;
      const hoverMiddleY = (bottom - top) / 2;
      const hoverClientY = y - top;

      if (!id || dragIndex === hoverIndex) {
        return;
      }
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      if (!isNewItemAdding) {
        onNewAddingItemProps({ hoveredIndex: hoverIndex });
        moveItem(dragIndex, hoverIndex);
        item.index = hoverIndex;
      } else {
        const belowThreshold = top + height / 2;
        const newShould = y >= belowThreshold;
        onNewAddingItemProps({
          hoveredIndex: hoverIndex,
          shouldAddBelow: newShould,
        });
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: type,
    item: { type: type, id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(itemRef));

  // can be used
  // const opacity = isNewItemAdding && !id ? "0.3" : "1";
  // const border = isSelected ? "3px dashed blue" : "1px solid silver";

  if (!gameName) return;
  return (
    <div>
      {StyledCards[gameName][type]({
        handlerId: handlerId,
        ref: itemRef,
        onClick,
        data,
      })}
    </div>
  );
};

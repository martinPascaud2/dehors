import { useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";

import { StyledCards } from "./StyledCards";
import useTypes from "./ITEM_TYPES/useTypes";

export const HandCard = ({
  index,
  itemType,
  data,
  onClick,
  onNewItemAdding,
  moveCard,
  gameName,
}) => {
  const cardRef = useRef(null);
  const itemTypes = useTypes({ gameName });

  const [collected, drop] = useDrop({
    accept: itemTypes || [],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!cardRef.current && !cardRef.current?.getBoundingClientRect) {
        return;
      }

      //   const { top, bottom, height } = cardRef.current.getBoundingClientRect();
      //   const { y } = monitor.getClientOffset();
      //   const hoverMiddleY = (bottom - top) / 2;
      //   const hoverClientY = y - top;

      const hoverIndex = index;
      const dragIndex = item.index;

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, dragRef] = useDrag({
    type: itemType,
    item: { type: itemType, data, gameName, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    onNewItemAdding(isDragging);
  }, [isDragging, onNewItemAdding]);

  dragRef(drop(cardRef));

  return (
    <div>
      {StyledCards[gameName][itemType]({
        ref: cardRef,
        index,
        handlerId: collected.handlerId,
        onClick,
        data,
      })}
    </div>
  );
};

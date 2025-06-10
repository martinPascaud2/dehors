import { useState, useCallback, useEffect, useMemo } from "react";
import { useDrop } from "react-dnd";
import isEqual from "lodash.isequal";
import update from "immutability-helper";

import { StageItem } from "./StageItem";
import useTypes from "./ITEM_TYPES/useTypes";

export const Stage = ({
  items,
  setItems,
  addNewItem,
  isNewItemAdding,
  setSelectedItem,
  selectedItem,
  gameName,
}) => {
  const itemTypes = useTypes({ gameName });
  const [stageItems, setStageItems] = useState(items);
  const [newAddingItemProps, setNewAddingItemProps] = useState({
    hoveredIndex: 0,
    shouldAddBelow: false,
  });
  const { hoveredIndex, shouldAddBelow } = newAddingItemProps;

  const handleNewAddingItemPropsChange = useCallback(
    (updatedProps) => {
      setNewAddingItemProps({
        ...newAddingItemProps,
        ...updatedProps,
      });
    },
    [setNewAddingItemProps]
  );

  useEffect(() => {
    if (!isEqual(stageItems, items)) {
      setStageItems(items.filter((item) => item !== undefined));
    }
    //   }, [items, stageItems]);
  }, [items]); //check

  const moveItem = useCallback(
    (dragIndex, hoverIndex) => {
      const dragItem = stageItems[dragIndex];
      setItems(
        update(stageItems, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragItem],
          ],
        })
      );
    },
    [stageItems, setStageItems]
  );

  const memoItems = useMemo(() => {
    return stageItems?.map((item, index) => {
      if (!item) return; //check
      const { id, type, data, gameName } = item;
      if (!type) return; //check
      return (
        <StageItem
          id={id}
          key={index}
          index={index}
          type={type}
          data={data}
          moveItem={moveItem}
          isNewItemAdding={isNewItemAdding}
          onNewAddingItemProps={handleNewAddingItemPropsChange}
          onClick={() => setSelectedItem({ id: id, index: index })}
          gameName={gameName}
          // isSelected={!!id && id === selectedItem?.id} //can be used
        />
      );
    });
  }, [
    stageItems,
    moveItem,
    selectedItem,
    setSelectedItem,
    isNewItemAdding,
    handleNewAddingItemPropsChange,
  ]);

  const [{ isOver, draggingItemType }, dropRef] = useDrop({
    accept: itemTypes || [],
    drop: (droppedItem) => {
      const { id, type, data, gameName, index } = droppedItem;
      if (!id) {
        addNewItem(type, data, gameName, hoveredIndex, shouldAddBelow, index);
      } else {
        setItems(stageItems);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      draggingItemType: monitor.getItemType(),
    }),
  });

  useEffect(() => {
    if (isNewItemAdding) {
      const _stageItems = stageItems.filter((item) => item && item.id);
      const startIndex = shouldAddBelow ? hoveredIndex + 1 : hoveredIndex;
      if (isOver && isNewItemAdding) {
        setStageItems([
          ..._stageItems.slice(0, startIndex),
          {
            type: draggingItemType,
          },
          ..._stageItems.slice(startIndex),
        ]);
      } else {
        setStageItems(_stageItems);
      }
    }
  }, [isOver, draggingItemType, isNewItemAdding, shouldAddBelow, hoveredIndex]);

  return (
    <div
      ref={dropRef}
      style={{
        width: "100%",
        height: "auto",
        overflowY: "auto",
        padding: "10px",
        border: "1px solid silver",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {memoItems}
    </div>
  );
};

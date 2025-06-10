import { useState, useCallback, useEffect } from "react";

import { Hand } from "./Hand";
import { Stage } from "./Stage";

export const DND = ({
  items,
  setItems,
  setGamerItems,
  oneShot = true,
  newHCs,
  setNewHCs,
  maxStageCards,
  gameName,
  isLocked,
  checkIsAllowed,
  onNewItems,
  newHand,
  setNewHand,
  dataGamerCards,
}) => {
  const [handItems, setHandItems] = useState([]);
  const [isNewItemAdding, setNewItemAdding] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  const handleAddNewItem = useCallback(
    (
      type,
      data,
      gameName,
      hoveredIndex = items.length,
      shouldAddBelow = true,
      dragIndex
    ) => {
      if (
        isLocked ||
        !checkIsAllowed({ itemType: type, itemData: data, handItems }) ||
        !items // check
      )
        return;
      const startIndex = shouldAddBelow ? hoveredIndex + 1 : hoveredIndex;

      const maxId = items.reduce(
        (max, obj) => (obj.id > max ? obj.id : max),
        0
      );
      let newItems = [
        ...items.slice(0, startIndex),
        { id: maxId + 1, type: type, data, gameName },
        ...items.slice(startIndex),
      ];
      if (maxStageCards) {
        newItems = newItems.sort((a, b) => b.id - a.id).slice(0, maxStageCards);
      }

      setItems(newItems);
      onNewItems(newItems);
      setSelectedItem({
        id: maxId + 1,
        index: startIndex,
      });

      oneShot &&
        setHandItems((prevHandItems) =>
          prevHandItems.filter((_, index) => index !== dragIndex)
        );
    },
    [items, onNewItems]
  );

  const MemoHand = useCallback(() => {
    let HI;
    if (newHand) {
      HI = [];
    } else {
      HI = handItems;
    }
    if (newHCs) {
      HI = [...HI, ...newHCs];
    }

    return (
      <Hand
        addNewItem={handleAddNewItem}
        onNewItemAdding={setNewItemAdding}
        selectedItem={selectedItem}
        gamerItems={HI}
        setHandItems={setHandItems}
      />
    );
  }, [handleAddNewItem, selectedItem, newHCs]);

  useEffect(() => {
    if (MemoHand) {
      setNewHCs(null);
      setNewHand(null);
      setGamerItems(handItems);
    }
  }, [MemoHand]);

  useEffect(() => {
    if (!dataGamerCards) return;
    setHandItems(dataGamerCards);
  }, [dataGamerCards, handItems]);

  return (
    <div style={{ display: "flex flex-col", justifyContent: "space-around" }}>
      <Stage
        items={items}
        setItems={setItems}
        addNewItem={handleAddNewItem}
        isNewItemAdding={isNewItemAdding}
        setSelectedItem={setSelectedItem}
        selectedItem={selectedItem}
        gameName={gameName}
      />
      <MemoHand />
    </div>
  );
};

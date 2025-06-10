import { useState, useCallback, useMemo, useEffect } from "react";
import update from "immutability-helper";

import { HandCard } from "./HandCard";

export const Hand = ({
  addNewItem,
  onNewItemAdding,
  selectedItem,
  gamerItems,
  setHandItems,
}) => {
  const [handCards, setHandCards] = useState(gamerItems);

  useEffect(() => {
    setHandItems(handCards);
  }, [handCards]);

  const moveCard = useCallback(
    (dragIndex, hoverIndex) => {
      const dragItem = handCards[dragIndex];
      setHandCards(
        update(handCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragItem],
          ],
        })
      );
    },
    [handCards, setHandCards]
  );

  const HandCards = useMemo(
    () =>
      handCards.map((item, index) => {
        const { type, data, gameName } = item;
        return (
          <HandCard
            index={index}
            key={index}
            type="button"
            itemType={type}
            data={item.data}
            onClick={() =>
              addNewItem(type, data, gameName, selectedItem?.index, true, index)
            }
            onNewItemAdding={onNewItemAdding}
            moveCard={moveCard}
            style={{
              display: "flex",
              margin: "10px",
            }}
            gameName={gameName}
          >
            {data?.text}
          </HandCard>
        );
      }),
    [addNewItem, onNewItemAdding, selectedItem, handCards, moveCard]
  );

  return <div className="flex flex-wrap">{HandCards}</div>;
};

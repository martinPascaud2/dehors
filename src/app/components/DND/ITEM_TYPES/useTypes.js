"use client";

import { useState, useEffect } from "react";

export default function useTypes({ gameName }) {
  const [itemTypes, setItemTypes] = useState();

  useEffect(() => {
    if (!gameName) return;
    const importTypes = async () => {
      const { types } = await import(
        `@/components/DND/ITEM_TYPES/${gameName}Types`
      );
      setItemTypes(types);
    };
    importTypes();
  }, [gameName]);

  return itemTypes;
}

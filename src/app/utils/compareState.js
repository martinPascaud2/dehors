import isEqual from "lodash.isequal";

export default function compareState(previousValue, newValue) {
  if (!isEqual(previousValue, newValue)) return newValue;
  else return previousValue;
}

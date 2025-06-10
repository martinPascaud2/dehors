export default function sortByKeys(obj) {
  const sortedObj = {};

  Object.keys(obj).forEach((user) => {
    sortedObj[user] = Object.fromEntries(
      Object.entries(obj[user]).sort(([keyA], [keyB]) =>
        keyA.localeCompare(keyB)
      )
    );
  });

  return sortedObj;
}

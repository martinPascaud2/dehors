export const removeAccents = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const formatWord = (guess) => {
  const lower = guess.toLowerCase();
  const trim = lower.trim();
  const noAccent = removeAccents(trim);

  return noAccent;
};

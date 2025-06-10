import levenshtein from "@/utils/levenshtein";

export default function getAreSimilar(actions) {
  const { 1: res1, 2: res2, 3: res3 } = actions;
  if (!res1 || !res2 || !res3) return false;

  if (levenshtein(res1, res2) <= 1) {
    return true;
  }
  if (levenshtein(res1, res3) <= 1) {
    return true;
  }
  if (levenshtein(res2, res3) <= 1) {
    return true;
  }
  return false;
}

import { formatWord } from "@/utils/formatWord";
import levenshtein from "@/utils/levenshtein";

export default function getAreSimilar(res1, res2) {
  if (!res1 || !res2) return false;

  const formatted1 = formatWord(res1);
  const formatted2 = formatWord(res2);

  const firsts1 = formatted1.slice(0, 4);
  const firsts2 = formatted2.slice(0, 4);

  if (levenshtein(firsts1, firsts2) <= 1) {
    return true;
  }
  return false;
}

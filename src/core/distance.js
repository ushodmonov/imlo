/**
 * Damerau–Levenshtein masofasi (OSA varianti).
 * Masofa `max` dan oshib ketishi aniq bo‘lsa, erta to‘xtab `max + 1` qaytaradi.
 */
export function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let beforePrev = null;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  let current = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    let rowMin = i;

    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(prev[j] + 1, current[j - 1] + 1, prev[j - 1] + cost);

      const isTransposition = i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1];
      if (isTransposition) value = Math.min(value, beforePrev[j - 2] + 1);

      current[j] = value;
      rowMin = Math.min(rowMin, value);
    }

    if (rowMin > max) return max + 1;
    [beforePrev, prev, current] = [prev, current, beforePrev ?? new Array(b.length + 1)];
  }
  return prev[b.length];
}

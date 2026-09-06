// Very simple keyword-based text similarity for MVP repeated-issue detection.
// No AI APIs used.

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'of', 'to',
  'and', 'or', 'for', 'with', 'this', 'that', 'it', 'i', 'we', 'my', 'our',
  'has', 'have', 'had', 'be', 'been', 'not', 'no', 'there', 'here', 'so',
  'very', 'again', 'also', 'due', 'from', 'as', 'by',
]);

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w));
}

function similarityScore(textA, textB) {
  const a = new Set(normalize(textA));
  const b = new Set(normalize(textB));
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  a.forEach((word) => {
    if (b.has(word)) intersection += 1;
  });
  const union = new Set([...a, ...b]).size;
  return intersection / union; // Jaccard similarity
}

// Groups complaints into clusters where similarity >= threshold, within the same category.
function findRecurringIssues(complaints, threshold = 0.35) {
  const clusters = [];
  const used = new Array(complaints.length).fill(false);

  for (let i = 0; i < complaints.length; i += 1) {
    if (used[i]) continue;
    const base = complaints[i];
    const group = [base];
    used[i] = true;
    for (let j = i + 1; j < complaints.length; j += 1) {
      if (used[j]) continue;
      const other = complaints[j];
      if (other.category !== base.category) continue;
      const score = similarityScore(`${base.title} ${base.description}`, `${other.title} ${other.description}`);
      if (score >= threshold) {
        group.push(other);
        used[j] = true;
      }
    }
    if (group.length >= 2) {
      clusters.push(group);
    }
  }

  return clusters
    .map((group) => {
      const sorted = [...group].sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt));
      return {
        issue: sorted[0].title,
        count: group.length,
        category: sorted[0].category,
        department: sorted[0].department,
        latestReport: sorted[0].createdAt,
        status: sorted[0].status,
      };
    })
    .sort((a, b) => b.count - a.count);
}

module.exports = { similarityScore, findRecurringIssues, normalize };

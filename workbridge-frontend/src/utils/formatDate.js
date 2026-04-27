export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-PK", { year:"numeric", month:"short", day:"numeric" });
}

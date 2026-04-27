export function calculateCost({ hiringType, rate, quantity }) {
  const map = { Hourly: rate.hourlyRate, Daily: rate.dailyRate, Weekly: rate.weeklyRate, Monthly: rate.monthlyRate };
  return (map[hiringType] || 0) * quantity;
}

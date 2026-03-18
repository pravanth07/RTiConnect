/**
 * RTI Act 2005 - Deadline Calculator
 * Section 7: PIO must respond within 30 days (48 hours for life/liberty)
 * Section 5(2): Add 5 days if request came via APIO
 * Section 19: Appeals must be decided in 30 days (max 45)
 */

const calculateResponseDeadline = ({ isLifeOrLiberty = false, viaAPIo = false, fromDate = new Date() }) => {
  let days = isLifeOrLiberty ? 2 : 30;
  if (viaAPIo) days += 5; // Section 5(2) proviso
  const deadline = new Date(fromDate);
  deadline.setDate(deadline.getDate() + days);
  return deadline;
};

const calculateAppealDeadline = (fromDate = new Date()) => {
  const deadline = new Date(fromDate);
  deadline.setDate(deadline.getDate() + 30);
  return deadline;
};

const getDaysRemaining = (deadline) => {
  const now = new Date();
  const diff = new Date(deadline) - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const isOverdue = (deadline) => {
  return new Date(deadline) < new Date();
};

const getDeadlineStatus = (deadline) => {
  const days = getDaysRemaining(deadline);
  if (days < 0) return { label: 'OVERDUE', color: 'red', days: Math.abs(days) };
  if (days <= 3) return { label: 'CRITICAL', color: 'orange', days };
  if (days <= 7) return { label: 'WARNING', color: 'yellow', days };
  return { label: 'ON_TRACK', color: 'green', days };
};

// Calculate penalty amount: ₹250/day, max ₹25,000 (Section 20)
const calculatePenalty = (deadline) => {
  if (!isOverdue(deadline)) return 0;
  const overdueDays = Math.abs(getDaysRemaining(deadline));
  return Math.min(overdueDays * 250, 25000);
};

module.exports = {
  calculateResponseDeadline,
  calculateAppealDeadline,
  getDaysRemaining,
  isOverdue,
  getDeadlineStatus,
  calculatePenalty,
};

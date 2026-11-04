/**
 * Settlement and Debt Simplification Engine for Sakan Split
 * Computes exact member balances and minimal transaction paths
 */

export function calculateBalancesAndSettlements(members = [], expenses = [], settlements = []) {
  // Initialize balance dictionary
  const stats = {};
  members.forEach((m) => {
    stats[m.id] = {
      member: m,
      paid: 0,
      share: 0,
      settledPaid: 0,
      settledReceived: 0,
      net: 0,
    };
  });

  let totalExpenses = 0;

  // 1. Process expenses
  expenses.forEach((expense) => {
    const amount = Number(expense.amount) || 0;
    if (amount <= 0) return;

    // Do not count pure settlement payments as new apartment consumption expenses
    if (expense.category !== 'settlement' && expense.category !== 'تسوية حساب') {
      totalExpenses += amount;
    }

    // Credit payer
    const payerId = expense.paid_by || expense.paidBy;
    if (stats[payerId]) {
      stats[payerId].paid += amount;
    }

    // Debit split recipients
    const splits = expense.splits || expense.splitBetween || [];
    if (splits.length > 0) {
      const splitAmount = amount / splits.length;
      splits.forEach((s) => {
        const memberId = typeof s === 'object' ? s.member_id : s;
        if (stats[memberId]) {
          stats[memberId].share += splitAmount;
        }
      });
    }
  });

  // Calculate net balance from expenses: (paid - share)
  // Positive = member should receive money (له)
  // Negative = member owes money (عليه)
  Object.values(stats).forEach((item) => {
    item.net = item.paid - item.share;
  });

  // 2. Process recorded settlements
  // When member A (debtor) pays to member B (creditor):
  // Member A has paid off that amount -> their net increases by +amount
  // Member B has received that amount -> their net decreases by -amount
  settlements.forEach((s) => {
    const amt = Number(s.amount) || 0;
    if (amt <= 0) return;

    const fromId = s.from_member_id || s.fromMemberId || s.fromId;
    const toId = s.to_member_id || s.toMemberId || s.toId;

    if (stats[fromId]) {
      stats[fromId].net += amt;
      stats[fromId].settledPaid = (stats[fromId].settledPaid || 0) + amt;
    }
    if (stats[toId]) {
      stats[toId].net -= amt;
      stats[toId].settledReceived = (stats[toId].settledReceived || 0) + amt;
    }
  });

  // Round numbers
  Object.values(stats).forEach((item) => {
    item.net = Math.round(item.net * 100) / 100;
    item.paid = Math.round(item.paid * 100) / 100;
    item.share = Math.round(item.share * 100) / 100;
    item.settledPaid = Math.round((item.settledPaid || 0) * 100) / 100;
    item.settledReceived = Math.round((item.settledReceived || 0) * 100) / 100;
  });

  // 3. Split into debtors and creditors
  const debtors = [];
  const creditors = [];

  Object.values(stats).forEach((item) => {
    if (item.net < -0.01) {
      debtors.push({
        member: item.member,
        amount: Math.abs(item.net),
      });
    } else if (item.net > 0.01) {
      creditors.push({
        member: item.member,
        amount: item.net,
      });
    }
  });

  // Sort descending by absolute amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  // Greedy match to minimize transaction count
  const suggestedSettlements = [];
  let d = 0;
  let c = 0;

  const dList = debtors.map((item) => ({ ...item }));
  const cList = creditors.map((item) => ({ ...item }));

  while (d < dList.length && c < cList.length) {
    const debtor = dList[d];
    const creditor = cList[c];

    const settleAmt = Math.min(debtor.amount, creditor.amount);
    const roundedAmt = Math.round(settleAmt * 100) / 100;

    if (roundedAmt > 0.01) {
      suggestedSettlements.push({
        from: debtor.member,
        to: creditor.member,
        amount: roundedAmt,
      });
    }

    debtor.amount -= settleAmt;
    creditor.amount -= settleAmt;

    if (debtor.amount <= 0.01) d++;
    if (creditor.amount <= 0.01) c++;
  }

  return {
    totalExpenses,
    memberStats: stats,
    suggestedSettlements,
  };
}

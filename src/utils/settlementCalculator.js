/**
 * Settlement and Debt Simplification Engine for Sakan Split
 * Computes exact member balances and minimal transaction paths
 */

export function calculateBalancesAndSettlements(members = [], expenses = []) {
  // Initialize balance dictionary
  const stats = {};
  members.forEach((m) => {
    stats[m.id] = {
      member: m,
      paid: 0,
      share: 0,
      net: 0,
    };
  });

  let totalExpenses = 0;

  expenses.forEach((expense) => {
    const amount = Number(expense.amount) || 0;
    if (amount <= 0) return;

    // Do not count pure settlement payments as new apartment consumption expenses
    if (expense.category !== 'settlement' && expense.category !== 'تسوية حساب') {
      totalExpenses += amount;
    }

    // Credit payer
    if (stats[expense.paid_by || expense.paidBy]) {
      stats[expense.paid_by || expense.paidBy].paid += amount;
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

  // Calculate net balance for each member: (paid - share)
  // Positive = member should receive money (له)
  // Negative = member owes money (عليه)
  Object.values(stats).forEach((item) => {
    item.net = Math.round((item.paid - item.share) * 100) / 100;
  });

  // Split into debtors and creditors
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


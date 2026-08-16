export const toPaise = (amount) => Math.round((Number(amount) || 0) * 100);

export const fromPaise = (paise) => Math.round(paise) / 100;

export const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

// Split an amount (in paise) into n integer shares that sum exactly to the amount.
export const splitPaise = (amountPaise, n) => {
  if (n <= 0) return [];
  const base = Math.floor(amountPaise / n);
  let remainder = amountPaise % n;
  const shares = [];
  for (let i = 0; i < n; i++) {
    shares.push(base + (remainder > 0 ? 1 : 0));
    if (remainder > 0) remainder -= 1;
  }
  return shares;
};

const partnerId = (partner) =>
  partner?._id ? partner._id.toString() : String(partner);

// Returns a Map<partnerId, shareInPaise> for an expense, distributing the full amount
// across the applicable partners using a stable ordering (so totals stay exact).
export const expenseShares = (expense) => {
  const partners = (expense.applicablePartners || []).map(partnerId);
  const n = partners.length;
  if (n === 0) return new Map();

  const amountPaise = toPaise(expense.amount);
  const shares = splitPaise(amountPaise, n);
  const sorted = [...partners].sort();

  const map = new Map();
  partners.forEach((id) => {
    const index = sorted.indexOf(id);
    map.set(id, shares[index]);
  });
  return map;
};

export const computeSummary = (expenses) => {
  let grandTotal = 0;
  let primaryTotal = 0;
  let secondaryTotal = 0;

  for (const expense of expenses) {
    const amount = Number(expense.amount) || 0;
    grandTotal += amount;
    if (expense.category === "primary") primaryTotal += amount;
    else secondaryTotal += amount;
  }

  return {
    grandTotal: round2(grandTotal),
    primaryTotal: round2(primaryTotal),
    secondaryTotal: round2(secondaryTotal),
    expenseCount: expenses.length,
  };
};

export const computePartnerSummaries = (expenses, activePartners) => {
  const rows = activePartners.map((partner) => ({
    partner: { _id: partner._id, name: partner.name, image: partner.image },
    primary: 0,
    secondary: 0,
    total: 0,
  }));
  const rowById = new Map(rows.map((row) => [row.partner._id.toString(), row]));

  for (const expense of expenses) {
    const shares = expenseShares(expense);
    for (const [id, paise] of shares) {
      const row = rowById.get(id);
      if (!row) continue;
      const value = fromPaise(paise);
      if (expense.category === "primary") row.primary += value;
      else row.secondary += value;
      row.total += value;
    }
  }

  const grandTotal = computeSummary(expenses).grandTotal;

  rows.forEach((row) => {
    row.primary = round2(row.primary);
    row.secondary = round2(row.secondary);
    row.total = round2(row.total);
    row.percentage = grandTotal > 0 ? round2((row.total / grandTotal) * 100) : 0;
  });

  rows.sort((a, b) => b.total - a.total);
  return rows;
};

export const computeSettlement = (expenses, activePartners) => {
  const rows = activePartners.map((partner) => ({
    partner: { _id: partner._id, name: partner.name, image: partner.image },
    paid: 0,
    expected: 0,
    balance: 0,
    status: "settled",
  }));
  const rowById = new Map(rows.map((row) => [row.partner._id.toString(), row]));

  for (const expense of expenses) {
    const payerRow = rowById.get(partnerId(expense.paidBy));
    if (payerRow) payerRow.paid += Number(expense.amount) || 0;

    const shares = expenseShares(expense);
    for (const [id, paise] of shares) {
      const row = rowById.get(id);
      if (row) row.expected += fromPaise(paise);
    }
  }

  rows.forEach((row) => {
    row.paid = round2(row.paid);
    row.expected = round2(row.expected);
    row.balance = round2(row.paid - row.expected);
    row.status = row.balance > 0.005 ? "receive" : row.balance < -0.005 ? "pay" : "settled";
  });

  const summary = computeSummary(expenses);
  const expectedTotal = round2(rows.reduce((sum, row) => sum + row.expected, 0));

  return {
    rows,
    grandTotal: summary.grandTotal,
    expectedTotal,
    netBalance: round2(summary.grandTotal - expectedTotal),
    expenseCount: summary.expenseCount,
  };
};

// Returns rows with the total amount each partner actually paid out of pocket,
// broken down by category, plus the share of the month's grand total each represents.
export const computePayerTotals = (expenses, partners) => {
  const rows = partners.map((partner) => ({
    partner: { _id: partner._id, name: partner.name, image: partner.image },
    primary: 0,
    secondary: 0,
    paid: 0,
    percentage: 0,
  }));
  const rowById = new Map(rows.map((row) => [row.partner._id.toString(), row]));

  for (const expense of expenses) {
    const row = rowById.get(partnerId(expense.paidBy));
    if (!row) continue;
    const amount = Number(expense.amount) || 0;
    row.paid += amount;
    if (expense.category === "primary") row.primary += amount;
    else row.secondary += amount;
  }

  const grandTotal = computeSummary(expenses).grandTotal;

  rows.forEach((row) => {
    row.primary = round2(row.primary);
    row.secondary = round2(row.secondary);
    row.paid = round2(row.paid);
    row.percentage = grandTotal > 0 ? round2((row.paid / grandTotal) * 100) : 0;
  });

  rows.sort((a, b) => b.paid - a.paid);
  return rows;
};

export const findHighestPayer = (payerTotals) => {
  const payers = (payerTotals || []).filter((row) => (row.paid || 0) > 0);
  if (payers.length === 0) return null;
  return payers.reduce((a, b) => (b.paid > a.paid ? b : a));
};

export const findLowestPayer = (payerTotals) => {
  const payers = (payerTotals || []).filter((row) => (row.paid || 0) > 0);
  if (payers.length === 0) return null;
  return payers.reduce((a, b) => (b.paid < a.paid ? b : a));
};

export const computeTransactions = (rows) => {  const debtors = rows
    .filter((row) => row.balance < -0.005)
    .map((row) => ({
      partnerId: row.partner._id,
      amount: round2(-row.balance),
    }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = rows
    .filter((row) => row.balance > 0.005)
    .map((row) => ({
      partnerId: row.partner._id,
      amount: round2(row.balance),
    }))
    .sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let debtorIndex = 0;
  let creditorIndex = 0;
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const amount = round2(Math.min(debtors[debtorIndex].amount, creditors[creditorIndex].amount));
    if (amount > 0) {
      transactions.push({
        from: debtors[debtorIndex].partnerId,
        to: creditors[creditorIndex].partnerId,
        amount,
      });
    }
    debtors[debtorIndex].amount = round2(debtors[debtorIndex].amount - amount);
    creditors[creditorIndex].amount = round2(creditors[creditorIndex].amount - amount);
    if (debtors[debtorIndex].amount <= 0.005) debtorIndex += 1;
    if (creditors[creditorIndex].amount <= 0.005) creditorIndex += 1;
  }
  return transactions;
};

export const aggregateMonthlyTrend = (expenses, months = []) => {
  const map = new Map();
  for (const month of months) {
    map.set(`${month.bsYear}-${month.bsMonth}`, {
      bsYear: month.bsYear,
      bsMonth: month.bsMonth,
      total: 0,
      count: 0,
    });
  }
  for (const expense of expenses) {
    const key = `${expense.bsYear}-${expense.bsMonth}`;
    if (!map.has(key)) {
      map.set(key, { bsYear: expense.bsYear, bsMonth: expense.bsMonth, total: 0, count: 0 });
    }
    const record = map.get(key);
    record.total += Number(expense.amount) || 0;
    record.count += 1;
  }
  const trend = [...map.values()].map((record) => ({
    bsYear: record.bsYear,
    bsMonth: record.bsMonth,
    total: round2(record.total),
    count: record.count,
  }));
  trend.sort((a, b) => a.bsYear - b.bsYear || a.bsMonth - b.bsMonth);
  return trend;
};

export const subtractBsMonths = (bsYear, bsMonth, count) => {
  let year = bsYear;
  let month = bsMonth;
  for (let i = 0; i < count; i++) {
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
  }
  return { bsYear: year, bsMonth: month };
};

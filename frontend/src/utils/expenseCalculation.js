// Centralized expense calculation engine (frontend mirror of backend logic).
// All monetary arithmetic is performed in paise (integer) to avoid float inaccuracies.

const toPaise = (rupees) => Math.round((Number(rupees) || 0) * 100);
const fromPaise = (paise) => Math.round(Number(paise) || 0) / 100;

/**
 * Returns the applicable partner list for an expense.
 * Primary expenses default to all active partners when nothing is configured.
 */
export const getApplicablePartnersForExpense = (expense, activePartners) => {
    if (expense?.applicablePartners?.length > 0) {
        return expense.applicablePartners;
    }
    if (expense?.category === 'primary') {
        return activePartners?.map((p) => p._id) || [];
    }
    return [];
};

export const computeExpenseTotals = (expenses = []) => {
    let primaryTotalPaise = 0;
    let secondaryTotalPaise = 0;

    expenses.forEach((expense) => {
        const amountPaise = toPaise(expense?.amount);
        if (expense?.category === 'primary') {
            primaryTotalPaise += amountPaise;
        } else {
            secondaryTotalPaise += amountPaise;
        }
    });

    return {
        primaryTotal: fromPaise(primaryTotalPaise),
        secondaryTotal: fromPaise(secondaryTotalPaise),
        grandTotal: fromPaise(primaryTotalPaise + secondaryTotalPaise),
    };
};

export const computeCategoryBreakdown = (expenses = []) => {
    const map = new Map();
    expenses.forEach((expense) => {
        const key = expense?.category || 'primary';
        const current = map.get(key) || { category: key, total: 0, count: 0 };
        current.total = fromPaise(toPaise(current.total) + toPaise(expense?.amount));
        current.count += 1;
        map.set(key, current);
    });
    return Array.from(map.values());
};

export const computePartnerSummaries = (expenses = [], partners = []) => {
    const summaryMap = new Map();

    partners.forEach((partner) => {
        summaryMap.set(partner._id, {
            partner,
            primary: 0,
            secondary: 0,
            total: 0,
            percentage: 0,
        });
    });

    expenses.forEach((expense) => {
        const payerId = expense?.paidBy;
        const amountPaise = toPaise(expense?.amount);
        const entry = summaryMap.get(payerId);

        if (!entry) {
            const newEntry = {
                partner: { _id: payerId, name: expense?.paidByName || 'Unknown' },
                primary: 0,
                secondary: 0,
                total: 0,
                percentage: 0,
            };
            if (expense?.category === 'primary') {
                newEntry.primary += fromPaise(amountPaise);
            } else {
                newEntry.secondary += fromPaise(amountPaise);
            }
            newEntry.total = fromPaise(toPaise(newEntry.primary) + toPaise(newEntry.secondary));
            summaryMap.set(payerId, newEntry);
            return;
        }

        if (expense?.category === 'primary') {
            entry.primary = fromPaise(toPaise(entry.primary) + amountPaise);
        } else {
            entry.secondary = fromPaise(toPaise(entry.secondary) + amountPaise);
        }
        entry.total = fromPaise(toPaise(entry.primary) + toPaise(entry.secondary));
    });

    const totals = computeExpenseTotals(expenses);
    const rows = Array.from(summaryMap.values()).map((row) => ({
        ...row,
        percentage: totals.grandTotal > 0 ? Math.round((toPaise(row.total) / toPaise(totals.grandTotal)) * 1000) / 10 : 0,
    }));

    return rows.sort((a, b) => toPaise(b.total) - toPaise(a.total));
};

export const computeSettlement = (expenses = [], partners = []) => {
    const paidMap = new Map();
    const expectedMap = new Map();

    partners.forEach((partner) => {
        paidMap.set(partner._id, 0);
        expectedMap.set(partner._id, 0);
    });

    expenses.forEach((expense) => {
        const amountPaise = toPaise(expense?.amount);
        const payerId = expense?.paidBy;

        if (paidMap.has(payerId)) {
            paidMap.set(payerId, paidMap.get(payerId) + amountPaise);
        } else {
            paidMap.set(payerId, amountPaise);
        }

        const applicable = expense?.applicablePartners || [];
        if (applicable.length > 0) {
            const sharePaise = Math.round(amountPaise / applicable.length);
            applicable.forEach((partnerId) => {
                if (expectedMap.has(partnerId)) {
                    expectedMap.set(partnerId, expectedMap.get(partnerId) + sharePaise);
                } else {
                    expectedMap.set(partnerId, sharePaise);
                }
            });
        }
    });

    const rows = partners.map((partner) => {
        const paid = fromPaise(paidMap.get(partner._id) || 0);
        const expected = fromPaise(expectedMap.get(partner._id) || 0);
        const balance = fromPaise(toPaise(paid) - toPaise(expected));
        let status = 'settled';
        if (balance > 0) status = 'receive';
        else if (balance < 0) status = 'pay';

        return {
            partner,
            paid,
            expected,
            balance,
            status,
        };
    });

    const grandTotal = fromPaise(Array.from(paidMap.values()).reduce((sum, v) => sum + v, 0));
    const expectedTotal = fromPaise(Array.from(expectedMap.values()).reduce((sum, v) => sum + v, 0));

    return {
        rows,
        grandTotal,
        expectedTotal,
    };
};

export const findHighestSpender = (partnerSummaries = []) => {
    if (!partnerSummaries.length) return null;
    return partnerSummaries.reduce((max, row) => (toPaise(row.total) > toPaise(max.total) ? row : max));
};

export const findLowestSpender = (partnerSummaries = []) => {
    if (!partnerSummaries.length) return null;
    return partnerSummaries.reduce((min, row) => (toPaise(row.total) < toPaise(min.total) ? row : min));
};

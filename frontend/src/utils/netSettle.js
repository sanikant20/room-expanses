const STATUS_PRIORITY = { confirmed: 3, paid: 2, pending: 1 };

const netSettle = (txs, statusMap) => {
    const balances = new Map();
    const partnerMap = new Map();

    for (const tx of txs) {
        const fromId = tx.from?._id || tx.from;
        const toId = tx.to?._id || tx.to;
        const amount = Number(tx.amount) || 0;

        balances.set(fromId, (balances.get(fromId) || 0) - amount);
        balances.set(toId, (balances.get(toId) || 0) + amount);

        if (tx.from?._id) partnerMap.set(fromId, tx.from);
        if (tx.to?._id) partnerMap.set(toId, tx.to);
    }

    const debtors = [];
    const creditors = [];

    for (const [id, balance] of balances) {
        const rounded = Math.round(balance * 100) / 100;
        if (rounded < -0.01) debtors.push({ id, amount: Math.abs(rounded) });
        else if (rounded > 0.01) creditors.push({ id, amount: rounded });
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const result = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
        const payment = Math.round(Math.min(debtors[i].amount, creditors[j].amount) * 100) / 100;
        if (payment > 0.01) {
            const key = `${debtors[i].id}->${creditors[j].id}`;
            const statuses = statusMap?.get(key) || [];
            let resolvedStatus = 'pending';
            for (const s of statuses) {
                if ((STATUS_PRIORITY[s] || 0) > (STATUS_PRIORITY[resolvedStatus] || 0)) {
                    resolvedStatus = s;
                }
            }
            result.push({
                from: partnerMap.get(debtors[i].id) || { _id: debtors[i].id, name: 'Unknown' },
                to: partnerMap.get(creditors[j].id) || { _id: creditors[j].id, name: 'Unknown' },
                amount: payment,
                paymentStatus: resolvedStatus,
            });
        }
        debtors[i].amount = Math.round((debtors[i].amount - payment) * 100) / 100;
        creditors[j].amount = Math.round((creditors[j].amount - payment) * 100) / 100;
        if (debtors[i].amount < 0.01) i++;
        if (creditors[j].amount < 0.01) j++;
    }
    return result;
};

export default netSettle;

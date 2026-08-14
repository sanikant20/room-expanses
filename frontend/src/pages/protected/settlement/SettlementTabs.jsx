import React, { useState } from 'react';
import { BalanceRounded, CalculateRounded, CompareArrowsRounded, StarOutlineRounded, StarRounded } from '@mui/icons-material';
import CustomTab from '../../../components/custom/CustomTab';
import { formatYearMonthString, getCurrentBsYearMonth } from '../../../utils/nepaliDate';
import SettlementSummary from './SettlementSummary';
import SettlementCalculation from './SettlementCalculation';
import SettlementTransactions from './SettlementTransactions';

const SettlementTabs = () => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const current = getCurrentBsYearMonth();
        return formatYearMonthString(current);
    });

    const tabs = [
        {
            label: 'Settlement Summary',
            icon: <BalanceRounded />,
            content: (
                <SettlementSummary
                    title="Settlement Summary"
                    icon={<BalanceRounded />}
                    subtitlePrefix="Total settlement summary"
                    filename="Settlement Summary"
                    allowSettle
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />
            ),
        },
        {
            label: 'Primary Summary',
            icon: <StarRounded />,
            content: (
                <SettlementSummary
                    title="Primary Settlement"
                    icon={<StarRounded />}
                    subtitlePrefix="Settlement for primary expenses"
                    filename="Primary Settlement Summary"
                    category="primary"
                    allowSettle
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />
            ),
        },
        {
            label: 'Secondary Summary',
            icon: <StarOutlineRounded />,
            content: (
                <SettlementSummary
                    title="Secondary Settlement"
                    icon={<StarOutlineRounded />}
                    subtitlePrefix="Settlement for secondary expenses"
                    filename="Secondary Settlement Summary"
                    category="secondary"
                    allowSettle
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />
            ),
        },
        {
            label: 'Calculations',
            icon: <CalculateRounded />,
            content: (
                <SettlementCalculation
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />
            ),
        },
        {
            label: 'Transactions',
            icon: <CompareArrowsRounded />,
            content: (
                <SettlementTransactions
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />
            ),
        },
    ];

    return <CustomTab tabs={tabs} />;
};

export default SettlementTabs;

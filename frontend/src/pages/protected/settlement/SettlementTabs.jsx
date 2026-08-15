import React, { useState } from 'react';
import { BalanceRounded, CalculateRounded, CompareArrowsRounded, StarOutlineRounded, StarRounded } from '@mui/icons-material';
import CustomTab from '../../../components/custom/CustomTab';
import { formatYearMonthString, getCurrentBsYearMonth } from '../../../utils/nepaliDate';
import { isPartnerAccount } from '../../../helper/getAuthData';
import SettlementSummary from './summary/SettlementSummary';
import SettlementCalculation from './calculation/SettlementCalculation';
import SettlementTransactions from './transactions/SettlementTransactions';

const SettlementTabs = () => {
    const isPartner = isPartnerAccount();
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const current = getCurrentBsYearMonth();
        return formatYearMonthString(current);
    });
    const [group, setGroup] = useState('all');

    const tabs = [
        {
            label: 'All Summary',
            icon: <BalanceRounded />,
            content: (
                <SettlementSummary
                    title="Settlement Summary"
                    icon={<BalanceRounded />}
                    subtitlePrefix="Total settlement summary"
                    filename="Settlement Summary"
                    allowSettle={!isPartner}
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
                    allowSettle={!isPartner}
                    category="primary"
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
                    allowSettle={!isPartner}
                    category="secondary"
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    group={group}
                    onGroupChange={setGroup}
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
                    group={group}
                    onGroupChange={setGroup}
                />
            ),
        },
    ];

    return <CustomTab tabs={tabs} storageKey="settlementActiveTab" />;
};

export default SettlementTabs;

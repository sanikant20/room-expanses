import React, { useState } from 'react';
import { BalanceRounded, CalculateRounded, CompareArrowsRounded, ReceiptLongRounded } from '@mui/icons-material';
import CustomTab from '../../../components/custom/CustomTab';
import { formatYearMonthString, getCurrentBsYearMonth } from '../../../utils/nepaliDate';
import { isPartnerAccount } from '../../../helper/getAuthData';
import SettlementSummary from './summary/SettlementSummary';
import SettlementCalculation from './calculation/SettlementCalculation';
import SettlementTransactions from './transactions/SettlementTransactions';
import SettlementMyPayments from './payments/SettlementMyPayments';

const SettlementTabs = () => {
    const isPartner = isPartnerAccount();
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const current = getCurrentBsYearMonth();
        return formatYearMonthString(current);
    });
    const [group, setGroup] = useState('all');

    const handleGroupChange = (newGroup) => {
        setGroup(newGroup);
    };

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
                    allowSettle={!isPartner}
                    showCategoryFilter
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    group={group}
                    onGroupChange={handleGroupChange}
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
        {
            label: 'My Payments',
            icon: <ReceiptLongRounded />,
            content: (
                <SettlementMyPayments
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

    ];

    return <CustomTab tabs={tabs} storageKey={isPartner ? 'settlementActiveTabPartner' : 'settlementActiveTab'} />;
};

export default SettlementTabs;

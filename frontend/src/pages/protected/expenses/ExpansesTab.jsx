import React, { useState } from 'react';
import { StarOutlineRounded, StarRounded } from '@mui/icons-material';
import CustomTab from '../../../components/custom/CustomTab';
import PrimaryExpansesList from './primaryExpanses/PrimaryExpansesList';
import SecondaryExpansesList from './secondaryExpanses/SecondaryExpansesList';
import {
    formatYearMonthString,
    getCurrentBsYearMonth,
} from '../../../utils/nepaliDate';

const ExpansesTab = () => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const current = getCurrentBsYearMonth();
        return formatYearMonthString(current);
    });

    const tabs = [
        {
            label: 'Primary Expenses',
            icon: <StarRounded />,
            content: (
                <PrimaryExpansesList
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />
            ),
        },
        {
            label: 'Secondary Expenses',
            icon: <StarOutlineRounded />,
            content: (
                <SecondaryExpansesList
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />
            ),
        },
    ];

    return <CustomTab tabs={tabs} />;
};

export default ExpansesTab;

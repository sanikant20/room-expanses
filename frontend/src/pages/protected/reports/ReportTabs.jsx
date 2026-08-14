import React, { useState } from 'react';
import CustomTab from '../../../components/custom/CustomTab';
import { AssessmentRounded, CategoryRounded, PersonRounded } from '@mui/icons-material';
import { formatYearMonthString, getCurrentBsYearMonth } from '../../../utils/nepaliDate';
import ReportMonthWise from './ReportMonthWise';
import ReportPartnerWise from './ReportPartnerWise';
import ReportCategoryWise from './ReportCategoryWise';

const ReportTabs = () => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const current = getCurrentBsYearMonth();
        return formatYearMonthString(current);
    });

    const tabs = [
        {
            label: 'Monthly Report',
            icon: <AssessmentRounded />,
            content: (
                <ReportMonthWise
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />
            ),
        },
        {
            label: 'Partner Report',
            icon: <PersonRounded />,
            content: (
                <ReportPartnerWise
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />
            ),
        },
        {
            label: 'Category Report',
            icon: <CategoryRounded />,
            content: (
                <ReportCategoryWise
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />
            ),
        },
    ];

    return <CustomTab tabs={tabs} />;
};

export default ReportTabs;

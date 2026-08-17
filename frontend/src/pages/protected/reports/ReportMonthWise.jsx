import React from 'react';
import CustomCard from '../../../components/custom/CustomCard';
import { AssessmentRounded } from '@mui/icons-material';
import { useGetMonthlyReport } from '../../../apis/reportAPI/ReportAPI';
import { parseYearMonthString } from '../../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../../constant/constant';
import { ExpenseTable, ReportMonthPicker } from './ReportShared';

const ReportMonthWise = ({ selectedMonth, onMonthChange }) => {
    const selectedMonthObj = parseYearMonthString(selectedMonth);

    const { data: monthlyData, isLoading } = useGetMonthlyReport(selectedMonthObj);

    const monthLabel = selectedMonthObj.bsYear && selectedMonthObj.bsMonth
        ? `${getNepaliMonthLabel(selectedMonthObj.bsMonth)} ${selectedMonthObj.bsYear}`
        : '';

    return (
        <CustomCard
            icon={<AssessmentRounded />}
            title="Monthly Report"
            subtitle={`Monthly expense summary for ${monthLabel || 'all months'}.`}
            headerInline={false}
        >
            <ExpenseTable
                data={monthlyData?.expenses}
                isLoading={isLoading}
                filename="Monthly Expense Report"
                extra={<ReportMonthPicker value={selectedMonth} onChange={onMonthChange} />}
            />
        </CustomCard>
    );
};

export default ReportMonthWise;

import React from 'react';
import { useTheme } from '@mui/material/styles';
import CustomCard from '../../../components/custom/CustomCard';
import { AssessmentRounded } from '@mui/icons-material';
import { useGetMonthlyReport } from '../../../apis/reportAPI/ReportAPI';
import { parseYearMonthString } from '../../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../../constant/constant';
import { formatToNepaliCurrency } from '../../../utils/currencyFormat';
import { ExpenseTable, ReportMonthPicker, StatBadges } from './ReportShared';

const ReportMonthWise = ({ selectedMonth, onMonthChange }) => {
    const theme = useTheme();
    const selectedMonthObj = parseYearMonthString(selectedMonth);

    const { data: monthlyData, isLoading } = useGetMonthlyReport(selectedMonthObj);
    const summary = monthlyData?.summary || {};

    const monthLabel = selectedMonthObj.bsYear && selectedMonthObj.bsMonth
        ? `${getNepaliMonthLabel(selectedMonthObj.bsMonth)} ${selectedMonthObj.bsYear}`
        : '';

    return (
        <CustomCard
            icon={<AssessmentRounded />}
            title="Monthly Report"
            subtitle={`Monthly expense summary for ${monthLabel || 'all months'}.`}
            headerInline={false}
            extra={
                <StatBadges items={[
                    { label: `Total (${summary.expenseCount || 0} records)`, value: formatToNepaliCurrency(summary.grandTotal || 0), color: theme.palette.primary.main },
                    { label: 'Primary', value: formatToNepaliCurrency(summary.primaryTotal || 0), color: theme.palette.success.main },
                    { label: 'Secondary', value: formatToNepaliCurrency(summary.secondaryTotal || 0), color: theme.palette.warning.main },
                ]} />
            }
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

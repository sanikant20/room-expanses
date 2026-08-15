import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Autocomplete, InputLabel, Stack, TextField } from '@mui/material';
import CustomCard from '../../../components/custom/CustomCard';
import { PersonRounded } from '@mui/icons-material';
import { useGetPartnerReport } from '../../../apis/reportAPI/ReportAPI';
import { useGetPartners } from '../../../apis/partnerAPI/PartnerAPI';
import { parseYearMonthString } from '../../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../../constant/constant';
import { formatToNepaliCurrency } from '../../../utils/currencyFormat';
import { ExpenseTable, ReportMonthPicker, StatBadges } from './ReportShared';

const ReportPartnerWise = ({ selectedMonth, onMonthChange }) => {
    const theme = useTheme();
    const [selectedPartner, setSelectedPartner] = useState(null);
    const autoSelectedPartner = useRef(false);

    const { data: activePartners = [], isLoading: partnersLoading } = useGetPartners({ status: 'active' });

    useEffect(() => {
        if (activePartners.length > 0 && !autoSelectedPartner.current) {
            autoSelectedPartner.current = true;
            setSelectedPartner(activePartners[0]);
        }
    }, [activePartners]);

    const selectedMonthObj = parseYearMonthString(selectedMonth);

    const { data: partnerData, isLoading: partnerLoading } = useGetPartnerReport({
        partnerId: selectedPartner?._id,
        ...selectedMonthObj,
    });
    const summary = partnerData?.summary || {};

    const monthLabel = selectedMonthObj.bsYear && selectedMonthObj.bsMonth
        ? `${getNepaliMonthLabel(selectedMonthObj.bsMonth)} ${selectedMonthObj.bsYear}`
        : '';

    return (
        <CustomCard
            icon={<PersonRounded />}
            headerInline={false}
            title="Partner Report"
            subtitle={`Expenses paid by a partner for ${monthLabel || 'all months'}.`}
            extra={
                selectedPartner ? (
                    <StatBadges items={[
                        { label: `Total (${summary.expenseCount || 0} records)`, value: formatToNepaliCurrency(summary.grandTotal || 0), color: theme.palette.primary.main },
                        { label: 'Primary', value: formatToNepaliCurrency(summary.primaryTotal || 0), color: theme.palette.success.main },
                        { label: 'Secondary', value: formatToNepaliCurrency(summary.secondaryTotal || 0), color: theme.palette.warning.main },
                    ]} />
                ) : null
            }
        >
            <ExpenseTable
                data={partnerData?.expenses}
                isLoading={partnerLoading}
                filename="Partner Expense Report"
                extra={
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1}
                        alignItems={{ xs: 'stretch', md: 'flex-end' }}
                        sx={{ flexWrap: 'wrap', width: '100%' }}
                    >
                        <Stack spacing={0.25} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
                            <InputLabel>Partner</InputLabel>
                            <Autocomplete
                                size="small"
                                options={activePartners}
                                loading={partnersLoading}
                                getOptionLabel={(option) => option.name || ''}
                                value={selectedPartner}
                                onChange={(e, option) => setSelectedPartner(option)}
                                renderInput={(params) => <TextField {...params} placeholder="Select partner" />}
                                sx={{ minWidth: { xs: 0, md: 220 }, width: { xs: '100%', md: 'auto' } }}
                            />
                        </Stack>
                        <ReportMonthPicker value={selectedMonth} onChange={onMonthChange} />
                    </Stack>
                }
            />
        </CustomCard>
    );
};

export default ReportPartnerWise;

import React, { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    Skeleton,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import {
    AccountBalanceWalletRounded,
    ArrowForward,
    GroupsRounded,
    PaidRounded,
    SavingsRounded,
    ReceiptLongRounded,
    TrendingUpRounded,
    TrendingDownRounded,
    CategoryRounded,
    CheckCircleRounded,
    ScheduleRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAuthData } from '../../../helper/getAuthData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import CustomCard from '../../../components/custom/CustomCard';
import AutoSettleBanner from '../../../components/custom/AutoSettleBanner';
import DataTable from '../../../components/table/DataTable';
import { NepaliYearMonthPicker } from '../../../components/date/NepaliYearMonthPicker';
import { useGetDashboardSummary } from '../../../apis/dashboardAPI/DashboardAPI';
import { formatToNepaliCurrency } from '../../../utils/currencyFormat';
import { convertToBSFormat } from '../../../utils/dateConverter';
import { formatYearMonthString, getCurrentBsYearMonth, parseYearMonthString } from '../../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../../constant/constant';

const CHART_COLORS = ['#4c7dff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const StatCard = ({ title, value, subtitle, icon, color }) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                height: '100%',
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: theme.palette[color].main,
                    boxShadow: `0 10px 24px ${alpha(theme.palette[color].main, 0.16)}`,
                },
            }}
        >
            <CardContent sx={{ p: 2.25 }}>
                <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography color="text.secondary" variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                            {title}
                        </Typography>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.4 }}>
                            {value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {subtitle}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            p: 1.4,
                            borderRadius: 2,
                            backgroundColor: `${theme.palette[color].main}15`,
                            color: theme.palette[color].main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

const Dashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const authData = getAuthData();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const current = getCurrentBsYearMonth();
        return formatYearMonthString(current);
    });

    const { data, isLoading } = useGetDashboardSummary(parseYearMonthString(selectedMonth));

    const selectedMonthObj = parseYearMonthString(selectedMonth);
    const monthLabel = selectedMonthObj.bsYear && selectedMonthObj.bsMonth
        ? `${getNepaliMonthLabel(selectedMonthObj.bsMonth)} ${selectedMonthObj.bsYear}`
        : '';

    const monthlyTrend = useMemo(() => {
        if (!data?.monthlyTrend?.length) return [];
        return data.monthlyTrend.map((item) => ({
            ...item,
            label: `${getNepaliMonthLabel(item.bsMonth)} ${item.bsYear}`,
        }));
    }, [data?.monthlyTrend]);

    const partnerChartData = useMemo(() => {
        return (data?.payerTotals || []).map((row) => ({
            name: row.partner?.name || 'Unknown',
            value: Number(row.paid) || 0,
        }));
    }, [data?.payerTotals]);

    const categoryChartData = useMemo(() => {
        const primary = Number(data?.primaryTotal) || 0;
        const secondary = Number(data?.secondaryTotal) || 0;
        return [
            { name: 'Primary', value: primary },
            { name: 'Secondary', value: secondary },
        ];
    }, [data]);

    const partnerColumns = useMemo(() => [
        {
            key: 'sn', label: 'SN', render: (row, index) => index + 1,
        },
        {
            key: 'partner', label: 'Partner',
            render: (row) => (
                <Typography variant="body2" fontWeight={600}>
                    {row.partner?.name || 'Unknown'}
                </Typography>
            ),
        },
        {
            key: 'primary', label: 'Primary Paid',
            render: (row) => formatToNepaliCurrency(row.primary),
            footerRenderer: ({ data }) => (
                <Typography variant="body2" fontWeight={700} color="primary.main">
                    {formatToNepaliCurrency(data.reduce((sum, row) => sum + (Number(row.primary) || 0), 0))}
                </Typography>
            ),
        },
        {
            key: 'secondary', label: 'Secondary Paid',
            render: (row) => formatToNepaliCurrency(row.secondary),
            footerRenderer: ({ data }) => (
                <Typography variant="body2" fontWeight={700} color="primary.main">
                    {formatToNepaliCurrency(data.reduce((sum, row) => sum + (Number(row.secondary) || 0), 0))}
                </Typography>
            ),
        },
        {
            key: 'total', label: 'Total Paid',
            render: (row) => <Typography variant="body2" fontWeight={700}>{formatToNepaliCurrency(row.paid)}</Typography>,
            footerRenderer: ({ data }) => (
                <Typography variant="body2" fontWeight={700} color="primary.main">
                    {formatToNepaliCurrency(data.reduce((sum, row) => sum + (Number(row.paid) || 0), 0))}
                </Typography>
            ),
        },
        {
            key: 'percentage', label: '% of Total Paid',
            render: (row) => (
                <Chip
                    label={`${row.percentage}%`}
                    size="small"
                    color={row.percentage >= 50 ? 'primary' : 'default'}
                    variant="outlined"
                />
            ),
        },
    ], []);

    const metrics = [
        {
            title: 'Total Room Expenses',
            value: isLoading ? <Skeleton width={90} /> : formatToNepaliCurrency(data?.grandTotal || 0),
            subtitle: `${data?.expenseCount || 0} expense record(s)`,
            icon: <AccountBalanceWalletRounded />,
            color: 'primary',
        },
        {
            title: 'Primary Expenses',
            value: isLoading ? <Skeleton width={90} /> : formatToNepaliCurrency(data?.primaryTotal || 0),
            subtitle: 'Shared by all partners',
            icon: <PaidRounded />,
            color: 'success',
        },
        {
            title: 'Secondary Expenses',
            value: isLoading ? <Skeleton width={90} /> : formatToNepaliCurrency(data?.secondaryTotal || 0),
            subtitle: 'Selected partners only',
            icon: <SavingsRounded />,
            color: 'warning',
        },
        {
            title: 'Room Partners',
            value: isLoading ? <Skeleton width={60} /> : (data?.partnerCount || 0),
            subtitle: 'Active partners',
            icon: <GroupsRounded />,
            color: 'secondary',
        },
    ];

    const highestPayer = data?.highestPayer;
    const lowestPayer = data?.lowestPayer;

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Card
                sx={{
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'common.white',
                    mb: 2.5,
                    boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
            >
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                    <Grid
                        container
                        rowSpacing={2}
                        sx={{ flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between' }}
                    >
                        <Grid size={{ xs: 12, sm: 'auto' }}>
                            <Stack spacing={0.5}>
                                <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.9 }}>
                                    The Roomies
                                </Typography>
                                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                                    {getGreeting()}, {authData?.FullName?.split(' ')[0] || 'there'}
                                </Typography>
                                <Typography variant="body1" sx={{ maxWidth: 640, opacity: 0.95 }}>
                                    Here's your room expense overview for {monthLabel || 'the selected Nepali month'}.
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 'auto' }}>
                            <Stack spacing={1} sx={{ borderRadius: 2, p: 1, backdropFilter: 'blur(4px)' }}>
                                <NepaliYearMonthPicker
                                    value={selectedMonth}
                                    onChange={setSelectedMonth}
                                    size="small"
                                    fullWidth={false}
                                />
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Auto-settle countdown + settlement status */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2, alignItems: 'stretch' }}>
                <AutoSettleBanner sx={{ mb: 0, flex: 1 }} />
                {!isLoading && data?.settlementStatus && (
                    <Box
                        sx={{
                            px: 1.5,
                            py: 1,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flex: 1,
                            backgroundColor: alpha(data.settlementStatus.status === 'settled' ? theme.palette.success.main : theme.palette.grey[500], 0.08),
                            border: `1px solid ${alpha(data.settlementStatus.status === 'settled' ? theme.palette.success.main : theme.palette.grey[500], 0.25)}`,
                        }}
                    >
                        {data.settlementStatus.status === 'settled' ? (
                            <CheckCircleRounded fontSize="small" color="success" />
                        ) : (
                            <ScheduleRounded fontSize="small" color="disabled" />
                        )}
                        <Typography variant="body2" color="text.secondary">
                            {monthLabel || 'This month'} settlement: <strong>{data.settlementStatus.status === 'settled' ? 'Settled' : 'Not settled yet'}</strong>
                            {data.settlementStatus.status === 'settled' && data.settlementStatus.settledAt && (
                                ` — Settled by ${data.settlementStatus.settledBy?.name || 'Auto System'} on ${convertToBSFormat(data.settlementStatus.settledAt)}`
                            )}
                        </Typography>
                    </Box>
                )}
            </Stack>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                {metrics.map((item, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <StatCard title={item.title} value={item.value} subtitle={item.subtitle} icon={item.icon} color={item.color} />
                    </Grid>
                ))}
            </Grid>

            {/* Highest / Lowest payers */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <TrendingUpRounded color="success" />
                                <Typography variant="h6" fontWeight={700}>Highest Payer</Typography>
                            </Stack>
                            {isLoading ? (
                                <Skeleton height={40} />
                            ) : highestPayer?.partner ? (
                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="body1" fontWeight={600}>{highestPayer.partner?.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">Paid the most this month</Typography>
                                    </Box>
                                    <Chip label={formatToNepaliCurrency(highestPayer.paid)} color="success" />
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary">No expenses recorded for this month.</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <TrendingDownRounded color="warning" />
                                <Typography variant="h6" fontWeight={700}>Lowest Payer</Typography>
                            </Stack>
                            {isLoading ? (
                                <Skeleton height={40} />
                            ) : lowestPayer?.partner ? (
                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="body1" fontWeight={600}>{lowestPayer.partner?.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">Paid the least this month</Typography>
                                    </Box>
                                    <Chip label={formatToNepaliCurrency(lowestPayer.paid)} color="warning" />
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary">No expenses recorded for this month.</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomCard icon={<CategoryRounded />} title="Primary vs Secondary Expenses">
                        {isLoading ? (
                            <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatToNepaliCurrency(value)} />
                                    <Legend />
                                    <Bar dataKey="value" name="Amount" radius={[6, 6, 0, 0]}>
                                        {categoryChartData.map((entry, index) => (
                                            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CustomCard>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomCard icon={<GroupsRounded />} title="Partner-wise Amount Paid">
                        {isLoading ? (
                            <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
                        ) : partnerChartData.length === 0 ? (
                            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body2" color="text.secondary">No data available</Typography>
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={partnerChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={(entry) => `${entry.name}`}>
                                        {partnerChartData.map((entry, index) => (
                                            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatToNepaliCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CustomCard>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <CustomCard icon={<ReceiptLongRounded />} title="Monthly Expense Trend">
                        {isLoading ? (
                            <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
                        ) : monthlyTrend.length === 0 ? (
                            <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body2" color="text.secondary">No data available</Typography>
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatToNepaliCurrency(value)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" name="Total Expenses" stroke={theme.palette.primary.main} strokeWidth={2.5} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CustomCard>
                </Grid>
            </Grid>

            {/* Partner Expense Summary */}
            <CustomCard
                icon={<GroupsRounded />}
                title="Partner Expense Summary"
                subtitle={`Amounts paid by each partner for ${monthLabel || 'all months'}.`}
                extra={
                    <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForward />}
                        onClick={() => navigate('/settlement')}
                    >
                        View Settlement
                    </Button>
                }
            >
                <DataTable
                    columns={partnerColumns}
                    data={data?.payerTotals || []}
                    loading={isLoading}
                    download={{ enabled: true, filename: 'Partner Expense Summary', excludeColumns: ['sn'] }}
                />
            </CustomCard>
        </Box>
    );
};

export default Dashboard;

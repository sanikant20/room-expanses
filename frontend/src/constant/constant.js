
export const EXPENSE_CATEGORIES = [
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
]

export const NEPALI_MONTHS = [
    { value: 1, label: "Baisakh", nepali: "बैशाख" },
    { value: 2, label: "Jestha", nepali: "जेठ" },
    { value: 3, label: "Asar", nepali: "असार" },
    { value: 4, label: "Shrawan", nepali: "साउन" },
    { value: 5, label: "Bhadra", nepali: "भदौ" },
    { value: 6, label: "Ashwin", nepali: "असोज" },
    { value: 7, label: "Kartik", nepali: "कार्तिक" },
    { value: 8, label: "Mangsir", nepali: "मंसिर" },
    { value: 9, label: "Poush", nepali: "पुष" },
    { value: 10, label: "Magh", nepali: "माघ" },
    { value: 11, label: "Falgun", nepali: "फागुन" },
    { value: 12, label: "Chaitra", nepali: "चैत" },
]

export const getNepaliMonthLabel = (month, lang = 'en') => {
    const found = NEPALI_MONTHS.find((m) => m.value === Number(month));
    if (!found) return '';
    return lang === 'ne' ? found.nepali : found.label;
}

export const getNepaliMonthRange = (month) => {
    const ranges = {
        1: "Mid-Apr to Mid-May",
        2: "Mid-May to Mid-Jun",
        3: "Mid-Jun to Mid-Jul",
        4: "Mid-Jul to Mid-Aug",
        5: "Mid-Aug to Mid-Sep",
        6: "Mid-Sep to Mid-Oct",
        7: "Mid-Oct to Mid-Nov",
        8: "Mid-Nov to Mid-Dec",
        9: "Mid-Dec to Mid-Jan",
        10: "Mid-Jan to Mid-Feb",
        11: "Mid-Feb to Mid-Mar",
        12: "Mid-Mar to Mid-Apr",
    }
    return ranges[Number(month)] || '';
}

export const PARTNER_STATUS = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
]

export const SETTLEMENT_STATUS = [
    { value: 'receive', label: 'To Receive', color: 'success' },
    { value: 'pay', label: 'To Pay', color: 'error' },
    { value: 'settled', label: 'Settled', color: 'default' },
]

export const PAYMENT_STATUS = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'paid', label: 'Paid', color: 'info' },
    { value: 'confirmed', label: 'Confirmed', color: 'success' },
]

export const BS_YEAR_RANGE = {
    min: 2070,
    max: 2090,
}

export const DEFAULT_BS_YEAR = 2081

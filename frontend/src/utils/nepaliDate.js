import NepaliDateModule from 'nepali-date-converter';
import { getNepaliMonthLabel } from '../constant/constant';

const NepaliDate = NepaliDateModule.default || NepaliDateModule;

/**
 * Derives { bsYear, bsMonth } from a Nepali (BS) date string.
 * Accepts formats: "YYYY-MM-DD" or "YYYY/MM/DD".
 */
export const getBsYearMonthFromBsDate = (bsDate) => {
    if (!bsDate) return { bsYear: null, bsMonth: null };
    const normalized = String(bsDate).replace(/\//g, '-');
    const [year, month] = normalized.split('-').map(Number);
    if (!year || !month) return { bsYear: null, bsMonth: null };
    return { bsYear: year, bsMonth: month };
};

/**
 * Derives { bsYear, bsMonth } from an AD date string (YYYY-MM-DD).
 */
export const getBsYearMonthFromAdDate = (adDate) => {
    try {
        const date = new Date(adDate);
        if (isNaN(date)) return { bsYear: null, bsMonth: null };
        const nepaliDate = NepaliDate.fromAD(date);
        return {
            bsYear: nepaliDate.getYear(),
            bsMonth: nepaliDate.getMonth() + 1,
        };
    } catch {
        return { bsYear: null, bsMonth: null };
    }
};

/**
 * Returns the current BS year and month.
 */
export const getCurrentBsYearMonth = () => {
    try {
        const now = new Date();
        const nepaliDate = NepaliDate.fromAD(now);
        return {
            bsYear: nepaliDate.getYear(),
            bsMonth: nepaliDate.getMonth() + 1,
        };
    } catch {
        return { bsYear: null, bsMonth: null };
    }
};

/**
 * Returns the current BS date as a "YYYY/MM/DD" string.
 */
export const getCurrentBsDate = () => {
    try {
        const now = new Date();
        const nepaliDate = NepaliDate.fromAD(now);
        const bs = nepaliDate.getBS();
        const month = String(bs.month + 1).padStart(2, '0');
        const day = String(bs.date).padStart(2, '0');
        return `${bs.year}/${month}/${day}`;
    } catch {
        return '';
    }
};

/**
 * Formats { bsYear, bsMonth } into a "YYYY/MM" string (month zero-padded).
 * Used with NepaliYearMonthPicker, which works with string values.
 */
export const formatYearMonthString = ({ bsYear, bsMonth }) => {
    if (!bsYear || !bsMonth) return '';
    return `${bsYear}/${String(bsMonth).padStart(2, '0')}`;
};

/**
 * Parses a "YYYY/MM" (or "YYYY/M") string back into { bsYear, bsMonth }.
 */
export const parseYearMonthString = (str) => {
    if (!str) return { bsYear: null, bsMonth: null };
    const [bsYear, bsMonth] = String(str).split('/').map(Number);
    if (!bsYear || !bsMonth) return { bsYear: null, bsMonth: null };
    return { bsYear, bsMonth };
};

/**
 * Subtracts `n` months from a BS year/month pair, rolling over years correctly.
 */
export const subtractBsMonths = (bsYear, bsMonth, n) => {
    let year = Number(bsYear);
    let month = Number(bsMonth);
    month -= n;
    while (month < 1) {
        month += 12;
        year -= 1;
    }
    return { bsYear: year, bsMonth: month };
};

/**
 * Adds `n` months to a BS year/month pair, rolling over years correctly.
 */
export const addBsMonths = (bsYear, bsMonth, n = 1) => {
    let year = Number(bsYear);
    let month = Number(bsMonth) + n;
    while (month > 12) {
        month -= 12;
        year += 1;
    }
    return { bsYear: year, bsMonth: month };
};

/**
 * Builds the last `count` BS months ending at (bsYear, bsMonth) inclusive.
 * Each entry: { bsYear, bsMonth, label }
 */
export const getBsMonthsRange = (bsYear, bsMonth, count = 6) => {
    const result = [];
    for (let i = 0; i < count; i++) {
        const { bsYear: y, bsMonth: m } = subtractBsMonths(bsYear, bsMonth, i);
        result.unshift({ bsYear: y, bsMonth: m, label: `${getNepaliMonthLabel(m)} ${y}` });
    }
    return result;
};

/**
 * Validates that a BS date string is in a valid shape.
 */
export const isValidBsDate = (bsDate) => {
    if (!bsDate) return false;
    const normalized = String(bsDate).replace(/\//g, '-');
    return /^\d{4}-\d{2}-\d{2}$/.test(normalized);
};

/**
 * Days remaining until the next auto-settle run (BS day 1, 00:30 Asia/Kathmandu).
 * The current BS month is the one the next run will settle automatically.
 * Returns null on failure.
 */
export const getDaysRemainingUntilAutoSettle = () => {
    try {
        const now = new NepaliDate();
        const year = now.getYear();
        const month = now.getMonth();
        let daysInMonth = 1;
        const probe = new NepaliDate(year, month, 1);
        while (true) {
            probe.setDate(daysInMonth + 1);
            if (probe.getYear() === year && probe.getMonth() === month) {
                daysInMonth++;
            } else {
                break;
            }
        }
        return {
            daysRemaining: daysInMonth - now.getDate() + 1,
            bsYear: year,
            bsMonth: month + 1,
        };
    } catch {
        return null;
    }
};

/**
 * Epoch timestamp (ms) of the next auto-settle run (BS day 1, 00:30 Asia/Kathmandu).
 * Uses the machine-local date as the app's "today" convention; returns null on failure.
 */
export const getNextAutoSettleTimestamp = () => {
    try {
        const now = new Date();
        const today = NepaliDate.fromAD(now);
        const year = today.getYear();
        const month = today.getMonth();
        let daysInMonth = 1;
        const probe = new NepaliDate(year, month, 1);
        while (true) {
            probe.setDate(daysInMonth + 1);
            if (probe.getYear() === year && probe.getMonth() === month) {
                daysInMonth++;
            } else {
                break;
            }
        }
        const daysRemaining = daysInMonth - today.getDate() + 1;
        const target = new Date(now);
        target.setDate(target.getDate() + daysRemaining);
        target.setHours(0, 30, 0, 0);
        return target.getTime();
    } catch {
        return null;
    }
};

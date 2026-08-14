import NepaliDateModule from 'nepali-date-converter';
import { dateFormatToToggledDate } from './dateFormatToToggleDate';

const NepaliDate = NepaliDateModule.default || NepaliDateModule;

export const dateFormatter = (year, month, day, separator = "-") => {
    const paddedMonth = String(month).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');
    return `${year}${separator}${paddedMonth}${separator}${paddedDay}`;
};

export const formatDateToSlash = (dateStr) => {
    return dateStr?.replace(/-/g, '/');
};

export const formatDateToDash = (dateStr) => {
    return dateStr?.replace(/\//g, '-');
};

export const convertToBSFormat = (date) => {
    if (!date) return null;

    try {
        const adDate = date instanceof Date ? date : new Date(date);
        if (isNaN(adDate)) return null;

        const nepaliDate = NepaliDate.fromAD(adDate);
        const year = nepaliDate.getYear();
        const month = String(nepaliDate.getMonth() + 1).padStart(2, "0");
        const day = String(nepaliDate.getDate()).padStart(2, "0");

        return `${year}/${month}/${day}`;
    } catch (err) {
        console.error("Invalid date conversion:", err);
        return null;
    }
};

export const convertToADFormat = (nepaliDateString) => {
    if (!nepaliDateString) return null;

    try {
        const [year, month, day] = String(nepaliDateString)
            ?.replace(/\//g, '-')
            ?.split('-')
            ?.map(Number) ?? [];

        if (!year || !month || !day) return null;

        if (year < 2000 || year > 2090) return null;

        const bsDate = new NepaliDate(year, month - 1, day);
        const adDate = bsDate?.toJsDate();

        if (!adDate || isNaN(adDate)) return null;

        const adYear = adDate.getFullYear();
        const adMonth = String(adDate.getMonth() + 1).padStart(2, '0');
        const adDay = String(adDate.getDate()).padStart(2, '0');

        return `${adYear}-${adMonth}-${adDay}`;
    } catch (error) {
        console.warn("Invalid Nepali date:", nepaliDateString, error.message);
        return null;
    }
};

export const getNepaliDaysBetween = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return null;

    const startAD = new Date(convertToADFormat(startDateStr));
    const endAD = new Date(convertToADFormat(endDateStr));

    if (isNaN(startAD) || isNaN(endAD)) return null;

    const diffTime = endAD.getTime() - startAD.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d)) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

export const formatDateAndTime = (dateString, useNepali = false) => {
    if (!dateString) return '';

    try {
        const normalized = String(dateString).replace(/\s+/g, ' ').trim();
        const date = new Date(normalized);

        if (isNaN(date.getTime())) return '';

        const datePart = dateFormatToToggledDate(normalized, useNepali);

        const pad = (n) => String(n).padStart(2, '0');
        let hours = date.getHours();
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        return `${datePart}, ${pad(hours)}:${minutes}:${seconds} ${ampm}`;
    } catch {
        return '';
    }
};

export const getTodayNepaliDate = () => {
    const engDate = new Date()?.toISOString().split('T')[0]
    const nepDate = convertToBSFormat(engDate)
    return nepDate
}

export const getTodayEnglishDate = () => {
    const engDate = new Date()?.toISOString().split('T')[0]
    return engDate
}

export const subtractMonthsFromDate = (date, months) => {
    if (!date) return '';
    const parts = date.split('/');
    if (parts.length === 3) {
        let y = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        let d = parts[2];
        m -= months;
        while (m < 1) { m += 12; y -= 1; }
        return `${y}/${String(m).padStart(2, '0')}/${d}`;
    }
    const newDate = new Date(date);
    if (isNaN(newDate)) return '';
    newDate.setMonth(newDate.getMonth() - months);
    return newDate.toISOString().split('T')[0];
}

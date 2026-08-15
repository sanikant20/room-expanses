import NepaliDateModule from 'nepali-date-converter';

const NepaliDate = NepaliDateModule.default || NepaliDateModule;

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

export const getTodayNepaliDate = () => {
    const engDate = new Date()?.toISOString().split('T')[0]
    const nepDate = convertToBSFormat(engDate)
    return nepDate
}

export const getTodayEnglishDate = () => {
    const engDate = new Date()?.toISOString().split('T')[0]
    return engDate
}

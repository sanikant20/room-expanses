// Format Nepali Number into Nepali Currency Format
export const formatToNepaliAmount = (num) => {
    if (num === null || num === undefined) return '0.00';

    const number = typeof num === 'string' ? parseFloat(num) : num;

    if (isNaN(number)) return '0.00';

    const formattedNumber = number?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return `${formattedNumber}`;
};

// Format Nepali Number into Nepali Currency Format with symbol
export const formatToNepaliCurrency = (num, currencySymbol = 'Rs') => {
    return `${currencySymbol} ${formatToNepaliAmount(num)}`;
};

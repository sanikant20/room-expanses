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

// Convert Nepali Number into Nepali Words
export const convertNumberToWords = (num) => {
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertLessThanThousand = (n) => {
        if (n === 0) return "";
        if (n < 10) return units[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + units[n % 10] : "");
        return units[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "");
    };

    const numToParse = parseFloat(num);
    if (isNaN(numToParse)) return "";
    if (numToParse === 0) return "Zero";

    let integerPart = Math.floor(numToParse);
    let result = "";

    if (integerPart >= 10000000) {
        result += convertLessThanThousand(Math.floor(integerPart / 10000000)) + " Crore ";
        integerPart %= 10000000;
    }
    if (integerPart >= 100000) {
        result += convertLessThanThousand(Math.floor(integerPart / 100000)) + " Lakh ";
        integerPart %= 100000;
    }
    if (integerPart >= 1000) {
        result += convertLessThanThousand(Math.floor(integerPart / 1000)) + " Thousand ";
        integerPart %= 1000;
    }
    if (integerPart > 0) {
        result += convertLessThanThousand(integerPart);
    }

    return result.trim() + " only.";
};

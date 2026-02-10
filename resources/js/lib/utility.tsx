export default function removeValueFromArray(arr: any, value: string) {
    var index = arr.indexOf(value);
    if (index !== -1) {
       arr.splice(index, 1);
    }

    return arr;
}


export function formatMoney(
    amount: number,
    currencyCode: string = "USD", // Change parameter name to currencyCode
    decimalCount: number = 2,
    locale: string = "en-US"
): string {
    // Ensure that decimalCount is non-negative
    if (decimalCount < 0) decimalCount = 0;

    // Create options for the number formatting
    const options: Intl.NumberFormatOptions = {
        style: "currency",
        currency: currencyCode, // Use the currency code here
        minimumFractionDigits: decimalCount,
        maximumFractionDigits: decimalCount,
    };

    // Format the number using the specified locale and options
    return new Intl.NumberFormat(locale, options).format(amount);
}

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        // Format the number in millions (M)
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        // Format the number in thousands (K)
        return (num / 1000).toFixed(1) + 'K';
    } else {
        // Return the number as-is if it's less than 1000
        return num.toString();
    }
}


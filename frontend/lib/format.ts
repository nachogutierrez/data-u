export function formatMoney(amount: number, currency: string): string {
    const abbreviations = [
        { value: 1E6, symbol: 'M' },
        { value: 1E3, symbol: 'K' },
    ];

    let formattedAmount: string|undefined = undefined;
    let symbol = '';

    for (const item of abbreviations) {
        if (amount >= item.value) {
            formattedAmount = (amount / item.value).toFixed(1);
            symbol = item.symbol;
            break;
        }
    }

    if (!formattedAmount) {
        formattedAmount = amount.toFixed(1);
    }

    return `${formattedAmount} ${symbol} ${currency.toUpperCase()}`;
}

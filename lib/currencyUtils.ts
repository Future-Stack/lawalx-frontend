export const getCurrencySymbol = (currency: string) => {
  return currency === 'NGN' ? '₦' : '$';
};

export const formatAmount = (amount: number, currency: string) => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString()}`;
};

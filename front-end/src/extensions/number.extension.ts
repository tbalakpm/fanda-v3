export {};

const indianCurrencyFormatter = (value: Number | String): string => {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

Number.prototype.toIndianCurrencyFormat = function (): string {
  return indianCurrencyFormatter(this);
};

Number.prototype.toIndianNumberFormat = function (): string {
  let val = indianCurrencyFormatter(this).replaceAll('₹', '');
  return val;
};

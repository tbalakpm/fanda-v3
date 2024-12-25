export {};
String.prototype.toTitleCase = function (): string {
  return this.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );
};

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

String.prototype.toIndianCurrencyFormat = function (): string {
  return indianCurrencyFormatter(this);
};

String.prototype.toIndianNumberFormat = function (): string {
  const val = indianCurrencyFormatter(this).substring(1);
  return val;
};

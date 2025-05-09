export {};
declare global {
  interface Number {
    toIndianCurrencyFormat(): string;
    toIndianNumberFormat(): string;
  }
  interface String {
    toTitleCase(): string;
    toIndianCurrencyFormat(): string;
    toIndianNumberFormat(): string;
  }
}

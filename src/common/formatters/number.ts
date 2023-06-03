const fmt = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});
const fmtWithNoDecimals = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  maximumSignificantDigits: 3,
});
export const currencyFormatter = (value: number, showDecimals?: boolean): string => {
  let suffix = "";
  let divisor = 1;
  const absValue = Math.abs(value);
  if (absValue >= 1e9) {
    suffix = "B";
    divisor = 1e9;
  } else if (absValue >= 1e6) {
    suffix = "M";
    divisor = 1e6;
  } else if (absValue >= 1e3) {
    suffix = "K";
    divisor = 1e3;
  }
  const valueToFormat = value / divisor;
  const formatted = (showDecimals ? fmt : fmtWithNoDecimals).format(valueToFormat) + suffix;
  return formatted;
};

export const percentageFormatter = (value: number): string => {
  const v100 = value * 100;
  const v = v100.toPrecision(3);
  return `${v}%`;
};

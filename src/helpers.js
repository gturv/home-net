export function calculateLandTransferTax(purchasePrice) {
  let tax = 0;

  if (purchasePrice <= 55000) {
    tax = purchasePrice * 0.005;
  } else if (purchasePrice <= 250000) {
    tax = 275 + (purchasePrice - 55000) * 0.01;
  } else if (purchasePrice <= 400000) {
    tax = 1975 + (purchasePrice - 250000) * 0.015;
  } else if (purchasePrice <= 2000000) {
    tax = 4475 + (purchasePrice - 400000) * 0.02;
  } else {
    tax = 36475 + (purchasePrice - 2000000) * 0.025;
  }

  return tax;
}

export function calculateCMHC(purchasePrice, downPayment) {
  const mortgage = purchasePrice - downPayment;
  const ltv = mortgage / purchasePrice;

  let rate = 0;
  if (ltv > 0.90) {
    rate = 0.04;
  } else if (ltv > 0.85) {
    rate = 0.031;
  } else if (ltv > 0.80) {
    rate = 0.028;
  }

  const cmhcPremium = mortgage * rate;
  const cmhcTaxDueOnClosing = cmhcPremium * 0.08; // 8% Ontario PST
  const newMortgage = mortgage + cmhcPremium;

  return {
    cmhcPremium,
    cmhcTaxDueOnClosing,
    newMortgage,
  };
}

export const formatCurrency = (value) => {
  if (value === undefined || value === null || value === '') return '$';
  const number = Number(value.toString().replace(/[^0-9.-]+/g, ''));
  if (isNaN(number)) return '';
  return '$' + number.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
};

export function calculateMortgagePayment(principal, rate, amortizationYears) {
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = amortizationYears * 12;

  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }

  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  return payment;
};

export function calculateBlendRate(currentMortgage, currentRate, newMortgage, newRate) {
  const totalMortgage = currentMortgage + newMortgage;
  if (totalMortgage === 0) return 0;
  const blendedRate = (currentMortgage * currentRate + newMortgage * newRate) / totalMortgage;
  return blendedRate;
}
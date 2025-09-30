export function calculateLandTransferTax(purchasePrice, firstTimeBuyer = false) {
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

  // Apply first-time buyer rebate (maximum $4,000)
  if (firstTimeBuyer) {
    const rebate = Math.min(tax, 4000);
    tax = tax - rebate;
  }

  return tax;
}

export function calculateCMHC(purchasePrice, downPayment, amortizationYears) {
  const mortgage = purchasePrice - downPayment;
  if (mortgage <= 0 || purchasePrice <= 0) {
    return 0;
  }

  // Calculate loan-to-value ratio
  const loanToValueRatio = (mortgage / purchasePrice) * 100;

  // CMHC insurance is not required if LTV is 80% or less
  if (loanToValueRatio <= 80) {
    return 0;
  }

  // CMHC premium rates based on loan-to-value ratio (as of 2024)
  let cmhcRate = 0;

  if (loanToValueRatio <= 85) {
    cmhcRate = amortizationYears <= 25 ? 0.028 : 0.030; // 2.80% or 3%
  } else if (loanToValueRatio <= 90) {
    cmhcRate = amortizationYears <= 25 ? 0.031 : 0.033; // 3.10% or 3.30%
  } else if (loanToValueRatio <= 95) {
    cmhcRate = amortizationYears <= 25 ? 0.04 : 0.042; // 4.00% or 4.20%
  }
  const cmhcPremium = mortgage * cmhcRate;
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

export function calculateMortgageInterest(mortgage, rate) {
  return mortgage * (rate / 100) / 12;
}

export function calculateThreeMonthsInterest(mortgage, rate) {
  console.log('3-month interest calculation:', {
    mortgage,
    rate,
    calculation: `${mortgage} * ${rate / 100} * (3/12)`,
    result: mortgage * (rate / 100) * (3 / 12)
  });
  return mortgage * (rate / 100) * (3 / 12);
}

export function calculateMortgagePenaltyIRD(mortgage, currentRate, currentMarketRate, monthsRemaining) {
  console.log('IRD Calculation inputs:', {
    mortgage,
    currentRate,
    currentMarketRate,
    monthsRemaining
  });

  // IRD is the difference between your rate and current market rate
  const interestDifference = currentRate - currentMarketRate;
  console.log('Interest difference:', interestDifference);

  // If current market rates are higher, no penalty (or minimal 3-month penalty)
  if (interestDifference <= 0) {
    const threeMonthFallback = calculateThreeMonthsInterest(mortgage, currentRate);
    console.log('No IRD penalty, returning 3-month interest:', threeMonthFallback);
    return threeMonthFallback;
  }

  // Calculate the interest rate differential penalty
  const yearsRemaining = monthsRemaining / 12;
  const irdPenalty = mortgage * (interestDifference / 100) * yearsRemaining;
  console.log('IRD penalty calculation:', {
    yearsRemaining,
    calculation: `${mortgage} * ${interestDifference / 100} * ${yearsRemaining}`,
    irdPenalty
  });

  // IRD penalty is typically the greater of 3 months interest or the IRD calculation
  const threeMonthPenalty = calculateThreeMonthsInterest(mortgage, currentRate);
  console.log('3-month penalty:', threeMonthPenalty);

  const finalPenalty = Math.max(irdPenalty, threeMonthPenalty);
  console.log('Final penalty (max of IRD and 3-month):', finalPenalty);

  return finalPenalty;
}


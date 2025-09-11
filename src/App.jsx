

import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Text } from '@chakra-ui/react'
import { calculateLandTransferTax, calculateCMHC, formatCurrency, calculateMortgagePayment, calculateBlendRate } from './helpers';
import DollarInput from './components/DollarInput.jsx';
import NumInput from './components/NumInput.jsx';
import TextBox from './components/TextBox.jsx';
import Check from './components/Check.jsx';

// Custom debounce function
const useDebounce = (callback, delay) => {
  const [timeoutId, setTimeoutId] = useState(null);
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
    
    setTimeoutId(newTimeoutId);
  }, [callback, delay, timeoutId]);
  
  return debouncedCallback;
};

function App() {
  const [salePrice, setSalePrice] = useState(0);
  const [commissionRate, setCommissionRate] = useState(5);
  const [lawyerFeeBuy, setLawyerFeeBuy] = useState(2000);
  const [lawyerFeeSell, setLawyerFeeSell] = useState(1500);
  const [mortgageRemaining, setMortgageRemaining] = useState(0);
  const [mortgageRemainingInput, setMortgageRemainingInput] = useState(0); // For input display
  //const [mortgageAdditional, setMortgageAdditional] = useState(0);
  const [propertyTax, setPropertyTax] = useState(5000);
  const [portingMortgage, setPortingMortgage] = useState(false);
  const [mortgageRateCurrent, setMortgageRateCurrent] = useState(4);
  const [mortgageRateNew, setMortgageRateNew] = useState(4);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [purchasePriceInput, setPurchasePriceInput] = useState(0); // For input display
  const [downPayment, setDownPayment] = useState(0);
  const [downPaymentInput, setDownPaymentInput] = useState(0); // For input display
  const [homeInspection, setHomeInspection] = useState(true);
  const [renovations, setRenovations] = useState(0);
  const [movingCosts, setMovingCosts] = useState(0);
  const [condoFees, setCondoFees] = useState(0);
  const [utilities, setUtilities] = useState(250);
  const [insuranceYearly, setInsuranceYearly] = useState(1500);
  const [rentalIncome, setRentalIncome] = useState(0);
  const [ammortizationYears, setAmortizationYears] = useState(25);

  // Create debounced setters
  const debouncedSetMortgageRemaining = useDebounce(setMortgageRemaining, 500);
  const debouncedSetPurchasePrice = useDebounce(setPurchasePrice, 800); // Longer delay for purchase price

  // Custom setters that handle both immediate input display and debounced actual values
  const handleMortgageRemainingChange = (value) => {
    setMortgageRemainingInput(value);
    debouncedSetMortgageRemaining(value);
  };

  const handlePurchasePriceChange = (value) => {
    setPurchasePriceInput(value);
    debouncedSetPurchasePrice(value);
  };

  // Simple non-debounced handler for down payment to avoid conflicts
  const handleDownPaymentChange = (value) => {
    setDownPaymentInput(value);
    setDownPayment(value);
  };

  // Set down payment to net proceeds when mortgage remaining changes
  useEffect(() => {
    if (mortgageRemaining > 0) {
      const commissionWithHST = (salePrice * (commissionRate / 100)) * 1.13;
      const netProceeds = salePrice - commissionWithHST - lawyerFeeSell - mortgageRemaining;
      if (netProceeds > 0 && !portingMortgage) {
        setDownPayment(netProceeds);
        setDownPaymentInput(netProceeds);
      }
      else if (netProceeds > 0 && portingMortgage && netProceeds < mortgageRemaining) {
        setDownPayment(mortgageRemaining);
        setDownPaymentInput(mortgageRemainingInput);
      }
    }
  }, [mortgageRemaining, salePrice, commissionRate, lawyerFeeSell, portingMortgage, mortgageRemainingInput]);

  // Intelligently set down payment when purchase price changes (after debounce)
  useEffect(() => {
    if (purchasePrice > 0 && mortgageRemaining > 0) {
      const commissionWithHST = (salePrice * (commissionRate / 100)) * 1.13;
      const netProceeds = salePrice - commissionWithHST - lawyerFeeSell - mortgageRemaining;
      
      if (netProceeds > 0) {
        // If net proceeds exceed purchase price, set down payment to purchase price (100% down)
        if (netProceeds >= purchasePrice) {
          setDownPayment(purchasePrice);
          setDownPaymentInput(purchasePrice);
        } else {
          // Otherwise set to net proceeds
          setDownPayment(netProceeds);
          setDownPaymentInput(netProceeds);
        }
      }
    }
  }, [purchasePrice, salePrice, commissionRate, lawyerFeeSell, mortgageRemaining]);




  const commissionWithHST = (salePrice * (commissionRate / 100)) * 1.13;
  const netProceeds = salePrice - commissionWithHST - lawyerFeeSell - mortgageRemaining
  const mortgageNew = purchasePrice - downPayment
  const downPaymentPercent = (downPayment / purchasePrice) * 100;
  const { cmhcPremium, cmhcTaxDueOnClosing, newMortgage } = (downPaymentPercent < 20 && downPaymentPercent > 0) ? calculateCMHC(purchasePrice, downPayment) : { cmhcPremium: 0, cmhcTaxDueOnClosing: 0, newMortgage: mortgageNew };

  const landTransferTax = calculateLandTransferTax(purchasePrice);
  
  // Calculate base cash needed for purchase
  const baseCashNeeded = purchasePrice - downPayment - mortgageNew + landTransferTax + lawyerFeeBuy + cmhcTaxDueOnClosing + renovations + (homeInspection ? 565 : 0);
  
  // If down payment equals purchase price (100% down), there might be excess proceeds
  const excessProceeds = (downPayment >= purchasePrice && netProceeds > purchasePrice) ? netProceeds - purchasePrice : 0;
  
  // Final cash needed accounting for excess proceeds
  const cashNeeded = baseCashNeeded - excessProceeds; 
  
  // When porting a mortgage, the additional mortgage needed is the total new mortgage minus what's being ported
  const additionalMortgageNeeded = portingMortgage ? Math.max(0, newMortgage - mortgageRemaining) : newMortgage;
  const blendedRate = portingMortgage ? calculateBlendRate(mortgageRemaining, mortgageRateCurrent, additionalMortgageNeeded, mortgageRateNew) : mortgageRateNew;

  const mortgagePaymentPurchase = calculateMortgagePayment(
    newMortgage, 
    portingMortgage ? blendedRate : mortgageRateNew, 
    ammortizationYears
  );
  //const cashPulled = netProceeds - cashNeeded;

  return (
  <div>
    <h1 style={{ marginBottom: "3rem" }}>Home Purchase/ Sale Calculator</h1>
    <div className="container">
      <div className="column">
        <h2>Sale Details</h2>
        <DollarInput state={salePrice} stateSetter={setSalePrice} label="Sale Price" step={5000} />
        <NumInput state={commissionRate} stateSetter={setCommissionRate} label="Commission Rate (%)" min={0} max={6} step={0.25} precision={2} />
        <TextBox label="Commission with HST" value={formatCurrency(commissionWithHST)} />
        <DollarInput state={lawyerFeeSell} stateSetter={setLawyerFeeSell} label="Lawyer Fee (Selling)" step={100} />
        <DollarInput state={mortgageRemainingInput} stateSetter={handleMortgageRemainingChange} label="Mortgage Remaining" step={1000} />
        <Check state={portingMortgage} stateSetter={setPortingMortgage} label="Porting Mortgage?" />
        { portingMortgage && 
          <NumInput state={mortgageRateCurrent} stateSetter={setMortgageRateCurrent} label="Current Mortgage Rate (%)" min={0} max={10} step={0.1} precision={2} />
        }
        {salePrice > 99999 &&<TextBox label="Net Proceeds" bold value={formatCurrency(netProceeds)} />}
      </div>

      <div className="purchase-section">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Purchase Details</h2>
        <div className="purchase-columns">
          <div className="column">
            <DollarInput state={purchasePriceInput} stateSetter={handlePurchasePriceChange} label="Purchase Price" step={5000} />
            <DollarInput state={downPaymentInput} stateSetter={handleDownPaymentChange} label="Down Payment ($)" step={10000} />
            {downPayment > 0 && purchasePrice > 99999 && (
              <TextBox label="Down Payment (%)" value={`${downPaymentPercent.toFixed(1)}%`} />
            )}
            {downPaymentPercent < 20 && downPaymentPercent > 0 && purchasePrice > 99999 && (
              <div>
                <Text>CMHC Premium: {formatCurrency(cmhcPremium)}</Text>
                <Text>CMHC Tax Due on Closing: {formatCurrency(cmhcTaxDueOnClosing)}</Text>
              </div>
            )} 
            {purchasePrice > 99999 && <TextBox label={portingMortgage ? "Additional Mortgage" : "New Mortgage"} value={portingMortgage ? formatCurrency(newMortgage - mortgageRemainingInput) : formatCurrency(newMortgage)} />}
            <NumInput state={mortgageRateNew} stateSetter={setMortgageRateNew} label={portingMortgage ? "New Mortgage Rate (%)" : "Mortgage Rate (%)"} min={0} max={10} step={0.1} precision={2} />
            {portingMortgage && <Text>Blended Rate: {blendedRate.toFixed(2)}%</Text>}
            <NumInput state={ammortizationYears} stateSetter={setAmortizationYears} label="Ammortization (Years)" min={1} max={30} step={1} precision={0} />
          </div>

          <div className="column">
            <TextBox label="Mortgage Payment" value={`$${mortgagePaymentPurchase.toFixed(2)}`} />
            <DollarInput state={propertyTax} stateSetter={setPropertyTax} label="Property Tax (Yearly)" step={100} />
            <TextBox label="Land Transfer Tax" value={formatCurrency(landTransferTax)} />
            <DollarInput state={lawyerFeeBuy} stateSetter={setLawyerFeeBuy} label="Lawyer Fee (Buying)" step={100} />
            <DollarInput state={renovations} stateSetter={setRenovations} label="Renovations" step={500} />
            <DollarInput state={movingCosts} stateSetter={setMovingCosts} label="Moving Costs" step={100} /> 
            <Check state={homeInspection} stateSetter={setHomeInspection} label="Home Inspection?" />
          </div>
          
        </div>
         <TextBox bold label={cashNeeded < 0 ? "Equity Pulled" : "Cash Needed"} value={formatCurrency(Math.abs(cashNeeded))} />
      </div>

      <div className="column">
        <h2>Ongoing Costs</h2>
        <DollarInput state={condoFees} stateSetter={setCondoFees} label="Condo Fees (Monthly)" step={50} />
        <DollarInput state={utilities} stateSetter={setUtilities} label="Utilities (Monthly)" step={50} />
        <DollarInput state={insuranceYearly} stateSetter={setInsuranceYearly} label="Home Insurance (Yearly)" step={100} />
        <DollarInput state={rentalIncome} stateSetter={setRentalIncome} label="Rental Income (Monthly)" step={100} />
        <TextBox label="Monthly Mortgage Payment" value={formatCurrency(mortgagePaymentPurchase)} />
        <TextBox bold label="Monthly Costs" value={formatCurrency((mortgagePaymentPurchase + condoFees + utilities + (propertyTax / 12) + (insuranceYearly / 12)) - rentalIncome)} />
      </div>
    </div>
{/*     <div className="container" style={{ marginTop: '2rem' }}>
      <div className="column">
        <h3>Net Proceeds</h3>
        <TextBox label="From Sale" value={formatCurrency(netProceeds)} />
      </div>
      
      <div className="column">
        <h3>{cashNeeded < 0 ? "Equity Pulled" : "Cash Needed"}</h3>
        <TextBox label={cashNeeded < 0 ? "From Purchase" : "For Purchase"} value={formatCurrency(Math.abs(cashNeeded))} />
      </div>
      
      <div className="column">
        <h3>Monthly Costs</h3>
        <TextBox label="Total Monthly" value={formatCurrency((mortgagePaymentPurchase + condoFees + utilities + (propertyTax / 12) + (insuranceYearly / 12)) - rentalIncome)} />
      </div>
    </div> */}
  </div>
  );
}

export default App

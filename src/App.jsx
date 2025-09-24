

import { useState, useEffect, useCallback, } from 'react';
import './App.css';
import { Text, Dialog, Button, VStack, HStack, Flex, Box } from '@chakra-ui/react'
import { calculateLandTransferTax, calculateCMHC, formatCurrency, calculateMortgagePayment, calculateBlendRate, calculateThreeMonthsInterest, calculateMortgagePenaltyIRD } from './helpers';
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
  const [lawyerFeeSell, setLawyerFeeSell] = useState(0);
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
  const [mortgagePenaltyApplies, setMortgagePenaltyApplies] = useState(false);
  const [mortgagePenaltyAmount, setMortgagePenaltyAmount] = useState(0);
  const [mortgagePenaltyEntered, setMortgagePenaltyEntered] = useState(false);
  const [mortgageFree, setMortgageFree] = useState(false);
  const [firstTimeBuyer, setFirstTimeBuyer] = useState(false);

  
  // Share functionality states
  const [shareButtonState, setShareButtonState] = useState('Share');
  const [shareButtonDisabled, setShareButtonDisabled] = useState(false);
  
  // Dialog states
  const [penaltyDialogOpen, setPenaltyDialogOpen] = useState(false);
  const [penaltyCalculationType, setPenaltyCalculationType] = useState('variable');
  const [penaltyInputs, setPenaltyInputs] = useState({
    currentBalance: mortgageRemaining,
    currentRate: mortgageRateCurrent,
    termRemaining: 0,
    currentDiscountRate: 0,
    currentPenaltyRate: 0
  });
  const commissionWithHST = (salePrice * (commissionRate / 100)) * 1.13;
  const mortgageNew = purchasePrice - downPayment
  const downPaymentPercent = (downPayment / purchasePrice) * 100;
  const { cmhcPremium, cmhcTaxDueOnClosing, newMortgage } = (downPaymentPercent < 20 && downPaymentPercent > 0) ? calculateCMHC(purchasePrice, downPayment) : { cmhcPremium: 0, cmhcTaxDueOnClosing: 0, newMortgage: mortgageNew };

  const netProceeds = salePrice - commissionWithHST - lawyerFeeSell - mortgageRemaining - mortgagePenaltyAmount


  // Create debounced setters
  const debouncedSetMortgageRemaining = useDebounce(setMortgageRemaining, 500);
  const debouncedSetPurchasePrice = useDebounce(setPurchasePrice, 800); // Longer delay for purchase price
  const debouncedSetDownPayment = useDebounce(setDownPayment, 500);

  // Custom setters that handle both immediate input display and debounced actual values
  const handleMortgageRemainingChange = (value) => {
    setMortgageRemainingInput(value);
    debouncedSetMortgageRemaining(value);
  };

  const handlePurchasePriceChange = (value) => {
    setPurchasePriceInput(value);
    debouncedSetPurchasePrice(value);
  };

  // Debounced handler for down payment to avoid showing errors while typing
  const handleDownPaymentChange = (value) => {
    setDownPaymentInput(value);
    debouncedSetDownPayment(value);
  };

  // Handle mortgage penalty checkbox
  const handleMortgagePenaltyChange = (checked) => {
    setMortgagePenaltyApplies(checked);
    if (checked && mortgageRemaining > 0) {
      // Set current values when opening dialog
      setPenaltyInputs({
        currentBalance: mortgageRemaining,
        currentRate: mortgageRateCurrent,
        termRemaining: 0,
        currentDiscountRate: 0,
        currentPenaltyRate: 0,
        manualAmount: 0
      });
      setPenaltyDialogOpen(true);
    } else {
      setMortgagePenaltyAmount(0);
      setMortgagePenaltyEntered(false);
//setMortgagePenaltyApplies(false);
    }
  };

  // Handle penalty calculation
  const handlePenaltyCalculation = () => {
    let calculatedPenalty = 0;
    
    if (penaltyCalculationType === 'variable') {
      calculatedPenalty = calculateThreeMonthsInterest(
        penaltyInputs.currentBalance,
        penaltyInputs.currentRate
      );
    } else if (penaltyCalculationType === 'fixed') {
      calculatedPenalty = calculateMortgagePenaltyIRD(
        penaltyInputs.currentBalance,
        penaltyInputs.currentRate,
        penaltyInputs.currentDiscountRate, // Current market rate
        penaltyInputs.termRemaining // Months remaining
      );
    } else {
      calculatedPenalty = penaltyInputs.manualAmount || 0;
    }
    
    setMortgagePenaltyAmount(calculatedPenalty);
    setMortgagePenaltyEntered(true);
    setPenaltyDialogOpen(false);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setPenaltyDialogOpen(false);
    setMortgagePenaltyApplies(false);
  };

  // Share functionality
  const generateShareURL = () => {
    const params = new URLSearchParams({
      sp: salePrice,
      cr: commissionRate,
      lb: lawyerFeeBuy,
      ls: lawyerFeeSell,
      mr: mortgageRemaining,
      pt: propertyTax,
      pm: portingMortgage,
      mrc: mortgageRateCurrent,
      mrn: mortgageRateNew,
      pp: purchasePrice,
      dp: downPayment,
      hi: homeInspection,
      rn: renovations,
      mc: movingCosts,
      cf: condoFees,
      ut: utilities,
      iy: insuranceYearly,
      ri: rentalIncome,
      ay: ammortizationYears,
      mpa: mortgagePenaltyApplies,
      mpo: mortgagePenaltyAmount,
      mpe: mortgagePenaltyEntered,
      mf: mortgageFree
    });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const handleShare = async () => {
    const shareURL = generateShareURL();
    try {
      await navigator.clipboard.writeText(shareURL);
      setShareButtonState('Copied');
      setShareButtonDisabled(true);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback: you could show the URL in a dialog or alert
      alert('Share URL: ' + shareURL);
    }
  };

  // Load data from URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('sp')) {
      setSalePrice(Number(urlParams.get('sp')) || 0);
      setCommissionRate(Number(urlParams.get('cr')) || 5);
      setLawyerFeeBuy(Number(urlParams.get('lb')) || 2000);
      setLawyerFeeSell(Number(urlParams.get('ls')) || 1500);
      setMortgageRemaining(Number(urlParams.get('mr')) || 0);
      setMortgageRemainingInput(Number(urlParams.get('mr')) || 0);
      setPropertyTax(Number(urlParams.get('pt')) || 5000);
      setPortingMortgage(urlParams.get('pm') === 'true');
      setMortgageRateCurrent(Number(urlParams.get('mrc')) || 4);
      setMortgageRateNew(Number(urlParams.get('mrn')) || 4);
      setPurchasePrice(Number(urlParams.get('pp')) || 0);
      setPurchasePriceInput(Number(urlParams.get('pp')) || 0);
      setDownPayment(Number(urlParams.get('dp')) || 0);
      setDownPaymentInput(Number(urlParams.get('dp')) || 0);
      setHomeInspection(urlParams.get('hi') === 'true');
      setRenovations(Number(urlParams.get('rn')) || 0);
      setMovingCosts(Number(urlParams.get('mc')) || 0);
      setCondoFees(Number(urlParams.get('cf')) || 0);
      setUtilities(Number(urlParams.get('ut')) || 250);
      setInsuranceYearly(Number(urlParams.get('iy')) || 1500);
      setRentalIncome(Number(urlParams.get('ri')) || 0);
      setAmortizationYears(Number(urlParams.get('ay')) || 25);
      setMortgagePenaltyApplies(urlParams.get('mpa') === 'true');
      setMortgagePenaltyAmount(Number(urlParams.get('mpo')) || 0);
      setMortgagePenaltyEntered(urlParams.get('mpe') === 'true');
      setMortgageFree(urlParams.get('mf') === 'true');
    }
  }, []);

  // hook to set default for lawyerFeeSell if user enters a sale price (otherwise it will impact the purchase cash needed)
  useEffect(() => {
    if (salePrice > 0 && lawyerFeeSell === 0) {
      setLawyerFeeSell(1500);
    }
    if (salePrice === 0 && lawyerFeeSell !== 0) {
      setLawyerFeeSell(0);
    }
  }, [salePrice, lawyerFeeSell]);

  // Reset share button when any input changes
  useEffect(() => {
    // Only reset if button is currently showing "Copied"
    if (shareButtonState === 'Copied') {
      setShareButtonState('Share');
      setShareButtonDisabled(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salePrice, commissionRate, lawyerFeeBuy, lawyerFeeSell, mortgageRemaining, propertyTax, 
      portingMortgage, mortgageRateCurrent, mortgageRateNew, purchasePrice, downPayment, 
      homeInspection, renovations, movingCosts, condoFees, utilities, insuranceYearly, 
      rentalIncome, ammortizationYears, mortgagePenaltyApplies, mortgagePenaltyAmount, 
      mortgagePenaltyEntered, mortgageFree]); // Intentionally excluding shareButtonState

  // Set down payment to net proceeds when mortgage remaining changes
  useEffect(() => {
    if (mortgageRemaining > 0 || mortgageFree) {
      if (netProceeds > 0 && !portingMortgage) {
        setDownPayment(netProceeds);
        setDownPaymentInput(netProceeds);
      }
    }
  }, [mortgageRemaining, salePrice, commissionRate, lawyerFeeSell, portingMortgage, mortgageRemainingInput, mortgagePenaltyAmount, netProceeds, mortgageFree]);


  // Intelligently set down payment when purchase price changes (after debounce)
  useEffect(() => {
    if (purchasePrice > 0 && (mortgageRemaining > 0 || mortgageFree)) {
/*       const commissionWithHST = (salePrice * (commissionRate / 100)) * 1.13;
      const netProceeds = salePrice - commissionWithHST - lawyerFeeSell - mortgageRemaining - mortgagePenaltyAmount;
       */
      if (netProceeds > 0) {
        // If net proceeds exceed purchase price, set down payment to purchase price (100% down)
        if (netProceeds >= purchasePrice && purchasePrice > 0) {
          setDownPayment(purchasePrice);
          setDownPaymentInput(purchasePrice);
        } else {
          // Otherwise set to net proceeds
          setDownPayment(netProceeds);
          setDownPaymentInput(netProceeds);
        }
      }
    }
  }, [purchasePrice, salePrice, commissionRate, lawyerFeeSell, mortgageRemaining, mortgagePenaltyAmount, netProceeds, mortgageFree]);

  // Remove mortgagePenaltyAmount if mortgageRemaining is zero
  useEffect(() => {
    if (mortgageRemaining === 0 || mortgageFree) {
      setMortgagePenaltyAmount(0);
      setMortgagePenaltyApplies(false);
      setMortgagePenaltyEntered(false);
    }
  }, [mortgageRemaining, mortgageFree]);
  
  const landTransferTax = calculateLandTransferTax(purchasePrice, firstTimeBuyer);
  
  // Calculate minimum down payment based on Canadian requirements
  const calculateMinimumDownPayment = (purchasePrice) => {
    if (purchasePrice <= 500000) {
      return purchasePrice * 0.05; // 5% for first $500k
    } else if (purchasePrice <= 1500000) {
      return (500000 * 0.05) + ((purchasePrice - 500000) * 0.10); // 5% on first $500k, 10% on remainder
    } else {
      return purchasePrice * 0.20; // 20% for $1.5M+
    }
  };

  const minimumDownPayment = calculateMinimumDownPayment(purchasePrice);
  const downPaymentError = purchasePrice > 99999 && downPayment > 0 && downPayment < minimumDownPayment;
  const downPaymentErrorText = downPaymentError ? `Minimum down payment: ${formatCurrency(minimumDownPayment)}` : "";
  
  // Calculate base cash needed for purchase
  const baseCashNeeded = purchasePrice - netProceeds - mortgageNew + landTransferTax + lawyerFeeBuy + cmhcTaxDueOnClosing + renovations + mortgagePenaltyAmount + (homeInspection ? 565 : 0);
  
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

  // Calculate section heights for desktop alignment
  return (
  <Box  >
    {/* Desktop Header with Share Button */}
    <Flex align="center" justify="center" position="relative" mb={{base: 0, lg: 6}} display={{ base: "none", lg: "flex" }}>
      <Text fontSize="2.5rem" fontWeight="bold" textAlign="center">Home Purchase/Sale Calculator</Text>
      <Button 
        onClick={handleShare}
        disabled={shareButtonDisabled}
        variant="ghost"
        fontSize="1rem"
        color={shareButtonDisabled ? "gray.400" : "gray.600"}
        position="absolute"
        right={0}
        cursor={shareButtonDisabled ? 'default' : 'pointer'}
      >
        {shareButtonState}
      </Button>
    </Flex>
    
    {/* Mobile-only Share Button */}
    <Flex justify="flex-end" mb={0} display={{ base: "flex", lg: "none" }}>
      <Button 
        onClick={handleShare}
        disabled={shareButtonDisabled}
        variant="ghost"
        fontSize="1rem"
        color={shareButtonDisabled ? "gray.400" : "gray.600"}
        cursor={shareButtonDisabled ? 'default' : 'pointer'}
      >
        {shareButtonState}
      </Button>
    </Flex>
    
    <Box display={{ base: "flex", lg: "grid" }} 
         flexDirection={{ base: "column" }} 
         gridTemplateColumns={{ lg: "1fr 2fr 1fr" }} 
         gap={{ base: 6, lg: 16 }} 
         minH={{ base: "auto", lg: "600px" }}
         divideY={{ base: "1px", lg: "0" }}
         divideColor={{ base: "border.emphasized", lg: "transparent" }}>
      {/* Sale Details Section */}
      <VStack align="flex-start" w="full" h="full" justify={{ base: "flex-start", lg: "space-between" }} position="relative">
        <Box w="full">
          <Text fontSize="1.5rem" fontWeight="bold" mb={4} textAlign={{ base: "center", lg: "left" }} w="full">Sale Details</Text>
          <Flex direction={{ base: "row", lg: "column" }} gap={4} wrap={{ base: "wrap", lg: "nowrap" }} align="flex-start" justify={{ base: "space-between", lg: "flex-start" }} w="full" >
            {(() => {
              // Create array of all sale detail items
              const saleItems = [
                <DollarInput key="salePrice" state={salePrice} stateSetter={setSalePrice} label="Sale Price" step={5000} />,
                <DollarInput key="mortgageRemaining" state={mortgageRemainingInput} stateSetter={handleMortgageRemainingChange} label="Mortgage Remaining" step={1000} invalid={(mortgageRemainingInput === 0 && portingMortgage) || (mortgageRemainingInput === 0 && mortgagePenaltyApplies)} errorText={"Enter mortgage amount"} />,
                <NumInput key="commissionRate" state={commissionRate} stateSetter={setCommissionRate} label="Commission Rate (%)" min={0} max={6} step={0.25} precision={2} />,
                <TextBox key="commissionHST" label="Commission w/ HST" value={formatCurrency(commissionWithHST)} />,
                <DollarInput key="lawyerFeeSell" state={lawyerFeeSell} stateSetter={setLawyerFeeSell} label="Lawyer Fee (Sell)" step={100} />,
                ...(!portingMortgage && !mortgagePenaltyApplies ? [<Check key="mortgageFree" state={mortgageFree} stateSetter={setMortgageFree} label="Mortgage Free" />] : []),
                ...(!mortgagePenaltyApplies && !mortgageFree ? [<Check key="portingMortgage" state={portingMortgage} stateSetter={setPortingMortgage} label="Port Mortgage" />] : []),
                ...(portingMortgage ? [<NumInput key="currentRate" state={mortgageRateCurrent} stateSetter={setMortgageRateCurrent} label="Current Rate (%)" min={0} max={10} step={0.1} precision={2} />] : []),
                ...(!mortgageFree ? [<Check key="mortgagePenalty" state={mortgagePenaltyApplies} stateSetter={handleMortgagePenaltyChange} label="Mortgage Penalty" />] : []),
                ...(mortgagePenaltyApplies && mortgagePenaltyEntered ? [<TextBox key="penaltyAmount" onClick={() => setPenaltyDialogOpen(true)} label="Mortgage Penalty" value={formatCurrency(mortgagePenaltyAmount)} />] : [])
              ];

              // Split items into two columns with max 4 items per column on mobile, single column on desktop
              const maxItemsPerColumn = 4;
              const midPoint = Math.min(maxItemsPerColumn, Math.ceil(saleItems.length / 2));
              const firstColumn = saleItems.slice(0, midPoint);
              const secondColumn = saleItems.slice(midPoint);

              return (
                <>
                  <VStack flex={{ base: "0 0 45%", lg: 1 }} align="flex-start" spacing={4}>
                    {firstColumn.map((item, index) => (
                      <Box key={index} w="full">
                        {item}
                      </Box>
                    ))}
                    {/* On desktop, add second column items to first column */}
                    <Box display={{ base: "none", lg: "contents" }}>
                      {secondColumn.map((item, index) => (
                        <Box key={`desktop-${index}`} w="full">
                          {item}
                        </Box>
                      ))}
                    </Box>
                  </VStack>
                  {secondColumn.length > 0 && (
                    <VStack flex={{ base: "0 0 45%", lg: 1 }} align="flex-start" spacing={4} display={{ base: "flex", lg: "none" }}>
                      {secondColumn.map((item, index) => (
                        <Box key={index} w="full">
                          {item}
                        </Box>
                      ))}
                    </VStack>
                  )}
                </>
              );
            })()}
          </Flex>
        </Box>
        
        {/* Net Proceeds - Full width on mobile */}
        <Box w="full" display="flex" flexDirection="column" alignItems="center">
          <Text fontSize="lg" fontWeight="bold" mb={2} textAlign="center">Net Proceeds</Text>
          <Box
            border="1px solid"
            borderColor="border.default"
            borderRadius="md"
            px={3}
            py={2}
            bg="bg.default"
            minH="10"
            width="200px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="fg.default"
            fontSize="sm"
            fontFamily="inherit"
            textAlign="center"
          >
            {salePrice > 99999 && (mortgageRemaining > 0 || mortgageFree) ? formatCurrency(netProceeds) : 0}
          </Box>
        </Box>
      </VStack>

      {/* Purchase Details Section */}
      <VStack align="flex-start" spacing={4} w="full" h="full" justify={{ base: "flex-start", lg: "space-between" }} position="relative" mb={{ base: 3, lg: 0 }}>
        <Box w="full">
          <Text fontSize="1.5rem" fontWeight="bold" mb={4} mt={{ base: 3, lg: 0 }} textAlign={{ base: "center", lg: "center" }} w="full">Purchase Details</Text>
          <Flex direction={{ base: "row", lg: "row" }} gap={4} align="flex-start" justify={{ base: "space-between", lg: "space-around" }} w="full" >
            {(() => {
              // Create array of all purchase detail items
              const purchaseItems = [
                <DollarInput key="purchasePrice" state={purchasePriceInput} stateSetter={handlePurchasePriceChange} label="Purchase Price" step={5000} max={10000000} />,
                <DollarInput key="downPayment" state={downPaymentInput} stateSetter={handleDownPaymentChange} label={`Down Payment ${downPayment > 0 && purchasePrice > 99999 ? '[' +downPaymentPercent.toFixed(1) + "%]" : ""}`} step={10000} max={10000000} invalid={downPaymentError} errorText={downPaymentErrorText} />,
                ...(!(purchasePrice > 0 && purchasePrice <= downPayment && downPayment > 0) ? [<TextBox key="newMortgage" label={portingMortgage ? "Additional Mortgage" : "New Mortgage"} value={purchasePrice < 99999 ? 0 : (portingMortgage ? formatCurrency(newMortgage - mortgageRemainingInput) : formatCurrency(newMortgage))} />] : []),
                ...(!(purchasePrice > 0 && purchasePrice <= downPayment && downPayment > 0) ? [<NumInput key="mortgageRate" state={mortgageRateNew} stateSetter={setMortgageRateNew} label={portingMortgage ? "New Mortgage Rate (%)" : "Mortgage Rate (%)"} min={0} max={10} step={0.1} precision={2} />] : []),
                ...(portingMortgage ? [<TextBox key="blendedRate" label="Blended Rate (%)" value={blendedRate.toFixed(2) + "%"} />] : []),
                ...(downPaymentPercent < 20 && downPaymentPercent > 0 && purchasePrice > 99999 ? [<TextBox key="cmhcPremium" label="CMHC Premium" value={formatCurrency(cmhcPremium)} />] : []),
                ...(!(purchasePrice <= downPayment && downPayment > 0 && purchasePrice > 0) ? [<NumInput key="amortization" state={ammortizationYears} stateSetter={setAmortizationYears} label="Amortization (Yrs)" min={1} max={30} step={5} precision={0} />] : []),
                <TextBox key="landTransferTax" label="Land Transfer Tax" value={formatCurrency(landTransferTax)} />,
                <DollarInput key="lawyerFeeBuy" state={lawyerFeeBuy} stateSetter={setLawyerFeeBuy} label="Lawyer Fee (Buy)" step={100} />,
                <DollarInput key="renovations" state={renovations} stateSetter={setRenovations} label="Renovations" step={500} />,
                <DollarInput key="movingCosts" state={movingCosts} stateSetter={setMovingCosts} label="Moving Costs" step={200} />,
                ...(downPaymentPercent < 20 && downPaymentPercent > 0 && purchasePrice > 99999 ? [<TextBox key="cmhcTax" label="CMHC Tax (Closing)" value={formatCurrency(cmhcTaxDueOnClosing)} />] : []),
                <Check key="homeInspection" state={homeInspection} stateSetter={setHomeInspection} label="Inspection?" />,
                ...(purchasePrice > 99999 && salePrice === 0 ? [<Check key="firstTimeBuyer" state={firstTimeBuyer} stateSetter={setFirstTimeBuyer} label="First Time Buyer?" />] : [])
              ];

              // Split items into two columns with max 6 items per column
              const maxItemsPerColumn = 5;
              const midPoint = Math.min(maxItemsPerColumn, Math.ceil(purchaseItems.length / 2));
              const firstColumn = purchaseItems.slice(0, midPoint);
              const secondColumn = purchaseItems.slice(midPoint);

              return (
                <>
                  <VStack flex={{ base: "0 0 40%", lg: "0 0 auto" }} align="flex-start" spacing={4}>
                    {firstColumn.map((item, index) => (
                      <Box key={index} w="full">
                        {item}
                      </Box>
                    ))}
                  </VStack>
                  <VStack flex={{ base: "0 0 40%", lg: "0 0 auto" }} align="flex-start" spacing={4}>
                    {secondColumn.map((item, index) => (
                      <Box key={index} w="full">
                        {item}
                      </Box>
                    ))}
                  </VStack>
                </>
              );
            })()}
          </Flex>
        </Box>
        
        {/* Cash Needed - Full width on mobile */}
        <Box w="full" display="flex" flexDirection="column" alignItems="center">
          <Text fontSize="lg" fontWeight="bold" mb={2} textAlign="center">{cashNeeded < 0 ? "Equity Pulled" : "Cash Needed"}</Text>
          <Box
            border="1px solid"
            borderColor="border.default"
            borderRadius="md"
            px={3}
            py={2}
            bg="bg.default"
            minH="10"
            width="200px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="fg.default"
            fontSize="sm"
            fontFamily="inherit"
            textAlign="center"
          >
            {purchasePrice > 99999 && downPayment > 0 ? formatCurrency(Math.abs(cashNeeded)) : 0}
          </Box>
        </Box>
      </VStack>

      {/* Monthly Costs Section */}
      <VStack align="flex-start" spacing={4} w="full" h="full" justify={{ base: "flex-start", lg: "space-between" }} position="relative">
        <Box w="full">
          <Text fontSize="1.5rem" fontWeight="bold" mb={4} mt={{ base: 3, lg: 0 }} textAlign={{ base: "center", lg: "right" }} w="full">Monthly Costs</Text>
          <Flex  direction={{ base: "row", lg: "column" }} gap={4} wrap={{ base: "wrap", lg: "nowrap" }} align={{ base: "flex-start", lg: "flex-end" }} justify={{ base: "space-between", lg: "flex-start" }} w="full" >
            {(() => {
              // Create array of all monthly cost items
              const monthlyItems = [
                <TextBox key="mortgagePayment" label="Mortgage Payment" value={purchasePrice > 99999 ? formatCurrency(mortgagePaymentPurchase) : 0} />,
                <DollarInput key="propertyTax" state={propertyTax} stateSetter={setPropertyTax} label="Property Tax" step={100} />,
                <DollarInput key="condoFees" state={condoFees} stateSetter={setCondoFees} label="Condo Fees" step={50} />,
                <DollarInput key="utilities" state={utilities} stateSetter={setUtilities} label="Utilities" step={50} />,
                <DollarInput key="insurance" state={insuranceYearly} stateSetter={setInsuranceYearly} label="Home Insurance" step={100} />,
                <DollarInput key="rentalIncome" state={rentalIncome} stateSetter={setRentalIncome} label="Rental Income" step={100} />
              ];

              // Split items into two columns with max 4 items per column on mobile, single column on desktop
              const maxItemsPerColumn = 4;
              const midPoint = Math.min(maxItemsPerColumn, Math.ceil(monthlyItems.length / 2));
              const firstColumn = monthlyItems.slice(0, midPoint);
              const secondColumn = monthlyItems.slice(midPoint);

              return (
                <>
                  <VStack flex={{ base: "0 0 45%", lg: "0 0 auto" }} align="flex-start" spacing={4}>
                    {firstColumn.map((item, index) => (
                      <Box key={index} w="full">
                        {item}
                      </Box>
                    ))}
                    {/* On desktop, add second column items to first column */}
                    <Box display={{ base: "none", lg: "contents" }}>
                      {secondColumn.map((item, index) => (
                        <Box key={`desktop-${index}`} w="full">
                          {item}
                        </Box>
                      ))}
                    </Box>
                  </VStack>
                  {secondColumn.length > 0 && (
                    <VStack flex={{ base: "0 0 45%", lg: "0 0 auto" }} align="flex-start" spacing={4} display={{ base: "flex", lg: "none" }}>
                      {secondColumn.map((item, index) => (
                        <Box key={index} w="full">
                          {item}
                        </Box>
                      ))}
                    </VStack>
                  )}
                </>
              );
            })()}
          </Flex>
        </Box>
        
        {/* Monthly Expense - Full width on mobile */}
        <Box w="full" display="flex" flexDirection="column" alignItems="center">
          <Text fontSize="lg" fontWeight="bold" mb={2} textAlign="center">Monthly Expense</Text>
          <Box
            border="1px solid"
            borderColor="border.default"
            borderRadius="md"
            px={3}
            py={2}
            bg="bg.default"
            minH="10"
            width="200px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="fg.default"
            fontSize="sm"
            fontFamily="inherit"
            textAlign="center"
          >
            {purchasePrice > 99999 ? formatCurrency((mortgagePaymentPurchase + condoFees + utilities + (propertyTax / 12) + (insuranceYearly / 12)) - rentalIncome) : 0}
          </Box>
        </Box>
      </VStack>
    </Box>

    {/* Mortgage Penalty Dialog */}
    <Dialog.Root open={penaltyDialogOpen} onOpenChange={setPenaltyDialogOpen}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="md">
          <Dialog.CloseTrigger onClick={handleDialogClose} />
          <Dialog.Header>
            <Dialog.Title>Calculate Mortgage Penalty</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold">Select calculation method:</Text>
              <VStack align="stretch" spacing={3}>
                <HStack cursor="pointer" onClick={() => setPenaltyCalculationType('variable')}>
                  <input 
                    type="radio" 
                    name="penaltyType" 
                    value="variable" 
                    checked={penaltyCalculationType === 'variable'}
                    onChange={(e) => setPenaltyCalculationType(e.target.value)}
                  />
                  <Text>Variable Rate (3 months interest)</Text>
                </HStack>
                <HStack cursor="pointer" onClick={() => setPenaltyCalculationType('fixed')}>
                  <input 
                    type="radio" 
                    name="penaltyType" 
                    value="fixed" 
                    checked={penaltyCalculationType === 'fixed'}
                    onChange={(e) => setPenaltyCalculationType(e.target.value)}
                  />
                  <Text>Fixed Rate (Interest Rate Differential)</Text>
                </HStack>
                <HStack cursor="pointer" onClick={() => setPenaltyCalculationType('manual')}>
                  <input 
                    type="radio" 
                    name="penaltyType" 
                    value="manual" 
                    checked={penaltyCalculationType === 'manual'}
                    onChange={(e) => setPenaltyCalculationType(e.target.value)}
                  />
                  <Text>Enter manually</Text>
                </HStack>
              </VStack>

              {penaltyCalculationType === 'variable' && (
                <VStack spacing={3} align="stretch">
                  <DollarInput 
                    state={penaltyInputs.currentBalance} 
                    stateSetter={(value) => setPenaltyInputs(prev => ({...prev, currentBalance: value}))} 
                    label="Current Mortgage Balance" 
                    step={1000} 
                  />
                  <NumInput 
                    state={penaltyInputs.currentRate} 
                    stateSetter={(value) => setPenaltyInputs(prev => ({...prev, currentRate: value}))} 
                    label="Current Rate (%)" 
                    min={0} max={10} step={0.1} precision={2} 
                  />
                </VStack>
              )}

              {penaltyCalculationType === 'fixed' && (
                <VStack spacing={3} align="stretch">
                  <DollarInput 
                    state={penaltyInputs.currentBalance} 
                    stateSetter={(value) => setPenaltyInputs(prev => ({...prev, currentBalance: value}))} 
                    label="Current Mortgage Balance" 
                    step={1000} 
                  />
                  <NumInput 
                    state={penaltyInputs.currentRate} 
                    stateSetter={(value) => setPenaltyInputs(prev => ({...prev, currentRate: value}))} 
                    label="Current Rate (%)" 
                    min={0} max={10} step={0.1} precision={2} 
                  />
                  <NumInput 
                    state={penaltyInputs.termRemaining} 
                    stateSetter={(value) => setPenaltyInputs(prev => ({...prev, termRemaining: value}))} 
                    label="Term Remaining (Months)" 
                    min={0} max={120} step={1} precision={0} 
                  />
                  <NumInput 
                    state={penaltyInputs.currentDiscountRate} 
                    stateSetter={(value) => setPenaltyInputs(prev => ({...prev, currentDiscountRate: value}))} 
                    label="Current Market Rate (%)" 
                    min={0} max={10} step={0.1} precision={2} 
                  />
                </VStack>
              )}

              {penaltyCalculationType === 'manual' && (
                <DollarInput 
                  state={penaltyInputs.manualAmount || 0} 
                  stateSetter={(value) => setPenaltyInputs(prev => ({...prev, manualAmount: value}))} 
                  label="Penalty Amount" 
                  step={100} 
                />
              )}
            </VStack>
          </Dialog.Body>
          <Dialog.Footer>
            <VStack spacing={3} w="full">
              <Button 
                onClick={handlePenaltyCalculation} 
                style={{
                  backgroundColor: '#3182CE',
                  color: 'white',
                  border: 'none'
                }}
                _hover={{ 
                  backgroundColor: '#2C5282',
                  color: 'white'
                }}
                w="full"
              >
                <Text color="white" fontWeight="medium">Apply Penalty</Text>
              </Button>
              <Button 
                onClick={handleDialogClose} 
                variant="outline" 
                w="full"
              >
                Cancel
              </Button>
            </VStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  </Box>
  );
}

export default App

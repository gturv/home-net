import { Field, NumberInput } from "@chakra-ui/react"
import { formatCurrency } from "../helpers.js"

export default function DollarInput({state, stateSetter, label, min=0, max=1000000, step=1000, precision=0, errorText, invalid}) {
  return (
    <Field.Root invalid={invalid}>
      <Field.Label whiteSpace="nowrap" fontSize={{ base: "sm", lg: "md" }}>
        {label}
      </Field.Label>
      <NumberInput.Root
        value={formatCurrency(state)}
        onValueChange={(details) => stateSetter(details.valueAsNumber || 0)}
        min={min}
        max={max}
        step={step}
        width={"132px"}
        precision={precision}
        onFocus={(e) => e.target.select()}
        marginBottom={1}
        formatOptions={{
          style: "currency",
          currency: "USD",
            maximumFractionDigits: precision,
            useGrouping: true
          }}
        >
          <NumberInput.Input />
          <NumberInput.Control />
        </NumberInput.Root>
        {errorText && <Field.ErrorText>{errorText}</Field.ErrorText>}
        </Field.Root>
  );
}
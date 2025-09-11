import { Field, NumberInput } from "@chakra-ui/react"
import { formatCurrency } from "../helpers.js"

export default function DollarInput({state, stateSetter, label, min=0, max=1000000, step=1000, precision=0}) {
  return (
    <Field.Root>
      <Field.Label>
        {label}
      </Field.Label>
      <NumberInput.Root
        value={formatCurrency(state)}
        onValueChange={(details) => stateSetter(details.valueAsNumber || 0)}
        min={min}
        max={max}
        step={step}
        precision={precision}
        onFocus={(e) => e.target.select()}
        marginBottom={3}
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
        </Field.Root>
  );
}
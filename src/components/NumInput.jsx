import { Field, NumberInput } from "@chakra-ui/react"

export default function NumInput({state, stateSetter, label, min=0, max=1000000, step=1000,  precision=0}) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <NumberInput.Root
        value={state.toString()}
        onValueChange={(details) => stateSetter(details.valueAsNumber || 0)}
        min={min}
        max={max}
        step={step}
        onFocus={(e) => e.target.select()}
        marginBottom={3}
        formatOptions={{
          style: "decimal",
          maximumFractionDigits: precision,
          minimumFractionDigits: 0,
          useGrouping: false
        }}
      >
        <NumberInput.Input />
        <NumberInput.Control>
          <NumberInput.IncrementTrigger />
          <NumberInput.DecrementTrigger />
        </NumberInput.Control>
      </NumberInput.Root>
    </Field.Root>
  );
}

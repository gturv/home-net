import { Field, NumberInput } from "@chakra-ui/react"

export default function NumInput({state, stateSetter, label, min=0, max=1000000, step=1000, precision=0, errorText, invalid}) {
  return (
    <Field.Root invalid={invalid}>
      <Field.Label whiteSpace="nowrap" fontSize={{ base: "sm", lg: "md" }}>{label}</Field.Label>
      <NumberInput.Root
        value={state.toString()}
        onValueChange={(details) => stateSetter(details.valueAsNumber || 0)}
        min={min}
        max={max}
        width={"132px"}
        step={step}
        onFocus={(e) => e.target.select()}
        marginBottom={1}
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
      {errorText && <Field.ErrorText>{errorText}</Field.ErrorText>}
    </Field.Root>
  );
}

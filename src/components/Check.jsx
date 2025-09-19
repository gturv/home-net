import { Checkbox } from "@chakra-ui/react";

export default function Check({state, stateSetter, label}) {
  return (
    <Checkbox.Root 
      checked={state} 
      onCheckedChange={(e) => stateSetter(!!e.checked)} 
      marginBottom={0.5}
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label whiteSpace="nowrap" fontSize={{ base: "sm", lg: "md" }}>{label}</Checkbox.Label>
    </Checkbox.Root>
  );
}
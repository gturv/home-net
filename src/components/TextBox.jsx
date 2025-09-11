import { Text, Field, Box } from "@chakra-ui/react"

export default function TextBox({label, value, bold = false, onClick = null}) {
  return (
    <Field.Root>
      <Field.Label>
        {label}
      </Field.Label>
      <Box
        border="1px solid"
        borderColor="border.emphasized"
        borderRadius="md"
        px={3}
        py={2}
        bg="bg.panel"
        minH="10"
        width="182px"
        display="flex"
        alignItems="center"
        color="fg.default"
        fontSize="sm"
        fontFamily="inherit"
        fontWeight={bold ? "bold" : "normal"}
        marginBottom={3}
        onClick={onClick}
        _focusVisible={{
          borderColor: "colorPalette.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-colorPalette-500)"
        }}
      >
        {value}
      </Box>
    </Field.Root>
  );
}
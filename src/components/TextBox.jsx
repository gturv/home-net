import { Text, Field, Box } from "@chakra-ui/react"

export default function TextBox({label, value, bold = false, onClick = null}) {
  return (
    <Field.Root>
      <Field.Label whiteSpace="nowrap" fontSize={{ base: "sm", lg: "md" }}>
        {label}
      </Field.Label>
      <Box
        border="1px solid"
        borderColor="gray.300"
        borderRadius="md"
        px={3}
        py={2}
        bg="bg.default"
        minH="10"
        width="132px"
        display="flex"
        alignItems="center"
        color="fg.default"
        fontSize="sm"
        fontFamily="inherit"
        fontWeight={bold ? "bold" : "normal"}
        marginBottom={1}
        cursor={onClick ? "pointer" : "default"}
        
        onClick={onClick}
        _hover={onClick ? {
          bg: "bg.subtle"
        } : {}}
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

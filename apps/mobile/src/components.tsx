import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
export function Button({
  title,
  onPress,
  disabled = false,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.secondary,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={[styles.buttonText, secondary && { color: "#173d2c" }]}>
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={[styles.input, error && { borderColor: "#a12626" }]}
        placeholderTextColor="#68746c"
        {...props}
      />
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
export function Choice({
  label,
  values,
  value,
  onChange,
  error,
}: {
  label: string;
  values: readonly string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>
        {values.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityLabel={label + ": " + option}
            accessibilityState={{ selected: value === option }}
            onPress={() => onChange(option)}
            style={[styles.choice, value === option && styles.chosen]}
          >
            <Text style={{ color: value === option ? "white" : "#173d2c" }}>
              {option.charAt(0) + option.slice(1).toLowerCase()}
            </Text>
          </Pressable>
        ))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f7f3" },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 48,
    maxWidth: 620,
    width: "100%",
    alignSelf: "center",
  },
  title: { fontSize: 32, fontWeight: "700", color: "#173d2c" },
  subtitle: { fontSize: 17, color: "#4b5d51", marginTop: 6, marginBottom: 24 },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  heading: {
    fontSize: 23,
    fontWeight: "600",
    color: "#173d2c",
    marginBottom: 12,
  },
  field: { marginBottom: 18 },
  label: { fontSize: 15, fontWeight: "600", color: "#263d30", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#b5c2b7",
    borderRadius: 8,
    padding: 12,
    fontSize: 17,
    color: "#142b1c",
    minHeight: 48,
  },
  button: {
    backgroundColor: "#173d2c",
    padding: 15,
    borderRadius: 9,
    alignItems: "center",
    marginVertical: 6,
    minHeight: 48,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  secondary: { backgroundColor: "#e5ece3" },
  error: { color: "#9d2323", fontSize: 14, marginTop: 5, marginBottom: 8 },
  note: { fontSize: 14, color: "#526256", marginBottom: 12, lineHeight: 21 },
  success: { color: "#17603a", marginBottom: 12, fontSize: 16 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: {
    borderWidth: 1,
    borderColor: "#9eafa1",
    borderRadius: 8,
    padding: 12,
    minHeight: 44,
  },
  chosen: { backgroundColor: "#173d2c", borderColor: "#173d2c" },
});

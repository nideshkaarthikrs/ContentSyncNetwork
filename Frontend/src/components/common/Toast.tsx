import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToastStore } from "../../store/toastStore";

/** Global error toast, mounted once in App.tsx above the navigator. */
export default function Toast() {
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);
  const insets = useSafeAreaInsets();

  if (!message) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.toast, { top: insets.top + 8 }]}
      onPress={hide}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{message}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "#1F2937",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 1000,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    color: "#FFF",
    fontSize: 14,
  },
});

import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToastStore } from "../../store/toastStore";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

/** Global error toast, mounted once in App.tsx above the navigator. */
export default function Toast() {
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = getStyles(theme);

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

const getStyles = (theme: Theme) => StyleSheet.create({
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    // Deliberately theme-invariant: a transient alert overlay stays legible
    // in both light and dark mode only if it doesn't follow the screen
    // background, so this dark slate + white text is fixed regardless of
    // `theme.dark` rather than mapped to theme.colors.surface/text.
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
    // See comment on `toast.backgroundColor` above -- paired fixed white text.
    color: "#FFF",
    fontSize: 14,
  },
});

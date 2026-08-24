import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useEffect, useRef } from "react";
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

// Purely presentational: AppNavigator renders this while the session hydrates
// and decides itself which navigator group to mount afterwards.
export default function SplashScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);
  // useRef, not a plain new Animated.Value: a re-render would otherwise bind
  // the style to a fresh 0.6-scale value while the spring drives the old one.
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  }, [scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <MaterialCommunityIcons
          name="music-note"
          size={70}
          color={theme.colors.primary}
        />

        <Text style={styles.logo}>CSN</Text>

        <Text style={styles.title}>
          Creative Sync Network
        </Text>

        <Text style={styles.subtitle}>
          Connect • Create • Collaborate
        </Text>
      </Animated.View>

      <View style={styles.waveContainer}>
        <Text style={styles.wave}>
          ─╱╲─╱╲──╱╲─╱╲──╱╲─╱╲──╱╲─╱╲──╱╲─
        </Text>
      </View>
    </View>
  );
}

const getStyles = (theme: Theme, insets: { top: number; bottom: number }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 80 + insets.top,
    paddingBottom: 80 + insets.bottom
  },

  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  logo: {
    fontSize: 54,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginTop: 10
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 10,
    color: theme.colors.text
  },

  subtitle: {
    fontSize: 14,
    marginTop: 10,
    color: theme.colors.textMuted
  },

  waveContainer: {
    marginBottom: 20
  },

  wave: {
    color: theme.colors.primary,
    fontSize: 18
  }
});
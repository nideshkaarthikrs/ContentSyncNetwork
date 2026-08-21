import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useEffect, useRef } from "react";
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";

// Purely presentational: AppNavigator renders this while the session hydrates
// and decides itself which navigator group to mount afterwards.
export default function SplashScreen() {
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
      <StatusBar barStyle="dark-content" />

      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <MaterialCommunityIcons
          name="music-note"
          size={70}
          color="#7C3AED"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
    marginTop: 36,
    marginBottom: 50
  },

  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  logo: {
    fontSize: 54,
    fontWeight: "bold",
    color: "#7C3AED",
    marginTop: 10
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 10,
    color: "#111827"
  },

  subtitle: {
    fontSize: 14,
    marginTop: 10,
    color: "#6B7280"
  },

  waveContainer: {
    marginBottom: 20
  },

  wave: {
    color: "#A855F7",
    fontSize: 18
  }
});
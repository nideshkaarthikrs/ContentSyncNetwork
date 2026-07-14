import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";

import { useAuthStore } from "../../store/authStore";

interface Props {
  navigation: any;
}

const MIN_SPLASH_MS = 2500;

export default function SplashScreen({ navigation }: Props) {
  const scaleAnim = new Animated.Value(0.6);
  const token = useAuthStore(state => state.token);
  const isHydrated = useAuthStore(state => state.isHydrated);
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const elapsed = Date.now() - mountedAt.current;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);

    const timer = setTimeout(() => {
      navigation.replace(token ? "Main" : "Login");
    }, remaining);

    return () => clearTimeout(timer);
  }, [isHydrated, token]);

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
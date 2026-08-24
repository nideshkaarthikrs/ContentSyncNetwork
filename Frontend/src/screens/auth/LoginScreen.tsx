import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getErrorMessage } from "../../api/getErrorMessage";
import { useLogin } from "../../hooks/auth/useLogin";
import { RootStackParamList } from "../../navigation/types";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";
import { isEmailFormat, isMobileFormat } from "../../utils/validators";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({
  navigation
}: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const login = useLogin();

  const handleLogin = async () => {
    const trimmedIdentifier = identifier.trim();
    // The backend already accepts either an email or a mobile number for this field
    // (see the "Email or Mobile" placeholder below) -- validate the format matches
    // one of the two before submitting, don't restrict the UI to email-only.
    if (!isEmailFormat(trimmedIdentifier) && !isMobileFormat(trimmedIdentifier)) {
      setError("Enter a valid email address or mobile number.");
      return;
    }
    setError(null);
    try {
      await login.mutateAsync({ email: trimmedIdentifier.toLowerCase(), password });
      // No navigation here: setting the session token swaps AppNavigator's
      // auth-gated groups automatically.
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password."));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center"
        }}
      >
        <Text style={styles.heading}>
          Welcome Back!
        </Text>

        <Text style={styles.subHeading}>
          Login to continue
        </Text>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color={theme.colors.textMuted}
          />

          <TextInput
            placeholder="Email or Mobile"
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color={theme.colors.textMuted}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={login.isPending}
        >
          <Text style={styles.loginText}>
            {login.isPending ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("SignUp")
            }
          >
            <Text style={styles.signupText}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    color: theme.colors.text
  },

  subHeading: {
    textAlign: "center",
    color: theme.colors.textMuted,
    marginTop: 10,
    marginBottom: 40
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    height: 56
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: theme.colors.text
  },

  errorText: {
    color: theme.colors.danger,
    textAlign: "center",
    marginBottom: 15
  },

  loginButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  loginText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 35
  },

  footerText: {
    color: theme.colors.textMuted
  },

  signupText: {
    color: theme.colors.primary,
    fontWeight: "700",
    marginLeft: 5
  }
});
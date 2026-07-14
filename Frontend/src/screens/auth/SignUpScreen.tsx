import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  navigation: any;
}

export default function SignUpScreen({
  navigation
}: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (!fullName || !email || !mobile || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    navigation.navigate("RoleSelection", {
      draft: { fullName, email, mobile, password }
    });
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
          Create Account
        </Text>

        <Text style={styles.subHeading}>
          Join the Creative Sync Network
        </Text>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color="#888"
          />

          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color="#888"
          />

          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="phone-outline"
            size={20}
            color="#888"
          />

          <TextInput
            placeholder="Mobile"
            style={styles.input}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color="#888"
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
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
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            Next
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Login")
            }
          >
            <Text style={styles.loginText}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = "#7C3AED";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 24,
    marginTop: 36,
    marginBottom: 50
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827"
  },

  subHeading: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 10,
    marginBottom: 40
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    height: 56
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15
  },

  errorText: {
    color: "#DC2626",
    marginBottom: 15,
    textAlign: "center"
  },

  nextButton: {
    backgroundColor: PRIMARY,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },

  nextText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 35
  },

  footerText: {
    color: "#6B7280"
  },

  loginText: {
    color: PRIMARY,
    fontWeight: "700",
    marginLeft: 5
  }
});

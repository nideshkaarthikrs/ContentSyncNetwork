import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons
} from "@expo/vector-icons";
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

export default function LoginScreen({
  navigation
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    navigation.navigate("RoleSelection");
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
            color="#888"
          />

          <TextInput
            placeholder="Email or Mobile"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
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

        <TouchableOpacity>
          <Text style={styles.forgot}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginText}>
            Login
          </Text>
        </TouchableOpacity>

        <Text style={styles.orText}>
          or continue with
        </Text>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <AntDesign
              name="google"
              size={22}
              color="#EA4335"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn}>
            <AntDesign
              name="apple"
              size={22}
              color="#000"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn}>
            <FontAwesome
              name="facebook"
              size={22}
              color="#1877F2"
            />
          </TouchableOpacity>
        </View>

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

  forgot: {
    alignSelf: "flex-end",
    color: "#6B7280",
    marginBottom: 25
  },

  loginButton: {
    backgroundColor: PRIMARY,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  loginText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  },

  orText: {
    textAlign: "center",
    marginVertical: 25,
    color: "#6B7280"
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15
  },

  socialBtn: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center"
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 35
  },

  footerText: {
    color: "#6B7280"
  },

  signupText: {
    color: PRIMARY,
    fontWeight: "700",
    marginLeft: 5
  }
});
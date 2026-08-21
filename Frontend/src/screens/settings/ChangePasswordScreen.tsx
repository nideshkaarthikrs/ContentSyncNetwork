import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getErrorMessage } from "../../api/getErrorMessage";
import { useChangePassword } from "../../hooks/auth/useChangePassword";

interface Props {
  navigation: any;
}

export default function ChangePasswordScreen({ navigation }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const changePassword = useChangePassword();

  const handleSubmit = async () => {
    setError(null);
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      Alert.alert("Success", "Your password has been changed.");
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err, "Could not change password. Please try again."));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="lock-outline" size={20} color="#888" />
        <TextInput
          placeholder="Current Password"
          secureTextEntry
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="lock-check-outline" size={20} color="#888" />
        <TextInput
          placeholder="New Password"
          secureTextEntry
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={changePassword.isPending}
      >
        <Text style={styles.submitText}>
          {changePassword.isPending ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const PRIMARY = "#7C3AED";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    marginTop: 36,
    marginBottom: 50
  },

  header: {
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700"
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
    textAlign: "center",
    marginBottom: 15
  },

  submitButton: {
    backgroundColor: PRIMARY,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },

  submitText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  }
});

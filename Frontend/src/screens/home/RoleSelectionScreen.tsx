import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getErrorMessage } from "../../api/getErrorMessage";
import { Role } from "../../api/services/auth.api";
import { useRegister } from "../../hooks/auth/useRegister";
import { RootStackParamList } from "../../navigation/types";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

type Props = NativeStackScreenProps<RootStackParamList, "RoleSelection">;

const roles: { id: string; title: string; icon: string; role: Role }[] = [
  {
    id: "1",
    title: "Composer",
    icon: "music-note",
    role: "COMPOSER"
  },
  {
    id: "2",
    title: "Lyric Writer",
    icon: "lead-pencil",
    role: "LYRICIST"
  },
  {
    id: "3",
    title: "Singer",
    icon: "microphone",
    role: "SINGER"
  },
  {
    id: "4",
    title: "Director",
    icon: "video-outline",
    role: "DIRECTOR"
  },
  {
    id: "5",
    title: "Producer",
    icon: "movie-open-outline",
    role: "PRODUCER"
  },
  {
    id: "6",
    title: "Audience",
    icon: "account-group-outline",
    role: "AUDIENCE"
  }
];

export default function RoleSelectionScreen({
  navigation,
  route
}: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [selectedRoles, setSelectedRoles] = useState<
    string[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const register = useRegister();

  const toggleRole = (id: string) => {
    if (selectedRoles.includes(id)) {
      setSelectedRoles(
        selectedRoles.filter(item => item !== id)
      );
    } else {
      setSelectedRoles([...selectedRoles, id]);
    }
  };

  const handleContinue = async () => {
    const draft = route?.params?.draft;
    if (!draft) {
      setError("Missing sign-up details. Please start over from Sign Up.");
      return;
    }
    if (selectedRoles.length === 0) {
      setError("Select at least one role.");
      return;
    }
    setError(null);

    const mappedRoles = roles
      .filter(item => selectedRoles.includes(item.id))
      .map(item => item.role);

    try {
      await register.mutateAsync({
        ...draft,
        roles: mappedRoles
      });
      navigation.replace("Login");
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Feather
          name="arrow-left"
          size={22}
          color={theme.colors.text}
        />
      </TouchableOpacity>

      <Text style={styles.title}>
        Select Your Roles
      </Text>

      <Text style={styles.subtitle}>
        Choose all that apply
      </Text>

      <FlatList
        data={roles}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          marginTop: 30
        }}
        renderItem={({ item }) => {
          const selected =
            selectedRoles.includes(item.id);

          return (
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => toggleRole(item.id)}
            >
              <View style={styles.roleLeft}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={24}
                  color={theme.colors.primary}
                />

                <Text style={styles.roleName}>
                  {item.title}
                </Text>
              </View>

              <View
                style={[
                  styles.checkbox,
                  selected &&
                    styles.checkboxSelected
                ]}
              >
                {selected && (
                  <Feather
                    name="check"
                    size={14}
                    color="#fff"
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
        disabled={register.isPending}
      >
        <Text style={styles.continueText}>
          {register.isPending ? "Creating account..." : "Continue"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20
  },

  backBtn: {
    marginTop: 15
  },

  title: {
    marginTop: 25,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: theme.colors.text
  },

  subtitle: {
    textAlign: "center",
    color: theme.colors.textMuted,
    marginTop: 8
  },

  roleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18
  },

  roleLeft: {
    flexDirection: "row",
    alignItems: "center"
  },

  roleName: {
    marginLeft: 15,
    fontSize: 16,
    color: theme.colors.text
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center"
  },

  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },

  errorText: {
    color: theme.colors.danger,
    textAlign: "center",
    marginBottom: 15
  },

  continueButton: {
    backgroundColor: theme.colors.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25
  },

  // White label on the primary-colored button; kept literal per the
  // white-on-primary exception.
  continueText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  }
});
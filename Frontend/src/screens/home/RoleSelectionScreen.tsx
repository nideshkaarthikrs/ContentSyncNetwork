import {
  Feather,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { getErrorMessage } from "../../api/getErrorMessage";
import { Role } from "../../api/services/auth.api";
import { useRegister } from "../../hooks/auth/useRegister";

interface Props {
  navigation: any;
  route: any;
}

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
          color="#111"
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
                  color="#7C3AED"
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

const PRIMARY = "#7C3AED";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    marginTop: 36,
    marginBottom: 50
  },

  backBtn: {
    marginTop: 15
  },

  title: {
    marginTop: 25,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center"
  },

  subtitle: {
    textAlign: "center",
    color: "#777",
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
    color: "#111"
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center"
  },

  checkboxSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY
  },

  errorText: {
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 15
  },

  continueButton: {
    backgroundColor: PRIMARY,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25
  },

  continueText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  }
});
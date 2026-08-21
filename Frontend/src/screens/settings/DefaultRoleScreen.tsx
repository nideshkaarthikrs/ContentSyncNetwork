import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getErrorMessage } from "../../api/getErrorMessage";
import { useProfile } from "../../hooks/profile/useProfile";
import { useUpdateProfile } from "../../hooks/profile/useUpdateProfile";
import { useAuthStore } from "../../store/authStore";

interface Props {
  navigation: any;
}

const ROLE_ICON: Record<string, string> = {
  COMPOSER: "music-note",
  LYRICIST: "lead-pencil",
  SINGER: "microphone",
  DIRECTOR: "video-outline",
  PRODUCER: "movie-open-outline",
  AUDIENCE: "account-group-outline",
};

export default function DefaultRoleScreen({ navigation }: Props) {
  const userId = useAuthStore((state) => state.user?.userId);
  const { data: profile, isLoading } = useProfile(userId);
  const updateProfile = useUpdateProfile(userId);
  const [selected, setSelected] = useState<string | null>(profile?.primaryRole ?? null);

  const handleSelect = async (role: string) => {
    setSelected(role);
    try {
      await updateProfile.mutateAsync({ primaryRole: role });
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err, "Could not update default role."));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Default Role</Text>
        <View style={{ width: 22 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#7C3AED" />
      ) : (
        <FlatList
          data={profile?.roles ?? []}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => {
            const isSelected = (selected ?? profile?.primaryRole) === item;
            return (
              <TouchableOpacity style={styles.roleCard} onPress={() => handleSelect(item)}>
                <View style={styles.roleLeft}>
                  <MaterialCommunityIcons
                    name={(ROLE_ICON[item] ?? "account") as any}
                    size={24}
                    color="#7C3AED"
                  />
                  <Text style={styles.roleName}>{item}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No roles set on your profile yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const PRIMARY = "#7C3AED";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    marginTop: 36,
    marginBottom: 50
  },

  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700"
  },

  roleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE"
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

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center"
  },

  radioSelected: {
    borderColor: PRIMARY
  },

  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#777"
  }
});

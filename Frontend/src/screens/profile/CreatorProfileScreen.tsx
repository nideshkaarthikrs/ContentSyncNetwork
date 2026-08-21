import Feather from "react-native-vector-icons/Feather";
import { launchImageLibrary } from "react-native-image-picker";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getErrorMessage } from "../../api/getErrorMessage";
import { serviceBaseUrl } from "../../config/services";
import { useProfile } from "../../hooks/profile/useProfile";
import { useUploadPhoto } from "../../hooks/profile/useUploadPhoto";
import { useAuthStore } from "../../store/authStore";

const FALLBACK_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg";

interface Props {
  navigation: any;
}

export default function CreatorProfileScreen({
  navigation
}: Props) {
  const userId = useAuthStore((state) => state.user?.userId);
  const { data: profile, isLoading } = useProfile(userId);
  const uploadPhoto = useUploadPhoto(userId);

  const avatarUri = profile?.avatarUrl
    ? `${serviceBaseUrl("profile")}${profile.avatarUrl}`
    : FALLBACK_AVATAR;

  const handleChangePhoto = async () => {
    const result = await launchImageLibrary({ mediaType: "photo", quality: 0.8 });
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert(
        result.errorCode === "permission" ? "Permission needed" : "Error",
        result.errorCode === "permission"
          ? "Photo library permission is required to change your profile photo."
          : result.errorMessage ?? "Could not open photo library."
      );
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    try {
      await uploadPhoto.mutateAsync({
        uri: asset.uri,
        name: asset.fileName ?? "photo.jpg",
        type: asset.type ?? "image/jpeg"
      });
    } catch (err) {
      Alert.alert("Upload failed", getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Cover */}

        <View style={styles.cover}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="arrow-left"
              size={22}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        {/* Profile */}

        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleChangePhoto} disabled={uploadPhoto.isPending}>
            <Image
              source={{
                uri: avatarUri
              }}
              style={styles.profileImage}
            />

            <View style={styles.editBadge}>
              {uploadPhoto.isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Feather name="camera" size={14} color="#FFF" />
              )}
            </View>
          </TouchableOpacity>

          {isLoading ? (
            <ActivityIndicator style={{ marginTop: 15 }} color={PRIMARY} />
          ) : (
            <>
              <Text style={styles.name}>
                {profile?.name || "Your Name"}
              </Text>

              <Text style={styles.role}>
                {profile?.roles?.join(" • ") || "No roles set"}
              </Text>

              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.statValue}>
                    {profile?.followers ?? 0}
                  </Text>
                  <Text style={styles.statLabel}>
                    Followers
                  </Text>
                </View>

                <View>
                  <Text style={styles.statValue}>
                    {profile?.rating?.toFixed(1) ?? "—"}
                  </Text>
                  <Text style={styles.statLabel}>
                    Rating
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* About */}

        <Text style={styles.sectionTitle}>
          About
        </Text>

        <Text style={styles.aboutText}>
          Passionate composer creating
          cinematic melodies, independent
          music projects, and collaborative
          productions across multiple genres.
        </Text>

        {/* Skills */}

        <Text style={styles.sectionTitle}>
          Skills
        </Text>

        <View style={styles.skillsRow}>
          {[
            "Composition",
            "Piano",
            "Orchestration",
            "Mixing"
          ].map(skill => (
            <View
              key={skill}
              style={styles.skillChip}
            >
              <Text>{skill}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
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

  cover: {
    height: 180,
    backgroundColor: PRIMARY
  },

  backButton: {
    marginTop: 50,
    marginLeft: 20
  },

  profileSection: {
    alignItems: "center",
    marginTop: -50
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFF"
  },

  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: PRIMARY,
    borderWidth: 2,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center"
  },

  name: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "700"
  },

  role: {
    color: "#666",
    marginTop: 5
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 25
  },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center"
  },

  statLabel: {
    color: "#666",
    textAlign: "center"
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "700"
  },

  aboutText: {
    marginHorizontal: 20,
    lineHeight: 22,
    color: "#555"
  },

  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20
  },

  skillChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8
  }
});

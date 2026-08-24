import { isAxiosError } from "axios";
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
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getErrorMessage } from "../../api/getErrorMessage";
import { resolveAssetUrl } from "../../config/services";
import { useProfile } from "../../hooks/profile/useProfile";
import { useUploadPhoto } from "../../hooks/profile/useUploadPhoto";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";
import { preflightUpload } from "../../utils/uploadPreflight";

const FALLBACK_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg";

type Props = NativeStackScreenProps<RootStackParamList, "CreatorProfile">;

export default function CreatorProfileScreen({
  navigation
}: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const userId = useAuthStore((state) => state.user?.userId);
  const { data: profile, isLoading, error } = useProfile(userId);
  const uploadPhoto = useUploadPhoto(userId);

  const isPrivateProfile =
    isAxiosError(error) &&
    error.response?.status === 403 &&
    (error.response?.data as { errorCode?: string } | undefined)?.errorCode === "CSN-PROFILE-PRIVATE";

  const avatarUri = profile?.avatarUrl
    ? resolveAssetUrl("profile", profile.avatarUrl)
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

    const name = asset.fileName ?? "photo.jpg";
    const preflight = preflightUpload("profile", {
      name,
      type: asset.type ?? "image/jpeg",
      size: asset.fileSize,
    });
    if (!preflight.ok) {
      Alert.alert("Upload failed", preflight.error ?? "Selected file is invalid.");
      return;
    }

    try {
      await uploadPhoto.mutateAsync({
        uri: asset.uri,
        name,
        type: preflight.file.type
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

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 30 }} color={theme.colors.primary} />
        ) : isPrivateProfile ? (
          <View style={styles.privateState}>
            <Feather name="lock" size={32} color={theme.colors.textMuted} />
            <Text style={styles.privateText}>
              This profile is private
            </Text>
          </View>
        ) : (
          <>
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
            </View>

            {/* Bio */}

            <Text style={styles.sectionTitle}>
              About
            </Text>

            <Text style={styles.aboutText}>
              {profile?.bio || "No bio yet"}
            </Text>
          </>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },

  cover: {
    height: 180,
    backgroundColor: theme.colors.primary
  },

  backButton: {
    marginTop: 50,
    marginLeft: 20
  },

  profileSection: {
    alignItems: "center",
    marginTop: -50
  },

  // White photo-frame ring around the avatar, which overlaps the primary
  // cover; kept literal so the ring reads consistently against the photo
  // in both themes (same rationale as the white-on-primary exception).
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
    backgroundColor: theme.colors.primary,
    // White ring separating the primary-colored badge from the avatar photo
    // behind it; kept literal for the same reason as profileImage's border.
    borderWidth: 2,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center"
  },

  name: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text
  },

  role: {
    color: theme.colors.textMuted,
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
    textAlign: "center",
    color: theme.colors.text
  },

  statLabel: {
    color: theme.colors.textMuted,
    textAlign: "center"
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text
  },

  aboutText: {
    marginHorizontal: 20,
    lineHeight: 22,
    color: theme.colors.text
  },

  privateState: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 40
  },

  privateText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: "center"
  }
});

import Feather from "react-native-vector-icons/Feather";
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
import TunePlayButton from "../../components/common/TunePlayButton";
import { useStopAudioOnBlur } from "../../hooks/useStopAudioOnBlur";
import { useDeleteTune } from "../../hooks/tune/useDeleteTune";
import { useMyTunes } from "../../hooks/tune/useMyTunes";
import { useMyProjects } from "../../hooks/project/useMyProjects";
import { useProfile } from "../../hooks/profile/useProfile";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";

type Props = NativeStackScreenProps<RootStackParamList, "ComposerDashboard">;

const FALLBACK_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg";

export default function ComposerDashboardScreen({
  navigation
}: Props) {
  useStopAudioOnBlur();

  const { data, isLoading, isError, refetch } = useMyTunes(1, 5);
  const tunes = data?.tunes ?? [];
  const deleteTune = useDeleteTune();

  const { data: projectsData } = useMyProjects(1, 5);

  const userId = useAuthStore((state) => state.user?.userId);
  const { data: profile } = useProfile(userId);
  const avatarUri = profile?.avatarUrl
    ? resolveAssetUrl("profile", profile.avatarUrl)
    : FALLBACK_AVATAR;

  const handleDelete = (tuneId: string) => {
    Alert.alert("Delete Tune", "This can't be undone. Delete this tune?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTune.mutateAsync(tuneId);
          } catch (err) {
            Alert.alert("Error", getErrorMessage(err, "Failed to delete tune."));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Purple Header */}

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>
              Composer Studio
            </Text>

            <Feather
              name="bell"
              size={20}
              color="#FFF"
            />
          </View>

          <Image
            source={{
              uri: avatarUri
            }}
            style={styles.profile}
          />
        </View>

        {/* Stats */}

        <View style={styles.statsGrid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              My Tunes
            </Text>

            <Text style={styles.cardValue}>
              {data?.total ?? "—"}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              Active Projects
            </Text>

            <Text style={styles.cardValue}>
              {projectsData?.total ?? "—"}
            </Text>
          </View>
        </View>

        {/* Upload */}

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() =>
            navigation.navigate("UploadTune")
          }
        >
          <Text style={styles.uploadText}>
            Upload New Tune
          </Text>
        </TouchableOpacity>

        {/* Recent Tunes */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            My Recent Tunes
          </Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <ActivityIndicator style={{ marginTop: 20 }} color={PRIMARY} />
        )}

        {isError && !isLoading && (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={styles.emptyText}>
              Couldn't load your tunes. Check your connection.
            </Text>
            <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 8 }}>
              <Text style={styles.seeAll}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && tunes.length === 0 && (
          <Text style={styles.emptyText}>
            No tunes yet. Upload your first one above.
          </Text>
        )}

        {tunes.map((tune) => (
          <TouchableOpacity
            key={tune.tuneId}
            style={styles.tuneCard}
            onPress={() =>
              navigation.navigate("TuneDetail", { tuneId: tune.tuneId })
            }
          >
            <View style={styles.tuneIconWrap}>
              <Feather name="music" size={24} color={PRIMARY} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.songName}>
                {tune.title}
              </Text>

              <Text style={styles.songMeta}>
                {tune.genre} • {tune.mood}
              </Text>
            </View>

            <View style={styles.rowActions}>
              <TunePlayButton tuneId={tune.tuneId} audioUrl={tune.audioUrl} size="small" />

              <TouchableOpacity
                onPress={() => handleDelete(tune.tuneId)}
                disabled={deleteTune.isPending}
                style={styles.deleteIconBtn}
              >
                <Feather name="trash-2" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>

            <Text style={styles.time}>
              {tune.status}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 80 }} />
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

  header: {
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700"
  },

  profile: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginTop: 20
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 20
  },

  card: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2
  },

  cardLabel: {
    color: "#666"
  },

  cardValue: {
    marginTop: 8,
    fontWeight: "700",
    fontSize: 22
  },

  uploadBtn: {
    backgroundColor: PRIMARY,
    marginHorizontal: 20,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  uploadText: {
    color: "#FFF",
    fontWeight: "700"
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 25
  },

  sectionTitle: {
    fontWeight: "700",
    fontSize: 18
  },

  seeAll: {
    color: PRIMARY
  },

  tuneCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 15
  },

  tuneIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center"
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    paddingHorizontal: 20
  },

  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10
  },

  deleteIconBtn: {
    marginLeft: 8,
    padding: 4
  },

  songName: {
    fontWeight: "700"
  },

  songMeta: {
    color: "#666",
    marginTop: 4
  },

  time: {
    color: "#888",
    fontSize: 12
  }
});
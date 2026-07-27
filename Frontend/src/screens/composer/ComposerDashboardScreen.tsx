import {
  Feather
} from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TunePlayButton from "../../components/common/TunePlayButton";
import { useMyTunes } from "../../hooks/tune/useMyTunes";

interface Props {
  navigation: any;
}

export default function ComposerDashboardScreen({
  navigation
}: Props) {
  const { data, isLoading } = useMyTunes(1, 5);
  const tunes = data?.tunes ?? [];

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
              uri:
                "https://randomuser.me/api/portraits/men/32.jpg"
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
              12
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              Total Plays
            </Text>

            <Text style={styles.cardValue}>
              45.6K
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              Revenue
            </Text>

            <Text style={styles.cardValue}>
              ₹45,320
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

        {!isLoading && tunes.length === 0 && (
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

            <View style={{ marginRight: 10 }}>
              <TunePlayButton tuneId={tune.tuneId} audioUrl={tune.audioUrl} size="small" />
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
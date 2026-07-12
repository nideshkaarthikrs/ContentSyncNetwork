import {
  Feather
} from "@expo/vector-icons";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  navigation: any;
}

export default function ComposerDashboardScreen({
  navigation
}: Props) {
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
              24
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

        <TouchableOpacity
          style={styles.tuneCard}
        >
          <Image
            source={{
              uri:
                "https://picsum.photos/200/300?4"
            }}
            style={styles.tuneImage}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.songName}>
              Love Theme
            </Text>

            <Text style={styles.songMeta}>
              50 Lyrics • 12 Singers
            </Text>
          </View>

          <Text style={styles.time}>
            2h ago
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tuneCard}
        >
          <Image
            source={{
              uri:
                "https://picsum.photos/200/300?5"
            }}
            style={styles.tuneImage}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.songName}>
              Freedom
            </Text>

            <Text style={styles.songMeta}>
              32 Lyrics • 8 Singers
            </Text>
          </View>

          <Text style={styles.time}>
            1d ago
          </Text>
        </TouchableOpacity>

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

  tuneImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12
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
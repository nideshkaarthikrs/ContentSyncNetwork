import {
  Feather,
  Ionicons
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
  route: any;
}

export default function TuneDetailScreen({
  navigation
}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}

        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri:
                "https://picsum.photos/500/700"
            }}
            style={styles.coverImage}
          />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="arrow-left"
              size={22}
              color="#FFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
          >
            <Ionicons
              name="play"
              size={34}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        {/* Tune Info */}

        <View style={styles.content}>
          <Text style={styles.title}>
            Love Melody
          </Text>

          <View style={styles.creatorRow}>
            <Image
              source={{
                uri:
                  "https://randomuser.me/api/portraits/men/32.jpg"
              }}
              style={styles.avatar}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.creator}>
                Arjun Music
              </Text>

              <Text style={styles.role}>
                Composer
              </Text>
            </View>

            <TouchableOpacity
              style={styles.followBtn}
            >
              <Text
                style={styles.followText}
              >
                Follow
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statValue}>
                1.2K
              </Text>
              <Text style={styles.statLabel}>
                Plays
              </Text>
            </View>

            <View>
              <Text style={styles.statValue}>
                125
              </Text>
              <Text style={styles.statLabel}>
                Lyrics
              </Text>
            </View>

            <View>
              <Text style={styles.statValue}>
                40
              </Text>
              <Text style={styles.statLabel}>
                Singers
              </Text>
            </View>

            <View>
              <Text style={styles.statValue}>
                5
              </Text>
              <Text style={styles.statLabel}>
                Videos
              </Text>
            </View>
          </View>

          {/* Description */}

          <Text style={styles.sectionTitle}>
            About Tune
          </Text>

          <Text style={styles.description}>
            A romantic melody with soft beats
            perfect for love songs and lyrical
            collaborations.
          </Text>

          {/* Tags */}

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text>Romantic</Text>
            </View>

            <View style={styles.tag}>
              <Text>Slow</Text>
            </View>

            <View style={styles.tag}>
              <Text>72 BPM</Text>
            </View>

            <View style={styles.tag}>
              <Text>C Major</Text>
            </View>
          </View>

          {/* Actions */}

          <Text style={styles.sectionTitle}>
            Get Involved
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate(
                "LyricsSubmission"
              )
            }
          >
            <Text style={styles.actionText}>
              Write Lyrics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate(
                "SingerStudio"
              )
            }
          >
            <Text style={styles.actionText}>
              Sing This Tune
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate(
                "DirectorStudio"
              )
            }
          >
            <Text style={styles.actionText}>
              Create Video
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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

  imageWrapper: {
    height: 280
  },

  coverImage: {
    width: "100%",
    height: "100%"
  },

  backBtn: {
    position: "absolute",
    top: 50,
    left: 20
  },

  playButton: {
    position: "absolute",
    top: "45%",
    left: "45%",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center"
  },

  content: {
    padding: 20
  },

  title: {
    fontSize: 28,
    fontWeight: "700"
  },

  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 10
  },

  creator: {
    fontWeight: "700"
  },

  role: {
    color: "#777"
  },

  followBtn: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8
  },

  followText: {
    color: PRIMARY,
    fontWeight: "700"
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25
  },

  statValue: {
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center"
  },

  statLabel: {
    color: "#777",
    textAlign: "center"
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 10,
    fontWeight: "700",
    fontSize: 18
  },

  description: {
    lineHeight: 22,
    color: "#555"
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15
  },

  tag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8
  },

  actionButton: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 10,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12
  },

  actionText: {
    color: PRIMARY,
    fontWeight: "700"
  }
});
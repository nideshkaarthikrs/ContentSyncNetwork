import {
  Feather,
  MaterialCommunityIcons
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

export default function CreatorProfileScreen({
  navigation
}: Props) {
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
          <Image
            source={{
              uri:
                "https://randomuser.me/api/portraits/men/32.jpg"
            }}
            style={styles.profileImage}
          />

          <Text style={styles.name}>
            Arjun Music
          </Text>

          <Text style={styles.role}>
            Composer • Producer
          </Text>

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statValue}>
                124
              </Text>
              <Text style={styles.statLabel}>
                Tunes
              </Text>
            </View>

            <View>
              <Text style={styles.statValue}>
                18K
              </Text>
              <Text style={styles.statLabel}>
                Followers
              </Text>
            </View>

            <View>
              <Text style={styles.statValue}>
                4.9
              </Text>
              <Text style={styles.statLabel}>
                Rating
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.followButton}
            >
              <Text
                style={styles.followText}
              >
                Follow
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageButton}
            >
              <MaterialCommunityIcons
                name="message-outline"
                size={20}
                color="#7C3AED"
              />
            </TouchableOpacity>
          </View>
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

        {/* Portfolio */}

        <Text style={styles.sectionTitle}>
          Featured Works
        </Text>

        {[1, 2, 3].map(item => (
          <TouchableOpacity
            key={item}
            style={styles.workCard}
          >
            <View>
              <Text style={styles.workTitle}>
                Love Melody {item}
              </Text>

              <Text
                style={styles.workMeta}
              >
                12.5K Plays
              </Text>
            </View>

            <Feather
              name="play-circle"
              size={28}
              color="#7C3AED"
            />
          </TouchableOpacity>
        ))}

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

  actionRow: {
    flexDirection: "row",
    marginTop: 20
  },

  followButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10
  },

  followText: {
    color: "#FFF",
    fontWeight: "700"
  },

  messageButton: {
    marginLeft: 12,
    borderWidth: 1,
    borderColor: PRIMARY,
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 10
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

  workCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  workTitle: {
    fontWeight: "700"
  },

  workMeta: {
    color: "#666",
    marginTop: 4
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
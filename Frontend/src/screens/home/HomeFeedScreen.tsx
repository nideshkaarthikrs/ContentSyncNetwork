import {
  Feather,
  Ionicons,
  MaterialIcons
} from "@expo/vector-icons";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  navigation: any;
}

export default function HomeFeedScreen({
  navigation
}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.logo}>CSN</Text>

          <View style={styles.headerIcons}>
            <TouchableOpacity>
              <Feather
                name="search"
                size={20}
                color="#111"
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#111"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}

        <View style={styles.searchBox}>
          <Feather
            name="search"
            size={18}
            color="#999"
          />

          <TextInput
            placeholder="Search for tunes, lyrics, people..."
            style={styles.searchInput}
          />
        </View>

        {/* Trending */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Trending Now
          </Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.trendingCard}
          >
            <Image
              source={{
                uri:
                  "https://picsum.photos/300/200"
              }}
              style={styles.trendingImage}
            />

            <View style={styles.playCircle}>
              <Ionicons
                name="play"
                size={20}
                color="#FFF"
              />
            </View>

            <Text style={styles.songTitle}>
              Romantic Melody
            </Text>

            <Text style={styles.songAuthor}>
              Arjun Music
            </Text>

            <Text style={styles.songStats}>
              ♡ 1.2K
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.trendingCard}
          >
            <Image
              source={{
                uri:
                  "https://picsum.photos/301/200"
              }}
              style={styles.trendingImage}
            />

            <View style={styles.playCircle}>
              <Ionicons
                name="play"
                size={20}
                color="#FFF"
              />
            </View>

            <Text style={styles.songTitle}>
              Feel The Soul
            </Text>

            <Text style={styles.songAuthor}>
              SoundWave
            </Text>

            <Text style={styles.songStats}>
              ❤️ 987
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Latest From Network */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Latest From Network
          </Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image
              source={{
                uri:
                  "https://randomuser.me/api/portraits/women/44.jpg"
              }}
              style={styles.avatar}
            />

            <View>
              <Text style={styles.userName}>
                Priya Singer
              </Text>

              <Text style={styles.postTime}>
                2h ago
              </Text>
            </View>
          </View>

          <Image
            source={{
              uri:
                "https://picsum.photos/400/300"
            }}
            style={styles.postImage}
          />

          <TouchableOpacity
            style={styles.postPlay}
          >
            <Ionicons
              name="play"
              size={26}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("UploadTune")
        }
      >
        <MaterialIcons
          name="add"
          size={30}
          color="#FFF"
        />
      </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15
  },

  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: PRIMARY
  },

  headerIcons: {
    flexDirection: "row",
    width: 70,
    justifyContent: "space-between"
  },

  searchBox: {
    margin: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50
  },

  searchInput: {
    flex: 1,
    marginLeft: 10
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700"
  },

  seeAll: {
    color: PRIMARY,
    fontWeight: "600"
  },

  trendingCard: {
    width: 180,
    marginLeft: 20
  },

  trendingImage: {
    width: 180,
    height: 120,
    borderRadius: 16
  },

  playCircle: {
    position: "absolute",
    top: 40,
    left: 75,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },

  songTitle: {
    marginTop: 10,
    fontWeight: "700"
  },

  songAuthor: {
    color: "#666",
    marginTop: 3
  },

  songStats: {
    marginTop: 4
  },

  postCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFF",
    borderRadius: 18,
    marginBottom: 20
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10
  },

  userName: {
    fontWeight: "700"
  },

  postTime: {
    color: "#666",
    fontSize: 12
  },

  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 18
  },

  postPlay: {
    position: "absolute",
    top: 120,
    left: "45%"
  },

  fab: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5
  }
});
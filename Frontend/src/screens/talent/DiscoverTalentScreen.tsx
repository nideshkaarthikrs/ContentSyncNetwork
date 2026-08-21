import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  navigation: any;
}

const topTunes = [
  {
    id: "1",
    title: "Dreamy Night",
    creator: "Arjun Music",
    likes: "1.5K",
    image:
      "https://picsum.photos/200/300?1"
  },
  {
    id: "2",
    title: "Heart Beats",
    creator: "Melody Maker",
    likes: "982",
    image:
      "https://picsum.photos/200/300?2"
  },
  {
    id: "3",
    title: "Rainy Mood",
    creator: "TuneCraft",
    likes: "768",
    image:
      "https://picsum.photos/200/300?3"
  }
];

const singers = [
  {
    id: "1",
    name: "Priya Singer",
    rating: "4.9",
    image:
      "https://randomuser.me/api/portraits/women/44.jpg"
  }
];

export default function DiscoverTalentScreen({
  navigation
}: Props) {
  const [selectedTab, setSelectedTab] =
    useState("All");

  const tabs = [
    "All",
    "Tunes",
    "Lyrics",
    "Singers",
    "Directors"
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.title}>
            Discover
          </Text>

          <TouchableOpacity>
            <Ionicons
              name="heart-outline"
              size={22}
              color="#111"
            />
          </TouchableOpacity>
        </View>

        {/* Search */}

        <View style={styles.searchBox}>
          <Feather
            name="search"
            size={18}
            color="#999"
          />

          <TextInput
            placeholder="Search people, tunes, lyrics..."
            style={styles.searchInput}
          />
        </View>

        {/* Tabs */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 15
          }}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() =>
                setSelectedTab(tab)
              }
              style={[
                styles.tab,
                selectedTab === tab &&
                  styles.activeTab
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab &&
                    styles.activeTabText
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filters */}

        <View style={styles.filterRow}>
          {["Genre", "Language", "Mood", "Sort"].map(
            item => (
              <TouchableOpacity
                key={item}
                style={styles.filterBtn}
              >
                <Text
                  style={styles.filterText}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Top Tunes */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Top Tunes
          </Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {topTunes.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.tuneCard}
            onPress={() =>
              navigation.navigate(
                "TuneDetail",
                { tuneId: item.id }
              )
            }
          >
            <Image
              source={{ uri: item.image }}
              style={styles.tuneImage}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.songTitle}>
                {item.title}
              </Text>

              <Text style={styles.creator}>
                {item.creator}
              </Text>
            </View>

            <View
              style={styles.likeContainer}
            >
              <Ionicons
                name="heart-outline"
                size={16}
                color="#777"
              />
              <Text style={styles.likeText}>
                {item.likes}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Top Singers */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Top Singers
          </Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {singers.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.singerCard}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.avatar}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.singerName}>
                {item.name}
              </Text>

              <Text style={styles.time}>
                2h ago
              </Text>
            </View>

            <Text style={styles.rating}>
              ⭐ {item.rating}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },

  title: {
    fontSize: 28,
    fontWeight: "700"
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
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

  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    marginTop: 15
  },

  activeTab: {
    backgroundColor: PRIMARY
  },

  tabText: {
    color: "#444"
  },

  activeTabText: {
    color: "#FFF"
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 15
  },

  filterBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },

  filterText: {
    fontSize: 12
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 10
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700"
  },

  seeAll: {
    color: PRIMARY
  },

  tuneCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15
  },

  tuneImage: {
    width: 55,
    height: 55,
    borderRadius: 10,
    marginRight: 12
  },

  songTitle: {
    fontWeight: "700"
  },

  creator: {
    color: "#666",
    marginTop: 4
  },

  likeContainer: {
    flexDirection: "row",
    alignItems: "center"
  },

  likeText: {
    marginLeft: 4
  },

  singerCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginRight: 12
  },

  singerName: {
    fontWeight: "700"
  },

  time: {
    color: "#777"
  },

  rating: {
    fontWeight: "600"
  }
});
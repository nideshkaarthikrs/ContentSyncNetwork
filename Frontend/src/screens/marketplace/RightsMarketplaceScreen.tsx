import {
  Feather,
  MaterialIcons
} from "@expo/vector-icons";
import { useState } from "react";
import {
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

const listings = [
  {
    id: "1",
    title: "Love Melody",
    type: "Tune Rights",
    owner: "Arjun Music",
    price: "₹75,000"
  },
  {
    id: "2",
    title: "Dream Lyrics",
    type: "Lyrics Rights",
    owner: "Priya Writer",
    price: "₹45,000"
  },
  {
    id: "3",
    title: "Freedom Anthem",
    type: "Full Project",
    owner: "CSN Studio",
    price: "₹2,50,000"
  }
];

export default function RightsMarketplaceScreen({
  navigation
}: Props) {
  const [search, setSearch] =
    useState("");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="arrow-left"
              size={22}
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Rights Marketplace
          </Text>

          <TouchableOpacity>
            <MaterialIcons
              name="filter-list"
              size={22}
            />
          </TouchableOpacity>
        </View>

        {/* Search */}

        <View style={styles.searchBox}>
          <Feather
            name="search"
            size={18}
            color="#777"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search rights..."
            style={styles.searchInput}
          />
        </View>

        {/* Categories */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={{ marginTop: 15 }}
        >
          {[
            "All",
            "Tunes",
            "Lyrics",
            "Videos",
            "Projects"
          ].map(item => (
            <TouchableOpacity
              key={item}
              style={styles.categoryChip}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Listings */}

        {listings.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.listingCard}
            onPress={() =>
              navigation.navigate(
                "RightsDetail",
                {
                  listingId: item.id
                }
              )
            }
          >
            <View
              style={styles.cardHeader}
            >
              <Text
                style={styles.assetTitle}
              >
                {item.title}
              </Text>

              <View
                style={styles.badge}
              >
                <Text
                  style={styles.badgeText}
                >
                  {item.type}
                </Text>
              </View>
            </View>

            <Text style={styles.owner}>
              Owner: {item.owner}
            </Text>

            <Text style={styles.price}>
              {item.price}
            </Text>

            <TouchableOpacity
              style={styles.buyButton}
            >
              <Text
                style={styles.buyText}
              >
                View Details
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Action */}

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate(
            "CreateRightsListing"
          )
        }
      >
        <MaterialIcons
          name="add"
          size={28}
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
    padding: 20
  },

  title: {
    fontSize: 20,
    fontWeight: "700"
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 50
  },

  searchInput: {
    flex: 1,
    marginLeft: 10
  },

  categoryChip: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 15
  },

  listingCard: {
    marginHorizontal: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    padding: 15
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  assetTitle: {
    fontWeight: "700",
    fontSize: 16
  },

  badge: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },

  badgeText: {
    color: PRIMARY,
    fontSize: 12
  },

  owner: {
    marginTop: 10,
    color: "#666"
  },

  price: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "700"
  },

  buyButton: {
    backgroundColor: PRIMARY,
    height: 45,
    borderRadius: 10,
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center"
  },

  buyText: {
    color: "#FFF",
    fontWeight: "700"
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5
  }
});
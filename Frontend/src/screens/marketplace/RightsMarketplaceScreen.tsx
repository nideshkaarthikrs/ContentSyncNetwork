import Feather from "react-native-vector-icons/Feather";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRightsListings } from "../../hooks/rights/useRightsListings";

interface Props {
  navigation: any;
}

const CATEGORIES = ["All", "TUNE", "SONG", "VIDEO"];

export default function RightsMarketplaceScreen({
  navigation
}: Props) {
  const [category, setCategory] = useState("All");
  const { data, isLoading } = useRightsListings(category === "All" ? undefined : category);
  const listings = data?.data ?? [];

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

          <View style={{ width: 22 }} />
        </View>

        {/* Categories */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={{ marginTop: 5 }}
        >
          {CATEGORIES.map(item => (
            <TouchableOpacity
              key={item}
              style={[
                styles.categoryChip,
                category === item && styles.categoryChipActive
              ]}
              onPress={() => setCategory(item)}
            >
              <Text style={category === item ? styles.categoryTextActive : undefined}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Listings */}

        {isLoading && (
          <ActivityIndicator style={{ marginTop: 30 }} color={PRIMARY} />
        )}

        {!isLoading && listings.length === 0 && (
          <Text style={styles.emptyText}>No listings available right now.</Text>
        )}

        {listings.map(item => (
          <TouchableOpacity
            key={item.listingId}
            style={styles.listingCard}
            onPress={() =>
              navigation.navigate(
                "RightsDetail",
                { listing: item }
              )
            }
          >
            <View
              style={styles.cardHeader}
            >
              <Text
                style={styles.assetTitle}
              >
                {item.assetId}
              </Text>

              <View
                style={styles.badge}
              >
                <Text
                  style={styles.badgeText}
                >
                  {item.assetType}
                </Text>
              </View>
            </View>

            <Text style={styles.owner}>
              {item.licenseType} • {item.territory} • {item.term}
            </Text>

            <Text style={styles.price}>
              ₹{item.price.toLocaleString("en-IN")}
            </Text>

            <View
              style={styles.buyButton}
            >
              <Text
                style={styles.buyText}
              >
                View Details
              </Text>
            </View>
          </TouchableOpacity>
        ))}

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

  categoryChip: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 15
  },

  categoryChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY
  },

  categoryTextActive: {
    color: "#FFF"
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 30,
    paddingHorizontal: 20
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
  }
});

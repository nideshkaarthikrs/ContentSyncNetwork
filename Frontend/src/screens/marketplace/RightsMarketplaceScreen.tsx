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
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useRightsListings } from "../../hooks/rights/useRightsListings";
import { RootStackParamList } from "../../navigation/types";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

type Props = NativeStackScreenProps<RootStackParamList, "RightsMarketplace">;

const CATEGORIES = ["All", "TUNE", "SONG", "VIDEO"];

export default function RightsMarketplaceScreen({
  navigation
}: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);

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
              color={theme.colors.text}
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
              <Text style={category === item ? styles.categoryTextActive : styles.categoryText}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Listings */}

        {isLoading && (
          <ActivityIndicator style={{ marginTop: 30 }} color={theme.colors.primary} />
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

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text
  },

  categoryChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 15
  },

  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },

  categoryText: {
    color: theme.colors.text
  },

  categoryTextActive: {
    color: "#FFF"
  },

  emptyText: {
    textAlign: "center",
    color: theme.colors.textMuted,
    marginTop: 30,
    paddingHorizontal: 20
  },

  listingCard: {
    marginHorizontal: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 15
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  assetTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: theme.colors.text
  },

  badge: {
    backgroundColor: theme.dark ? "#3B2E5C" : "#F3E8FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },

  badgeText: {
    color: theme.colors.primary,
    fontSize: 12
  },

  owner: {
    marginTop: 10,
    color: theme.colors.textMuted
  },

  price: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text
  },

  buyButton: {
    backgroundColor: theme.colors.primary,
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

import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getErrorMessage } from "../../api/getErrorMessage";
import { RightsListing } from "../../api/services/rights.api";
import { useDrmToken } from "../../hooks/rights/useDrmToken";
import { usePurchaseRights } from "../../hooks/rights/usePurchaseRights";
import { useRaiseClaim } from "../../hooks/rights/useRaiseClaim";
import { RootStackParamList } from "../../navigation/types";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

type Props = NativeStackScreenProps<RootStackParamList, "RightsDetail">;

export default function RightsDetailScreen({
  navigation,
  route
}: Props) {
  const listing: RightsListing | undefined = route?.params?.listing;

  const theme = useTheme();
  const styles = getStyles(theme);

  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [claimReason, setClaimReason] = useState("");
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  const purchaseRights = usePurchaseRights();
  const drmToken = useDrmToken();
  const raiseClaim = useRaiseClaim();

  if (!listing) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.owner}>No listing selected.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handlePurchase = async () => {
    try {
      const result = await purchaseRights.mutateAsync({
        assetId: listing.assetId,
        licenseType: listing.licenseType
      });
      setPurchaseStatus(result.status);
      Alert.alert("Purchase Initiated", `Status: ${result.status}`);
    } catch (err) {
      Alert.alert("Purchase Failed", getErrorMessage(err));
    }
  };

  const handleGetStream = async () => {
    try {
      const result = await drmToken.mutateAsync(listing.assetId);
      setStreamUrl(result.streamUrl);
    } catch (err) {
      Alert.alert("Failed to get streaming token", getErrorMessage(err));
    }
  };

  const handleRaiseClaim = async () => {
    if (!claimReason.trim()) {
      Alert.alert("Enter a reason", "Please describe the copyright issue.");
      return;
    }
    try {
      const result = await raiseClaim.mutateAsync({ assetId: listing.assetId, reason: claimReason });
      setClaimStatus(result.status);
      setClaimReason("");
      Alert.alert("Claim Submitted", `Claim ${result.claimId} is ${result.status}.`);
    } catch (err) {
      Alert.alert("Failed to submit claim", getErrorMessage(err));
    }
  };

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

          <Text style={styles.headerTitle}>
            Rights Detail
          </Text>

          <View style={{ width: 20 }} />
        </View>

        {/* Hero Card */}

        <View style={styles.heroCard}>
          <Text style={styles.songTitle}>
            {listing.assetId}
          </Text>

          <Text style={styles.category}>
            {listing.assetType} • {listing.licenseType}
          </Text>

          <Text style={styles.price}>
            ₹{listing.price.toLocaleString("en-IN")}
          </Text>
        </View>

        {/* Details */}

        <Text style={styles.sectionTitle}>
          Listing Details
        </Text>

        <View style={styles.infoCard}>
          <Row title="Territory" value={listing.territory} />
          <Row title="Term" value={listing.term} />
          <Row title="Status" value={purchaseStatus ?? listing.status} />
        </View>

        {/* Purchase */}

        <TouchableOpacity
          style={styles.buyButton}
          onPress={handlePurchase}
          disabled={purchaseRights.isPending}
        >
          <Text style={styles.buyText}>
            {purchaseRights.isPending ? "Processing..." : "Purchase Rights"}
          </Text>
        </TouchableOpacity>

        {/* DRM Streaming */}

        <Text style={styles.sectionTitle}>
          Streaming Access
        </Text>

        <TouchableOpacity
          style={styles.contractCard}
          onPress={handleGetStream}
        >
          <MaterialCommunityIcons
            name="play-network-outline"
            size={28}
            color={theme.colors.primary}
          />

          <Text style={styles.contractText}>
            {drmToken.isPending ? "Generating..." : "Get Streaming Token"}
          </Text>
        </TouchableOpacity>

        {streamUrl && (
          <Text style={styles.streamUrl} numberOfLines={2}>
            {streamUrl}
          </Text>
        )}

        {/* Copyright Claim */}

        <Text style={styles.sectionTitle}>
          Report a Copyright Issue
        </Text>

        <TextInput
          style={styles.claimInput}
          placeholder="Describe the issue..."
          multiline
          value={claimReason}
          onChangeText={setClaimReason}
        />

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleRaiseClaim}
          disabled={raiseClaim.isPending}
        >
          <Text
            style={styles.secondaryText}
          >
            {raiseClaim.isPending ? "Submitting..." : "Submit Claim"}
          </Text>
        </TouchableOpacity>

        {claimStatus && (
          <Text style={styles.claimStatus}>Claim status: {claimStatus}</Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const Row = ({
  title,
  value
}: {
  title: string;
  value: string;
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{title}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },

  centered: {
    justifyContent: "center",
    alignItems: "center"
  },

  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text
  },

  heroCard: {
    margin: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    padding: 24
  },

  songTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700"
  },

  // Decorative tint text on top of `primary`; primary itself is a different,
  // lighter hex in dark mode (#A78BFA vs light mode's #7C3AED), so the original
  // fixed light-lavender text loses contrast against the lighter dark-mode
  // card. Branch to a deep purple in dark mode to keep it legible there.
  category: {
    color: theme.dark ? "#4C1D95" : "#E9D5FF",
    marginTop: 8
  },

  price: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "700",
    marginTop: 12
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text
  },

  infoCard: {
    marginHorizontal: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16
  },

  owner: {
    fontWeight: "600",
    color: theme.colors.text
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8
  },

  rowLabel: {
    color: theme.colors.textMuted
  },

  rowValue: {
    color: theme.colors.text
  },

  contractCard: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center"
  },

  contractText: {
    marginLeft: 12,
    fontWeight: "600",
    color: theme.colors.text
  },

  streamUrl: {
    marginHorizontal: 20,
    marginTop: 10,
    color: theme.colors.textMuted,
    fontSize: 12
  },

  claimInput: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    minHeight: 80,
    padding: 15,
    textAlignVertical: "top",
    color: theme.colors.text
  },

  claimStatus: {
    marginHorizontal: 20,
    marginTop: 10,
    color: theme.colors.textMuted
  },

  buyButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    marginTop: 25,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  buyText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginHorizontal: 20,
    marginTop: 12,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  secondaryText: {
    color: theme.colors.primary,
    fontWeight: "700"
  }
});

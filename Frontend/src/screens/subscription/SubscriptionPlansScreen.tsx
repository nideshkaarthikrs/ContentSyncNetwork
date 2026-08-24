import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getErrorMessage } from "../../api/getErrorMessage";
import { SubscriptionPlan } from "../../api/services/payment.api";
import { useSubscribe } from "../../hooks/payment/useSubscribe";
import { RootStackParamList } from "../../navigation/types";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

type Props = NativeStackScreenProps<RootStackParamList, "SubscriptionPlans">;

const plans: {
  id: SubscriptionPlan;
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}[] = [
  {
    id: "FREE",
    name: "Free",
    price: "₹0",
    features: [
      "Browse Projects",
      "Submit Entries",
      "Basic Profile",
      "Limited Uploads"
    ]
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: "₹499 / month",
    popular: true,
    features: [
      "Unlimited Uploads",
      "AI Assistant",
      "Priority Visibility",
      "Advanced Analytics",
      "Rights Marketplace"
    ]
  },
  {
    id: "PRODUCER",
    name: "Producer",
    price: "₹10,000 / month",
    features: [
      "Team Workspace",
      "Revenue Dashboard",
      "Unlimited Projects",
      "Advanced Reports",
      "Producer Tools"
    ]
  }
];

export default function SubscriptionPlansScreen({
  navigation
}: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlan>("PREMIUM");
  // Session-local only: there is no GET endpoint for subscription status, so this
  // resets on remount/app restart rather than reflecting a persisted subscription record.
  const [activePlan, setActivePlan] = useState<string | null>(null);

  const subscribe = useSubscribe();

  const handleUpgrade = async () => {
    try {
      const result = await subscribe.mutateAsync(selectedPlan);
      setActivePlan(result.plan);
      Alert.alert("Subscribed", `You're now on the ${result.plan} plan.`);
    } catch (err) {
      Alert.alert("Subscription Failed", getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Header */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
          >
            <Feather
              name="arrow-left"
              size={22}
              color={theme.colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Subscription Plans
          </Text>

          <View style={{ width: 20 }} />
        </View>

        {/* Current Plan */}

        <View style={styles.currentPlanCard}>
          <Text style={styles.currentLabel}>
            Purchased this session
          </Text>

          <Text style={styles.currentPlan}>
            {activePlan ?? "Nothing purchased yet"}
          </Text>
        </View>

        {/* Plans */}

        {plans.map(plan => {
          const selected =
            selectedPlan === plan.id;

          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selected &&
                  styles.selectedCard
              ]}
              onPress={() =>
                setSelectedPlan(plan.id)
              }
            >
              {plan.popular && (
                <View
                  style={styles.popularBadge}
                >
                  <Text
                    style={
                      styles.popularText
                    }
                  >
                    MOST POPULAR
                  </Text>
                </View>
              )}

              <Text
                style={styles.planTitle}
              >
                {plan.name}
              </Text>

              <Text
                style={styles.planPrice}
              >
                {plan.price}
              </Text>

              {plan.features.map(
                feature => (
                  <View
                    key={feature}
                    style={
                      styles.featureRow
                    }
                  >
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color={theme.colors.success}
                    />

                    <Text
                      style={
                        styles.featureText
                      }
                    >
                      {feature}
                    </Text>
                  </View>
                )
              )}
            </TouchableOpacity>
          );
        })}

        {/* Upgrade */}

        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleUpgrade}
          disabled={subscribe.isPending}
        >
          <Text
            style={styles.upgradeText}
          >
            {subscribe.isPending ? "Subscribing..." : "Upgrade Plan"}
          </Text>
        </TouchableOpacity>

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

  // Decorative light-purple card fill; no matching theme token, so branch
  // to a deep purple in dark mode to keep the text on it legible (same
  // pattern as WalletPaymentsScreen's `actionButton`).
  currentPlanCard: {
    marginHorizontal: 20,
    backgroundColor: theme.dark ? "#3B2A5A" : "#F5F3FF",
    borderRadius: 16,
    padding: 20
  },

  currentLabel: {
    color: theme.colors.textMuted
  },

  currentPlan: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 5,
    color: theme.colors.text
  },

  planCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 20
  },

  selectedCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2
  },

  popularBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10
  },

  // White label on the primary-colored badge; kept literal per the
  // white-on-primary exception.
  popularText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700"
  },

  planTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text
  },

  planPrice: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.primary,
    marginVertical: 10
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },

  featureText: {
    marginLeft: 10,
    color: theme.colors.text
  },

  upgradeButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    marginTop: 25,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  // White label on the primary-colored button; kept literal per the
  // white-on-primary exception.
  upgradeText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  }
});

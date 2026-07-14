import {
  Feather,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { getErrorMessage } from "../../api/getErrorMessage";
import { SubscriptionPlan } from "../../api/services/payment.api";
import { useSubscribe } from "../../hooks/payment/useSubscribe";

interface Props {
  navigation: any;
}

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
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlan>("PREMIUM");
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
            Current Plan
          </Text>

          <Text style={styles.currentPlan}>
            {activePlan ?? "No active subscription"}
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
                      color="#10B981"
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

const PRIMARY = "#7C3AED";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    marginTop: 36,
    marginBottom: 50
  },

  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700"
  },

  currentPlanCard: {
    marginHorizontal: 20,
    backgroundColor: "#F5F3FF",
    borderRadius: 16,
    padding: 20
  },

  currentLabel: {
    color: "#666"
  },

  currentPlan: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 5
  },

  planCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 20
  },

  selectedCard: {
    borderColor: PRIMARY,
    borderWidth: 2
  },

  popularBadge: {
    alignSelf: "flex-start",
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10
  },

  popularText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700"
  },

  planTitle: {
    fontSize: 20,
    fontWeight: "700"
  },

  planPrice: {
    fontSize: 26,
    fontWeight: "700",
    color: PRIMARY,
    marginVertical: 10
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },

  featureText: {
    marginLeft: 10
  },

  upgradeButton: {
    backgroundColor: PRIMARY,
    marginHorizontal: 20,
    marginTop: 25,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  upgradeText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  }
});

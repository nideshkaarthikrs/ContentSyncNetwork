import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getErrorMessage } from "../../api/getErrorMessage";
import { useRevenueDashboard } from "../../hooks/payment/useRevenueDashboard";
import { useWithdraw } from "../../hooks/payment/useWithdraw";

interface Props {
  navigation: any;
}

export default function WalletPaymentsScreen({
  navigation
}: Props) {
  const { data, isLoading } = useRevenueDashboard();
  const withdraw = useWithdraw();

  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [lastWithdrawal, setLastWithdrawal] = useState<{ withdrawalId: string; status: string } | null>(null);

  const handleWithdraw = async () => {
    const trimmedAmount = amount.trim();
    // Whole numbers only, matching the backend's @IsInt @Min(1) on withdraw.dto.ts
    // (WithdrawalRequest.amount is a Prisma Int column) — reject decimals like
    // "500.50" client-side instead of letting the request 400 at the network.
    if (!/^\d+$/.test(trimmedAmount)) {
      Alert.alert("Enter a whole number", "Withdrawal amount must be a whole number of rupees (no decimals).");
      return;
    }
    const parsedAmount = parseInt(trimmedAmount, 10);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Enter an amount", "Please enter a valid withdrawal amount.");
      return;
    }
    if (!bankAccountId.trim()) {
      Alert.alert("Enter a bank account", "Please enter a bank account ID.");
      return;
    }
    try {
      const result = await withdraw.mutateAsync({ amount: parsedAmount, bankAccountId: bankAccountId.trim() });
      setLastWithdrawal(result);
      setShowWithdrawForm(false);
      setAmount("");
      setBankAccountId("");
      Alert.alert("Withdrawal Requested", `${result.withdrawalId} is ${result.status}.`);
    } catch (err) {
      Alert.alert("Withdrawal Failed", getErrorMessage(err));
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
            Wallet & Payments
          </Text>

          <View style={{ width: 24 }} />
        </View>

        {/* Wallet Card */}

        <View style={styles.walletCard}>
          <Text style={styles.balanceLabel}>
            Withdrawable balance
          </Text>

          {isLoading ? (
            <ActivityIndicator color="#FFF" style={{ marginTop: 10 }} />
          ) : (
            <Text style={styles.balance}>
              ₹{(data?.availableBalance ?? 0).toLocaleString("en-IN")}
            </Text>
          )}

          <Text style={styles.updated}>
            Earnings ₹{(data?.totalRevenue ?? 0).toLocaleString("en-IN")}
            {data?.marketplaceSales ? ` • Marketplace ₹${data.marketplaceSales.toLocaleString("en-IN")}` : ""}
            {data?.royalties ? ` • Royalties ₹${data.royalties.toLocaleString("en-IN")}` : ""}
            {data?.contestWins ? ` • Contests ₹${data.contestWins.toLocaleString("en-IN")}` : ""}
          </Text>

          {!!data?.subscriptionSpend && (
            <Text style={styles.spendLine}>
              − ₹{data.subscriptionSpend.toLocaleString("en-IN")} spent on subscription
            </Text>
          )}
        </View>

        {/* Actions */}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowWithdrawForm(!showWithdrawForm)}
          >
            <MaterialCommunityIcons
              name="bank-transfer-out"
              size={26}
              color="#7C3AED"
            />

            <Text style={styles.actionText}>
              Withdraw
            </Text>
          </TouchableOpacity>
        </View>

        {showWithdrawForm && (
          <View style={styles.withdrawForm}>
            <TextInput
              style={styles.input}
              placeholder="Amount (whole rupees only)"
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
            />

            <TextInput
              style={styles.input}
              placeholder="Bank Account ID"
              value={bankAccountId}
              onChangeText={setBankAccountId}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleWithdraw}
              disabled={withdraw.isPending}
            >
              <Text style={styles.submitText}>
                {withdraw.isPending ? "Submitting..." : "Request Withdrawal"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {lastWithdrawal && (
          <View style={styles.transactionCard}>
            <Text style={styles.transactionTitle}>{lastWithdrawal.withdrawalId}</Text>
            <Text style={styles.amount}>{lastWithdrawal.status}</Text>
          </View>
        )}

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

  walletCard: {
    margin: 20,
    backgroundColor: PRIMARY,
    borderRadius: 18,
    padding: 24
  },

  balanceLabel: {
    color: "#DDD"
  },

  balance: {
    color: "#FFF",
    fontSize: 34,
    fontWeight: "700",
    marginTop: 8
  },

  updated: {
    color: "#E9D5FF",
    marginTop: 8,
    fontSize: 12
  },

  spendLine: {
    color: "#FCA5A5",
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600"
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20
  },

  actionButton: {
    width: "100%",
    backgroundColor: "#F5F3FF",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center"
  },

  actionText: {
    marginTop: 8,
    fontWeight: "600"
  },

  withdrawForm: {
    marginHorizontal: 20,
    marginTop: 15
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10
  },

  submitButton: {
    backgroundColor: PRIMARY,
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },

  submitText: {
    color: "#FFF",
    fontWeight: "700"
  },

  transactionCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  transactionTitle: {
    fontWeight: "600"
  },

  amount: {
    fontWeight: "700",
    color: "#10B981"
  }
});

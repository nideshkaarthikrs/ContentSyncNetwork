import {
  Feather,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import {
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

const transactions = [
  {
    id: "1",
    title: "Rights Sale",
    amount: "+ ₹50,000",
    date: "Today"
  },
  {
    id: "2",
    title: "Streaming Revenue",
    amount: "+ ₹12,500",
    date: "Yesterday"
  },
  {
    id: "3",
    title: "Subscription Renewal",
    amount: "- ₹499",
    date: "25 Jun"
  },
  {
    id: "4",
    title: "Wallet Withdrawal",
    amount: "- ₹20,000",
    date: "20 Jun"
  }
];

export default function WalletPaymentsScreen({
  navigation
}: Props) {
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

          <TouchableOpacity>
            <MaterialCommunityIcons
              name="history"
              size={24}
            />
          </TouchableOpacity>
        </View>

        {/* Wallet Card */}

        <View style={styles.walletCard}>
          <Text style={styles.balanceLabel}>
            Available Balance
          </Text>

          <Text style={styles.balance}>
            ₹1,25,450
          </Text>

          <Text style={styles.updated}>
            Last Updated: Today
          </Text>
        </View>

        {/* Actions */}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
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

          <TouchableOpacity
            style={styles.actionButton}
          >
            <MaterialCommunityIcons
              name="cash-plus"
              size={26}
              color="#7C3AED"
            />

            <Text style={styles.actionText}>
              Add Funds
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Methods */}

        <Text style={styles.sectionTitle}>
          Payment Methods
        </Text>

        <TouchableOpacity
          style={styles.methodCard}
        >
          <MaterialCommunityIcons
            name="bank"
            size={26}
            color="#7C3AED"
          />

          <View
            style={{ marginLeft: 12 }}
          >
            <Text
              style={styles.methodTitle}
            >
              HDFC Bank
            </Text>

            <Text
              style={styles.methodSub}
            >
              xxxx xxxx 3456
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.methodCard}
        >
          <MaterialCommunityIcons
            name="wallet-outline"
            size={26}
            color="#7C3AED"
          />

          <View
            style={{ marginLeft: 12 }}
          >
            <Text
              style={styles.methodTitle}
            >
              UPI
            </Text>

            <Text
              style={styles.methodSub}
            >
              arjun@okhdfc
            </Text>
          </View>
        </TouchableOpacity>

        {/* Transactions */}

        <Text style={styles.sectionTitle}>
          Recent Transactions
        </Text>

        {transactions.map(item => (
          <View
            key={item.id}
            style={styles.transactionCard}
          >
            <View>
              <Text
                style={styles.transactionTitle}
              >
                {item.title}
              </Text>

              <Text
                style={styles.transactionDate}
              >
                {item.date}
              </Text>
            </View>

            <Text
              style={[
                styles.amount,
                {
                  color:
                    item.amount.startsWith(
                      "+"
                    )
                      ? "#10B981"
                      : "#EF4444"
                }
              ]}
            >
              {item.amount}
            </Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.taxButton}
        >
          <Text style={styles.taxText}>
            Download Tax Statement
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
    marginTop: 8
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20
  },

  actionButton: {
    width: "48%",
    backgroundColor: "#F5F3FF",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center"
  },

  actionText: {
    marginTop: 8,
    fontWeight: "600"
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700"
  },

  methodCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center"
  },

  methodTitle: {
    fontWeight: "700"
  },

  methodSub: {
    color: "#666",
    marginTop: 2
  },

  transactionCard: {
    marginHorizontal: 20,
    marginBottom: 12,
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

  transactionDate: {
    color: "#666",
    marginTop: 4
  },

  amount: {
    fontWeight: "700"
  },

  taxButton: {
    backgroundColor: PRIMARY,
    marginHorizontal: 20,
    marginTop: 25,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  taxText: {
    color: "#FFF",
    fontWeight: "700"
  }
});
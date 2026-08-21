import Feather from "react-native-vector-icons/Feather";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

interface Props {
  navigation: any;
}

const FAQS = [
  {
    question: "How do I upload a tune?",
    answer: "Go to the Creator tab and tap Upload Tune, then follow the prompts to select and submit your audio file."
  },
  {
    question: "How do I change my password?",
    answer: "Open Settings from your profile, then tap Change Password under the Account section."
  },
  {
    question: "How do withdrawals work?",
    answer: "Withdrawals can be requested from your Wallet. Payouts require a linked bank account, which is coming soon."
  },
  {
    question: "Who can I contact for support?",
    answer: "Reach us at support@csn.app and we'll get back to you within 1-2 business days."
  }
];

export default function HelpCenterScreen({ navigation }: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {FAQS.map((faq) => (
          <View key={faq.question} style={styles.faqItem}>
            <Text style={styles.question}>{faq.question}</Text>
            <Text style={styles.answer}>{faq.answer}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    marginTop: 36,
    marginBottom: 50
  },

  header: {
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text
  },

  body: {
    paddingBottom: 40
  },

  faqItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },

  question: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6
  },

  answer: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20
  }
});

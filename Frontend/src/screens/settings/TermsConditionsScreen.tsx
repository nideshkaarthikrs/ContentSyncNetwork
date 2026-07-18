import { Feather } from "@expo/vector-icons";
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

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account and using CSN, you agree to be bound by these Terms & Conditions."
  },
  {
    title: "2. Content Ownership",
    body: "You retain ownership of all tunes, lyrics, videos, and other content you upload. By uploading, you grant CSN a license to host and display that content within the app."
  },
  {
    title: "3. Marketplace & Payments",
    body: "Rights listings, purchases, and subscriptions are subject to the payment terms presented at the time of the transaction."
  },
  {
    title: "4. Account Responsibility",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account."
  },
  {
    title: "5. Changes to These Terms",
    body: "We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the new terms."
  }
];

export default function TermsConditionsScreen({ navigation }: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
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

  section: {
    marginBottom: 20
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6
  },

  sectionBody: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20
  }
});

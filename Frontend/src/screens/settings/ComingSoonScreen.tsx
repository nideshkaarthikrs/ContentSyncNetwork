import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
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
  route: any;
}

export default function ComingSoonScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const title = route?.params?.title ?? "Coming Soon";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.body}>
        <MaterialCommunityIcons name="clock-outline" size={56} color={theme.colors.textMuted} />
        <Text style={styles.message}>This feature is coming soon.</Text>
      </View>
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40
  },

  message: {
    marginTop: 16,
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: "center"
  }
});

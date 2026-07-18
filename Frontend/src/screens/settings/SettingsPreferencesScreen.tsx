import {
  Feather,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLogout } from "../../hooks/auth/useLogout";
import { useProfile } from "../../hooks/profile/useProfile";
import { useUpdateProfile } from "../../hooks/profile/useUpdateProfile";
import { useAuthStore } from "../../store/authStore";
import { usePreferencesStore } from "../../store/preferencesStore";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

interface Props {
  navigation: any;
}

export default function SettingsPreferencesScreen({
  navigation
}: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      // useLogout clears the local session even if the server call fails, so the user can
      // still proceed to Login below — no need to surface a network error here.
    }
    navigation.replace("Login");
  };

  const darkMode = usePreferencesStore((state) => state.darkMode);
  const setDarkMode = usePreferencesStore((state) => state.setDarkMode);

  const userId = useAuthStore((state) => state.user?.userId);
  const { data: profile } = useProfile(userId);
  const updateProfile = useUpdateProfile(userId);

  const notificationsEnabled = profile?.pushNotificationsEnabled ?? true;
  const publicProfile = profile?.publicProfile ?? true;

  const MenuItem = ({
    icon,
    title,
    screen,
    params
  }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() =>
        screen &&
        navigation.navigate(screen, params)
      }
    >
      <View style={styles.menuLeft}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={theme.colors.primary}
        />

        <Text style={styles.menuText}>
          {title}
        </Text>
      </View>

      <Feather
        name="chevron-right"
        size={20}
        color={theme.colors.textMuted}
      />
    </TouchableOpacity>
  );

  const SwitchItem = ({
    icon,
    title,
    value,
    onChange
  }: any) => (
    <View style={styles.menuItem}>
      <View style={styles.menuLeft}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={theme.colors.primary}
        />

        <Text style={styles.menuText}>
          {title}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          true: theme.colors.primary
        }}
      />
    </View>
  );

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
            Settings
          </Text>

          <View style={{ width: 22 }} />
        </View>

        {/* Account */}

        <Text style={styles.section}>
          ACCOUNT
        </Text>

        <MenuItem
          icon="account-circle-outline"
          title="Profile"
          screen="CreatorProfile"
        />

        <MenuItem
          icon="shield-account"
          title="Verification"
          screen="ComingSoon"
          params={{ title: "Verification" }}
        />

        <MenuItem
          icon="lock-outline"
          title="Change Password"
          screen="ChangePassword"
        />

        {/* Preferences */}

        <Text style={styles.section}>
          APP PREFERENCES
        </Text>

        <SwitchItem
          icon="weather-night"
          title="Dark Mode"
          value={darkMode}
          onChange={setDarkMode}
        />

        <SwitchItem
          icon="bell-outline"
          title="Notifications"
          value={notificationsEnabled}
          onChange={(value: boolean) => updateProfile.mutate({ pushNotificationsEnabled: value })}
        />

        <SwitchItem
          icon="eye-outline"
          title="Public Profile"
          value={publicProfile}
          onChange={(value: boolean) => updateProfile.mutate({ publicProfile: value })}
        />

        {/* Payments */}

        <Text style={styles.section}>
          PAYMENTS
        </Text>

        <MenuItem
          icon="bank-outline"
          title="Bank Account"
          screen="ComingSoon"
          params={{ title: "Bank Account" }}
        />

        <MenuItem
          icon="credit-card-outline"
          title="Payment Methods"
          screen="ComingSoon"
          params={{ title: "Payment Methods" }}
        />

        <MenuItem
          icon="cash-multiple"
          title="Wallet"
          screen="WalletPayments"
        />

        {/* Creator */}

        <Text style={styles.section}>
          CREATOR SETTINGS
        </Text>

        <MenuItem
          icon="music-note"
          title="Default Role"
          screen="DefaultRole"
        />

        <MenuItem
          icon="chart-line"
          title="Analytics"
          screen="AnalyticsDashboard"
        />

        {/* Support */}

        <Text style={styles.section}>
          SUPPORT
        </Text>

        <MenuItem
          icon="help-circle-outline"
          title="Help Center"
          screen="HelpCenter"
        />

        <MenuItem
          icon="file-document-outline"
          title="Terms & Conditions"
          screen="TermsConditions"
        />

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={logout.isPending}
        >
          <Text style={styles.logoutText}>
            {logout.isPending ? "Logging out..." : "Logout"}
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
    backgroundColor: theme.colors.background,
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
    fontWeight: "700",
    color: theme.colors.text
  },

  section: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    color: theme.colors.textMuted,
    fontWeight: "700",
    fontSize: 13
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center"
  },

  menuText: {
    marginLeft: 12,
    fontSize: 15,
    color: theme.colors.text
  },

  logoutButton: {
    backgroundColor: theme.colors.danger,
    marginHorizontal: 20,
    marginTop: 30,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  logoutText: {
    color: "#FFFFFF",
    fontWeight: "700"
  }
});
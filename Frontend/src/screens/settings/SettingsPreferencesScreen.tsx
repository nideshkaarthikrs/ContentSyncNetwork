import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getErrorMessage } from "../../api/getErrorMessage";
import { useLogout } from "../../hooks/auth/useLogout";
import { useProfile } from "../../hooks/profile/useProfile";
import { useUpdateProfile } from "../../hooks/profile/useUpdateProfile";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { usePreferencesStore } from "../../store/preferencesStore";
import { useToastStore } from "../../store/toastStore";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

type Props = NativeStackScreenProps<RootStackParamList, "SettingsPreferences">;

// Module-scope (not defined inside the screen component): a component defined inside
// a render body is a new function identity every render, which React treats as a new
// component type -- forcing a full remount (and loss of any internal state) on every
// re-render of the parent.
function MenuItem({
  icon,
  title,
  screen,
  params,
  navigation,
  styles,
  theme
}: {
  icon: string;
  title: string;
  // A local string-keyed dispatch table, same as HomeStack/CreatorStack/BusinessStack --
  // `screen` is checked against RootStackParamList's route names (typo-proofing the
  // route name), while `params` stays loosely typed since it isn't tied to one route.
  screen?: keyof RootStackParamList;
  params?: Record<string, unknown>;
  navigation: Props["navigation"];
  styles: ReturnType<typeof getStyles>;
  theme: Theme;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() =>
        // `screen` is validated against RootStackParamList above (a typo'd route
        // name passed to a MenuItem is a tsc error), but `navigate`'s overloads
        // can't be resolved for a dynamic (non-literal) route name -- same
        // dispatch-table tradeoff as HomeStack/CreatorStack/BusinessStack.
        screen &&
        navigation.navigate(screen as any, params)
      }
    >
      <View style={styles.menuLeft}>
        <MaterialCommunityIcons
          name={icon as any}
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
}

function SwitchItem({
  icon,
  title,
  value,
  onChange,
  styles,
  theme
}: {
  icon: string;
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
  styles: ReturnType<typeof getStyles>;
  theme: Theme;
}) {
  return (
    <View style={styles.menuItem}>
      <View style={styles.menuLeft}>
        <MaterialCommunityIcons
          name={icon as any}
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
}

export default function SettingsPreferencesScreen({
  navigation
}: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const logout = useLogout();
  const showToast = useToastStore((state) => state.show);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      // useLogout clears the local session even if the server call fails — clearing the
      // token swaps AppNavigator to the Login group, so no navigation is needed here.
    }
  };

  const darkMode = usePreferencesStore((state) => state.darkMode);
  const setDarkMode = usePreferencesStore((state) => state.setDarkMode);

  const userId = useAuthStore((state) => state.user?.userId);
  const { data: profile } = useProfile(userId);
  const updateProfile = useUpdateProfile(userId);

  // Short-lived overrides so the switch flips immediately on tap, instead of waiting
  // for the mutation to resolve and the profile query to refetch; cleared on success,
  // rolled back to the pre-tap value on failure.
  const [pendingNotifications, setPendingNotifications] = useState<boolean | null>(null);
  const [pendingPublicProfile, setPendingPublicProfile] = useState<boolean | null>(null);

  const notificationsEnabled = pendingNotifications ?? profile?.pushNotificationsEnabled ?? true;
  const publicProfile = pendingPublicProfile ?? profile?.publicProfile ?? true;

  const handleToggleNotifications = (value: boolean) => {
    const previous = notificationsEnabled;
    setPendingNotifications(value);
    updateProfile.mutate(
      { pushNotificationsEnabled: value },
      {
        onSuccess: () => setPendingNotifications(null),
        onError: (err) => {
          setPendingNotifications(previous);
          showToast(getErrorMessage(err, "Could not update notifications."));
        },
      },
    );
  };

  const handleTogglePublicProfile = (value: boolean) => {
    const previous = publicProfile;
    setPendingPublicProfile(value);
    updateProfile.mutate(
      { publicProfile: value },
      {
        onSuccess: () => setPendingPublicProfile(null),
        onError: (err) => {
          setPendingPublicProfile(previous);
          showToast(getErrorMessage(err, "Could not update public profile."));
        },
      },
    );
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
          navigation={navigation}
          styles={styles}
          theme={theme}
        />

        <MenuItem
          icon="shield-account"
          title="Verification"
          screen="ComingSoon"
          params={{ title: "Verification" }}
          navigation={navigation}
          styles={styles}
          theme={theme}
        />

        <MenuItem
          icon="lock-outline"
          title="Change Password"
          screen="ChangePassword"
          navigation={navigation}
          styles={styles}
          theme={theme}
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
          styles={styles}
          theme={theme}
        />

        <SwitchItem
          icon="bell-outline"
          title="Notifications"
          value={notificationsEnabled}
          onChange={handleToggleNotifications}
          styles={styles}
          theme={theme}
        />

        <SwitchItem
          icon="eye-outline"
          title="Public Profile"
          value={publicProfile}
          onChange={handleTogglePublicProfile}
          styles={styles}
          theme={theme}
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
          navigation={navigation}
          styles={styles}
          theme={theme}
        />

        <MenuItem
          icon="credit-card-outline"
          title="Payment Methods"
          screen="ComingSoon"
          params={{ title: "Payment Methods" }}
          navigation={navigation}
          styles={styles}
          theme={theme}
        />

        <MenuItem
          icon="cash-multiple"
          title="Wallet"
          screen="WalletPayments"
          navigation={navigation}
          styles={styles}
          theme={theme}
        />

        {/* Creator */}

        <Text style={styles.section}>
          CREATOR SETTINGS
        </Text>

        <MenuItem
          icon="music-note"
          title="Default Role"
          screen="DefaultRole"
          navigation={navigation}
          styles={styles}
          theme={theme}
        />

        <MenuItem
          icon="chart-line"
          title="Analytics"
          screen="AnalyticsDashboard"
          navigation={navigation}
          styles={styles}
          theme={theme}
        />

        {/* Support */}

        <Text style={styles.section}>
          SUPPORT
        </Text>

        <MenuItem
          icon="help-circle-outline"
          title="Help Center"
          screen="HelpCenter"
          navigation={navigation}
          styles={styles}
          theme={theme}
        />

        <MenuItem
          icon="file-document-outline"
          title="Terms & Conditions"
          screen="TermsConditions"
          navigation={navigation}
          styles={styles}
          theme={theme}
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
import {
  Feather,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  navigation: any;
}

export default function SettingsPreferencesScreen({
  navigation
}: Props) {
  const [darkMode, setDarkMode] =
    useState(false);

  const [notificationsEnabled,
    setNotificationsEnabled] =
    useState(true);

  const [publicProfile,
    setPublicProfile] =
    useState(true);

  const MenuItem = ({
    icon,
    title,
    screen
  }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() =>
        screen &&
        navigation.navigate(screen)
      }
    >
      <View style={styles.menuLeft}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color="#7C3AED"
        />

        <Text style={styles.menuText}>
          {title}
        </Text>
      </View>

      <Feather
        name="chevron-right"
        size={20}
        color="#888"
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
          color="#7C3AED"
        />

        <Text style={styles.menuText}>
          {title}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          true: "#7C3AED"
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
        />

        <MenuItem
          icon="lock-outline"
          title="Change Password"
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
          value={
            notificationsEnabled
          }
          onChange={
            setNotificationsEnabled
          }
        />

        <SwitchItem
          icon="eye-outline"
          title="Public Profile"
          value={publicProfile}
          onChange={setPublicProfile}
        />

        {/* Payments */}

        <Text style={styles.section}>
          PAYMENTS
        </Text>

        <MenuItem
          icon="bank-outline"
          title="Bank Account"
        />

        <MenuItem
          icon="credit-card-outline"
          title="Payment Methods"
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
        />

        <MenuItem
          icon="file-document-outline"
          title="Terms & Conditions"
        />

        <TouchableOpacity
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>
            Logout
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

  section: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    color: "#666",
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
    borderBottomColor: "#EEE"
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center"
  },

  menuText: {
    marginLeft: 12,
    fontSize: 15
  },

  logoutButton: {
    backgroundColor: "#EF4444",
    marginHorizontal: 20,
    marginTop: 30,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  logoutText: {
    color: "#FFF",
    fontWeight: "700"
  }
});
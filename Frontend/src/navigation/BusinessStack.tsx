import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const businessModules = [
  {
    id: '1',
    title: 'Marketplace',
    icon: 'storefront-outline',
    screen: 'RightsMarketplace',
  },
  {
    id: '2',
    title: 'Rights',
    icon: 'shield-checkmark-outline',
    screen: 'RightsMarketplace',
  },
  {
    id: '3',
    title: 'Producer',
    icon: 'briefcase-outline',
    screen: 'ComingSoon',
    params: { title: 'Producer Dashboard' },
  },
  {
    id: '4',
    title: 'Revenue',
    icon: 'cash-outline',
    screen: 'RevenueDashboard',
  },
  {
    id: '5',
    title: 'Wallet',
    icon: 'wallet-outline',
    screen: 'WalletPayments',
  },
  {
    id: '6',
    title: 'Analytics',
    icon: 'bar-chart-outline',
    screen: 'AnalyticsDashboard',
  },
  {
    id: '7',
    title: 'Notifications',
    icon: 'notifications-outline',
    screen: 'NotificationsCenter',
  },
  {
    id: '8',
    title: 'Subscription',
    icon: 'diamond-outline',
    screen: 'SubscriptionPlans',
  },
  {
    id: '9',
    title: 'Settings',
    icon: 'settings-outline',
    screen: 'SettingsPreferences',
  },
];

type BusinessModule = {
  id: string;
  title: string;
  icon: string;
  screen: string;
  params?: Record<string, unknown>;
};

export default function BusinessStack({
  navigation,
}: any) {
  const renderItem = ({
    item,
  }: {
    item: BusinessModule;
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate(item.screen, item.params)
      }
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={item.icon as any}
          size={30}
          color="#7C3AED"
        />
      </View>

      <Text style={styles.cardTitle}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          BUSINESS HUB
        </Text>

        <Text style={styles.subHeading}>
          Monetization, Rights & Growth
        </Text>
      </View>

      <FlatList
        data={businessModules}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingTop: 50,
    marginTop: 36,
    marginBottom: 50
  },

  header: {
    marginBottom: 24,
  },

  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },

  subHeading: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 15,
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 6,
    borderRadius: 22,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
});
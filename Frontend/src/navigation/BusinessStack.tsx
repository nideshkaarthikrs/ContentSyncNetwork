import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Ionicons from 'react-native-vector-icons/Ionicons';

import { Theme } from '../theme/theme';
import { useTheme } from '../theme/useTheme';
import { MainTabParamList, RootStackParamList } from './types';

type BusinessModule = {
  id: string;
  title: string;
  icon: string;
  screen: keyof RootStackParamList;
  params?: Record<string, unknown>;
};

const businessModules: BusinessModule[] = [
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

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Business'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function BusinessStack({
  navigation,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  const renderItem = ({
    item,
  }: {
    item: BusinessModule;
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        // `item.screen`/`item.params` are validated against RootStackParamList
        // (typos in the array above are a tsc error), but `navigate`'s overloads
        // can't be resolved for a dynamic (non-literal) route name -- see the
        // dispatch-table ruling in the task brief. Cast only at this call site.
        navigation.navigate(item.screen as any, item.params)
      }
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={item.icon as any}
          size={30}
          color={theme.colors.primary}
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

const getStyles = (theme: Theme, insets: { top: number; bottom: number }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 14,
    paddingTop: 50 + insets.top,
    paddingBottom: insets.bottom
  },

  header: {
    marginBottom: 24,
  },

  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors.text,
  },

  subHeading: {
    marginTop: 6,
    color: theme.colors.textMuted,
    fontSize: 15,
  },

  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
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
    backgroundColor: theme.dark ? '#3B2E5C' : '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
});
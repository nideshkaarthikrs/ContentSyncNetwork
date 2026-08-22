import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const homeModules = [
  {
    id: '1',
    title: 'Home Feed',
    icon: 'home-outline',
    screen: 'HomeFeed',
  },
  {
    id: '2',
    title: 'Discover',
    icon: 'compass-outline',
    screen: 'ComingSoon',
    params: { title: 'Talent Discovery' },
  },
  {
    id: '3',
    title: 'Profile',
    icon: 'person-outline',
    screen: 'CreatorProfile',
  },
  {
    id: '4',
    title: 'Projects',
    icon: 'folder-open-outline',
    screen: 'MyProjects',
  },
  {
    id: '5',
    title: 'Marketplace',
    icon: 'storefront-outline',
    screen: 'RightsMarketplace',
  },
  {
    id: '6',
    title: 'Voting',
    icon: 'thumbs-up-outline',
    screen: 'Voting',
  },
  {
    id: '7',
    title: 'AI Assist',
    icon: 'sparkles-outline',
    screen: 'AIAssistant',
  },
  {
    id: '8',
    title: 'Notifications',
    icon: 'notifications-outline',
    screen: 'NotificationsCenter',
  },
  {
    id: '9',
    title: 'Settings',
    icon: 'settings-outline',
    screen: 'SettingsPreferences',
  },
];

type HomeModule = {
  id: string;
  title: string;
  icon: string;
  screen: string;
  params?: Record<string, unknown>;
};

export default function HomeStack({
  navigation,
}: any) {
  const renderItem = ({
    item,
  }: {
    item: HomeModule;
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
          CREATIVE SYNC NETWORK
        </Text>

        <Text style={styles.subHeading}>
          Discover • Collaborate • Create • Monetize
        </Text>
      </View>

      <FlatList
        data={homeModules}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
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
    fontSize: 28,
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
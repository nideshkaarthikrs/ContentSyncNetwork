import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const creatorModules = [
  {
    id: '1',
    title: 'Home Feed',
    icon: 'home-outline',
    screen: 'HomeFeed',
  },
  {
    id: '2',
    title: 'Discover',
    icon: 'search-outline',
    screen: 'DiscoverTalent',
  },
  {
    id: '3',
    title: 'Composer',
    icon: 'musical-notes-outline',
    screen: 'ComposerDashboard',
  },
  {
    id: '4',
    title: 'Lyrics',
    icon: 'document-text-outline',
    screen: 'LyricsSubmission',
  },
  {
    id: '5',
    title: 'Singer',
    icon: 'mic-outline',
    screen: 'SingerStudio',
  },
  {
    id: '6',
    title: 'Director',
    icon: 'videocam-outline',
    screen: 'DirectorStudio',
  },
  {
    id: '7',
    title: 'AI Assist',
    icon: 'sparkles-outline',
    screen: 'AIAssistant',
  },
  {
    id: '8',
    title: 'Projects',
    icon: 'folder-open-outline',
    screen: 'ProjectWorkspace',
  },
  {
    id: '9',
    title: 'Voting',
    icon: 'thumbs-up-outline',
    screen: 'Voting',
  },
];

type CreatorModule = {
  id: string;
  title: string;
  icon: string;
  screen: string;
};

export default function CreatorStack({
  navigation,
}: any) {
  const renderItem = ({
    item,
  }: {
    item: CreatorModule;
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate(item.screen)
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
          CREATOR STUDIO
        </Text>

        <Text style={styles.subHeading}>
          Create, Collaborate & Publish
        </Text>
      </View>

      <FlatList
        data={creatorModules}
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
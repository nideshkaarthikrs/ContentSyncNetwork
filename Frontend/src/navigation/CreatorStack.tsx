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

type CreatorModule = {
  id: string;
  title: string;
  icon: string;
  screen: keyof RootStackParamList;
  params?: Record<string, unknown>;
};

const creatorModules: CreatorModule[] = [
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
    screen: 'ComingSoon',
    params: { title: 'Talent Discovery' },
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
    screen: 'MyProjects',
  },
  {
    id: '9',
    title: 'Voting',
    icon: 'thumbs-up-outline',
    screen: 'Voting',
  },
];

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Creator'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function CreatorStack({
  navigation,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  const renderItem = ({
    item,
  }: {
    item: CreatorModule;
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
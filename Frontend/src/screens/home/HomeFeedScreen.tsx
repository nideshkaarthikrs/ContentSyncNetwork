import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { FeedItem, FeedItemType } from "../../api/services/feed.api";
import { useHomeFeed } from "../../hooks/feed/useHomeFeed";
import { RootStackParamList } from "../../navigation/types";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

type Props = NativeStackScreenProps<RootStackParamList, "HomeFeed">;

const FEED_ICON: Record<FeedItemType, string> = {
  TUNE: "music-note",
  VIDEO: "videocam",
  PROJECT: "folder",
};

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function FeedCard({ item }: { item: FeedItem }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.feedCard}>
      <View style={styles.feedIconWrap}>
        <MaterialIcons name={FEED_ICON[item.type]} size={20} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.feedTitle}>{item.title}</Text>
        <Text style={styles.feedMeta}>
          {item.actorUserId} · {timeAgo(item.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export default function HomeFeedScreen({
  navigation
}: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { data: feed, isLoading } = useHomeFeed();
  const posts = feed?.data ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.logo}>CSN</Text>

          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("NotificationsCenter")
              }
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Latest From Network */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Latest From Network
          </Text>
        </View>

        {isLoading && (
          <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
        )}

        {!isLoading && posts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={40} color={theme.colors.border} />
            <Text style={styles.emptyText}>
              Nothing in your feed yet. Follow creators and upload tunes to see activity here.
            </Text>
          </View>
        )}

        {!isLoading &&
          posts.map((item) => <FeedCard key={item.feedItemId} item={item} />)}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("UploadTune")
        }
      >
        <MaterialIcons
          name="add"
          size={30}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15
  },

  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.primary
  },

  headerIcons: {
    flexDirection: "row"
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text
  },

  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 30
  },

  emptyText: {
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20
  },

  feedCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },

  feedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },

  feedTitle: {
    fontWeight: "600",
    fontSize: 15,
    color: theme.colors.text
  },

  feedMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2
  },

  fab: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5
  }
});
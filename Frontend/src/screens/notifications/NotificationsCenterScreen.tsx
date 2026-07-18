import {
  Feather,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Notification, NotificationType } from "../../api/services/notification.api";
import { useMarkAllRead } from "../../hooks/notifications/useMarkAllRead";
import { useMarkNotificationRead } from "../../hooks/notifications/useMarkNotificationRead";
import { useNotifications } from "../../hooks/notifications/useNotifications";

interface Props {
  navigation: any;
}

const TYPE_ICON: Record<NotificationType, string> = {
  FOLLOW: "account-plus",
  VOTE_RECEIVED: "music-note",
  INVITE: "account-multiple-plus",
  MARKETPLACE_SALE: "cash",
  COPYRIGHT_CLAIM: "shield-alert",
  SYSTEM: "shield-check",
};

const TYPE_CATEGORY: Record<NotificationType, string> = {
  FOLLOW: "Activity",
  VOTE_RECEIVED: "Activity",
  INVITE: "Collaboration",
  MARKETPLACE_SALE: "Finance",
  COPYRIGHT_CLAIM: "System",
  SYSTEM: "System",
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

export default function NotificationsCenterScreen({
  navigation
}: Props) {
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markRead = useMarkNotificationRead();

  const notifications = data?.data ?? [];

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (!item.read) {
          markRead.mutate(item.notificationId);
        }
        if (item.type === "INVITE" && item.sourceId) {
          navigation.navigate("ProjectWorkspace", { projectId: item.sourceId });
        }
      }}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={TYPE_ICON[item.type] as any}
          size={24}
          color="#7C3AED"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>
          {item.title}
        </Text>

        <Text style={styles.time}>
          {TYPE_CATEGORY[item.type]} · {timeAgo(item.createdAt)}
        </Text>
      </View>

      {!item.read && (
        <View style={styles.unreadDot} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Feather
            name="arrow-left"
            size={22}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Notifications
        </Text>

        <TouchableOpacity
          onPress={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || !data?.unreadCount}
        >
          <Text style={styles.markRead}>
            Read All
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#7C3AED" />
      ) : notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications yet</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.notificationId}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 40
          }}
        />
      )}
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

  markRead: {
    color: PRIMARY,
    fontWeight: "600"
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#777"
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EEE"
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },

  title: {
    fontSize: 15,
    fontWeight: "600"
  },

  time: {
    marginTop: 4,
    color: "#777",
    fontSize: 12
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY
  }
});

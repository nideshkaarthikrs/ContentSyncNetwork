import {
  Feather,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  navigation: any;
}

const notificationsData = [
  {
    id: "1",
    icon: "music-note",
    title: "Your tune received 52 votes",
    time: "2 mins ago",
    category: "Activity",
    read: false
  },
  {
    id: "2",
    icon: "cash",
    title: "Rights listing sold for ₹50,000",
    time: "15 mins ago",
    category: "Finance",
    read: false
  },
  {
    id: "3",
    icon: "microphone",
    title: "Singer Rahul uploaded performance",
    time: "1 hour ago",
    category: "Collaboration",
    read: true
  },
  {
    id: "4",
    icon: "account-plus",
    title: "Priya started following you",
    time: "Yesterday",
    category: "Activity",
    read: true
  },
  {
    id: "5",
    icon: "shield-check",
    title: "Account verification approved",
    time: "2 days ago",
    category: "System",
    read: true
  }
];

export default function NotificationsCenterScreen({
  navigation
}: Props) {
  const [notifications, setNotifications] =
    useState(notificationsData);

  const markAllRead = () => {
    setNotifications(prev =>
      prev.map(item => ({
        ...item,
        read: true
      }))
    );
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={item.icon as any}
          size={24}
          color="#7C3AED"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>
          {item.title}
        </Text>

        <Text style={styles.time}>
          {item.time}
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
          onPress={markAllRead}
        >
          <Text style={styles.markRead}>
            Read All
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: 40
        }}
      />
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
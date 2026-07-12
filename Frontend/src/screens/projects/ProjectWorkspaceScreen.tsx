import {
  Feather,
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  navigation: any;
}

const projectMembers = [
  {
    id: "1",
    name: "Arjun Music",
    role: "Composer"
  },
  {
    id: "2",
    name: "Priya Writer",
    role: "Lyricist"
  },
  {
    id: "3",
    name: "Rahul Singer",
    role: "Singer"
  },
  {
    id: "4",
    name: "Vijay Director",
    role: "Director"
  }
];

const tasks = [
  {
    id: "1",
    title: "Finalize Lyrics",
    status: "Pending"
  },
  {
    id: "2",
    title: "Record Vocal Track",
    status: "In Progress"
  },
  {
    id: "3",
    title: "Storyboard Creation",
    status: "Completed"
  }
];

export default function ProjectWorkspaceScreen({
  navigation
}: Props) {
  const [activeTab, setActiveTab] =
    useState("Overview");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="arrow-left"
              size={22}
              color="#FFF"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Project Workspace
          </Text>

          <TouchableOpacity>
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        {/* Project Summary */}

        <View style={styles.projectCard}>
          <Text style={styles.projectName}>
            Love Melody Project
          </Text>

          <Text style={styles.projectMeta}>
            Active Collaboration
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: "72%" }
                ]}
              />
            </View>

            <Text style={styles.progressText}>
              72% Complete
            </Text>
          </View>
        </View>

        {/* Tabs */}

        <View style={styles.tabContainer}>
          {[
            "Overview",
            "Tasks",
            "Files",
            "Chat"
          ].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() =>
                setActiveTab(tab)
              }
              style={[
                styles.tabButton,
                activeTab === tab &&
                  styles.activeTab
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab &&
                    styles.activeTabText
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Team */}

        <Text style={styles.sectionTitle}>
          Team Members
        </Text>

        {projectMembers.map(member => (
          <View
            key={member.id}
            style={styles.memberCard}
          >
            <View
              style={styles.avatarCircle}
            >
              <Text
                style={styles.avatarText}
              >
                {member.name.charAt(0)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>
                {member.name}
              </Text>

              <Text style={styles.memberRole}>
                {member.role}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="message-outline"
              size={22}
              color="#7C3AED"
            />
          </View>
        ))}

        {/* Tasks */}

        <Text style={styles.sectionTitle}>
          Project Tasks
        </Text>

        {tasks.map(task => (
          <View
            key={task.id}
            style={styles.taskCard}
          >
            <Text style={styles.taskTitle}>
              {task.title}
            </Text>

            <View
              style={[
                styles.statusBadge,
                task.status ===
                  "Completed" &&
                  styles.completedBadge
              ]}
            >
              <Text
                style={styles.statusText}
              >
                {task.status}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>
            Create New Task
          </Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Chat */}

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate(
            "ProjectChat"
          )
        }
      >
        <MaterialCommunityIcons
          name="chat"
          size={28}
          color="#FFF"
        />
      </TouchableOpacity>
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
    backgroundColor: PRIMARY,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700"
  },

  projectCard: {
    margin: 20,
    backgroundColor: "#F5F3FF",
    borderRadius: 15,
    padding: 20
  },

  projectName: {
    fontSize: 20,
    fontWeight: "700"
  },

  projectMeta: {
    color: "#666",
    marginTop: 5
  },

  progressContainer: {
    marginTop: 15
  },

  progressBar: {
    height: 8,
    backgroundColor: "#DDD",
    borderRadius: 8
  },

  progressFill: {
    height: 8,
    backgroundColor: PRIMARY,
    borderRadius: 8
  },

  progressText: {
    marginTop: 8,
    color: "#666"
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around"
  },

  tabButton: {
    paddingVertical: 10
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY
  },

  tabText: {
    color: "#666"
  },

  activeTabText: {
    color: PRIMARY,
    fontWeight: "700"
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
    fontWeight: "700",
    fontSize: 18
  },

  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15
  },

  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },

  avatarText: {
    fontWeight: "700",
    color: PRIMARY
  },

  memberName: {
    fontWeight: "700"
  },

  memberRole: {
    color: "#666"
  },

  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#EEE"
  },

  taskTitle: {
    fontWeight: "600"
  },

  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15
  },

  completedBadge: {
    backgroundColor: "#D1FAE5"
  },

  statusText: {
    fontSize: 12
  },

  actionButton: {
    backgroundColor: PRIMARY,
    height: 52,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },

  actionText: {
    color: "#FFF",
    fontWeight: "700"
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center"
  }
});
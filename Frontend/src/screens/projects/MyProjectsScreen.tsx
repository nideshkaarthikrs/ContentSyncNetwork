import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
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

import { useMyProjects } from "../../hooks/project/useMyProjects";
import { RootStackParamList } from "../../navigation/types";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

type Props = NativeStackScreenProps<RootStackParamList, "MyProjects">;

export default function MyProjectsScreen({ navigation }: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const { data, isLoading } = useMyProjects(1, 20);
  const projects = data?.projects ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Projects</Text>

        <TouchableOpacity onPress={() => navigation.navigate("ProjectWorkspace")}>
          <Feather name="plus" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {isLoading && (
          <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
        )}

        {!isLoading && projects.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="folder-open-outline" size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No projects yet. Create your first one.</Text>
          </View>
        )}

        {projects.map((project) => (
          <TouchableOpacity
            key={project.projectId}
            style={styles.projectCard}
            onPress={() =>
              navigation.navigate("ProjectWorkspace", {
                projectId: project.projectId,
                projectName: project.projectName
              })
            }
          >
            <View style={styles.projectIconWrap}>
              <Feather name="folder" size={24} color={theme.colors.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.projectName}>{project.projectName}</Text>

              <Text style={styles.projectMeta}>
                {project.projectId} • {project.role}
              </Text>
            </View>

            <Text style={styles.time}>{project.status}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },

  header: {
    backgroundColor: theme.colors.primary,
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

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40
  },

  emptyText: {
    color: theme.colors.textMuted,
    marginHorizontal: 20,
    textAlign: "center",
    marginTop: 10
  },

  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 15
  },

  // Decorative light-purple icon well behind the folder icon; no matching
  // theme token, so branch to a deep purple in dark mode to keep the icon
  // legible against the dark background.
  projectIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: theme.dark ? "#3B2A5A" : "#F3E8FF",
    justifyContent: "center",
    alignItems: "center"
  },

  projectName: {
    fontWeight: "700",
    color: theme.colors.text
  },

  projectMeta: {
    color: theme.colors.textMuted,
    marginTop: 4
  },

  time: {
    color: theme.colors.textMuted,
    fontSize: 12
  }
});

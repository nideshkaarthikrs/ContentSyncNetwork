import {
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
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

const projects = [
  {
    id: "1",
    title: "Love Melody",
    status: "Production",
    budget: "₹2,50,000"
  },
  {
    id: "2",
    title: "Dream Symphony",
    status: "Voting",
    budget: "₹1,80,000"
  },
  {
    id: "3",
    title: "Freedom Anthem",
    status: "Rights Sale",
    budget: "₹4,25,000"
  }
];

export default function ProducerDashboardScreen({
  navigation
}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Header */}

        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>
              Welcome Producer
            </Text>

            <Text style={styles.subTitle}>
              Manage projects & investments
            </Text>
          </View>

          <TouchableOpacity>
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#111"
            />
          </TouchableOpacity>
        </View>

        {/* KPI Cards */}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              12
            </Text>
            <Text style={styles.statLabel}>
              Projects
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              ₹18L
            </Text>
            <Text style={styles.statLabel}>
              Invested
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              ₹32L
            </Text>
            <Text style={styles.statLabel}>
              Revenue
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              78%
            </Text>
            <Text style={styles.statLabel}>
              ROI
            </Text>
          </View>
        </View>

        {/* Quick Actions */}

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
          >
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={32}
              color="#7C3AED"
            />

            <Text style={styles.actionText}>
              New Project
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              navigation.navigate(
                "RevenueDashboard"
              )
            }
          >
            <MaterialCommunityIcons
              name="cash-multiple"
              size={32}
              color="#7C3AED"
            />

            <Text style={styles.actionText}>
              Revenue
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Projects */}

        <Text style={styles.sectionTitle}>
          Active Projects
        </Text>

        {projects.map(project => (
          <TouchableOpacity
            key={project.id}
            style={styles.projectCard}
          >
            <View>
              <Text style={styles.projectTitle}>
                {project.title}
              </Text>

              <Text style={styles.projectStatus}>
                {project.status}
              </Text>
            </View>

            <View>
              <Text style={styles.budget}>
                {project.budget}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Investments */}

        <Text style={styles.sectionTitle}>
          Recent Investments
        </Text>

        <View style={styles.investmentCard}>
          <Text style={styles.investmentTitle}>
            Music Rights Acquisition
          </Text>

          <Text style={styles.investmentValue}>
            ₹1,25,000
          </Text>

          <Text style={styles.investmentMeta}>
            Purchased 3 days ago
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
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
    justifyContent: "space-between"
  },

  welcome: {
    fontSize: 22,
    fontWeight: "700"
  },

  subTitle: {
    color: "#666",
    marginTop: 4
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 15
  },

  statCard: {
    width: "48%",
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center"
  },

  statValue: {
    fontSize: 24,
    fontWeight: "700"
  },

  statLabel: {
    color: "#666",
    marginTop: 5
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700"
  },

  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20
  },

  actionCard: {
    width: "48%",
    height: 110,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  actionText: {
    marginTop: 8,
    fontWeight: "600"
  },

  projectCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  projectTitle: {
    fontWeight: "700"
  },

  projectStatus: {
    color: "#666",
    marginTop: 4
  },

  budget: {
    color: PRIMARY,
    fontWeight: "700"
  },

  investmentCard: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#F9FAFB"
  },

  investmentTitle: {
    fontWeight: "700"
  },

  investmentValue: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10
  },

  investmentMeta: {
    color: "#666",
    marginTop: 4
  }
});
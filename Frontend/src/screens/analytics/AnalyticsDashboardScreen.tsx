import {
  Feather,
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

export default function AnalyticsDashboardScreen({
  navigation
}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

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
            Analytics
          </Text>

          <TouchableOpacity>
            <Feather
              name="download"
              size={20}
            />
          </TouchableOpacity>
        </View>

        {/* Overview */}

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            Total Revenue
          </Text>

          <Text style={styles.heroValue}>
            ₹8,45,000
          </Text>

          <Text style={styles.heroGrowth}>
            +18% this month
          </Text>
        </View>

        {/* KPI */}

        <View style={styles.grid}>
          <Metric
            title="Plays"
            value="125K"
          />

          <Metric
            title="Followers"
            value="42K"
          />

          <Metric
            title="Projects"
            value="38"
          />

          <Metric
            title="Rights Sold"
            value="14"
          />
        </View>

        {/* Top Tunes */}

        <Text style={styles.sectionTitle}>
          Top Performing Tunes
        </Text>

        <View style={styles.card}>
          <TuneRow
            title="Love Melody"
            plays="56K"
          />

          <TuneRow
            title="Dream Symphony"
            plays="34K"
          />

          <TuneRow
            title="Freedom Anthem"
            plays="28K"
          />
        </View>

        {/* Audience */}

        <Text style={styles.sectionTitle}>
          Audience Geography
        </Text>

        <View style={styles.card}>
          <TuneRow
            title="India"
            plays="62%"
          />

          <TuneRow
            title="USA"
            plays="18%"
          />

          <TuneRow
            title="UK"
            plays="8%"
          />

          <TuneRow
            title="Others"
            plays="12%"
          />
        </View>

        {/* Revenue Sources */}

        <Text style={styles.sectionTitle}>
          Revenue Sources
        </Text>

        <View style={styles.card}>
          <TuneRow
            title="Rights Sales"
            plays="₹4,20,000"
          />

          <TuneRow
            title="Streaming"
            plays="₹2,10,000"
          />

          <TuneRow
            title="Subscriptions"
            plays="₹95,000"
          />

          <TuneRow
            title="Advertising"
            plays="₹1,20,000"
          />
        </View>

        <TouchableOpacity
          style={styles.reportButton}
        >
          <MaterialCommunityIcons
            name="file-chart"
            color="#FFF"
            size={22}
          />

          <Text style={styles.reportText}>
            Export Analytics Report
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const Metric = ({
  title,
  value
}: {
  title: string;
  value: string;
}) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricValue}>
      {value}
    </Text>

    <Text style={styles.metricTitle}>
      {title}
    </Text>
  </View>
);

const TuneRow = ({
  title,
  plays
}: {
  title: string;
  plays: string;
}) => (
  <View style={styles.row}>
    <Text>{title}</Text>
    <Text>{plays}</Text>
  </View>
);

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

  heroCard: {
    margin: 20,
    backgroundColor: PRIMARY,
    borderRadius: 18,
    padding: 24
  },

  heroLabel: {
    color: "#DDD"
  },

  heroValue: {
    color: "#FFF",
    fontSize: 34,
    fontWeight: "700"
  },

  heroGrowth: {
    color: "#FFF",
    marginTop: 5
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 20
  },

  metricCard: {
    width: "48%",
    backgroundColor: "#F5F3FF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12
  },

  metricValue: {
    fontSize: 22,
    fontWeight: "700"
  },

  metricTitle: {
    color: "#666",
    marginTop: 4
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "700"
  },

  card: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    padding: 15
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10
  },

  reportButton: {
    backgroundColor: PRIMARY,
    marginHorizontal: 20,
    marginTop: 25,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },

  reportText: {
    color: "#FFF",
    fontWeight: "700",
    marginLeft: 10
  }
});
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
  route: any;
}

export default function RightsDetailScreen({
  navigation,
  route
}: Props) {

  const rights = {
    title: "Love Melody",
    owner: "Arjun Music",
    category: "Full Song Rights",
    price: "₹75,000",
    duration: "Lifetime",
    usage: [
      "Commercial Usage",
      "Streaming Platforms",
      "OTT Distribution",
      "YouTube Monetization"
    ]
  };

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
            Rights Detail
          </Text>

          <TouchableOpacity>
            <Feather
              name="share-2"
              size={20}
            />
          </TouchableOpacity>
        </View>

        {/* Hero Card */}

        <View style={styles.heroCard}>
          <Text style={styles.songTitle}>
            {rights.title}
          </Text>

          <Text style={styles.category}>
            {rights.category}
          </Text>

          <Text style={styles.price}>
            {rights.price}
          </Text>
        </View>

        {/* Owner */}

        <Text style={styles.sectionTitle}>
          Rights Owner
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            {rights.owner}
          </Text>
        </View>

        {/* Ownership */}

        <Text style={styles.sectionTitle}>
          Ownership Split
        </Text>

        <View style={styles.infoCard}>
          <Row
            title="Composer"
            value="40%"
          />
          <Row
            title="Singer"
            value="20%"
          />
          <Row
            title="Lyricist"
            value="20%"
          />
          <Row
            title="Producer"
            value="20%"
          />
        </View>

        {/* Usage Rights */}

        <Text style={styles.sectionTitle}>
          Usage Rights
        </Text>

        <View style={styles.infoCard}>
          {rights.usage.map(item => (
            <View
              key={item}
              style={styles.usageRow}
            >
              <MaterialCommunityIcons
                name="check-circle"
                color="#10B981"
                size={20}
              />

              <Text
                style={styles.usageText}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Contract */}

        <Text style={styles.sectionTitle}>
          Contract Details
        </Text>

        <TouchableOpacity
          style={styles.contractCard}
        >
          <MaterialCommunityIcons
            name="file-document-outline"
            size={28}
            color="#7C3AED"
          />

          <Text style={styles.contractText}>
            View Digital Contract
          </Text>
        </TouchableOpacity>

        {/* Purchase */}

        <TouchableOpacity
          style={styles.buyButton}
        >
          <Text style={styles.buyText}>
            Purchase Rights
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
        >
          <Text
            style={styles.secondaryText}
          >
            Contact Owner
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const Row = ({
  title,
  value
}: {
  title: string;
  value: string;
}) => (
  <View style={styles.row}>
    <Text>{title}</Text>
    <Text>{value}</Text>
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

  songTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700"
  },

  category: {
    color: "#E9D5FF",
    marginTop: 8
  },

  price: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "700",
    marginTop: 12
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "700"
  },

  infoCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    padding: 16
  },

  infoText: {
    fontWeight: "600"
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8
  },

  usageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8
  },

  usageText: {
    marginLeft: 10
  },

  contractCard: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    flexDirection: "row",
    alignItems: "center"
  },

  contractText: {
    marginLeft: 12,
    fontWeight: "600"
  },

  buyButton: {
    backgroundColor: PRIMARY,
    marginHorizontal: 20,
    marginTop: 25,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  buyText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: PRIMARY,
    marginHorizontal: 20,
    marginTop: 12,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  secondaryText: {
    color: PRIMARY,
    fontWeight: "700"
  }
});
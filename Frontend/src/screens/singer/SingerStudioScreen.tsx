import {
  Feather,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  navigation: any;
  route: any;
}

export default function SingerStudioScreen({
  navigation
}: Props) {
  const [aiEnhance, setAiEnhance] =
    useState(true);

  const [autoTune, setAutoTune] =
    useState(true);

  const handleSubmit = () => {
    Alert.alert(
      "Success",
      "Performance submitted successfully."
    );
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
              color="#111"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Singer Studio
          </Text>

          <View style={{ width: 22 }} />
        </View>

        {/* Step 1 */}

        <Text style={styles.stepTitle}>
          1. Select Tune
        </Text>

        <TouchableOpacity
          style={styles.selector}
        >
          <Text>Love Melody</Text>

          <Feather
            name="chevron-right"
            size={18}
          />
        </TouchableOpacity>

        {/* Step 2 */}

        <Text style={styles.stepTitle}>
          2. Select Lyrics
        </Text>

        <TouchableOpacity
          style={styles.selector}
        >
          <Text>
            Kadhal Pookal by Anu Writer
          </Text>

          <Feather
            name="chevron-right"
            size={18}
          />
        </TouchableOpacity>

        {/* Step 3 */}

        <Text style={styles.stepTitle}>
          3. Record / Upload
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionCard}
          >
            <MaterialCommunityIcons
              name="microphone"
              size={36}
              color="#7C3AED"
            />

            <Text style={styles.actionText}>
              Record Voice
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
          >
            <Feather
              name="upload"
              size={34}
              color="#7C3AED"
            />

            <Text style={styles.actionText}>
              Upload File
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Enhance */}

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>
              AI Enhance
            </Text>

            <Text style={styles.switchDesc}>
              Improve pitch, noise &
              clarity
            </Text>
          </View>

          <Switch
            value={aiEnhance}
            onValueChange={setAiEnhance}
            trackColor={{
              true: "#7C3AED"
            }}
          />
        </View>

        {/* Auto Tune */}

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>
              Auto Pitch Correction
            </Text>
          </View>

          <Switch
            value={autoTune}
            onValueChange={setAutoTune}
            trackColor={{
              true: "#7C3AED"
            }}
          />
        </View>

        {/* Submit */}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            Submit Performance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.guidelines}>
            Need help? View guidelines
          </Text>
        </TouchableOpacity>

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700"
  },

  stepTitle: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "700"
  },

  selector: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20
  },

  actionCard: {
    width: "48%",
    height: 120,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  actionText: {
    marginTop: 10,
    fontWeight: "600"
  },

  switchRow: {
    marginHorizontal: 20,
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  switchTitle: {
    fontWeight: "700"
  },

  switchDesc: {
    color: "#666",
    fontSize: 12,
    marginTop: 4
  },

  submitButton: {
    backgroundColor: PRIMARY,
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 35
  },

  submitText: {
    color: "#FFF",
    fontWeight: "700"
  },

  guidelines: {
    textAlign: "center",
    marginTop: 20,
    color: PRIMARY,
    fontWeight: "500"
  }
});
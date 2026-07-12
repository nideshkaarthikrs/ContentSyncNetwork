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
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  navigation: any;
}

export default function DirectorStudioScreen({
  navigation
}: Props) {
  const [useAIStoryboard, setUseAIStoryboard] =
    useState(true);

  const [allowCollaboration, setAllowCollaboration] =
    useState(true);

  const [concept, setConcept] = useState("");

  const handleSubmit = () => {
    Alert.alert(
      "Success",
      "Video concept submitted successfully."
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
            Director Studio
          </Text>

          <View style={{ width: 22 }} />
        </View>

        {/* Tune */}

        <Text style={styles.label}>
          Selected Tune
        </Text>

        <TouchableOpacity style={styles.selector}>
          <Text>Love Melody</Text>

          <Feather
            name="chevron-right"
            size={18}
          />
        </TouchableOpacity>

        {/* Lyrics */}

        <Text style={styles.label}>
          Selected Lyrics
        </Text>

        <TouchableOpacity style={styles.selector}>
          <Text>
            Kadhal Pookal - Submitted Lyrics
          </Text>

          <Feather
            name="chevron-right"
            size={18}
          />
        </TouchableOpacity>

        {/* Upload Mood Board */}

        <Text style={styles.label}>
          Mood Board / Reference
        </Text>

        <TouchableOpacity style={styles.uploadBox}>
          <MaterialCommunityIcons
            name="image-multiple-outline"
            size={40}
            color="#7C3AED"
          />

          <Text style={styles.uploadText}>
            Upload Images / References
          </Text>

          <Text style={styles.uploadSub}>
            JPG, PNG, PDF
          </Text>
        </TouchableOpacity>

        {/* Concept */}

        <Text style={styles.label}>
          Story Concept
        </Text>

        <TextInput
          multiline
          textAlignVertical="top"
          value={concept}
          onChangeText={setConcept}
          placeholder="Describe your video storyline, scenes, visual mood and cinematic approach..."
          style={styles.storyInput}
        />

        {/* AI Storyboard */}

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>
              Generate AI Storyboard
            </Text>

            <Text style={styles.switchDesc}>
              Create scene suggestions automatically
            </Text>
          </View>

          <Switch
            value={useAIStoryboard}
            onValueChange={setUseAIStoryboard}
            trackColor={{ true: "#7C3AED" }}
          />
        </View>

        {/* Collaboration */}

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>
              Open For Collaboration
            </Text>

            <Text style={styles.switchDesc}>
              Allow other directors to join
            </Text>
          </View>

          <Switch
            value={allowCollaboration}
            onValueChange={
              setAllowCollaboration
            }
            trackColor={{ true: "#7C3AED" }}
          />
        </View>

        {/* Generate */}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate(
              "AIAssistant"
            )
          }
        >
          <Text style={styles.secondaryText}>
            Generate Storyboard
          </Text>
        </TouchableOpacity>

        {/* Submit */}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubmit}
        >
          <Text style={styles.primaryText}>
            Submit Video Proposal
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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

  label: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
    fontWeight: "600"
  },

  selector: {
    height: 52,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  uploadBox: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#DDD",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 25
  },

  uploadText: {
    marginTop: 10,
    fontWeight: "600"
  },

  uploadSub: {
    color: "#666",
    marginTop: 5
  },

  storyInput: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    minHeight: 180,
    padding: 15
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
    fontSize: 12
  },

  secondaryButton: {
    marginHorizontal: 20,
    marginTop: 25,
    borderWidth: 1,
    borderColor: PRIMARY,
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },

  secondaryText: {
    color: PRIMARY,
    fontWeight: "700"
  },

  primaryButton: {
    marginHorizontal: 20,
    marginTop: 15,
    backgroundColor: PRIMARY,
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },

  primaryText: {
    color: "#FFF",
    fontWeight: "700"
  }
});
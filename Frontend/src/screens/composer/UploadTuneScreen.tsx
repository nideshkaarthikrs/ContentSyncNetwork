import { Feather } from "@expo/vector-icons";
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

export default function UploadTuneScreen({
  navigation
}: Props) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [language, setLanguage] = useState("");
  const [bpm, setBpm] = useState("");
  const [key, setKey] = useState("");
  const [aiAnalyze, setAiAnalyze] =
    useState(true);

  const handlePublish = () => {
    Alert.alert(
      "Success",
      "Tune published successfully"
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
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
            Upload Tune
          </Text>

          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter tune title"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Genre</Text>
        <TouchableOpacity
          style={styles.dropdown}
        >
          <Text style={styles.placeholder}>
            Select genre
          </Text>
          <Feather
            name="chevron-down"
            size={18}
          />
        </TouchableOpacity>

        <Text style={styles.label}>Mood</Text>
        <TouchableOpacity
          style={styles.dropdown}
        >
          <Text style={styles.placeholder}>
            Select mood
          </Text>
          <Feather
            name="chevron-down"
            size={18}
          />
        </TouchableOpacity>

        <Text style={styles.label}>
          Language
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
        >
          <Text style={styles.placeholder}>
            Select language
          </Text>
          <Feather
            name="chevron-down"
            size={18}
          />
        </TouchableOpacity>

        <Text style={styles.label}>
          BPM (Tempo)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 120"
          keyboardType="numeric"
          value={bpm}
          onChangeText={setBpm}
        />

        <Text style={styles.label}>
          Key (Optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. C Major"
          value={key}
          onChangeText={setKey}
        />

        <Text style={styles.label}>
          Upload Audio
        </Text>

        <TouchableOpacity
          style={styles.uploadBox}
        >
          <Feather
            name="upload-cloud"
            size={30}
            color="#7C3AED"
          />

          <Text style={styles.uploadText}>
            Tap to upload audio file
          </Text>

          <Text style={styles.uploadSub}>
            MP3, WAV, FLAC (Max 50MB)
          </Text>
        </TouchableOpacity>

        <View style={styles.aiRow}>
          <View>
            <Text style={styles.aiTitle}>
              AI Analyze
            </Text>

            <Text style={styles.aiDesc}>
              Get AI insights for this tune
            </Text>
          </View>

          <Switch
            value={aiAnalyze}
            onValueChange={setAiAnalyze}
            trackColor={{
              true: "#7C3AED"
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.publishButton}
          onPress={handlePublish}
        >
          <Text style={styles.publishText}>
            Publish Tune
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700"
  },

  label: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600"
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 15
  },

  dropdown: {
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

  placeholder: {
    color: "#888"
  },

  uploadBox: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#DDD",
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 25
  },

  uploadText: {
    marginTop: 10,
    fontWeight: "600"
  },

  uploadSub: {
    fontSize: 12,
    color: "#777",
    marginTop: 4
  },

  aiRow: {
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  aiTitle: {
    fontWeight: "700"
  },

  aiDesc: {
    color: "#666",
    fontSize: 12
  },

  publishButton: {
    backgroundColor: PRIMARY,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 30
  },

  publishText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  }
});
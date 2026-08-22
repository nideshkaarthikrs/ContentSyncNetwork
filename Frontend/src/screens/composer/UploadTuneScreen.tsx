import Feather from "react-native-vector-icons/Feather";
import { errorCodes, isErrorWithCode, pick } from "@react-native-documents/picker";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getErrorMessage } from "../../api/getErrorMessage";
import { RNFile } from "../../api/rnFile";
import { TuneAnalysis } from "../../api/services/tune.api";
import SelectListModal from "../../components/common/SelectListModal";
import { useAnalyzeTune } from "../../hooks/tune/useAnalyzeTune";
import { useCreateTune } from "../../hooks/tune/useCreateTune";
import { preflightUpload } from "../../utils/uploadPreflight";

interface Props {
  navigation: any;
}

const GENRES = ["Pop", "Classical", "Folk", "Hip-Hop", "Rock", "Devotional", "Electronic", "Jazz"];
const MOODS = ["Happy", "Sad", "Romantic", "Energetic", "Calm", "Melancholic", "Uplifting"];
const LANGUAGES = ["Tamil", "English", "Hindi", "Telugu", "Malayalam", "Kannada"];

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
  const [audioFile, setAudioFile] = useState<RNFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<TuneAnalysis | null>(null);

  const [genreModalOpen, setGenreModalOpen] = useState(false);
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  const createTune = useCreateTune();
  const analyzeTune = useAnalyzeTune();

  const pickAudio = async () => {
    let asset;
    try {
      [asset] = await pick({
        type: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/flac", "audio/*"],
      });
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert("Selection Failed", getErrorMessage(err));
      return;
    }

    const name = asset.name ?? "audio";
    const preflight = preflightUpload("tune", {
      name,
      type: asset.type ?? "audio/mpeg",
      size: asset.size,
    });
    if (!preflight.ok) {
      setError(preflight.error ?? "Selected file is invalid.");
      return;
    }

    setAudioFile({
      uri: asset.uri,
      name,
      type: preflight.file.type
    });
  };

  const handlePublish = async () => {
    if (!title || !genre || !mood || !language) {
      setError("Please fill in title, genre, mood, and language.");
      return;
    }
    if (!audioFile) {
      setError("Please upload an audio file.");
      return;
    }
    const parsedBpm = bpm ? Number(bpm) : undefined;
    if (bpm && (!Number.isFinite(parsedBpm) || parsedBpm! <= 0)) {
      setError("BPM must be a valid positive number.");
      return;
    }
    setError(null);
    setAnalysis(null);

    try {
      const created = await createTune.mutateAsync({
        payload: {
          title,
          genre,
          mood,
          language,
          bpm: parsedBpm
        },
        audio: audioFile
      });

      if (aiAnalyze) {
        try {
          const result = await analyzeTune.mutateAsync(created.tuneId);
          setAnalysis(result);
        } catch {
          // Analysis is a bonus step; a failure here shouldn't block the successful upload.
        }
      }

      Alert.alert("Success", "Tune published successfully", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to publish tune. Please try again."));
    }
  };

  const isSubmitting = createTune.isPending || analyzeTune.isPending;

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
          onPress={() => setGenreModalOpen(true)}
        >
          <Text style={genre ? styles.dropdownValue : styles.placeholder}>
            {genre || "Select genre"}
          </Text>
          <Feather
            name="chevron-down"
            size={18}
          />
        </TouchableOpacity>

        <Text style={styles.label}>Mood</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setMoodModalOpen(true)}
        >
          <Text style={mood ? styles.dropdownValue : styles.placeholder}>
            {mood || "Select mood"}
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
          onPress={() => setLanguageModalOpen(true)}
        >
          <Text style={language ? styles.dropdownValue : styles.placeholder}>
            {language || "Select language"}
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
          onPress={pickAudio}
        >
          <Feather
            name="upload-cloud"
            size={30}
            color="#7C3AED"
          />

          <Text style={styles.uploadText}>
            {audioFile ? audioFile.name : "Tap to upload audio file"}
          </Text>

          <Text style={styles.uploadSub}>
            MP3, WAV, FLAC
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

        {analysis && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <Text style={styles.resultTitle}>AI Tune Analysis</Text>
              {analysis.source !== "gemini" && (
                <Text style={styles.sampleBadge}>AI estimate</Text>
              )}
            </View>

            <View style={styles.analysisGrid}>
              <Text style={styles.analysisItem}>Genre: {analysis.genre}</Text>
              <Text style={styles.analysisItem}>BPM: {analysis.bpm}</Text>
              <Text style={styles.analysisItem}>Key: {analysis.key}</Text>
              <Text style={styles.analysisItem}>Mood: {analysis.mood}</Text>
              <Text style={styles.analysisItem}>
                Confidence: {analysis.confidence}%
              </Text>
            </View>
          </View>
        )}

        {error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        <TouchableOpacity
          style={styles.publishButton}
          onPress={handlePublish}
          disabled={isSubmitting}
        >
          <Text style={styles.publishText}>
            {isSubmitting ? "Publishing..." : "Publish Tune"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <SelectListModal
        visible={genreModalOpen}
        title="Select Genre"
        items={GENRES}
        keyExtractor={(item) => item}
        labelExtractor={(item) => item}
        onSelect={(item) => {
          setGenre(item);
          setGenreModalOpen(false);
        }}
        onClose={() => setGenreModalOpen(false)}
      />

      <SelectListModal
        visible={moodModalOpen}
        title="Select Mood"
        items={MOODS}
        keyExtractor={(item) => item}
        labelExtractor={(item) => item}
        onSelect={(item) => {
          setMood(item);
          setMoodModalOpen(false);
        }}
        onClose={() => setMoodModalOpen(false)}
      />

      <SelectListModal
        visible={languageModalOpen}
        title="Select Language"
        items={LANGUAGES}
        keyExtractor={(item) => item}
        labelExtractor={(item) => item}
        onSelect={(item) => {
          setLanguage(item);
          setLanguageModalOpen(false);
        }}
        onClose={() => setLanguageModalOpen(false)}
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

  dropdownValue: {
    color: "#111"
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

  errorText: {
    color: "#DC2626",
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 15
  },

  resultCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 15,
    backgroundColor: "#FAFAFA"
  },

  resultHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },

  resultTitle: {
    fontWeight: "700",
    fontSize: 15
  },

  sampleBadge: {
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic"
  },

  analysisGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },

  analysisItem: {
    color: "#333",
    fontSize: 13,
    minWidth: "45%"
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

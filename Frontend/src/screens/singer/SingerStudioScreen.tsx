import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getErrorMessage } from "../../api/getErrorMessage";
import { RNFile } from "../../api/rnFile";
import { Lyrics } from "../../api/services/lyrics.api";
import SelectListModal from "../../components/common/SelectListModal";
import { useTuneLyrics } from "../../hooks/lyrics/useTuneLyrics";
import { useTunePicker } from "../../hooks/tune/useTunePicker";
import { useAnalyzePerformance } from "../../hooks/voice/useAnalyzePerformance";
import { useUploadPerformance } from "../../hooks/voice/useUploadPerformance";

interface Props {
  navigation: any;
  route: any;
}

export default function SingerStudioScreen({
  navigation,
  route
}: Props) {
  const {
    selectedTune,
    setSelectedTune,
    myTunes,
    isModalOpen: tuneModalOpen,
    open: openTuneModal,
    close: closeTuneModal,
  } = useTunePicker(route?.params?.tuneId, route?.params?.tuneTitle);
  const [selectedLyrics, setSelectedLyrics] = useState<Lyrics | null>(null);
  const [voiceFile, setVoiceFile] = useState<RNFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [aiEnhance, setAiEnhance] =
    useState(true);

  const [autoTune, setAutoTune] =
    useState(true);

  const [lyricsModalOpen, setLyricsModalOpen] = useState(false);

  const { data: tuneLyrics } = useTuneLyrics(selectedTune?.tuneId);
  const uploadPerformance = useUploadPerformance();
  const analyzePerformance = useAnalyzePerformance();

  const pickVoiceFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/*"],
      copyToCacheDirectory: true
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setVoiceFile({
      uri: asset.uri,
      name: asset.name ?? "performance",
      type: asset.mimeType ?? "audio/mpeg"
    });
  };

  const handleSubmit = async () => {
    if (!selectedTune) {
      setError("Please select a tune.");
      return;
    }
    if (!selectedLyrics) {
      setError("Please select lyrics.");
      return;
    }
    if (!voiceFile) {
      setError("Please upload a voice file.");
      return;
    }
    setError(null);

    try {
      const { performanceId } = await uploadPerformance.mutateAsync({
        payload: { tuneId: selectedTune.tuneId, lyricsId: selectedLyrics.lyricsId },
        file: voiceFile
      });

      if (aiEnhance) {
        try {
          await analyzePerformance.mutateAsync(performanceId);
        } catch {
          // Analysis is a bonus step; a failure here shouldn't block the successful submission.
        }
      }

      Alert.alert("Success", "Performance submitted successfully.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to submit performance."));
    }
  };

  const isSubmitting = uploadPerformance.isPending || analyzePerformance.isPending;

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
          onPress={openTuneModal}
        >
          <Text>{selectedTune?.title ?? "Choose a tune"}</Text>

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
          onPress={() => selectedTune ? setLyricsModalOpen(true) : setError("Select a tune first.")}
        >
          <Text>
            {selectedLyrics ? selectedLyrics.title : "Choose lyrics"}
          </Text>

          <Feather
            name="chevron-right"
            size={18}
          />
        </TouchableOpacity>

        {/* Step 3 */}

        <Text style={styles.stepTitle}>
          3. Upload Performance
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={pickVoiceFile}
          >
            <Feather
              name="upload"
              size={34}
              color="#7C3AED"
            />

            <Text style={styles.actionText}>
              {voiceFile ? voiceFile.name : "Upload File"}
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

        {error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        {/* Submit */}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? "Submitting..." : "Submit Performance"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>

      <SelectListModal
        visible={tuneModalOpen}
        title="Select Tune"
        items={myTunes?.tunes ?? []}
        keyExtractor={(item) => item.tuneId}
        labelExtractor={(item) => item.title}
        onSelect={(item) => {
          setSelectedTune(item);
          setSelectedLyrics(null);
          closeTuneModal();
        }}
        onClose={closeTuneModal}
        emptyText="You haven't uploaded any tunes yet."
      />

      <SelectListModal
        visible={lyricsModalOpen}
        title="Select Lyrics"
        items={tuneLyrics?.lyrics ?? []}
        keyExtractor={(item) => item.lyricsId}
        labelExtractor={(item) => `${item.title} (${item.language})`}
        onSelect={(item) => {
          setSelectedLyrics(item);
          setLyricsModalOpen(false);
        }}
        onClose={() => setLyricsModalOpen(false)}
        emptyText="No lyrics submitted for this tune yet."
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
    justifyContent: "center",
    marginHorizontal: 20
  },

  actionCard: {
    width: "100%",
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

  errorText: {
    color: "#DC2626",
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 20
  },

  submitButton: {
    backgroundColor: PRIMARY,
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20
  },

  submitText: {
    color: "#FFF",
    fontWeight: "700"
  }
});

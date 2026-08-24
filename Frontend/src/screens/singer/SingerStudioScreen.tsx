import Feather from "react-native-vector-icons/Feather";
import { errorCodes, isErrorWithCode, pick } from "@react-native-documents/picker";
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
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getErrorMessage } from "../../api/getErrorMessage";
import { RNFile } from "../../api/rnFile";
import { Lyrics } from "../../api/services/lyrics.api";
import { PerformanceAnalysis } from "../../api/services/voice.api";
import SelectListModal from "../../components/common/SelectListModal";
import TunePlayButton from "../../components/common/TunePlayButton";
import { useStopAudioOnBlur } from "../../hooks/useStopAudioOnBlur";
import { useTuneLyrics } from "../../hooks/lyrics/useTuneLyrics";
import { useTunePicker } from "../../hooks/tune/useTunePicker";
import { useAnalyzePerformance } from "../../hooks/voice/useAnalyzePerformance";
import { useUploadPerformance } from "../../hooks/voice/useUploadPerformance";
import { RootStackParamList } from "../../navigation/types";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";
import { preflightUpload } from "../../utils/uploadPreflight";

type Props = NativeStackScreenProps<RootStackParamList, "SingerStudio">;

export default function SingerStudioScreen({
  navigation,
  route
}: Props) {
  useStopAudioOnBlur();

  const theme = useTheme();
  const styles = getStyles(theme);

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
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);

  const [aiEnhance, setAiEnhance] =
    useState(true);

  const [lyricsModalOpen, setLyricsModalOpen] = useState(false);

  const { data: tuneLyrics } = useTuneLyrics(selectedTune?.tuneId);
  const uploadPerformance = useUploadPerformance();
  const analyzePerformance = useAnalyzePerformance();

  const pickVoiceFile = async () => {
    let asset;
    try {
      [asset] = await pick({
        type: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/*"],
      });
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert("Selection Failed", getErrorMessage(err));
      return;
    }

    const name = asset.name ?? "performance";
    const preflight = preflightUpload("voice", {
      name,
      type: asset.type ?? "audio/mpeg",
      size: asset.size,
    });
    if (!preflight.ok) {
      setError(preflight.error ?? "Selected file is invalid.");
      return;
    }

    setVoiceFile({
      uri: asset.uri,
      name,
      type: preflight.file.type
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
    setAnalysis(null);

    try {
      const { performanceId } = await uploadPerformance.mutateAsync({
        payload: { tuneId: selectedTune.tuneId, lyricsId: selectedLyrics.lyricsId },
        file: voiceFile
      });

      if (aiEnhance) {
        try {
          const result = await analyzePerformance.mutateAsync(performanceId);
          setAnalysis(result);
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
              color={theme.colors.text}
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
          <Text style={styles.selectorText}>{selectedTune?.title ?? "Choose a tune"}</Text>

          <View style={styles.selectorRight}>
            {selectedTune && (
              <TunePlayButton tuneId={selectedTune.tuneId} audioUrl={selectedTune.audioUrl} size="small" />
            )}

            <Feather
              name="chevron-right"
              size={18}
            />
          </View>
        </TouchableOpacity>

        {/* Step 2 */}

        <Text style={styles.stepTitle}>
          2. Select Lyrics
        </Text>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => selectedTune ? setLyricsModalOpen(true) : setError("Select a tune first.")}
        >
          <Text style={styles.selectorText}>
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
              color={theme.colors.primary}
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
              Analyze performance
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
              true: theme.colors.primary
            }}
          />
        </View>

        {analysis && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <Text style={styles.resultTitle}>AI Performance Analysis</Text>
              {analysis.source !== "gemini" && (
                <Text style={styles.sampleBadge}>AI estimate</Text>
              )}
            </View>

            <View style={styles.analysisGrid}>
              <Text style={styles.analysisItem}>Pitch: {analysis.pitch}</Text>
              <Text style={styles.analysisItem}>Clarity: {analysis.clarity}</Text>
              <Text style={styles.analysisItem}>Rhythm: {analysis.rhythm}</Text>
              <Text style={styles.analysisItem}>Overall: {analysis.overall}</Text>
            </View>
          </View>
        )}

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
        renderRight={(item) => (
          <TunePlayButton tuneId={item.tuneId} audioUrl={item.audioUrl} size="small" />
        )}
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

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text
  },

  stepTitle: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "700",
    color: theme.colors.text
  },

  selector: {
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  selectorText: {
    color: theme.colors.text
  },

  selectorRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
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
    borderColor: theme.colors.border,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  actionText: {
    marginTop: 10,
    fontWeight: "600",
    color: theme.colors.text
  },

  switchRow: {
    marginHorizontal: 20,
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  switchTitle: {
    fontWeight: "700",
    color: theme.colors.text
  },

  switchDesc: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4
  },

  errorText: {
    color: theme.colors.danger,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 20
  },

  resultCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 15,
    backgroundColor: theme.colors.surface
  },

  resultHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },

  resultTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: theme.colors.text
  },

  sampleBadge: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: "italic"
  },

  analysisGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },

  analysisItem: {
    color: theme.colors.text,
    fontSize: 13,
    minWidth: "45%"
  },

  submitButton: {
    backgroundColor: theme.colors.primary,
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

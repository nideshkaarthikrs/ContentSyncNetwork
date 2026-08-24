import Feather from "react-native-vector-icons/Feather";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getErrorMessage } from "../../api/getErrorMessage";
import SelectListModal from "../../components/common/SelectListModal";
import TunePlayButton from "../../components/common/TunePlayButton";
import { useStopAudioOnBlur } from "../../hooks/useStopAudioOnBlur";
import { useCreateLyrics } from "../../hooks/lyrics/useCreateLyrics";
import { useGenerateLyrics } from "../../hooks/lyrics/useGenerateLyrics";
import { RootStackParamList } from "../../navigation/types";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

type Props = NativeStackScreenProps<RootStackParamList, "LyricsSubmission">;

const LANGUAGES = ["Tamil", "English", "Hindi", "Telugu", "Malayalam", "Kannada"];

export default function LyricsSubmissionScreen({
  navigation,
  route
}: Props) {
  useStopAudioOnBlur();

  const theme = useTheme();
  const styles = getStyles(theme);

  const tuneId: string | undefined = route?.params?.tuneId;
  const tuneTitle: string = route?.params?.tuneTitle || "Untitled Tune";

  const [language, setLanguage] = useState("Tamil");
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lyricsSource, setLyricsSource] = useState<"gemini" | "sample" | null>(null);

  const createLyrics = useCreateLyrics();
  const generateLyrics = useGenerateLyrics();

  const handleAiAssist = async () => {
    if (!tuneId) {
      setError("No tune selected — open this screen from a tune's detail page.");
      return;
    }
    try {
      const result = await generateLyrics.mutateAsync({
        tuneId,
        language,
        theme: title || "love"
      });
      const first = result.versions[0];
      if (first) setLyrics(first.lyrics);
      setLyricsSource(result.source);
    } catch (err) {
      Alert.alert("AI Assist Failed", getErrorMessage(err));
    }
  };

  const handleSubmit = async () => {
    if (!tuneId) {
      setError("No tune selected — open this screen from a tune's detail page.");
      return;
    }
    if (!lyrics.trim()) {
      setError("Please write some lyrics before submitting.");
      return;
    }
    setError(null);

    try {
      await createLyrics.mutateAsync({
        tuneId,
        title: title || tuneTitle,
        language,
        lyrics
      });
      Alert.alert("Success", "Lyrics submitted successfully.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to submit lyrics."));
    }
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
              color={theme.colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Submit Lyrics
          </Text>

          <View style={{ width: 22 }} />
        </View>

        {/* Tune */}

        <Text style={styles.label}>Tune</Text>

        <View style={styles.readOnlyBox}>
          <Text style={styles.readOnlyText}>{tuneTitle}</Text>

          {tuneId && <TunePlayButton tuneId={tuneId} size="small" />}
        </View>

        {/* Language */}

        <Text style={styles.label}>
          Language
        </Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setLanguageModalOpen(true)}
        >
          <Text style={styles.dropdownValue}>{language}</Text>

          <Feather
            name="chevron-down"
            size={18}
          />
        </TouchableOpacity>

        {/* Title */}

        <Text style={styles.label}>
          Title (Optional)
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Kadhal Pookal"
          value={title}
          onChangeText={setTitle}
        />

        {/* Lyrics */}

        <Text style={styles.label}>
          Lyrics
        </Text>

        <TextInput
          style={styles.lyricsBox}
          multiline
          textAlignVertical="top"
          placeholder="Write your lyrics here..."
          value={lyrics}
          onChangeText={setLyrics}
          maxLength={5000}
        />

        <Text style={styles.counter}>
          {lyrics.length}/5000
        </Text>

        {lyricsSource === "sample" && (
          <Text style={styles.sampleBadge}>
            AI estimate (sample) — Gemini was unavailable for this generation
          </Text>
        )}

        {error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        {/* AI Assist */}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleAiAssist}
          disabled={generateLyrics.isPending}
        >
          <Text style={styles.secondaryText}>
            {generateLyrics.isPending ? "Generating..." : "AI Lyric Assist"}
          </Text>
        </TouchableOpacity>

        {/* Submit */}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubmit}
          disabled={createLyrics.isPending}
        >
          <Text style={styles.primaryText}>
            {createLyrics.isPending ? "Submitting..." : "Submit Lyrics"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

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

  label: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 8,
    fontWeight: "600",
    color: theme.colors.text
  },

  readOnlyBox: {
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginHorizontal: 20
  },

  readOnlyText: {
    color: theme.colors.text
  },

  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center"
  },

  dropdownValue: {
    color: theme.colors.text
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    color: theme.colors.text
  },

  lyricsBox: {
    minHeight: 220,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 15,
    color: theme.colors.text
  },

  counter: {
    textAlign: "right",
    marginRight: 25,
    color: theme.colors.textMuted,
    marginTop: 5
  },

  sampleBadge: {
    marginHorizontal: 20,
    marginTop: 6,
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: "italic"
  },

  errorText: {
    color: theme.colors.danger,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12
  },

  secondaryText: {
    color: theme.colors.primary,
    fontWeight: "600"
  },

  primaryButton: {
    backgroundColor: theme.colors.primary,
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 15
  },

  primaryText: {
    color: "#FFF",
    fontWeight: "700"
  }
});

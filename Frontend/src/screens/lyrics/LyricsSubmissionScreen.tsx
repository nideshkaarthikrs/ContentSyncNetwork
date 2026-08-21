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

import { getErrorMessage } from "../../api/getErrorMessage";
import SelectListModal from "../../components/common/SelectListModal";
import TunePlayButton from "../../components/common/TunePlayButton";
import { useStopAudioOnBlur } from "../../hooks/useStopAudioOnBlur";
import { useCreateLyrics } from "../../hooks/lyrics/useCreateLyrics";
import { useGenerateLyrics } from "../../hooks/lyrics/useGenerateLyrics";

interface Props {
  navigation: any;
  route: any;
}

const LANGUAGES = ["Tamil", "English", "Hindi", "Telugu", "Malayalam", "Kannada"];

export default function LyricsSubmissionScreen({
  navigation,
  route
}: Props) {
  useStopAudioOnBlur();

  const tuneId: string | undefined = route?.params?.tuneId;
  const tuneTitle: string = route?.params?.tuneTitle || "Untitled Tune";

  const [language, setLanguage] = useState("Tamil");
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [error, setError] = useState<string | null>(null);

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
              color="#111"
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
          <Text>{tuneTitle}</Text>

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
          <Text>{language}</Text>

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
    marginTop: 15,
    marginBottom: 8,
    fontWeight: "600"
  },

  readOnlyBox: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginHorizontal: 20
  },

  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center"
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 15
  },

  lyricsBox: {
    minHeight: 220,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 15
  },

  counter: {
    textAlign: "right",
    marginRight: 25,
    color: "#777",
    marginTop: 5
  },

  errorText: {
    color: "#DC2626",
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: PRIMARY,
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12
  },

  secondaryText: {
    color: PRIMARY,
    fontWeight: "600"
  },

  primaryButton: {
    backgroundColor: PRIMARY,
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

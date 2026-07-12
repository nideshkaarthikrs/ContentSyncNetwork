import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  navigation: any;
  route: any;
}

export default function LyricsSubmissionScreen({
  navigation,
  route
}: Props) {
  const tune = route?.params?.tune || "Love Melody";

  const [language, setLanguage] =
    useState("Tamil");
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");

  const handleSubmit = () => {
    Alert.alert(
      "Success",
      "Lyrics submitted successfully."
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
            Submit Lyrics
          </Text>

          <View style={{ width: 22 }} />
        </View>

        {/* Tune */}

        <Text style={styles.label}>Tune</Text>

        <View style={styles.readOnlyBox}>
          <Text>{tune}</Text>
        </View>

        {/* Language */}

        <Text style={styles.label}>
          Language
        </Text>

        <TouchableOpacity
          style={styles.dropdown}
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

        {/* AI Assist */}

        <TouchableOpacity
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryText}>
            AI Lyric Assist
          </Text>
        </TouchableOpacity>

        {/* Save */}

        <TouchableOpacity
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryText}>
            Save Draft
          </Text>
        </TouchableOpacity>

        {/* Submit */}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubmit}
        >
          <Text style={styles.primaryText}>
            Submit Lyrics
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
    marginTop: 15,
    marginBottom: 8,
    fontWeight: "600"
  },

  readOnlyBox: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    justifyContent: "center",
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
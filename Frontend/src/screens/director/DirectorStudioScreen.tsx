import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from "react-native-image-picker";
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
import { Storyboard } from "../../api/services/video.api";
import SelectListModal from "../../components/common/SelectListModal";
import TunePlayButton from "../../components/common/TunePlayButton";
import { useStopAudioOnBlur } from "../../hooks/useStopAudioOnBlur";
import { useTunePicker } from "../../hooks/tune/useTunePicker";
import { useCreateVideoProject } from "../../hooks/video/useCreateVideoProject";
import { useGenerateStoryboard } from "../../hooks/video/useGenerateStoryboard";
import { useUploadVideo } from "../../hooks/video/useUploadVideo";
import { preflightUpload } from "../../utils/uploadPreflight";

interface Props {
  navigation: any;
  route: any;
}

export default function DirectorStudioScreen({
  navigation,
  route
}: Props) {
  useStopAudioOnBlur();

  const [useAIStoryboard, setUseAIStoryboard] =
    useState(true);

  const [concept, setConcept] = useState("");
  const {
    selectedTune,
    setSelectedTune,
    myTunes,
    isModalOpen: tuneModalOpen,
    open: openTuneModal,
    close: closeTuneModal,
  } = useTunePicker(route?.params?.tuneId, route?.params?.tuneTitle);
  const [moodBoard, setMoodBoard] = useState<RNFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);

  const createVideoProject = useCreateVideoProject();
  const uploadVideo = useUploadVideo();
  const generateStoryboard = useGenerateStoryboard();

  const pickMoodBoard = async () => {
    const result = await launchImageLibrary({ mediaType: "photo", quality: 0.8 });
    if (result.didCancel) return;
    if (result.errorCode) {
      setError(
        result.errorCode === "permission"
          ? "Photo library permission is required to upload a mood board."
          : result.errorMessage ?? "Could not open photo library."
      );
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    const name = asset.fileName ?? "moodboard.jpg";
    const preflight = preflightUpload("video", {
      name,
      type: asset.type ?? "image/jpeg",
      size: asset.fileSize,
    });
    if (!preflight.ok) {
      setError(preflight.error ?? "Selected file is invalid.");
      return;
    }

    setMoodBoard({
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
    if (!concept.trim()) {
      setError("Please describe your story concept.");
      return;
    }
    setError(null);
    setStoryboard(null);

    try {
      await createVideoProject.mutateAsync({
        songId: selectedTune.tuneId,
        title: concept.slice(0, 60)
      });

      if (moodBoard) {
        try {
          await uploadVideo.mutateAsync({ file: moodBoard, kind: "MOOD_BOARD" });
        } catch {
          // Mood board upload is a bonus step; a failure here shouldn't block the project creation.
        }
      }

      if (useAIStoryboard) {
        try {
          const result = await generateStoryboard.mutateAsync(selectedTune.tuneId);
          setStoryboard(result);
        } catch {
          // Storyboard generation is a bonus step; a failure here shouldn't block the submission.
        }
      }

      Alert.alert("Success", "Video concept submitted successfully.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to submit video proposal."));
    }
  };

  const isSubmitting = createVideoProject.isPending || uploadVideo.isPending || generateStoryboard.isPending;

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

        <TouchableOpacity
          style={styles.selector}
          onPress={openTuneModal}
        >
          <Text>{selectedTune?.title ?? "Choose a tune"}</Text>

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

        {/* Upload Mood Board */}

        <Text style={styles.label}>
          Mood Board / Reference
        </Text>

        <TouchableOpacity style={styles.uploadBox} onPress={pickMoodBoard}>
          <MaterialCommunityIcons
            name="image-multiple-outline"
            size={40}
            color="#7C3AED"
          />

          <Text style={styles.uploadText}>
            {moodBoard ? moodBoard.name : "Upload Images / References"}
          </Text>

          <Text style={styles.uploadSub}>
            JPG, PNG
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

        {storyboard && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <Text style={styles.resultTitle}>AI Storyboard</Text>
              {storyboard.source !== "gemini" && (
                <Text style={styles.sampleBadge}>AI estimate</Text>
              )}
            </View>

            {storyboard.shots.map((shot) => (
              <View key={shot.shot} style={styles.shotRow}>
                <Text style={styles.shotNumber}>Shot {shot.shot}</Text>
                <Text style={styles.shotDescription}>{shot.description}</Text>
                <Text style={styles.shotDuration}>{shot.duration}s</Text>
              </View>
            ))}
          </View>
        )}

        {error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        {/* Submit */}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryText}>
            {isSubmitting ? "Submitting..." : "Submit Video Proposal"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <SelectListModal
        visible={tuneModalOpen}
        title="Select Tune"
        items={myTunes?.tunes ?? []}
        keyExtractor={(item) => item.tuneId}
        labelExtractor={(item) => item.title}
        onSelect={(item) => {
          setSelectedTune(item);
          closeTuneModal();
        }}
        onClose={closeTuneModal}
        emptyText="You haven't uploaded any tunes yet."
        renderRight={(item) => (
          <TunePlayButton tuneId={item.tuneId} audioUrl={item.audioUrl} size="small" />
        )}
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

  selectorRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
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

  errorText: {
    color: "#DC2626",
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 20
  },

  resultCard: {
    marginHorizontal: 20,
    marginTop: 25,
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

  shotRow: {
    marginBottom: 10
  },

  shotNumber: {
    fontWeight: "600",
    color: PRIMARY,
    marginBottom: 2
  },

  shotDescription: {
    color: "#333"
  },

  shotDuration: {
    color: "#777",
    fontSize: 12,
    marginTop: 2
  },

  primaryButton: {
    marginHorizontal: 20,
    marginTop: 20,
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

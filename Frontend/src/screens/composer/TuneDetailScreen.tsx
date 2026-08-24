import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getErrorMessage } from "../../api/getErrorMessage";
import TunePlayButton from "../../components/common/TunePlayButton";
import { useStopAudioOnBlur } from "../../hooks/useStopAudioOnBlur";
import { useDeleteTune } from "../../hooks/tune/useDeleteTune";
import { useTune } from "../../hooks/tune/useTune";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";

type Props = NativeStackScreenProps<RootStackParamList, "TuneDetail">;

export default function TuneDetailScreen({
  navigation,
  route
}: Props) {
  useStopAudioOnBlur();

  const tuneId = route?.params?.tuneId;
  const { data: tune, isLoading, isError, error } = useTune(tuneId);
  const deleteTune = useDeleteTune();
  const currentUserId = useAuthStore((state) => state.user?.userId);

  const isOwner = !!tune && !!currentUserId && tune.ownerId === currentUserId;

  const handleDelete = () => {
    Alert.alert("Delete Tune", "This can't be undone. Delete this tune?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTune.mutateAsync(tuneId);
            navigation.goBack();
          } catch (err) {
            Alert.alert("Error", getErrorMessage(err, "Failed to delete tune."));
          }
        }
      }
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator color={PRIMARY} size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !tune) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>
          {getErrorMessage(error, "Tune not found.")}
        </Text>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: PRIMARY, fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}

        <View style={styles.iconHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="arrow-left"
              size={22}
              color="#111"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.coverPlaceholder}>
          <Ionicons name="musical-notes" size={64} color="#FFF" />

          <View style={styles.playButtonWrap}>
            <TunePlayButton tuneId={tune.tuneId} audioUrl={tune.audioUrl} size="large" />

            {isOwner && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDelete}
                disabled={deleteTune.isPending}
              >
                <Feather
                  name="trash-2"
                  size={20}
                  color="#DC2626"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tune Info */}

        <View style={styles.content}>
          <Text style={styles.title}>
            {tune.title}
          </Text>

          <Text style={styles.role}>
            {tune.status}
          </Text>

          {/* Tags */}

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text>{tune.genre}</Text>
            </View>

            <View style={styles.tag}>
              <Text>{tune.mood}</Text>
            </View>

            <View style={styles.tag}>
              <Text>{tune.language}</Text>
            </View>

            {tune.bpm != null && (
              <View style={styles.tag}>
                <Text>{tune.bpm} BPM</Text>
              </View>
            )}
          </View>

          {/* Actions */}

          <Text style={styles.sectionTitle}>
            Get Involved
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate(
                "LyricsSubmission",
                { tuneId: tune.tuneId, tuneTitle: tune.title }
              )
            }
          >
            <Text style={styles.actionText}>
              Write Lyrics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate(
                "SingerStudio",
                { tuneId: tune.tuneId, tuneTitle: tune.title }
              )
            }
          >
            <Text style={styles.actionText}>
              Sing This Tune
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate(
                "DirectorStudio",
                { tuneId: tune.tuneId, tuneTitle: tune.title }
              )
            }
          >
            <Text style={styles.actionText}>
              Create Video
            </Text>
          </TouchableOpacity>
        </View>

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

  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20
  },

  errorText: {
    color: "#DC2626",
    textAlign: "center"
  },

  iconHeader: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1,
    flexDirection: "row"
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center"
  },

  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10
  },

  coverPlaceholder: {
    height: 220,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center"
  },

  playButtonWrap: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center"
  },

  content: {
    padding: 20
  },

  title: {
    fontSize: 28,
    fontWeight: "700"
  },

  role: {
    color: "#777",
    marginTop: 6
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 10,
    fontWeight: "700",
    fontSize: 18
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15
  },

  tag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8
  },

  actionButton: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 10,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12
  },

  actionText: {
    color: PRIMARY,
    fontWeight: "700"
  }
});

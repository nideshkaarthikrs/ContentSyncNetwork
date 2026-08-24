import Feather from "react-native-vector-icons/Feather";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getErrorMessage } from "../../api/getErrorMessage";
import { useCastVote } from "../../hooks/voting/useCastVote";
import { useVoteResults } from "../../hooks/voting/useVoteResults";
import { RootStackParamList } from "../../navigation/types";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Voting">;

const ENTITY_TYPE = "PERFORMANCE";

// No backend endpoint lists voting candidates yet — voting-service only tracks
// votes per entityId. Until a candidates listing exists, the screen shows an
// honest empty state instead of hardcoded fake performers (which used to POST
// real votes against nonexistent entities). The cast/results plumbing below is
// live and ready for when candidates arrive.
interface VotingCandidate {
  id: string;
  name: string;
  role: string;
  image: string;
}

const submissions: VotingCandidate[] = [];

export default function VotingScreen({
  navigation
}: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);
  const [votedForId, setVotedForId] = useState<string | null>(null);

  const castVote = useCastVote();
  const { data: results, isLoading: resultsLoading } = useVoteResults(votedForId ?? undefined);

  const submitVote = async () => {
    if (!selectedId) {
      Alert.alert(
        "Select Candidate",
        "Please select a submission."
      );
      return;
    }

    try {
      await castVote.mutateAsync({ entityType: ENTITY_TYPE, entityId: selectedId });
      setVotedForId(selectedId);
      Alert.alert(
        "Vote Submitted",
        "Your vote has been recorded."
      );
    } catch (err) {
      Alert.alert("Vote Failed", getErrorMessage(err, "You may have already voted for this entry."));
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

          <Text style={styles.title}>
            Community Voting
          </Text>

          <View style={{ width: 22 }} />
        </View>

        {/* Participants */}

        {submissions.length === 0 && (
          <Text style={styles.emptyText}>
            No voting candidates yet. Check back when a contest is running.
          </Text>
        )}

        {submissions.map(item => {
          const selected =
            selectedId === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.participantCard,
                selected &&
                  styles.selectedCard
              ]}
              onPress={() =>
                setSelectedId(item.id)
              }
            >
              <Image
                source={{
                  uri: item.image
                }}
                style={styles.avatar}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {item.name}
                </Text>

                <Text style={styles.role}>
                  {item.role}
                </Text>
              </View>

              {votedForId === item.id && (
                <View
                  style={styles.voteInfo}
                >
                  {resultsLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <>
                      <Text
                        style={styles.voteCount}
                      >
                        {results?.votes ?? "—"}
                      </Text>

                      <Text
                        style={styles.voteLabel}
                      >
                        Rank #{results?.rank ?? "—"}
                      </Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {submissions.length > 0 && (
          <TouchableOpacity
            style={styles.voteButton}
            onPress={submitVote}
            disabled={castVote.isPending}
          >
            <Text style={styles.voteText}>
              {castVote.isPending ? "Submitting..." : "Submit Vote"}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text
  },

  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 15
  },

  selectedCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginRight: 12
  },

  name: {
    fontWeight: "700",
    color: theme.colors.text
  },

  role: {
    color: theme.colors.textMuted
  },

  voteInfo: {
    alignItems: "center",
    minWidth: 60
  },

  voteCount: {
    fontWeight: "700",
    color: theme.colors.text
  },

  voteLabel: {
    fontSize: 12,
    color: theme.colors.textMuted
  },

  voteButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    marginTop: 25,
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },

  voteText: {
    color: "#FFF",
    fontWeight: "700"
  },

  emptyText: {
    textAlign: "center",
    color: theme.colors.textMuted,
    marginTop: 30,
    marginHorizontal: 20
  }
});

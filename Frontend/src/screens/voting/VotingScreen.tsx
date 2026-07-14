import {
  Feather
} from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { getErrorMessage } from "../../api/getErrorMessage";
import { useCastVote } from "../../hooks/voting/useCastVote";
import { useVoteResults } from "../../hooks/voting/useVoteResults";

interface Props {
  navigation: any;
}

const ENTITY_TYPE = "PERFORMANCE";

// No backend endpoint lists voting candidates — voting-service only tracks votes per arbitrary entityId.
// These entityIds are stand-ins for real performance IDs; casting and results are wired to live endpoints.
const submissions = [
  {
    id: "PER3001",
    name: "Priya Singer",
    role: "Singer",
    image:
      "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: "PER3002",
    name: "Arun Vocalist",
    role: "Singer",
    image:
      "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: "PER3003",
    name: "Meera Voice",
    role: "Singer",
    image:
      "https://randomuser.me/api/portraits/women/65.jpg"
  }
];

export default function VotingScreen({
  navigation
}: Props) {
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
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Community Voting
          </Text>

          <View style={{ width: 22 }} />
        </View>

        {/* Tune Card */}

        <View style={styles.tuneCard}>
          <Text style={styles.tuneTitle}>
            Love Melody
          </Text>

          <Text style={styles.tuneMeta}>
            Select the best performance
          </Text>
        </View>

        {/* Participants */}

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
                    <ActivityIndicator size="small" color={PRIMARY} />
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

        <TouchableOpacity
          style={styles.voteButton}
          onPress={submitVote}
          disabled={castVote.isPending}
        >
          <Text style={styles.voteText}>
            {castVote.isPending ? "Submitting..." : "Submit Vote"}
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

  title: {
    fontSize: 20,
    fontWeight: "700"
  },

  tuneCard: {
    marginHorizontal: 20,
    backgroundColor: "#F5F3FF",
    padding: 18,
    borderRadius: 12
  },

  tuneTitle: {
    fontSize: 18,
    fontWeight: "700"
  },

  tuneMeta: {
    marginTop: 5,
    color: "#666"
  },

  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    padding: 15
  },

  selectedCard: {
    borderColor: PRIMARY,
    borderWidth: 2
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginRight: 12
  },

  name: {
    fontWeight: "700"
  },

  role: {
    color: "#666"
  },

  voteInfo: {
    alignItems: "center",
    minWidth: 60
  },

  voteCount: {
    fontWeight: "700"
  },

  voteLabel: {
    fontSize: 12,
    color: "#666"
  },

  voteButton: {
    backgroundColor: PRIMARY,
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
  }
});

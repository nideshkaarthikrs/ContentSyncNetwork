import {
  Feather
} from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  navigation: any;
}

const submissions = [
  {
    id: "1",
    name: "Priya Singer",
    role: "Singer",
    votes: 1245,
    image:
      "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: "2",
    name: "Arun Vocalist",
    role: "Singer",
    votes: 1088,
    image:
      "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: "3",
    name: "Meera Voice",
    role: "Singer",
    votes: 945,
    image:
      "https://randomuser.me/api/portraits/women/65.jpg"
  }
];

export default function VotingScreen({
  navigation
}: Props) {
  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const submitVote = () => {
    if (!selectedId) {
      Alert.alert(
        "Select Candidate",
        "Please select a submission."
      );
      return;
    }

    Alert.alert(
      "Vote Submitted",
      "Your vote has been recorded."
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

              <View
                style={styles.voteInfo}
              >
                <Text
                  style={styles.voteCount}
                >
                  {item.votes}
                </Text>

                <Text
                  style={styles.voteLabel}
                >
                  Votes
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Voting Status */}

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>
            Voting Ends In
          </Text>

          <Text style={styles.timer}>
            03 Days 12 Hours
          </Text>
        </View>

        <TouchableOpacity
          style={styles.voteButton}
          onPress={submitVote}
        >
          <Text style={styles.voteText}>
            Submit Vote
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
    alignItems: "center"
  },

  voteCount: {
    fontWeight: "700"
  },

  voteLabel: {
    fontSize: 12,
    color: "#666"
  },

  statsCard: {
    margin: 20,
    alignItems: "center"
  },

  statsTitle: {
    color: "#666"
  },

  timer: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8
  },

  voteButton: {
    backgroundColor: PRIMARY,
    marginHorizontal: 20,
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
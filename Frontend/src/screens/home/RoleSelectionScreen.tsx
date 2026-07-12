import {
  Feather,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  navigation: any;
}

const roles = [
  {
    id: "1",
    title: "Composer",
    icon: "music-note"
  },
  {
    id: "2",
    title: "Lyric Writer",
    icon: "lead-pencil"
  },
  {
    id: "3",
    title: "Singer",
    icon: "microphone"
  },
  {
    id: "4",
    title: "Director",
    icon: "video-outline"
  },
  {
    id: "5",
    title: "Producer",
    icon: "movie-open-outline"
  },
  {
    id: "6",
    title: "Audience",
    icon: "account-group-outline"
  }
];

export default function RoleSelectionScreen({
  navigation
}: Props) {
  const [selectedRoles, setSelectedRoles] = useState<
    string[]
  >([]);

  const toggleRole = (id: string) => {
    if (selectedRoles.includes(id)) {
      setSelectedRoles(
        selectedRoles.filter(item => item !== id)
      );
    } else {
      setSelectedRoles([...selectedRoles, id]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <Text style={styles.title}>
        Select Your Roles
      </Text>

      <Text style={styles.subtitle}>
        Choose all that apply
      </Text>

      <FlatList
        data={roles}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          marginTop: 30
        }}
        renderItem={({ item }) => {
          const selected =
            selectedRoles.includes(item.id);

          return (
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => toggleRole(item.id)}
            >
              <View style={styles.roleLeft}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={24}
                  color="#7C3AED"
                />

                <Text style={styles.roleName}>
                  {item.title}
                </Text>
              </View>

              <View
                style={[
                  styles.checkbox,
                  selected &&
                    styles.checkboxSelected
                ]}
              >
                {selected && (
                  <Feather
                    name="check"
                    size={14}
                    color="#fff"
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() =>
          navigation.replace("Main")
        }
      >
        <Text style={styles.continueText}>
          Continue
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const PRIMARY = "#7C3AED";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    marginTop: 36,
    marginBottom: 50
  },

  backBtn: {
    marginTop: 15
  },

  title: {
    marginTop: 25,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center"
  },

  subtitle: {
    textAlign: "center",
    color: "#777",
    marginTop: 8
  },

  roleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18
  },

  roleLeft: {
    flexDirection: "row",
    alignItems: "center"
  },

  roleName: {
    marginLeft: 15,
    fontSize: 16,
    color: "#111"
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center"
  },

  checkboxSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY
  },

  continueButton: {
    backgroundColor: PRIMARY,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25
  },

  continueText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  }
});
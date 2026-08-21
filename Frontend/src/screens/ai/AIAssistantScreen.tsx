import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  navigation: any;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export default function AIAssistantScreen({
  navigation
}: Props) {
  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([
      {
        id: "1",
        sender: "ai",
        text:
          "Hello! I'm CSN AI Assistant. How can I help with your music project today?"
      }
    ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: message
    };

    const aiMsg: Message = {
      id: `${Date.now()}ai`,
      sender: "ai",
      text:
        "I can help with lyrics, composition, singing suggestions, storyboard ideas and project collaboration."
    };

    setMessages(prev => [
      ...prev,
      userMsg,
      aiMsg
    ]);

    setMessage("");
  };

  const renderItem = ({
    item
  }: {
    item: Message;
  }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "user"
          ? styles.userBubble
          : styles.aiBubble
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "user" && {
            color: "#FFF"
          }
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
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

          <View
            style={styles.headerCenter}
          >
            <MaterialCommunityIcons
              name="robot-outline"
              size={22}
              color="#7C3AED"
            />

            <Text style={styles.headerTitle}>
              AI Assistant
            </Text>
          </View>

          <View style={{ width: 22 }} />
        </View>

        {/* Chat */}

        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: 15
          }}
        />

        {/* Input */}

        <View style={styles.inputRow}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ask AI anything..."
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
          >
            <Feather
              name="send"
              size={18}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickChip}
          >
            <Text>
              Generate Lyrics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickChip}
          >
            <Text>
              Tune Analysis
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickChip}
          >
            <Text>
              Storyboard
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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

  headerCenter: {
    flexDirection: "row",
    alignItems: "center"
  },

  headerTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "700"
  },

  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10
  },

  aiBubble: {
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start"
  },

  userBubble: {
    backgroundColor: PRIMARY,
    alignSelf: "flex-end"
  },

  messageText: {
    color: "#111"
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 10
  },

  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 25,
    paddingHorizontal: 15
  },

  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10
  },

  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    paddingBottom: 15
  },

  quickChip: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8
  }
});
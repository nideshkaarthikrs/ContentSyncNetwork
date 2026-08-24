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
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getErrorMessage } from "../../api/getErrorMessage";
import { useAssistantChat } from "../../hooks/ai/useAssistantChat";
import { RootStackParamList } from "../../navigation/types";
import { useToastStore } from "../../store/toastStore";

type Props = NativeStackScreenProps<RootStackParamList, "AIAssistant">;

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  source?: "gemini" | "sample";
}

// Recent-conversation window sent as `history` — enough context for the assistant
// without over-engineering truncation.
const HISTORY_WINDOW = 10;

const QUICK_PROMPTS: { label: string; prompt: string }[] = [
  { label: "Generate Lyrics", prompt: "Help me write lyrics for a song about " },
  { label: "Tune Analysis", prompt: "What genre, bpm, and mood would suit a tune that " },
  { label: "Storyboard", prompt: "Suggest a video storyboard for a song about " }
];

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

  const chat = useAssistantChat();
  const showToast = useToastStore(s => s.show);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed || chat.isPending) return;

    const history = messages.slice(-HISTORY_WINDOW).map(m => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text
    }));

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: trimmed
    };

    setMessages(prev => [...prev, userMsg]);
    setMessage("");

    chat.mutate(
      { message: trimmed, history },
      {
        onSuccess: res => {
          setMessages(prev => [
            ...prev,
            {
              id: `${Date.now()}ai`,
              sender: "ai",
              text: res.reply,
              source: res.source
            }
          ]);
        },
        onError: err => {
          showToast(getErrorMessage(err));
        }
      }
    );
  };

  const fillPrompt = (prompt: string) => {
    setMessage(prompt);
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

      {item.source === "sample" && (
        <Text style={styles.sampleLabel}>Sample reply (AI not available)</Text>
      )}
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
          ListFooterComponent={
            chat.isPending ? (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <Text style={styles.messageText}>...</Text>
              </View>
            ) : null
          }
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
            disabled={chat.isPending}
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
          {QUICK_PROMPTS.map(chip => (
            <TouchableOpacity
              key={chip.label}
              style={styles.quickChip}
              onPress={() => fillPrompt(chip.prompt)}
            >
              <Text>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
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

  sampleLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic"
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
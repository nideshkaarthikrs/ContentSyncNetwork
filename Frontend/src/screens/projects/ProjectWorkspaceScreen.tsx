import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { errorCodes, isErrorWithCode, pick } from "@react-native-documents/picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getErrorMessage } from "../../api/getErrorMessage";
import { Role } from "../../api/services/auth.api";
import { ProjectFile } from "../../api/services/project.api";
import { resolveAssetUrl } from "../../config/services";
import { useChatSocket } from "../../hooks/chat/useChatSocket";
import { useProjectMessages } from "../../hooks/chat/useProjectMessages";
import { useSendMessage } from "../../hooks/chat/useSendMessage";
import { useCreateProject } from "../../hooks/project/useCreateProject";
import { useInviteCollaborator } from "../../hooks/project/useInviteCollaborator";
import { useProjectFiles } from "../../hooks/project/useProjectFiles";
import { useProjectMembers } from "../../hooks/project/useProjectMembers";
import { useRespondToInvite } from "../../hooks/project/useRespondToInvite";
import { useUploadProjectFile } from "../../hooks/project/useUploadProjectFile";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { preflightUpload } from "../../utils/uploadPreflight";

type Props = NativeStackScreenProps<RootStackParamList, "ProjectWorkspace">;

const INVITABLE_ROLES: Role[] = ["COMPOSER", "LYRICIST", "SINGER", "DIRECTOR"];

export default function ProjectWorkspaceScreen({
  navigation,
  route
}: Props) {
  const [projectId, setProjectId] = useState<string | undefined>(route?.params?.projectId);
  const [projectName, setProjectName] = useState(route?.params?.projectName ?? "");
  const [activeTab, setActiveTab] =
    useState("Overview");

  if (!projectId) {
    return (
      <CreateProjectForm
        projectName={projectName}
        setProjectName={setProjectName}
        onCreated={setProjectId}
        onBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <ProjectWorkspaceContent
      projectId={projectId}
      projectName={projectName}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      navigation={navigation}
    />
  );
}

function CreateProjectForm({
  projectName,
  setProjectName,
  onCreated,
  onBack
}: {
  projectName: string;
  setProjectName: (v: string) => void;
  onCreated: (projectId: string) => void;
  onBack: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const createProject = useCreateProject();

  const handleCreate = async () => {
    if (!projectName.trim()) {
      setError("Please enter a project name.");
      return;
    }
    setError(null);
    try {
      const created = await createProject.mutateAsync(projectName);
      onCreated(created.projectId);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create project."));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>New Project</Text>

        <View style={{ width: 22 }} />
      </View>

      <View style={{ padding: 20 }}>
        <Text style={styles.label}>Project Name</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Love Melody Project"
          value={projectName}
          onChangeText={setProjectName}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCreate}
          disabled={createProject.isPending}
        >
          <Text style={styles.actionText}>
            {createProject.isPending ? "Creating..." : "Create Project"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ProjectWorkspaceContent({
  projectId,
  projectName,
  activeTab,
  setActiveTab,
  navigation
}: {
  projectId: string;
  projectName: string;
  activeTab: string;
  setActiveTab: (v: string) => void;
  navigation: Props["navigation"];
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Feather
            name="arrow-left"
            size={22}
            color="#FFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {projectName || projectId}
        </Text>

        <View style={{ width: 22 }} />
      </View>

      {/* Tabs */}

      <View style={styles.tabContainer}>
        {[
          "Overview",
          "Files",
          "Chat"
        ].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() =>
              setActiveTab(tab)
            }
            style={[
              styles.tabButton,
              activeTab === tab &&
                styles.activeTab
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab &&
                  styles.activeTabText
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "Overview" && <OverviewTab projectId={projectId} />}
      {activeTab === "Files" && <FilesTab projectId={projectId} />}
      {activeTab === "Chat" && <ChatTab projectId={projectId} />}
    </SafeAreaView>
  );
}

function OverviewTab({ projectId }: { projectId: string }) {
  const { data, isLoading } = useProjectMembers(projectId);
  const inviteCollaborator = useInviteCollaborator(projectId);
  const respondToInvite = useRespondToInvite(projectId);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("SINGER");
  const currentUserId = useAuthStore((state) => state.user?.userId);

  const handleInvite = async () => {
    if (!inviteUserId.trim()) {
      Alert.alert("Enter a user ID", "e.g. USR000002");
      return;
    }
    try {
      await inviteCollaborator.mutateAsync({ userId: inviteUserId.trim(), role: inviteRole });
      setInviteUserId("");
      Alert.alert("Invited", `${inviteUserId} has been invited.`);
    } catch (err) {
      Alert.alert("Invite Failed", getErrorMessage(err));
    }
  };

  const handleRespond = async (status: "ACCEPTED" | "DECLINED") => {
    try {
      await respondToInvite.mutateAsync(status);
    } catch (err) {
      Alert.alert("Failed", getErrorMessage(err));
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>
        Team Members
      </Text>

      {isLoading && <ActivityIndicator style={{ marginLeft: 20 }} color={PRIMARY} />}

      {!isLoading && (data?.members.length ?? 0) === 0 && (
        <Text style={styles.emptyText}>No collaborators yet. Invite one below.</Text>
      )}

      {data?.members.map(member => (
        <View
          key={member.userId}
          style={styles.memberCard}
        >
          <View
            style={styles.avatarCircle}
          >
            <Text
              style={styles.avatarText}
            >
              {member.userId.slice(-2)}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.memberName}>
              {member.userId}
            </Text>

            <Text style={styles.memberRole}>
              {member.role} • {member.inviteStatus}
            </Text>
          </View>

          {member.userId === currentUserId && member.inviteStatus === "PENDING" && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={styles.inviteRespondButton}
                onPress={() => handleRespond("ACCEPTED")}
                disabled={respondToInvite.isPending}
              >
                <Text style={styles.inviteRespondButtonText}>
                  {respondToInvite.isPending ? "..." : "Accept"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inviteRespondButton, styles.inviteDeclineButton]}
                onPress={() => handleRespond("DECLINED")}
                disabled={respondToInvite.isPending}
              >
                <Text style={[styles.inviteRespondButtonText, styles.inviteDeclineButtonText]}>
                  {respondToInvite.isPending ? "..." : "Decline"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}

      <Text style={styles.sectionTitle}>
        Invite Collaborator
      </Text>

      <View style={styles.inviteRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 10 }]}
          placeholder="User ID (e.g. USR000002)"
          value={inviteUserId}
          onChangeText={setInviteUserId}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.inviteRow}>
        {INVITABLE_ROLES.map(role => (
          <TouchableOpacity
            key={role}
            style={[styles.roleChip, inviteRole === role && styles.roleChipActive]}
            onPress={() => setInviteRole(role)}
          >
            <Text style={[styles.roleChipText, inviteRole === role && styles.roleChipTextActive]}>
              {role}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleInvite}
        disabled={inviteCollaborator.isPending}
      >
        <Text style={styles.actionText}>
          {inviteCollaborator.isPending ? "Inviting..." : "Send Invite"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function FilesTab({ projectId }: { projectId: string }) {
  const { data, isLoading } = useProjectFiles(projectId);
  const uploadFile = useUploadProjectFile(projectId);
  const files = data?.files ?? [];

  const handleUpload = async () => {
    let asset;
    try {
      [asset] = await pick();
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert("Upload Failed", getErrorMessage(err));
      return;
    }

    const name = asset.name ?? "file";
    const preflight = preflightUpload("project", {
      name,
      type: asset.type ?? "application/octet-stream",
      size: asset.size,
    });
    if (!preflight.ok) {
      Alert.alert("Upload Failed", preflight.error ?? "Selected file is invalid.");
      return;
    }

    try {
      await uploadFile.mutateAsync({
        uri: asset.uri,
        name,
        type: preflight.file.type,
      });
    } catch (err) {
      Alert.alert("Upload Failed", getErrorMessage(err));
    }
  };

  const openFile = async (file: ProjectFile) => {
    try {
      await Linking.openURL(resolveAssetUrl("project", file.fileUrl));
    } catch {
      Alert.alert("Couldn't open file", "No app on this device can open this file type.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={uploadFile.isPending}>
        {uploadFile.isPending ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <>
            <Feather name="upload" size={16} color="#FFF" />
            <Text style={styles.uploadButtonText}>Upload File</Text>
          </>
        )}
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator color={PRIMARY} style={{ marginTop: 30 }} />
      ) : files.length === 0 ? (
        <View style={{ alignItems: "center", padding: 40 }}>
          <MaterialCommunityIcons name="folder-open-outline" size={40} color="#CCC" />
          <Text style={styles.emptyText}>No files shared yet.</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.fileId}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.fileRow} onPress={() => openFile(item)}>
              <Feather name="file-text" size={20} color={PRIMARY} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.fileName}>{item.filename}</Text>
                <Text style={styles.fileMeta}>
                  {item.uploadedBy} · {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function ChatTab({ projectId }: { projectId: string }) {
  const { data, isLoading } = useProjectMessages(projectId);
  const sendMessage = useSendMessage(projectId);
  useChatSocket(projectId);
  const [text, setText] = useState("");
  const currentUserId = useAuthStore((state) => state.user?.userId);

  const handleSend = async () => {
    if (!text.trim()) return;
    const toSend = text;
    setText("");
    try {
      await sendMessage.mutateAsync(toSend);
    } catch (err) {
      Alert.alert("Message Failed", getErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} color={PRIMARY} />}

      <FlatList
        data={data?.messages ?? []}
        keyExtractor={(item) => item.messageId}
        contentContainerStyle={{ padding: 20 }}
        inverted
        // `inverted` flips the whole list content (including ListEmptyComponent),
        // so counter-flip the empty-state text to keep it upright.
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { transform: [{ scaleY: -1 }] }]}>No messages yet. Say hi!</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.senderUserId === currentUserId ? styles.messageMine : styles.messageTheirs
            ]}
          >
            <Text style={styles.messageSender}>{item.senderName}</Text>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}
      />

      <View style={styles.messageInputRow}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
        />

        <TouchableOpacity onPress={handleSend} disabled={sendMessage.isPending}>
          <Ionicons name="send" size={24} color={PRIMARY} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    backgroundColor: PRIMARY,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700"
  },

  label: {
    fontWeight: "600",
    marginBottom: 8
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 15
  },

  errorText: {
    color: "#DC2626",
    marginTop: 10
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around"
  },

  tabButton: {
    paddingVertical: 10
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY
  },

  tabText: {
    color: "#666"
  },

  activeTabText: {
    color: PRIMARY,
    fontWeight: "700"
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
    fontWeight: "700",
    fontSize: 18
  },

  emptyText: {
    color: "#888",
    marginHorizontal: 20,
    textAlign: "center",
    marginTop: 10
  },

  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    marginHorizontal: 20,
    marginTop: 15,
    height: 46,
    borderRadius: 10,
    gap: 8
  },

  uploadButtonText: {
    color: "#FFF",
    fontWeight: "600"
  },

  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },

  fileName: {
    fontWeight: "600",
    color: "#111"
  },

  fileMeta: {
    color: "#999",
    fontSize: 12,
    marginTop: 2
  },

  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15
  },

  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },

  avatarText: {
    fontWeight: "700",
    color: PRIMARY
  },

  memberName: {
    fontWeight: "700"
  },

  memberRole: {
    color: "#666"
  },

  inviteRespondButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },

  inviteDeclineButton: {
    backgroundColor: "#FEE2E2"
  },

  inviteRespondButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12
  },

  inviteDeclineButtonText: {
    color: "#DC2626"
  },

  inviteRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 10,
    gap: 8
  },

  roleChip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8
  },

  roleChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY
  },

  roleChipText: {
    color: "#666",
    fontSize: 12
  },

  roleChipTextActive: {
    color: "#FFF"
  },

  actionButton: {
    backgroundColor: PRIMARY,
    height: 52,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },

  actionText: {
    color: "#FFF",
    fontWeight: "700"
  },

  messageBubble: {
    maxWidth: "80%",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  },

  messageMine: {
    alignSelf: "flex-end",
    backgroundColor: "#F3E8FF"
  },

  messageTheirs: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6"
  },

  messageSender: {
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 2
  },

  messageText: {
    color: "#111"
  },

  messageInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    gap: 12
  },

  messageInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 22,
    paddingHorizontal: 16
  }
});

import { Feather } from "@expo/vector-icons";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SelectListModalProps<T> {
  visible: boolean;
  title: string;
  items: T[];
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  onSelect: (item: T) => void;
  onClose: () => void;
  emptyText?: string;
}

export default function SelectListModal<T>({
  visible,
  title,
  items,
  keyExtractor,
  labelExtractor,
  onSelect,
  onClose,
  emptyText = "Nothing here yet."
}: SelectListModalProps<T>) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>

          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={22} color="#111" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => onSelect(item)}>
              <Text style={styles.rowText}>{labelExtractor(item)}</Text>
              <Feather name="chevron-right" size={18} color="#888" />
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },
  title: {
    fontSize: 18,
    fontWeight: "700"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  rowText: {
    fontSize: 15,
    color: "#111",
    flex: 1,
    marginRight: 10
  },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 40
  }
});

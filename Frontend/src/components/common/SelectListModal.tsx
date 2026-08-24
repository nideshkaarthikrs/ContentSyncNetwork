import Feather from "react-native-vector-icons/Feather";
import type { ReactNode } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

interface SelectListModalProps<T> {
  visible: boolean;
  title: string;
  items: T[];
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  onSelect: (item: T) => void;
  onClose: () => void;
  emptyText?: string;
  renderRight?: (item: T) => ReactNode;
}

export default function SelectListModal<T>({
  visible,
  title,
  items,
  keyExtractor,
  labelExtractor,
  onSelect,
  onClose,
  emptyText = "Nothing here yet.",
  renderRight
}: SelectListModalProps<T>) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>

          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={22} color={theme.colors.text} />
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
              {renderRight?.(item)}
              <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
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
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  rowText: {
    fontSize: 15,
    color: theme.colors.text,
    flex: 1,
    marginRight: 10
  },
  empty: {
    textAlign: "center",
    color: theme.colors.textMuted,
    marginTop: 40
  }
});

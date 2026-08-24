import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Theme } from '../../theme/theme';
import { useTheme } from '../../theme/useTheme';

export default function SectionCard({ children }: any) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  }
});
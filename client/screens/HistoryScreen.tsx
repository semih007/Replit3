import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Colors, Typography } from "@/constants/theme";

interface HistoryItem {
  id: string;
  midterm: string;
  final: string;
  average: number;
  status: string;
  statusColor: string;
  date: string;
  limit: string;
}

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem("grade_history");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Error loading history", error);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem("grade_history");
      setHistory([]);
    } catch (error) {
      console.error("Error clearing history", error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="list" size={48} color={colors.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Henüz kayıtlı işlem yok.
            </ThemedText>
          </View>
        ) : (
          history.map((item) => (
            <View 
              key={item.id} 
              style={[styles.historyCard, { backgroundColor: colors.backgroundDefault }]}
            >
              <View style={[styles.statusIndicator, { backgroundColor: item.statusColor }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <ThemedText style={styles.statusLabel}>{item.status}</ThemedText>
                  <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>
                    {item.date}
                  </ThemedText>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.gradeInfo}>
                    <ThemedText style={[styles.gradeLabel, { color: colors.textSecondary }]}>Vize: {item.midterm}</ThemedText>
                    <ThemedText style={[styles.gradeLabel, { color: colors.textSecondary }]}>Final: {item.final}</ThemedText>
                    <ThemedText style={[styles.gradeLabel, { color: colors.textSecondary }]}>Baraj: {item.limit || "30"}</ThemedText>
                  </View>
                  <View style={styles.averageInfo}>
                    <ThemedText style={styles.averageValue}>{item.average.toFixed(2)}</ThemedText>
                    <ThemedText style={[styles.averageLabel, { color: colors.textSecondary }]}>Ortalama</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {history.length > 0 && (
        <View style={styles.buttonContainer}>
          <Pressable 
            onPress={clearHistory}
            style={[styles.clearButton, { backgroundColor: colors.error }]}
          >
            <Feather name="trash-2" size={20} color="#FFFFFF" />
            <ThemedText style={styles.clearButtonText}>Geçmişi Temizle</ThemedText>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: 16,
  },
  historyCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusIndicator: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusLabel: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateText: {
    fontSize: 12,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeInfo: {
    gap: 4,
  },
  gradeLabel: {
    fontSize: 14,
  },
  averageInfo: {
    alignItems: 'center',
  },
  averageValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  averageLabel: {
    fontSize: 10,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: 8,
  },
  buttonContainer: {
    padding: Spacing.lg,
    paddingBottom: 20,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  }
});
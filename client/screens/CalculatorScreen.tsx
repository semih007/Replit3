import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeInDown,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import * as Haptics from "expo-haptics";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  History: undefined;
  Settings: undefined;
};

type GradeStatus = "pass" | "fail" | "conditional";

interface CalculationResult {
  average: number;
  status: GradeStatus;
  statusText: string;
  statusColor: string;
}

export default function CalculatorScreen() {
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [midtermGrade, setMidtermGrade] = useState("");
  const [finalGrade, setFinalGrade] = useState("");
  const [finalLimit, setFinalLimit] = useState("30");
  const [customLimit, setCustomLimit] = useState("");
  const [showCustomLimit, setShowCustomLimit] = useState(false);
  const [midtermError, setMidtermError] = useState("");
  const [finalError, setFinalError] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);

  const resultScale = useSharedValue(0.9);
  const resultOpacity = useSharedValue(0);

  useEffect(() => {
    const loadDefaultLimit = async () => {
      try {
        const savedLimit = await AsyncStorage.getItem("default_limit");
        if (savedLimit) {
          setFinalLimit(savedLimit);
        }
      } catch (e) {
        console.error("Failed to load default limit", e);
      }
    };
    loadDefaultLimit();
  }, []);

  const saveUserDefaultLimit = async (limit: string) => {
    try {
      if (limit && !isNaN(parseFloat(limit))) {
        await AsyncStorage.setItem("default_limit", limit);
        Alert.alert("Başarılı", "Varsayılan baraj notu güncellendi.");
      }
    } catch (e) {
      console.error("Failed to save default limit", e);
    }
  };

  const validateGrade = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < 0 || num > 100) return null;
    return num;
  };

  const calculateGrade = useCallback(() => {
    setMidtermError("");
    setFinalError("");

    const midterm = validateGrade(midtermGrade);
    const final = validateGrade(finalGrade);

    let limitValue = 30;
    if (showCustomLimit) {
      limitValue = parseFloat(customLimit) || 0;
    } else {
      limitValue = parseFloat(finalLimit) || 30;
    }

    let hasError = false;

    if (midterm === null) {
      setMidtermError("0-100 arası geçerli bir not girin");
      hasError = true;
    }

    if (final === null) {
      setFinalError("0-100 arası geçerli bir not girin");
      hasError = true;
    }

    if (
      showCustomLimit &&
      (isNaN(limitValue) || limitValue < 0 || limitValue > 100)
    ) {
      Alert.alert("Hata", "Lütfen geçerli bir baraj notu girin (0-100)");
      return;
    }

    if (hasError) {
      return;
    }

    const average = midterm! * 0.4 + final! * 0.6;

    let status: GradeStatus;
    let statusText: string;
    let statusColor: string;

    if (final! < limitValue) {
      status = "fail";
      statusText = "Kaldın (Final Barajı Altında)";
      statusColor = colors.error;
    } else if (average < 40) {
      status = "fail";
      statusText = "Kaldın (Ortalama Yetersiz)";
      statusColor = colors.error;
    } else if (average >= 40 && average < 50) {
      status = "conditional";
      statusText = "Şartlı Geçtin";
      statusColor = colors.warning;
    } else {
      status = "pass";
      statusText = "Geçtin";
      statusColor = colors.success;
    }

    const newResult: CalculationResult = {
      average: Math.round(average * 100) / 100,
      status,
      statusText,
      statusColor,
    };

    setResult(newResult);

    const saveToHistory = async () => {
      try {
        const historyData = await AsyncStorage.getItem("grade_history");
        let history = historyData ? JSON.parse(historyData) : [];

        const newItem = {
          id: Date.now().toString(),
          midterm: midtermGrade,
          final: finalGrade,
          limit: showCustomLimit ? customLimit : finalLimit,
          average: newResult.average,
          status: statusText,
          statusColor: statusColor,
          date: new Date().toLocaleString("tr-TR"),
        };

        history = [newItem, ...history].slice(0, 20);
        await AsyncStorage.setItem("grade_history", JSON.stringify(history));
      } catch (e) {
        console.error("Failed to save history", e);
      }
    };

    saveToHistory();

    resultScale.value = withSequence(
      withSpring(1.05, { damping: 10, stiffness: 100 }),
      withSpring(1, { damping: 15, stiffness: 100 })
    );
    resultOpacity.value = withSpring(1);
  }, [
    midtermGrade,
    finalGrade,
    finalLimit,
    customLimit,
    showCustomLimit,
    colors,
  ]);

  const animatedResultStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
    opacity: resultOpacity.value,
  }));

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.inputBorder }]}>
        <ThemedText style={styles.headerTitle}>Not Hesaplama</ThemedText>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate("History")}
            style={styles.headerIcon}
          >
            <Ionicons name="list-outline" size={26} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={styles.headerIcon}
          >
            <Ionicons
              name="information-circle-outline"
              size={26}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(400)}>
            <ThemedText style={styles.label}>Vize Notu</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundDefault,
                  borderColor: midtermError ? colors.error : colors.inputBorder,
                  color: colors.text,
                },
              ]}
              value={midtermGrade}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '');
                if (numericValue === '' || Number(numericValue) <= 100) {
                  setMidtermGrade(numericValue);
                  setMidtermError("");
                }
              }}
              placeholder="0-100 arasi bir deger girin"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={3}
              testID="input-midterm"
            />
            {midtermError ? (
              <ThemedText style={styles.errorText}>{midtermError}</ThemedText>
            ) : null}

            <ThemedText style={[styles.label, { marginTop: 16 }]}>
              Final Notu
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundDefault,
                  borderColor: finalError ? colors.error : colors.inputBorder,
                  color: colors.text,
                },
              ]}
              value={finalGrade}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '');
                if (numericValue === '' || Number(numericValue) <= 100) {
                  setFinalGrade(numericValue);
                  setFinalError("");
                }
              }}
              placeholder="0-100 arasi bir deger girin"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={3}
              testID="input-final"
            />
            {finalError ? (
              <ThemedText style={styles.errorText}>{finalError}</ThemedText>
            ) : null}

            <ThemedText style={[styles.label, { marginTop: 16 }]}>
              Final Baraj Notu (Kalma Siniri)
            </ThemedText>
            <View style={styles.limitButtonsRow}>
              {["30", "35"].map((limit) => (
                <TouchableOpacity
                  key={limit}
                  onPress={() => {
                    setFinalLimit(limit);
                    setShowCustomLimit(false);
                  }}
                  style={[
                    styles.limitButton,
                    { borderColor: colors.inputBorder },
                    finalLimit === limit &&
                      !showCustomLimit && {
                        backgroundColor: colors.tint + "20",
                        borderColor: colors.tint,
                      },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.limitButtonText,
                      finalLimit === limit &&
                        !showCustomLimit && {
                          color: colors.tint,
                          fontWeight: "bold",
                        },
                    ]}
                  >
                    {limit}
                  </ThemedText>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setShowCustomLimit(true)}
                style={[
                  styles.limitButton,
                  { borderColor: colors.inputBorder },
                  showCustomLimit && {
                    backgroundColor: colors.tint,
                    borderColor: colors.tint,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.limitButtonText,
                    showCustomLimit && { color: "#fff", fontWeight: "bold" },
                  ]}
                >
                  Diger
                </ThemedText>
              </TouchableOpacity>
            </View>

            {showCustomLimit && (
              <View style={{ marginTop: 12 }}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundDefault,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                  value={customLimit}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    if (numericValue === '' || Number(numericValue) <= 100) {
                      setCustomLimit(numericValue);
                    }
                  }}
                  placeholder="Baraj notunu girin (örn: 40)"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Pressable
                  onPress={() => saveUserDefaultLimit(customLimit)}
                  style={{ marginTop: 8, alignSelf: "flex-end" }}
                >
                  <ThemedText style={{ color: colors.link, fontSize: 12 }}>
                    Bu barajı varsayılan yap
                  </ThemedText>
                </Pressable>
              </View>
            )}

            <TouchableOpacity
              onPress={calculateGrade}
              style={[styles.calculateButton, { backgroundColor: colors.tint }]}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={24} color="#fff" />
              <ThemedText style={styles.calculateButtonText}>
                Hesapla
              </ThemedText>
            </TouchableOpacity>

            {result && (
              <Animated.View
                style={[
                  styles.resultCard,
                  animatedResultStyle,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <ThemedText style={styles.resultAverage}>
                  {result.average}
                </ThemedText>
                <ThemedText
                  style={[styles.resultStatus, { color: result.statusColor }]}
                >
                  {result.statusText}
                </ThemedText>

                <View style={styles.resultDetails}>
                  <View style={styles.detailItem}>
                    <ThemedText style={styles.detailLabel}>Vize (%40)</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {midtermGrade}
                    </ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <ThemedText style={styles.detailLabel}>Final (%60)</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {finalGrade}
                    </ThemedText>
                  </View>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: Platform.OS === "ios" ? 40 : 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerIcon: {
    marginLeft: 15,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 55,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  limitButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  limitButton: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  limitButtonText: {
    fontSize: 14,
  },
  calculateButton: {
    height: 55,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  calculateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  resultCard: {
    marginTop: 24,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
  },
  resultAverage: {
    fontSize: 48,
    fontWeight: "bold",
  },
  resultStatus: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  resultDetails: {
    flexDirection: "row",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    width: "100%",
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
});


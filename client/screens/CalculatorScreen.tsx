import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { HeaderButton } from "@react-navigation/elements";

type GradeStatus = "pass" | "conditional" | "fail" | null;

interface CalculationResult {
  average: number;
  status: GradeStatus;
  statusText: string;
  statusColor: string;
}

export default function CalculatorScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [midtermGrade, setMidtermGrade] = useState("");
  const [finalGrade, setFinalGrade] = useState("");
  const [finalLimit, setFinalLimit] = useState("30");
  const [customLimit, setCustomLimit] = useState("");
  const [showCustomLimit, setShowCustomLimit] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [midtermError, setMidtermError] = useState("");
  const [finalError, setFinalError] = useState("");

  const buttonScale = useSharedValue(1);
  const resultScale = useSharedValue(1);

  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    const loadUserDefaultLimit = async () => {
      try {
        const savedLimit = await AsyncStorage.getItem("user_default_limit");
        if (savedLimit) {
          setFinalLimit(savedLimit);
          if (savedLimit !== "30" && savedLimit !== "35") {
            setCustomLimit(savedLimit);
            setShowCustomLimit(true);
          }
        }
      } catch (e) {
        console.error("Error loading default limit", e);
      }
    };
    loadUserDefaultLimit();
  }, []);

  const saveUserDefaultLimit = async (limit: string) => {
    if (!limit || limit.trim() === "") return;
    try {
      await AsyncStorage.setItem("user_default_limit", limit);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error("Error saving default limit", e);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <Pressable 
            onPress={() => {
              navigation.navigate("History");
            }}
            hitSlop={25}
            style={({ pressed }) => [
              styles.headerButton,
              { opacity: pressed ? 0.5 : 1 }
            ]}
          >
            <Feather name="list" size={28} color={theme.text} />
          </Pressable>
          <Pressable 
            onPress={() => {
              navigation.navigate("About");
            }}
            hitSlop={25}
            style={({ pressed }) => [
              styles.headerButton,
              { opacity: pressed ? 0.5 : 1 }
            ]}
          >
            <Feather name="info" size={28} color={theme.text} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, theme.text]);

  const validateGrade = (value: string): number | null => {
    if (value === "") return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 100) return null;
    return num;
  };

  const calculateGrade = useCallback(() => {
    setMidtermError("");
    setFinalError("");

    const midterm = validateGrade(midtermGrade);
    const final = validateGrade(finalGrade);
    
    // Baraj notunu o anki state'den al
    let limitValue = 30;
    if (showCustomLimit) {
      limitValue = parseFloat(customLimit) || 0;
    } else {
      limitValue = parseFloat(finalLimit) || 30;
    }

    let hasError = false;

    if (midterm === null) {
      setMidtermError("Gecerli bir vize notu girin (0-100)");
      hasError = true;
    }

    if (final === null) {
      setFinalError("Gecerli bir final notu girin (0-100)");
      hasError = true;
    }
    
    if (showCustomLimit && (isNaN(limitValue) || limitValue < 0 || limitValue > 100)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
    }

    if (hasError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const average = midterm! * 0.4 + final! * 0.6;

    let status: GradeStatus;
    let statusText: string;
    let statusColor: string;

    // Önce final barajını kontrol et
    if (final! < limitValue) {
      status = "fail";
      statusText = "Kaldin (Final Baraj)";
      statusColor = colors.error;
    } else if (average < 40) {
      status = "fail";
      statusText = "Kaldin (Ortalama)";
      statusColor = colors.error;
    } else if (average >= 40 && average < 50) {
      status = "conditional";
      statusText = "Sartli Gectin";
      statusColor = colors.warning;
    } else {
      status = "pass";
      statusText = "Gectin";
      statusColor = colors.success;
    }

    const newResult: CalculationResult = {
      average: Math.round(average * 100) / 100,
      status,
      statusText,
      statusColor,
    };

    setResult(newResult);

    // Geçmişe kaydet
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
          date: new Date().toLocaleString('tr-TR'),
        };
        history = [newItem, ...history].slice(0, 10); // Sadece son 10 işlem
        await AsyncStorage.setItem("grade_history", JSON.stringify(history));
      } catch (e) {
        console.error("Save error", e);
      }
    };
    saveToHistory();

    resultScale.value = withSequence(
      withSpring(1.05, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );

    if (status === "pass") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (status === "conditional") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [midtermGrade, finalGrade, finalLimit, customLimit, showCustomLimit, colors]);

  const clearForm = useCallback(() => {
    setMidtermGrade("");
    setFinalGrade("");
    setResult(null);
    setMidtermError("");
    setFinalError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15 });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const resultAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
  }));

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View style={styles.inputGroup}>
          <ThemedText
            style={[styles.label, { color: colors.textSecondary }]}
          >
            Vize Notu
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundDefault,
                borderColor: midtermError ? colors.error : colors.inputBorder,
                color: theme.text,
              },
            ]}
            value={midtermGrade}
            onChangeText={(text) => {
              setMidtermGrade(text);
              setMidtermError("");
            }}
            placeholder="0-100 arasi bir deger girin"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            testID="input-midterm"
          />
          {midtermError ? (
            <ThemedText style={[styles.errorText, { color: colors.error }]}>
              {midtermError}
            </ThemedText>
          ) : null}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={styles.inputGroup}>
          <ThemedText
            style={[styles.label, { color: colors.textSecondary }]}
          >
            Final Notu
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundDefault,
                borderColor: finalError ? colors.error : colors.inputBorder,
                color: theme.text,
              },
            ]}
            value={finalGrade}
            onChangeText={(text) => {
              setFinalGrade(text);
              setFinalError("");
            }}
            placeholder="0-100 arasi bir deger girin"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            testID="input-final"
          />
          {finalError ? (
            <ThemedText style={[styles.errorText, { color: colors.error }]}>
              {finalError}
            </ThemedText>
          ) : null}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).duration(400)}>
        <View style={styles.inputGroup}>
          <ThemedText
            style={[styles.label, { color: colors.textSecondary }]}
          >
            Final Baraj Notu (Kalma Siniri)
          </ThemedText>
          <View style={styles.limitSelector}>
            {["30", "35", "custom"].map((val) => (
              <Pressable
                key={val}
                onPress={() => {
                  if (val === "custom") {
                    setShowCustomLimit(true);
                  } else {
                    setFinalLimit(val);
                    setShowCustomLimit(false);
                    saveUserDefaultLimit(val);
                  }
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.limitButton,
                  { backgroundColor: colors.backgroundDefault, borderColor: colors.inputBorder },
                  ((!showCustomLimit && finalLimit === val) || (showCustomLimit && val === "custom")) && { backgroundColor: colors.link, borderColor: colors.link }
                ]}
              >
                <ThemedText style={[
                  styles.limitButtonText, 
                  { color: colors.textSecondary },
                  ((!showCustomLimit && finalLimit === val) || (showCustomLimit && val === "custom")) && { color: "#FFFFFF" }
                ]}>
                  {val === "custom" ? "Diger" : val}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          {showCustomLimit && (
            <View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundDefault,
                    borderColor: colors.inputBorder,
                    color: theme.text,
                    marginTop: Spacing.sm,
                  },
                ]}
                value={customLimit}
                onChangeText={setCustomLimit}
                placeholder="Baraj notunu girin (örn: 40)"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
              <Pressable 
                onPress={() => saveUserDefaultLimit(customLimit)}
                style={{ marginTop: 8, alignSelf: 'flex-end' }}
              >
                <ThemedText style={{ color: colors.link, fontSize: 12 }}>Bu barajı varsayılan yap</ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <AnimatedPressable
          onPress={calculateGrade}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.calculateButton,
            { backgroundColor: colors.link },
            buttonAnimatedStyle,
          ]}
          testID="button-calculate"
        >
          <Feather
            name="check-circle"
            size={20}
            color="#FFFFFF"
            style={styles.buttonIcon}
          />
          <ThemedText style={styles.calculateButtonText}>Hesapla</ThemedText>
        </AnimatedPressable>
      </Animated.View>

      {result ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[
            styles.resultCard,
            { backgroundColor: result.statusColor },
            resultAnimatedStyle,
          ]}
        >
          <ThemedText style={styles.statusText}>{result.statusText}</ThemedText>

          <View style={styles.averageContainer}>
            <ThemedText style={styles.averageLabel}>Ortalama</ThemedText>
            <ThemedText style={styles.averageValue}>
              {result.average.toFixed(2)}
            </ThemedText>
          </View>

          {result.status === "fail" && parseFloat(finalGrade) < (showCustomLimit ? (parseFloat(customLimit) || 0) : (parseFloat(finalLimit) || 0)) ? (
            <View style={styles.warningBox}>
              <Feather name="alert-triangle" size={16} color="#FFFFFF" />
              <ThemedText style={styles.warningText}>
                Final notu {showCustomLimit ? (customLimit || "0") : (finalLimit || "0")} barajinin altinda oldugu icin ortalamaniz {result.average.toFixed(2)} olsa dahi dersten kaldiniz.
              </ThemedText>
            </View>
          ) : null}

          <Pressable
            onPress={clearForm}
            style={({ pressed }) => [
              styles.clearButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            testID="button-clear"
          >
            <Feather name="refresh-ccw" size={18} color="#FFFFFF" />
            <ThemedText style={styles.clearButtonText}>
              Yeni Hesaplama
            </ThemedText>
          </Pressable>
        </Animated.View>
      ) : null}

      <Animated.View
        entering={FadeInDown.delay(500).duration(400)}
        style={styles.infoSection}
      >
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.backgroundDefault },
          ]}
        >
          <ThemedText style={[styles.infoTitle, { color: theme.text }]}>
            Hesaplama Formulu
          </ThemedText>
          <ThemedText
            style={[styles.infoText, { color: colors.textSecondary }]}
          >
            Ortalama = (Vize x 0.40) + (Final x 0.60)
          </ThemedText>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View
                style={[styles.statusDot, { backgroundColor: colors.success }]}
              />
              <ThemedText
                style={[styles.infoItemText, { color: colors.textSecondary }]}
              >
                50 ve uzeri: Gectin
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <View
                style={[styles.statusDot, { backgroundColor: colors.warning }]}
              />
              <ThemedText
                style={[styles.infoItemText, { color: colors.textSecondary }]}
              >
                40-49 arasi: Sartli Gectin
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <View
                style={[styles.statusDot, { backgroundColor: colors.error }]}
              />
              <ThemedText
                style={[styles.infoItemText, { color: colors.textSecondary }]}
              >
                40'in altinda veya Final 30'un altinda: Kaldin
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  headerButton: {
    padding: 12,
    marginLeft: 16,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.inputLabel,
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  errorText: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  calculateButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  calculateButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  resultCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing["2xl"],
    marginBottom: Spacing["2xl"],
  },
  courseNameResult: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  statusText: {
    ...Typography.resultStatus,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 44,
  },
  limitSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  limitButton: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  limitButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  averageContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  averageLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
  },
  averageValue: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 56, // Android'de sıkışmayı önlemek için eklendi
    textAlign: "center",
  },
  breakdownContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BorderRadius.xs,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  breakdownRow: {
    marginBottom: Spacing.xs,
  },
  breakdownText: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: BorderRadius.xs,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  warningText: {
    color: "#FFFFFF",
    fontSize: 13,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: BorderRadius.xs,
    paddingVertical: Spacing.md,
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: Spacing.sm,
  },
  infoSection: {
    marginTop: Spacing.lg,
  },
  infoCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  infoText: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  infoList: {
    gap: Spacing.sm,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  infoItemText: {
    fontSize: 13,
  },
});

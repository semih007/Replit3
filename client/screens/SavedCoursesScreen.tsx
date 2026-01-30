import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Typography } from "@/constants/theme";

interface SavedCourse {
  id: string;
  name: string;
  midterm: string;
  final: string;
  average: number | null;
  status: "pass" | "conditional" | "fail" | null;
}

const STORAGE_KEY = "saved_courses";

export default function SavedCoursesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const [courses, setCourses] = useState<SavedCourse[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<SavedCourse | null>(null);
  const [courseName, setCourseName] = useState("");
  const [midterm, setMidterm] = useState("");
  const [final, setFinal] = useState("");
  const [finalLimit, setFinalLimit] = useState(30);

  useFocusEffect(
    useCallback(() => {
      loadFinalLimit();
      loadCourses();
    }, [])
  );

  const loadFinalLimit = async () => {
    try {
      const savedLimit = await AsyncStorage.getItem("user_default_limit");
      if (savedLimit) {
        const limitValue = parseFloat(savedLimit);
        if (!isNaN(limitValue) && limitValue >= 0 && limitValue <= 100) {
          setFinalLimit(limitValue);
        }
      }
    } catch (e) {
      console.error("Error loading final limit", e);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setCourses(JSON.parse(data));
      }
    } catch (e) {
      console.error("Error loading courses", e);
    }
  };

  const saveCourses = async (newCourses: SavedCourse[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCourses));
      setCourses(newCourses);
    } catch (e) {
      console.error("Error saving courses", e);
    }
  };

  const calculateStatus = (midtermVal: number, finalVal: number, limit: number = finalLimit) => {
    const average = midtermVal * 0.4 + finalVal * 0.6;
    let status: "pass" | "conditional" | "fail";
    
    if (finalVal < limit) {
      status = "fail";
    } else if (average < 40) {
      status = "fail";
    } else if (average >= 40 && average < 50) {
      status = "conditional";
    } else {
      status = "pass";
    }
    
    return { average: Math.round(average * 100) / 100, status };
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setCourseName("");
    setMidterm("");
    setFinal("");
    setModalVisible(true);
  };

  const openEditModal = (course: SavedCourse) => {
    setEditingCourse(course);
    setCourseName(course.name);
    setMidterm(course.midterm);
    setFinal(course.final);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!courseName.trim()) {
      Alert.alert("Hata", "Ders adı giriniz");
      return;
    }

    let average: number | null = null;
    let status: "pass" | "conditional" | "fail" | null = null;

    const midtermVal = parseFloat(midterm);
    const finalVal = parseFloat(final);

    if (!isNaN(midtermVal) && !isNaN(finalVal) && 
        midtermVal >= 0 && midtermVal <= 100 && 
        finalVal >= 0 && finalVal <= 100) {
      const result = calculateStatus(midtermVal, finalVal);
      average = result.average;
      status = result.status;
    }

    if (editingCourse) {
      const updatedCourses = courses.map(c => 
        c.id === editingCourse.id 
          ? { ...c, name: courseName.trim(), midterm, final, average, status }
          : c
      );
      saveCourses(updatedCourses);
    } else {
      const newCourse: SavedCourse = {
        id: Date.now().toString(),
        name: courseName.trim(),
        midterm,
        final,
        average,
        status,
      };
      saveCourses([...courses, newCourse]);
    }

    setModalVisible(false);
  };

  const handleDelete = (courseId: string) => {
    Alert.alert(
      "Dersi Sil",
      "Bu dersi silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", 
          style: "destructive",
          onPress: () => {
            const filtered = courses.filter(c => c.id !== courseId);
            saveCourses(filtered);
          }
        }
      ]
    );
  };

  const getStatusColor = (status: "pass" | "conditional" | "fail" | null) => {
    switch (status) {
      case "pass": return colors.success;
      case "conditional": return colors.warning;
      case "fail": return colors.error;
      default: return colors.inputBorder;
    }
  };

  const getStatusText = (status: "pass" | "conditional" | "fail" | null) => {
    switch (status) {
      case "pass": return "Geçti";
      case "conditional": return "Şartlı";
      case "fail": return "Kaldı";
      default: return "Not Girilmedi";
    }
  };

  const getCourseStatus = (course: SavedCourse) => {
    const midtermVal = parseFloat(course.midterm);
    const finalVal = parseFloat(course.final);
    
    if (!isNaN(midtermVal) && !isNaN(finalVal) && 
        midtermVal >= 0 && midtermVal <= 100 && 
        finalVal >= 0 && finalVal <= 100) {
      return calculateStatus(midtermVal, finalVal, finalLimit);
    }
    return { average: null, status: null };
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["3xl"],
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {courses.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="book-open" size={48} color={colors.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Henüz kayıtlı ders yok
            </ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Aşağıdaki butona tıklayarak ders ekleyebilirsiniz
            </ThemedText>
          </View>
        ) : (
          courses.map((course, index) => {
            const courseStatus = getCourseStatus(course);
            return (
              <Animated.View 
                key={course.id}
                entering={FadeInDown.delay(index * 100).duration(300)}
              >
                <Pressable
                  onPress={() => openEditModal(course)}
                  style={[
                    styles.courseCard,
                    { 
                      backgroundColor: colors.backgroundDefault,
                      borderLeftColor: getStatusColor(courseStatus.status),
                      borderLeftWidth: 4,
                    }
                  ]}
                >
                  <View style={styles.courseHeader}>
                    <ThemedText style={[styles.courseName, { color: theme.text }]}>
                      {course.name}
                    </ThemedText>
                    <Pressable
                      onPress={() => handleDelete(course.id)}
                      hitSlop={15}
                      style={styles.deleteButton}
                    >
                      <Feather name="trash-2" size={18} color={colors.error} />
                    </Pressable>
                  </View>

                  <View style={styles.gradesRow}>
                    <View style={styles.gradeItem}>
                      <ThemedText style={[styles.gradeLabel, { color: colors.textSecondary }]}>
                        Vize
                      </ThemedText>
                      <ThemedText style={[styles.gradeValue, { color: theme.text }]}>
                        {course.midterm || "-"}
                      </ThemedText>
                    </View>
                    <View style={styles.gradeItem}>
                      <ThemedText style={[styles.gradeLabel, { color: colors.textSecondary }]}>
                        Final
                      </ThemedText>
                      <ThemedText style={[styles.gradeValue, { color: theme.text }]}>
                        {course.final || "-"}
                      </ThemedText>
                    </View>
                    <View style={styles.gradeItem}>
                      <ThemedText style={[styles.gradeLabel, { color: colors.textSecondary }]}>
                        Ortalama
                      </ThemedText>
                      <ThemedText style={[styles.gradeValue, { color: theme.text }]}>
                        {courseStatus.average !== null ? courseStatus.average.toFixed(2) : "-"}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(courseStatus.status) + "20" }]}>
                    <ThemedText style={[styles.statusText, { color: getStatusColor(courseStatus.status) }]}>
                      {getStatusText(courseStatus.status)}
                    </ThemedText>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      <Pressable
        onPress={openAddModal}
        style={[styles.addButton, { backgroundColor: colors.link }]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: theme.text }]}>
                {editingCourse ? "Ders Düzenle" : "Yeni Ders Ekle"}
              </ThemedText>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={15}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Ders Adı *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundDefault,
                    borderColor: colors.inputBorder,
                    color: theme.text,
                  },
                ]}
                value={courseName}
                onChangeText={setCourseName}
                placeholder="Örn: Matematik"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Vize Notu (Opsiyonel)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundDefault,
                    borderColor: colors.inputBorder,
                    color: theme.text,
                  },
                ]}
                value={midterm}
                onChangeText={setMidterm}
                placeholder="0-100"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Final/Bütünleme Notu (Opsiyonel)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundDefault,
                    borderColor: colors.inputBorder,
                    color: theme.text,
                  },
                ]}
                value={final}
                onChangeText={setFinal}
                placeholder="0-100"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            <Pressable
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: colors.link }]}
            >
              <ThemedText style={styles.saveButtonText}>
                {editingCourse ? "Güncelle" : "Kaydet"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  courseCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  gradesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  gradeItem: {
    alignItems: "center",
    flex: 1,
  },
  gradeLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  gradeValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: Spacing.lg,
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
  saveButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

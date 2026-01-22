import React from "react";
import { View, StyleSheet, ScrollView, Image, Linking, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: Spacing.xl,
        paddingBottom: insets.bottom + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={styles.headerSection}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.appIcon}
            resizeMode="contain"
          />
          <ThemedText style={styles.appName}>Not Hesaplama</ThemedText>
          <ThemedText style={[styles.version, { color: colors.textSecondary }]}>
            Sürüm 1.0.0
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundDefault }]}>
          <View style={styles.sectionHeader}>
            <Feather name="info" size={20} color={colors.link} />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Uygulama Hakkında
            </ThemedText>
          </View>
          <ThemedText style={[styles.sectionText, { color: colors.textSecondary }]}>
            Bu uygulama, üniversite öğrencilerinin vize ve final notlarını hızlıca hesaplayıp, başarı durumlarını görebilmeleri için geliştirilmiştir.
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundDefault }]}>
          <View style={styles.sectionHeader}>
            <Feather name="settings" size={20} color={colors.link} />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Hesaplama Mantığı
            </ThemedText>
          </View>
          <View style={styles.formulaBox}>
            <ThemedText style={[styles.formula, { color: theme.text }]}>
              Vize %40 + Final/Büt %60 = Ortalama
            </ThemedText>
          </View>
          
          <View style={styles.rulesContainer}>
            <View style={styles.ruleItem}>
              <View style={[styles.ruleBadge, { backgroundColor: colors.success }]} />
              <ThemedText style={[styles.ruleText, { color: colors.textSecondary }]}>
                Ortalama {">"} 49: Geçtin
              </ThemedText>
            </View>
            <View style={styles.ruleItem}>
              <View style={[styles.ruleBadge, { backgroundColor: colors.warning }]} />
              <ThemedText style={[styles.ruleText, { color: colors.textSecondary }]}>
                49 {">"} Ortalama {">"} 39: Şartlı Geçtin
              </ThemedText>
            </View>
            <View style={styles.ruleItem}>
              <View style={[styles.ruleBadge, { backgroundColor: colors.error }]} />
              <ThemedText style={[styles.ruleText, { color: colors.textSecondary }]}>
                Final Notu {"<"} Final Barajın: Kaldın
              </ThemedText>
            </View>
          </View>

          <ThemedText style={[styles.sectionNote, { color: colors.textSecondary }]}>
            Uygulama, seçtiğiniz final barajını öncelikli tutar. Final notunuz barajın altındaysa ortalamanız ne olursa olsun ders başarısız sayılır.
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundDefault }]}>
          <View style={styles.sectionHeader}>
            <Feather name="mail" size={20} color={colors.link} />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              İletişim
            </ThemedText>
          </View>
          <ThemedText style={[styles.sectionText, { color: colors.textSecondary }]}>
            Geri bildirimleriniz ve sorularınız için iletişime geçebilirsiniz.
          </ThemedText>
          <Pressable 
            onPress={() => Linking.openURL('mailto:destek@nothesaplama.com')}
            style={({ pressed }) => [styles.contactButton, { backgroundColor: colors.link, opacity: pressed ? 0.8 : 1 }]}
          >
            <ThemedText style={styles.contactButtonText}>E-posta Gönder</ThemedText>
          </Pressable>

          <Pressable 
            onPress={() => Linking.openURL('https://github.com/semih007/Replit3')}
            style={({ pressed }) => [styles.contactButton, { backgroundColor: '#333', opacity: pressed ? 0.8 : 1, marginTop: Spacing.sm, flexDirection: 'row' }]}
          >
            <Feather name="github" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <ThemedText style={styles.contactButtonText}>GitHub Deposu</ThemedText>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  version: {
    fontSize: 14,
  },
  sectionCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  formulaBox: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: BorderRadius.xs,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  formula: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  rulesContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  ruleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionNote: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.lg,
    fontStyle: 'italic',
  },
  contactButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

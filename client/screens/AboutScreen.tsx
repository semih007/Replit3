import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Typography } from "@/constants/theme";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
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
            Surum 1.0.0
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.backgroundDefault },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="book-open" size={20} color={colors.link} />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Uygulama Hakkinda
            </ThemedText>
          </View>
          <ThemedText
            style={[styles.sectionText, { color: colors.textSecondary }]}
          >
            Bu uygulama, universite ogrencilerinin ders notlarini hesaplamalari
            icin tasarlanmistir. Turk universite sistemindeki standart not
            hesaplama yontemini kullanir.
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.backgroundDefault },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="percent" size={20} color={colors.link} />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Not Hesaplama Sistemi
            </ThemedText>
          </View>
          <ThemedText
            style={[styles.sectionText, { color: colors.textSecondary }]}
          >
            Ortalama su sekilde hesaplanir:
          </ThemedText>
          <View style={styles.formulaBox}>
            <ThemedText style={[styles.formula, { color: theme.text }]}>
              Ortalama = (Vize x 0.40) + (Final x 0.60)
            </ThemedText>
          </View>
          <ThemedText
            style={[
              styles.sectionText,
              { color: colors.textSecondary, marginTop: Spacing.md },
            ]}
          >
            Vize sinavi toplam notun %40'ini, final sinavi ise %60'ini olusturur.
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.backgroundDefault },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="award" size={20} color={colors.link} />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Gecme Kosullari
            </ThemedText>
          </View>

          <View style={styles.ruleItem}>
            <View
              style={[styles.ruleDot, { backgroundColor: colors.success }]}
            />
            <View style={styles.ruleContent}>
              <ThemedText style={[styles.ruleTitle, { color: theme.text }]}>
                Gectin (50 ve uzeri)
              </ThemedText>
              <ThemedText
                style={[styles.ruleDesc, { color: colors.textSecondary }]}
              >
                Ortalamaniz 50 ve uzerindeyse dersi basariyla tamamladiniz.
              </ThemedText>
            </View>
          </View>

          <View style={styles.ruleItem}>
            <View
              style={[styles.ruleDot, { backgroundColor: colors.warning }]}
            />
            <View style={styles.ruleContent}>
              <ThemedText style={[styles.ruleTitle, { color: theme.text }]}>
                Sartli Gectin (40-49 arasi)
              </ThemedText>
              <ThemedText
                style={[styles.ruleDesc, { color: colors.textSecondary }]}
              >
                Ortalamaniz 40 ile 49 arasindaysa sartli olarak gectiniz.
                Genel not ortalamaniza bagli olarak durumunuz degisebilir.
              </ThemedText>
            </View>
          </View>

          <View style={styles.ruleItem}>
            <View style={[styles.ruleDot, { backgroundColor: colors.error }]} />
            <View style={styles.ruleContent}>
              <ThemedText style={[styles.ruleTitle, { color: theme.text }]}>
                Kaldin (40'in altinda)
              </ThemedText>
              <ThemedText
                style={[styles.ruleDesc, { color: colors.textSecondary }]}
              >
                Ortalamaniz 40'in altindaysa veya final notunuz 30'un altindaysa
                dersten kaldiniz. Final notunun en az 30 olmasi zorunludur.
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.backgroundDefault },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="alert-circle" size={20} color={colors.error} />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Onemli Not
            </ThemedText>
          </View>
          <ThemedText
            style={[styles.sectionText, { color: colors.textSecondary }]}
          >
            Final sinavi notu 30'un altinda olan ogrenciler, ortalamasi ne olursa
            olsun dersten kalmis sayilir. Bu kural cogu Turk universitesinde
            gecerlidir.
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).duration(400)}>
        <View style={styles.exampleSection}>
          <ThemedText style={[styles.exampleTitle, { color: theme.text }]}>
            Ornek Hesaplamalar
          </ThemedText>

          <View
            style={[
              styles.exampleCard,
              { backgroundColor: colors.success + "20" },
            ]}
          >
            <View style={styles.exampleHeader}>
              <Feather name="check-circle" size={18} color={colors.success} />
              <ThemedText
                style={[styles.exampleStatus, { color: colors.success }]}
              >
                Gectin
              </ThemedText>
            </View>
            <ThemedText
              style={[styles.exampleCalc, { color: colors.textSecondary }]}
            >
              Vize: 70, Final: 60
            </ThemedText>
            <ThemedText
              style={[styles.exampleCalc, { color: colors.textSecondary }]}
            >
              (70 x 0.40) + (60 x 0.60) = 28 + 36 = 64
            </ThemedText>
          </View>

          <View
            style={[
              styles.exampleCard,
              { backgroundColor: colors.warning + "20" },
            ]}
          >
            <View style={styles.exampleHeader}>
              <Feather name="alert-triangle" size={18} color={colors.warning} />
              <ThemedText
                style={[styles.exampleStatus, { color: colors.warning }]}
              >
                Sartli Gectin
              </ThemedText>
            </View>
            <ThemedText
              style={[styles.exampleCalc, { color: colors.textSecondary }]}
            >
              Vize: 50, Final: 40
            </ThemedText>
            <ThemedText
              style={[styles.exampleCalc, { color: colors.textSecondary }]}
            >
              (50 x 0.40) + (40 x 0.60) = 20 + 24 = 44
            </ThemedText>
          </View>

          <View
            style={[
              styles.exampleCard,
              { backgroundColor: colors.error + "20" },
            ]}
          >
            <View style={styles.exampleHeader}>
              <Feather name="x-circle" size={18} color={colors.error} />
              <ThemedText
                style={[styles.exampleStatus, { color: colors.error }]}
              >
                Kaldin
              </ThemedText>
            </View>
            <ThemedText
              style={[styles.exampleCalc, { color: colors.textSecondary }]}
            >
              Vize: 80, Final: 25 (Final 30'un altinda)
            </ThemedText>
            <ThemedText
              style={[styles.exampleCalc, { color: colors.textSecondary }]}
            >
              Final notu 30'un altinda oldugu icin kaldiniz.
            </ThemedText>
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
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 24,
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
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  formulaBox: {
    backgroundColor: "rgba(30, 58, 95, 0.1)",
    borderRadius: BorderRadius.xs,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  formula: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  ruleItem: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  ruleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: Spacing.md,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  ruleDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  exampleSection: {
    marginTop: Spacing.md,
  },
  exampleTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  exampleCard: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  exampleStatus: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  exampleCalc: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },
});

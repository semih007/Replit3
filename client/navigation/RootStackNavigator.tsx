import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CalculatorScreen from "@/screens/CalculatorScreen";
import AboutScreen from "@/screens/AboutScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import SavedCoursesScreen from "@/screens/SavedCoursesScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Calculator: undefined;
  About: undefined;
  History: undefined;
  SavedCourses: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Calculator"
        component={CalculatorScreen}
        options={{
          headerTitle: "Not Hesaplama",
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerTitle: "Hakkinda",
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          headerTitle: "Gecmis",
        }}
      />
      <Stack.Screen
        name="SavedCourses"
        component={SavedCoursesScreen}
        options={{
          headerTitle: "Kayitli Dersler",
        }}
      />
    </Stack.Navigator>
  );
}

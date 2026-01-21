# replit.md

## Overview

This is a Turkish university grade calculator mobile application built with React Native and Expo. The app helps students calculate their course grades based on the Turkish university grading system (specifically Konya Technical University associate degree requirements).

**Core Functionality:**
- Calculate weighted average: (midterm × 40%) + (final × 60%)
- Determine pass/fail status based on rules:
  - Final grade must be > 30 to pass
  - Average > 49: Direct pass
  - Average 40-49: Conditional pass
  - Average < 40: Fail

The app uses color-coded results (green=pass, yellow=conditional, red=fail) for instant visual feedback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation (native-stack) with a simple two-screen structure (Calculator and About)
- **State Management**: Local React state (useState) for form inputs and calculation results
- **Styling**: StyleSheet with a custom theme system supporting light/dark modes
- **Animations**: React Native Reanimated for smooth UI transitions and haptic feedback via expo-haptics
- **Path Aliases**: `@/` maps to `./client`, `@shared/` maps to `./shared`

### Project Structure
```
client/           # React Native frontend
├── components/   # Reusable UI components (Button, Card, ThemedText, etc.)
├── screens/      # Screen components (CalculatorScreen, AboutScreen)
├── navigation/   # Stack navigator setup
├── hooks/        # Custom hooks (useTheme, useScreenOptions)
├── constants/    # Theme colors, spacing, typography
└── lib/          # API client utilities

server/           # Express backend (minimal, mostly for web serving)
shared/           # Shared types and schemas (Drizzle + Zod)
```

### Backend Architecture
- **Framework**: Express.js (v5) with TypeScript
- **Purpose**: Primarily serves as a proxy/static file server for web builds; the app's core logic is client-side only
- **ORM Setup**: Drizzle ORM configured with PostgreSQL (though not actively used for the grade calculator functionality)
- **Storage**: In-memory storage implementation exists for user management (template code, not used by main app)

### Design Patterns
- **Theming**: Centralized color/spacing constants with `useTheme` hook for consistent light/dark mode support
- **Error Handling**: ErrorBoundary component wraps the app for graceful error recovery
- **Keyboard Handling**: Platform-aware keyboard scroll views using react-native-keyboard-controller

## External Dependencies

### Core Runtime
- **Expo SDK 54**: Managed workflow for React Native development
- **React Native 0.81.5**: Base mobile framework
- **React 19.1.0**: UI library

### Navigation & UI
- **@react-navigation/native-stack**: Screen navigation
- **react-native-reanimated**: Animations
- **react-native-gesture-handler**: Touch gestures
- **expo-haptics**: Haptic feedback on button presses

### Database (Template/Unused)
- **Drizzle ORM**: SQL query builder
- **PostgreSQL (pg)**: Database driver
- **drizzle-zod**: Schema validation

### Build & Development
- **tsx**: TypeScript execution for server
- **esbuild**: Server bundling
- **babel-preset-expo**: React Native transpilation
- **module-resolver**: Path alias support

### Target Platforms
- Android 10+ (minSdkVersion 29)
- iOS (with tablet support)
- Web (single-page output)
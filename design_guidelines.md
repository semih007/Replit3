# University Grade Calculator - Design Guidelines

## Brand Identity

**Purpose**: Help Turkish university students quickly calculate their course grades and understand their pass/fail status based on the Turkish university grading system.

**Aesthetic Direction**: **Clean Academic** - Purposeful, trustworthy, results-focused. Uses color intentionally to communicate grade outcomes (red=fail, yellow=conditional, green=pass). Maximum clarity with minimal distraction.

**Memorable Element**: Color-coded grade results that feel like an official transcript, with bold status cards that give instant visual feedback.

## Navigation Architecture

**Type**: Stack-Only (single-screen utility app)

**Screens**:
1. Calculator Screen - Main interface for entering grades and viewing results
2. About Screen - App information and grading system explanation

## Screen Specifications

### Calculator Screen
**Purpose**: Enter course grades and see calculated average with pass/fail status

**Layout**:
- Header: Default navigation bar, transparent background
  - Title: "Not Hesaplama" (centered)
  - Right button: Info icon → navigates to About screen
- Main content: Scrollable form (ScrollView)
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: insets.bottom + Spacing.xl
- Floating elements: None

**Components**:
- Course name input field (optional, helps students track multiple courses)
- Midterm grade input (0-100, numeric keyboard)
- Final grade input (0-100, numeric keyboard)
- Calculate button (full-width, prominent)
- Result card (appears after calculation):
  - Shows weighted average
  - Shows status with color-coding and large status text
  - Shows calculation breakdown (vize×0.4 + final×0.6)
- Clear/Reset button below result card

**Empty State**: Illustration showing student at desk with books (academic-calculator-empty.png)

### About Screen
**Purpose**: Explain grading system rules and app information

**Layout**:
- Header: Default with back button, title "Hakkında"
- Main content: Scrollable
- Lists grading rules clearly with examples

## Color Palette

**Primary**: #1E3A5F (Deep Academic Blue) - Headers, primary actions
**Background**: #F8F9FA (Soft Off-White) - Main background
**Surface**: #FFFFFF (Pure White) - Cards, input fields

**Status Colors** (critical for app function):
- **Success**: #2D8659 (Forest Green) - Pass (≥50)
- **Warning**: #D97706 (Amber) - Conditional (40-49)
- **Error**: #C53030 (Academic Red) - Fail (<40)

**Text**:
- Primary: #1A202C
- Secondary: #4A5568
- Disabled: #A0AEC0

**Input Borders**:
- Default: #E2E8F0
- Focus: Primary (#1E3A5F)
- Error: Error (#C53030)

## Typography

**Font**: System default (San Francisco for clarity)

**Type Scale**:
- Title: 28px, Bold
- Heading: 20px, Semibold
- Body: 16px, Regular
- Input Label: 14px, Medium
- Caption: 12px, Regular
- **Result Status**: 32px, Bold (for "Geçtin/Kaldın/Şartlı")

## Visual Design

- Input fields: 8px border radius, 16px vertical padding
- Buttons: 12px border radius, 16px vertical padding
- Result card: 16px border radius, 24px padding, solid color background (not just border)
- All touchable elements: Opacity 0.7 when pressed
- Cards: NO drop shadow (clean, flat design)
- Calculate button: Solid Primary color, white text, full-width
- Status colors fill entire result card background with white text

## Assets to Generate

1. **icon.png** - App icon showing calculator with grades/percentages in academic blue
   - WHERE USED: Device home screen

2. **splash-icon.png** - Simplified calculator icon for splash screen
   - WHERE USED: App launch screen

3. **academic-calculator-empty.png** - Illustration of open notebook with calculator and pencil
   - WHERE USED: Calculator screen before first calculation, centered above form

4. **grading-system-diagram.png** - Visual diagram showing 40% + 60% = result
   - WHERE USED: About screen to explain calculation method
# TheJERKTracker UI Design Reference

**OFFICIAL DESIGN SPECIFICATION - DO NOT MODIFY WITHOUT APPROVAL**

This document serves as the definitive reference for TheJERKTracker's frontend UI design. Any changes to the main page should preserve these exact specifications.

## Brand Identity

### Logo & Branding
- **Brand Name**: TheJERKTracker
- **Tagline**: Restaurant Solutions
- **Main Headline**: "Modern Pickup Tracking for Restaurants"

### Color Palette
- **Primary Orange**: `#ed7734`
- **Secondary Orange**: `#de5d20`
- **Orange Gradient**: `linear-gradient(135deg, #ed7734 0%, #de5d20 100%)`
- **Orange Light (Badge)**: `#ed773420` (20% opacity)
- **Background**: `#fafaf9` (off-white)
- **Hero Background**: `linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%)`
- **Text Dark**: `#1c1917`
- **Text Medium**: `#57534e`
- **Text Light**: `#78716c`
- **White**: `#ffffff`
- **Footer Dark**: `#1c1917`

## Typography

### Font Family
- **Primary**: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Font Smoothing**: `-webkit-font-smoothing: antialiased`

### Heading Sizes & Weights
- **6xl**: Main hero heading "Modern Pickup Tracking"
  - Weight: `bold` (700)
  - Color: `#1c1917`
  - Line Height: `1.1`
- **4xl**: Section headings
  - Weight: `bold` (700)
- **3xl**: Sub-section headings
  - Weight: `bold` (700)
- **xl**: Navigation brand, feature titles
  - Weight: `bold` (700)

### Text Sizes
- **xl**: Hero description, section descriptions
- **lg**: Stats labels, body text
- **base**: Feature descriptions
- **sm**: Navigation tagline, footer text, small labels

## Layout Structure

### Navigation Bar
- **Background**: `rgba(255, 255, 255, 0.95)` with `backdrop-filter: blur(10px)`
- **Border**: `1px solid #e7e5e4` (bottom)
- **Position**: `sticky` top, z-index: 1020
- **Height**: 80px
- **Logo Section**:
  - Orange circle with "JT" initials
  - Brand name: TheJERKTracker (xl, bold, #1c1917)
  - Tagline: "Restaurant Solutions" (sm, #78716c)

### Hero Section
- **Background**: Hero gradient (`#fef7ee` to `#fafaf9`)
- **Padding**: 6rem top/bottom
- **Min Height**: 80vh
- **Content**: Centered, max-width 800px

#### Hero Content Structure
1. **Trust Badge**:
   - Background: `#ed773420`
   - Color: `#ed7734`
   - Padding: 0.5rem 1rem
   - Border radius: 9999px (full rounded)
   - Text: "Trusted by 2,000+ Restaurants"
   - Icon: Star (16px)

2. **Main Heading**:
   - "Modern Pickup Tracking" (6xl, bold, #1c1917)
   - "for Restaurants" (orange gradient text)
   - Line height: 1.1
   - Margin bottom: 1.5rem

3. **Description**:
   - Size: xl
   - Color: #57534e
   - Max width: 600px
   - Center aligned
   - Margin bottom: 3rem

4. **CTA Buttons**:
   - Primary: "Start Free Trial" (lg, primary orange)
   - Secondary: "View Pricing" (lg, outline)
   - Gap: 1rem between buttons

5. **Feature Icons**:
   - Shield: "No setup fees"
   - Users: "Free support"
   - Clock: "5-minute setup"
   - Size: 16px icons
   - Gap: 2rem between items
   - Font size: 0.875rem
   - Color: #78716c

### Features Section
- **Heading**: "Everything You Need to Succeed" (4xl, bold, #1c1917)
- **Description**: xl size, #57534e, max-width 600px, center aligned
- **Cards**: 3-column grid layout, 2rem padding each

### Social Proof Section
- **Background**: White
- **Heading**: "Trusted by Restaurants Worldwide" (3xl, bold, #1c1917)
- **Stats Cards**: Orange background (#ed7734)
  - "2,000+ Active Restaurants"
  - "50K+ Orders Tracked Daily" 
  - "98% Customer Satisfaction"

### Call-to-Action Section
- **Background**: Orange gradient (`#ed7734` to `#de5d20`)
- **Text Color**: White
- **Padding**: 6rem top/bottom
- **Heading**: "Ready to Transform Your Pickup Experience?" (4xl, bold, white)
- **Description**: xl size, white with 90% opacity
- **Buttons**: 
  - "Start Free Trial" (lg, secondary - white background)
  - "View Pricing" (lg, outline with white border)

### Footer
- **Background**: `#1c1917`
- **Text Color**: White
- **Padding**: 3rem top, 2rem bottom
- **Copyright**: "© 2025 TheJERKTracker. Built with ❤️ for restaurants."
- **Text Size**: sm
- **Opacity**: 70% for copyright text

## Spacing System

### Margins & Padding
- **Section Padding**: 6rem top/bottom for major sections
- **Card Padding**: 2rem
- **Button Padding**: Standard button padding
- **Gap Spacing**: 
  - Small gaps: 0.5rem
  - Medium gaps: 1rem
  - Large gaps: 2rem
  - Section gaps: 3rem

### Grid & Flexbox
- **Feature Grid**: `repeat(auto-fit, minmax(300px, 1fr))`
- **Stats Grid**: 3-column equal width
- **Flex Alignment**: Center alignment for hero content
- **Max Widths**: 800px for hero content, 600px for descriptions

## Interactive Elements

### Buttons
- **Primary**: Orange background, white text, hover effects
- **Secondary**: White background, orange text
- **Ghost**: Transparent background, hover effects
- **Outline**: Border only, hover fill effect
- **Sizes**: lg (large) for CTAs, standard for navigation

### Hover Effects
- **Scale**: `scale(1.05)` on hover for buttons
- **Tap**: `scale(0.95)` on press
- **Transitions**: Smooth animations using Framer Motion

### Focus States
- **Outline**: 2px solid #ed7734
- **Offset**: 2px
- **Applied to**: All interactive elements

## Animation Specifications

### Framer Motion Effects
- **Initial**: `opacity: 0, y: 50` for hero elements
- **Animate**: `opacity: 1, y: 0`
- **Duration**: 0.8s with easeOut easing
- **Stagger**: 0.2s delays between elements
- **Hover Animations**: Scale transforms for buttons

### Page Load Sequence
1. Navigation fade in
2. Trust badge scale in (0.2s delay)
3. Main heading slide up (0.3s delay)
4. Description slide up (0.4s delay)
5. Buttons fade in (0.5s delay)
6. Feature icons fade in (0.6s delay)

## Responsive Behavior

### Breakpoints
- **Mobile First**: Design scales down from desktop
- **Grid Adaptation**: `auto-fit, minmax(300px, 1fr)`
- **Navigation**: Responsive header with mobile considerations
- **Typography**: Maintains hierarchy across devices

## Code Implementation Notes

### Styled Components
- **All props**: Use transient props with `$` prefix (`$size`, `$color`, `$gap`, etc.)
- **No DOM pollution**: Prevents React warnings about unknown props
- **Theme consistency**: Colors and spacing from centralized theme

### Component Structure
```
Navigation
├── Logo (JT circle + brand name)
├── Menu (How it Works, Pricing)
└── CTA (Launch Dashboard)

Hero Section
├── Trust Badge
├── Main Heading (with gradient text)
├── Description
├── CTA Buttons
└── Feature Icons

Features Section
├── Section Header
└── Feature Cards Grid

Stats Section
├── Section Header
└── Stats Cards

CTA Section
├── Heading
├── Description
└── Action Buttons

Footer
└── Copyright
```

## File References

### Primary Files
- **Main Page**: `/app/page.tsx`
- **Styled Components**: `/styles/components.ts`
- **Theme**: `/styles/theme.ts`
- **Global Styles**: Applied via styled-components GlobalStyles

### Key Dependencies
- **Styling**: styled-components
- **Animation**: framer-motion
- **Icons**: lucide-react
- **Framework**: Next.js 15.5.4

---

**IMPORTANT**: This design specification represents the approved TheJERKTracker brand identity and user experience. Any modifications should:

1. ✅ Maintain the exact color palette
2. ✅ Preserve typography hierarchy  
3. ✅ Keep spacing and layout proportions
4. ✅ Maintain animation timing and effects
5. ✅ Use transient props for styled-components
6. ✅ Follow the established component structure

**Before making changes**: Reference this document and ensure consistency with the established design system.

**Last Updated**: October 11, 2025
**Status**: ✅ APPROVED - Production Ready
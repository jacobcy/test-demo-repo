export const themes = {
  defaultLight: {
    name: '默认亮色',
    type: 'light',
    colors: {
      appBg: '#F3F4F6', // Slightly off-white
      headerBg: 'linear-gradient(to right, #6366F1, #8B5CF6)', // Indigo to Purple
      mainContentBg: '#FFFFFF', // White
      textColor: '#1F2937', // Gray-800
      quoteTextColor: '#4F46E5', // Indigo-600
      
      userBubbleBg: '#4F46E5', // Indigo-600
      userBubbleText: '#FFFFFF',
      charBubbleBg: '#FFFFFF',
      charBubbleText: '#1F2937',
      charBubbleBorder: '#E5E7EB', // Gray-200
      systemBubbleBg: '#E5E7EB', // Gray-200
      systemBubbleText: '#4B5563', // Gray-600

      buttonPrimaryBg: '#4F46E5', // Indigo-600
      buttonPrimaryText: '#FFFFFF',
      buttonSecondaryBg: '#E5E7EB',
      buttonSecondaryText: '#1F2937',
      
      settingsPanelBg: '#FFFFFF',
      settingsHeaderText: '#111827',
      settingsTextColor: '#374151',
      settingsBorder: '#E5E7EB',

      metadataSectionBg: '#F9FAFB', // Gray-50
      metadataHeader: '#374151', // Gray-700
      metadataText: '#4B5563', // Gray-600
      metadataInfoBoxBg: '#FFFFFF',

      footerBg: '#F3F4F6',
      footerText: '#6B7280', // Gray-500

      iconDefault: '#4B5563', // Gray-600
      iconActive: '#4F46E5', // Indigo-600

      // Special block styles (light theme)
      specialBlockBorder: '#D1D5DB', // gray-300
      specialBlockDefaultHeaderBg: '#6B7280', // gray-500
      specialBlockDefaultHeaderText: '#FFFFFF',
      specialBlockDefaultContentBg: '#F3F4F6', // gray-100
      specialBlockDefaultContentText: '#1F2937',

      specialBlockImageHeaderBg: '#7C3AED', // purple-600
      specialBlockImageContentBg: '#F5F3FF', // purple-50
      
      specialBlockTableHeaderBg: '#2563EB', // blue-600
      specialBlockTableContentBg: '#EFF6FF', // blue-50

      specialBlockCodeHeaderBg: '#059669', // green-600
      specialBlockCodeContentBg: '#F0FDF4', // green-50 (Tailwind green-50)
    }
  },
  defaultDark: {
    name: '默认暗色',
    type: 'dark',
    colors: {
      appBg: '#111827', // Gray-900
      headerBg: '#312E81', // Indigo-900
      mainContentBg: '#1F2937', // Gray-800
      textColor: '#E5E7EB', // Gray-200
      quoteTextColor: '#A5B4FC', // Indigo-300

      userBubbleBg: '#4338CA', // Indigo-700
      userBubbleText: '#FFFFFF',
      charBubbleBg: '#374151', // Gray-700
      charBubbleText: '#E5E7EB',
      charBubbleBorder: '#4B5563', // Gray-600
      systemBubbleBg: '#4B5563', // Gray-600
      systemBubbleText: '#D1D5DB', // Gray-300

      buttonPrimaryBg: '#4F46E5', // Indigo-600
      buttonPrimaryText: '#FFFFFF',
      buttonSecondaryBg: '#374151',
      buttonSecondaryText: '#E5E7EB',

      settingsPanelBg: '#1F2937', // Gray-800
      settingsHeaderText: '#F3F4F6',
      settingsTextColor: '#D1D5DB',
      settingsBorder: '#4B5563',

      metadataSectionBg: '#1F2937', // Gray-800
      metadataHeader: '#A5B4FC', // Indigo-300
      metadataText: '#D1D5DB', // Gray-300
      metadataInfoBoxBg: '#374151', // Gray-700 (opacity 50)

      footerBg: '#1F2937', // Gray-800
      footerText: '#9CA3AF', // Gray-400
      
      iconDefault: '#9CA3AF', // Gray-400
      iconActive: '#A5B4FC', // Indigo-300

      // Special block styles (dark theme)
      specialBlockBorder: '#4B5563', // gray-600
      specialBlockDefaultHeaderBg: '#4B5563', // gray-600
      specialBlockDefaultHeaderText: '#E5E7EB', // gray-200
      specialBlockDefaultContentBg: '#1F2937', // gray-800
      specialBlockDefaultContentText: '#D1D5DB',

      specialBlockImageHeaderBg: '#5B21B6', // purple-800
      specialBlockImageContentBg: '#2E1065', // Slightly darker purple-900 shade for content
      
      specialBlockTableHeaderBg: '#1E40AF', // blue-800
      specialBlockTableContentBg: '#1C325D', // Darker blue shade
      
      specialBlockCodeHeaderBg: '#065F46', // green-800
      specialBlockCodeContentBg: '#033424', // Darker green shade
    }
  },
  monokai: {
    name: 'Monokai',
    type: 'dark',
    colors: {
      appBg: '#272822',
      headerBg: '#1E1F1C',
      mainContentBg: '#2D2E2A',
      textColor: '#F8F8F2',
      quoteTextColor: '#E6DB74', // Yellow for quotes

      userBubbleBg: '#AE81FF', // Purple
      userBubbleText: '#272822',
      charBubbleBg: '#49483E', // Darker Gray
      charBubbleText: '#F8F8F2',
      charBubbleBorder: '#75715E',
      systemBubbleBg: '#75715E', // Gray
      systemBubbleText: '#F8F8F2',

      buttonPrimaryBg: '#FD971F', // Orange
      buttonPrimaryText: '#272822',
      buttonSecondaryBg: '#75715E',
      buttonSecondaryText: '#F8F8F2',

      settingsPanelBg: '#3E3D32',
      settingsHeaderText: '#F92672', // Pink
      settingsTextColor: '#F8F8F2',
      settingsBorder: '#75715E',

      metadataSectionBg: '#2D2E2A',
      metadataHeader: '#A6E22E', // Green
      metadataText: '#F8F8F2',
      metadataInfoBoxBg: '#3E3D32',

      footerBg: '#1E1F1C',
      footerText: '#A0A0A0',

      iconDefault: '#CCCCCC',
      iconActive: '#FD971F', // Orange

      // Special block styles (Monokai) - adapt from dark
      specialBlockBorder: '#75715E',
      specialBlockDefaultHeaderBg: '#75715E',
      specialBlockDefaultHeaderText: '#F8F8F2',
      specialBlockDefaultContentBg: '#3E3D32',
      specialBlockDefaultContentText: '#F8F8F2',

      specialBlockImageHeaderBg: '#AE81FF', // Purple
      specialBlockImageContentBg: '#49483E', 
      
      specialBlockTableHeaderBg: '#66D9EF', // Cyan
      specialBlockTableContentBg: '#49483E',
      
      specialBlockCodeHeaderBg: '#A6E22E', // Green
      specialBlockCodeContentBg: '#33342D', // Slightly different dark for code
    }
  },
  solarizedLight: {
    name: 'Solarized Light',
    type: 'light',
    colors: {
      appBg: '#fdf6e3', // base3
      headerBg: '#eee8d5', // base2
      mainContentBg: '#fdf6e3', // base3
      textColor: '#586e75', // base01 (content)
      quoteTextColor: '#268bd2', // blue

      userBubbleBg: '#268bd2', // blue
      userBubbleText: '#fdf6e3', // base3
      charBubbleBg: '#eee8d5', // base2
      charBubbleText: '#586e75', // base01
      charBubbleBorder: '#93a1a1', // base1
      systemBubbleBg: '#eee8d5', // base2
      systemBubbleText: '#839496', // base0

      buttonPrimaryBg: '#2aa198', // cyan
      buttonPrimaryText: '#fdf6e3',
      buttonSecondaryBg: '#93a1a1', // base1
      buttonSecondaryText: '#073642', // base02

      settingsPanelBg: '#eee8d5',
      settingsHeaderText: '#cb4b16', // orange
      settingsTextColor: '#586e75',
      settingsBorder: '#93a1a1',

      metadataSectionBg: '#fdf6e3',
      metadataHeader: '#b58900', // yellow
      metadataText: '#657b83', // base00
      metadataInfoBoxBg: '#eee8d5',

      footerBg: '#eee8d5',
      footerText: '#839496', // base0

      iconDefault: '#657b83',
      iconActive: '#2aa198', // cyan

      // Special block styles (Solarized Light)
      specialBlockBorder: '#93a1a1', // base1
      specialBlockDefaultHeaderBg: '#93a1a1', // base1
      specialBlockDefaultHeaderText: '#002b36', // base03
      specialBlockDefaultContentBg: '#eee8d5', // base2
      specialBlockDefaultContentText: '#586e75', // base01

      specialBlockImageHeaderBg: '#6c71c4', // violet
      specialBlockImageContentBg: '#fdf6e3', 
      
      specialBlockTableHeaderBg: '#268bd2', // blue
      specialBlockTableContentBg: '#fdf6e3',
      
      specialBlockCodeHeaderBg: '#859900', // green
      specialBlockCodeContentBg: '#f5f0e1', // slightly off base3
    }
  }
};

export const defaultThemeName = 'defaultLight'; 
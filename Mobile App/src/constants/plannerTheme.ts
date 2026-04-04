import { ThemeMode } from '../types/planner';

// Aligned with src/constants/theme.ts
export const getPlannerTheme = (mode: ThemeMode | 'light' | 'dark') => {
  const isDark = mode === 'dark';
  
  return {
    // Backgrounds
    bg: isDark ? '#0b120e' : '#f6f7f7',           
    surface: isDark ? '#1d2a24' : '#ffffff',      
    surface2: isDark ? '#121a16' : '#f0f5f1',     
    border: isDark ? '#2a3a31' : '#d8e2db', 

    // Text
    text: isDark ? '#f7faf8' : '#102117',         
    text2: isDark ? '#9aa8a0' : '#6b7a71',        
    text3: isDark ? '#2a3a31' : '#d8e2db',        

    // Accents (Matching global primary: #52b781)
    accent: '#52b781',       
    accentLight: isDark ? 'rgba(82, 183, 129, 0.1)' : 'rgba(82, 183, 129, 0.08)',  
    accentMid: isDark ? '#75cf9e' : '#1f7b54',    

    // Status Colors
    amber: isDark ? '#fbb32b' : '#f59e0b',                             
    amberLight: isDark ? 'rgba(251, 179, 43, 0.1)' : 'rgba(245, 158, 11, 0.1)',
    red: '#ef4444',                               
    redLight: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
    blue: isDark ? '#3b82f6' : '#2563eb',                              
    blueLight: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.08)',
    purple: '#8b5cf6',                            
    purpleLight: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)',
  };
};

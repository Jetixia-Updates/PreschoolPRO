import { create } from "zustand";

interface AppState {
  // Language
  locale: "en" | "ar";
  setLocale: (locale: "en" | "ar") => void;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Notification count
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;
  incrementNotifications: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  locale: "en",
  setLocale: (locale) => set({ locale }),

  theme: "light",
  setTheme: (theme) => set({ theme }),

  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  unreadNotifications: 0,
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  incrementNotifications: () =>
    set((state) => ({
      unreadNotifications: state.unreadNotifications + 1,
    })),
}));

/**
 * Student filter store for list page
 */
interface StudentFilterState {
  search: string;
  iscedLevel: string;
  classroomId: string;
  gender: string;
  setSearch: (search: string) => void;
  setIscedLevel: (level: string) => void;
  setClassroomId: (id: string) => void;
  setGender: (gender: string) => void;
  reset: () => void;
}

export const useStudentFilterStore = create<StudentFilterState>((set) => ({
  search: "",
  iscedLevel: "all",
  classroomId: "all",
  gender: "all",
  setSearch: (search) => set({ search }),
  setIscedLevel: (iscedLevel) => set({ iscedLevel }),
  setClassroomId: (classroomId) => set({ classroomId }),
  setGender: (gender) => set({ gender }),
  reset: () =>
    set({
      search: "",
      iscedLevel: "all",
      classroomId: "all",
      gender: "all",
    }),
}));

/**
 * Dashboard filter store
 */
interface DashboardState {
  dateRange: "today" | "week" | "month" | "year";
  selectedSchoolId: string | null;
  setDateRange: (range: "today" | "week" | "month" | "year") => void;
  setSelectedSchoolId: (id: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dateRange: "month",
  selectedSchoolId: null,
  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedSchoolId: (selectedSchoolId) => set({ selectedSchoolId }),
}));

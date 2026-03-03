/**
 * Hierarchical Context Providers
 *
 * Provides College → Class → Section context with:
 * 1. Centralized state management
 * 2. Automatic reset of dependent values
 * 3. URL sync (optional)
 * 4. Permission-based visibility
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  CollegeOption,
  ClassOption,
  SectionOption,
  ContextState,
} from '@/types/permissions.types';

// ============================================================================
// COLLEGE CONTEXT
// ============================================================================

interface CollegeContextType {
  selectedCollege: number | null;
  setSelectedCollege: (collegeId: number | null) => void;
  colleges: CollegeOption[];
  setColleges: (colleges: CollegeOption[]) => void;
  isLoadingColleges: boolean;
  setIsLoadingColleges: (loading: boolean) => void;
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

export const useCollegeContext = () => {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollegeContext must be used within CollegeProvider');
  }
  return context;
};

interface CollegeProviderProps {
  children: ReactNode;
  syncWithURL?: boolean;
}

export const CollegeProvider: React.FC<CollegeProviderProps> = ({
  children,
  syncWithURL = true,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCollege, setSelectedCollegeState] = useState<number | null>(() => {
    if (syncWithURL) {
      const urlCollege = searchParams.get('college');
      return urlCollege ? Number(urlCollege) : null;
    }
    return null;
  });
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);

  const setSelectedCollege = useCallback((collegeId: number | null) => {
    setSelectedCollegeState(collegeId);

    // Update URL if sync is enabled
    if (syncWithURL) {
      const newParams = new URLSearchParams(searchParams);
      if (collegeId) {
        newParams.set('college', String(collegeId));
      } else {
        newParams.delete('college');
      }
      // Remove dependent params
      newParams.delete('class');
      newParams.delete('section');
      setSearchParams(newParams);
    }
  }, [syncWithURL, searchParams, setSearchParams]);

  const collegeValue = useMemo(() => ({
    selectedCollege,
    setSelectedCollege,
    colleges,
    setColleges,
    isLoadingColleges,
    setIsLoadingColleges,
  }), [selectedCollege, setSelectedCollege, colleges, isLoadingColleges]);

  return (
    <CollegeContext.Provider value={collegeValue}>
      {children}
    </CollegeContext.Provider>
  );
};

// ============================================================================
// CLASS CONTEXT
// ============================================================================

interface ClassContextType {
  selectedClass: number | null;
  setSelectedClass: (classId: number | null) => void;
  classes: ClassOption[];
  setClasses: (classes: ClassOption[]) => void;
  isLoadingClasses: boolean;
  setIsLoadingClasses: (loading: boolean) => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const useClassContext = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClassContext must be used within ClassProvider');
  }
  return context;
};

interface ClassProviderProps {
  children: ReactNode;
  syncWithURL?: boolean;
}

export const ClassProvider: React.FC<ClassProviderProps> = ({
  children,
  syncWithURL = true,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedClass, setSelectedClassState] = useState<number | null>(() => {
    if (syncWithURL) {
      const urlClass = searchParams.get('class');
      return urlClass ? Number(urlClass) : null;
    }
    return null;
  });
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const setSelectedClass = useCallback((classId: number | null) => {
    setSelectedClassState(classId);

    // Update URL if sync is enabled
    if (syncWithURL) {
      const newParams = new URLSearchParams(searchParams);
      if (classId) {
        newParams.set('class', String(classId));
      } else {
        newParams.delete('class');
      }
      // Remove dependent params
      newParams.delete('section');
      setSearchParams(newParams);
    }
  }, [syncWithURL, searchParams, setSearchParams]);

  const classValue = useMemo(() => ({
    selectedClass,
    setSelectedClass,
    classes,
    setClasses,
    isLoadingClasses,
    setIsLoadingClasses,
  }), [selectedClass, setSelectedClass, classes, isLoadingClasses]);

  return (
    <ClassContext.Provider value={classValue}>
      {children}
    </ClassContext.Provider>
  );
};

// ============================================================================
// SECTION CONTEXT
// ============================================================================

interface SectionContextType {
  selectedSection: number | null;
  setSelectedSection: (sectionId: number | null) => void;
  sections: SectionOption[];
  setSections: (sections: SectionOption[]) => void;
  allSections: SectionOption[];
  setAllSections: (sections: SectionOption[]) => void;
  isLoadingSections: boolean;
  setIsLoadingSections: (loading: boolean) => void;
}

const SectionContext = createContext<SectionContextType | undefined>(undefined);

export const useSectionContext = () => {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error('useSectionContext must be used within SectionProvider');
  }
  return context;
};

interface SectionProviderProps {
  children: ReactNode;
  syncWithURL?: boolean;
}

export const SectionProvider: React.FC<SectionProviderProps> = ({
  children,
  syncWithURL = true,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSection, setSelectedSectionState] = useState<number | null>(() => {
    if (syncWithURL) {
      const urlSection = searchParams.get('section');
      return urlSection ? Number(urlSection) : null;
    }
    return null;
  });
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [allSections, setAllSections] = useState<SectionOption[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  const setSelectedSection = useCallback((sectionId: number | null) => {
    setSelectedSectionState(sectionId);

    // Update URL if sync is enabled
    if (syncWithURL) {
      const newParams = new URLSearchParams(searchParams);
      if (sectionId) {
        newParams.set('section', String(sectionId));
      } else {
        newParams.delete('section');
      }
      setSearchParams(newParams);
    }
  }, [syncWithURL, searchParams, setSearchParams]);

  const sectionValue = useMemo(() => ({
    selectedSection,
    setSelectedSection,
    sections,
    setSections,
    allSections,
    setAllSections,
    isLoadingSections,
    setIsLoadingSections,
  }), [selectedSection, setSelectedSection, sections, allSections, isLoadingSections]);

  return (
    <SectionContext.Provider value={sectionValue}>
      {children}
    </SectionContext.Provider>
  );
};

// ============================================================================
// COMBINED HIERARCHICAL PROVIDER
// ============================================================================

interface HierarchicalProviderProps {
  children: ReactNode;
  syncWithURL?: boolean;
}

/**
 * Combines all three providers in correct hierarchy
 * Use this in your app root or route wrapper
 */
export const HierarchicalContextProvider: React.FC<HierarchicalProviderProps> = ({
  children,
  syncWithURL = true,
}) => {
  return (
    <CollegeProvider syncWithURL={syncWithURL}>
      <ClassProvider syncWithURL={syncWithURL}>
        <SectionProvider syncWithURL={syncWithURL}>{children}</SectionProvider>
      </ClassProvider>
    </CollegeProvider>
  );
};

// ============================================================================
// COMBINED HOOK (for easy access to all contexts)
// ============================================================================

export const useHierarchicalContext = () => {
  const collegeContext = useCollegeContext();
  const classContext = useClassContext();
  const sectionContext = useSectionContext();

  return {
    // College
    selectedCollege: collegeContext.selectedCollege,
    setSelectedCollege: collegeContext.setSelectedCollege,
    colleges: collegeContext.colleges,
    setColleges: collegeContext.setColleges,
    isLoadingColleges: collegeContext.isLoadingColleges,
    setIsLoadingColleges: collegeContext.setIsLoadingColleges,

    // Class
    selectedClass: classContext.selectedClass,
    setSelectedClass: classContext.setSelectedClass,
    classes: classContext.classes,
    setClasses: classContext.setClasses,
    isLoadingClasses: classContext.isLoadingClasses,
    setIsLoadingClasses: classContext.setIsLoadingClasses,

    // Section
    selectedSection: sectionContext.selectedSection,
    setSelectedSection: sectionContext.setSelectedSection,
    sections: sectionContext.sections,
    setSections: sectionContext.setSections,
    allSections: sectionContext.allSections,
    setAllSections: sectionContext.setAllSections,
    isLoadingSections: sectionContext.isLoadingSections,
    setIsLoadingSections: sectionContext.setIsLoadingSections,

    // Helper to get current state
    getContextState: (): ContextState => ({
      selectedCollegeId: collegeContext.selectedCollege,
      selectedClassId: classContext.selectedClass,
      selectedSectionId: sectionContext.selectedSection,
    }),

    // Helper to reset all
    resetAll: () => {
      collegeContext.setSelectedCollege(null);
      classContext.setSelectedClass(null);
      sectionContext.setSelectedSection(null);
    },
  };
};

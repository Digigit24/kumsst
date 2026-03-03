/**
 * Context Selector Hooks
 *
 * Provides hooks for fetching and managing context options:
 * - useColleges
 * - useClasses
 * - useSections
 *
 * These hooks automatically fetch options based on:
 * 1. User permissions
 * 2. Parent context (e.g., classes depend on selected college)
 */

import { useClassContext, useCollegeContext, useSectionContext } from '@/contexts/HierarchicalContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import {
    fetchAllContextSections,
    fetchContextClasses,
    fetchContextColleges,
} from '@/services/permissions.service';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

// ============================================================================
// COLLEGES HOOK
// ============================================================================

export const useContextColleges = () => {
  const { setColleges, setIsLoadingColleges } = useCollegeContext();
  const { permissions } = usePermissions();

  const query = useQuery({
    queryKey: ['context', 'colleges'],
    queryFn: fetchContextColleges,
    enabled: permissions?.canChooseCollege !== false, // Fetch even if false for initial data
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update context when data changes
  useEffect(() => {
    if (query.data?.results) {
      setColleges(query.data.results);
    }
    setIsLoadingColleges(query.isLoading);
  }, [query.data, query.isLoading, setColleges, setIsLoadingColleges]);

  return query;
};

// ============================================================================
// CLASSES HOOK
// ============================================================================

export const useContextClasses = () => {
  const { selectedCollege } = useCollegeContext();
  const { setClasses, setIsLoadingClasses, setSelectedClass } = useClassContext();
  const { permissions, userContext } = usePermissions();
  const previousCollegeRef = useRef<number | null>(null);

  const query = useQuery({
    queryKey: ['context', 'classes', selectedCollege, permissions?.isTeacher ? userContext?.userId : null],
    queryFn: () => fetchContextClasses(
      selectedCollege || undefined,
      permissions?.isTeacher ? userContext?.userId : undefined
    ),
    enabled: permissions?.canChooseClass !== false, // Fetch even if false for initial data
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update context when data changes
  useEffect(() => {
    if (query.data?.results) {
      setClasses(query.data.results);
    }
    setIsLoadingClasses(query.isLoading);
  }, [query.data, query.isLoading, setClasses, setIsLoadingClasses]);

  // Reset class selection ONLY when college actually changes value (not on first render)
  useEffect(() => {
    if (previousCollegeRef.current !== null && previousCollegeRef.current !== selectedCollege) {
      setSelectedClass(null);
    }
    previousCollegeRef.current = selectedCollege;
  }, [selectedCollege, setSelectedClass]);

  return query;
};

// ============================================================================
// SECTIONS HOOK
// ============================================================================

/**
 * Prefetches ALL sections for the selected college upfront,
 * then filters client-side by selectedClass for instant section switching.
 * Eliminates the per-class API round-trip that caused loading delays.
 */
export const useContextSections = () => {
  const { selectedCollege } = useCollegeContext();
  const { selectedClass } = useClassContext();
  const { setSections, setAllSections, setIsLoadingSections, setSelectedSection, allSections } = useSectionContext();
  const { permissions, userContext } = usePermissions();
  const previousClassRef = useRef<number | null>(null);

  // Fetch ALL sections for the college upfront (not per-class)
  const query = useQuery({
    queryKey: ['context', 'allSections', selectedCollege, permissions?.isTeacher ? userContext?.userId : null],
    queryFn: () => fetchAllContextSections(
      selectedCollege || undefined,
      permissions?.isTeacher ? userContext?.userId : undefined
    ),
    enabled: permissions?.canChooseSection !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Store all sections when data arrives
  useEffect(() => {
    if (query.data?.results) {
      setAllSections(query.data.results);
    }
    setIsLoadingSections(query.isLoading);
  }, [query.data, query.isLoading, setAllSections, setIsLoadingSections]);

  // Filter sections client-side when class changes — instant, no network call
  useEffect(() => {
    if (selectedClass) {
      const filtered = allSections.filter(s => s.class_obj === selectedClass);
      setSections(filtered);
    } else {
      setSections([]);
    }
  }, [selectedClass, allSections, setSections]);

  // Reset section selection ONLY when class actually changes value (not on first render)
  useEffect(() => {
    if (previousClassRef.current !== null && previousClassRef.current !== selectedClass) {
      setSelectedSection(null);
    }
    previousClassRef.current = selectedClass;
  }, [selectedClass, setSelectedSection]);

  return query;
};

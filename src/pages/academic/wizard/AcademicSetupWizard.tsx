/**
 * Academic Structure Blueprint — Premium Edition.
 *
 * Visual design: Gradient borders, glowing cards, 3D depth, animated counters,
 * card-based tree nodes, rich color palette, micro-interactions everywhere.
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  Rocket,
  RotateCcw,
  Scroll,
  Settings2,
  Sparkles,
  Trash2,
  Users,
  Wand2,
  X,
  Zap
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { InlineCreateAcademicSession } from '../../../components/common/InlineCreateAcademicSession';
import { InlineCreateFaculty } from '../../../components/common/InlineCreateFaculty';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelectWithCreate } from '../../../components/ui/searchable-select-with-create';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { useSuperAdminContext } from '../../../contexts/SuperAdminContext';
import { useFacultiesSWR } from '../../../hooks/useAcademicSWR';
import { useAuth } from '../../../hooks/useAuth';
import { useAcademicSessionsSWR } from '../../../hooks/useCoreSWR';
import { classApi, programApi, sectionApi } from '../../../services/academic.service';
import { getCurrentUserCollege, isSuperAdmin } from '../../../utils/auth.utils';

// ============================================================================
// TYPES
// ============================================================================

interface BlueprintSection {
  id: string;
  name: string;
  maxStudents: number;
}

interface BlueprintClass {
  id: string;
  name: string;
  semester: number;
  year: number;
  maxStudents: number;
  sections: BlueprintSection[];
  collapsed: boolean;
}

interface BlueprintState {
  programName: string;
  programCode: string;
  shortName: string;
  programType: string;
  faculty: number;
  academicSession: number;
  duration: number;
  durationType: string;
  totalCredits: string;
  description: string;
  defaultSections: number;
  classes: BlueprintClass[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DURATION_CHIPS = [1, 2, 3, 4, 5, 6];

const PROGRAM_TYPES = [
  { value: 'undergraduate', label: 'UG', full: 'Undergraduate', icon: GraduationCap },
  { value: 'postgraduate', label: 'PG', full: 'Postgraduate', icon: BookOpen },
  { value: 'diploma', label: 'Diploma', full: 'Diploma', icon: Scroll },
  { value: 'certificate', label: 'Cert', full: 'Certificate', icon: Award },
];

const DURATION_TYPES = [
  { value: 'years', label: 'Years', icon: Calendar },
  { value: 'semesters', label: 'Semesters', icon: BookOpen },
  { value: 'months', label: 'Months', icon: Clock },
];

const SECTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const SECTION_PRESETS = [
  { count: 1, label: 'A' },
  { count: 2, label: 'A, B' },
  { count: 3, label: 'A, B, C' },
  { count: 4, label: 'A-D' },
];

// Year accent colours — rich gradients for tree
const YEAR_COLORS = [
  { gradient: 'from-blue-500 to-cyan-400', light: 'bg-blue-500/8', text: 'text-blue-500', border: 'border-blue-400/30', badge: 'bg-blue-500/15 text-blue-600', glow: 'shadow-blue-500/10' },
  { gradient: 'from-violet-500 to-purple-400', light: 'bg-violet-500/8', text: 'text-violet-500', border: 'border-violet-400/30', badge: 'bg-violet-500/15 text-violet-600', glow: 'shadow-violet-500/10' },
  { gradient: 'from-amber-500 to-orange-400', light: 'bg-amber-500/8', text: 'text-amber-500', border: 'border-amber-400/30', badge: 'bg-amber-500/15 text-amber-600', glow: 'shadow-amber-500/10' },
  { gradient: 'from-emerald-500 to-teal-400', light: 'bg-emerald-500/8', text: 'text-emerald-500', border: 'border-emerald-400/30', badge: 'bg-emerald-500/15 text-emerald-600', glow: 'shadow-emerald-500/10' },
  { gradient: 'from-rose-500 to-pink-400', light: 'bg-rose-500/8', text: 'text-rose-500', border: 'border-rose-400/30', badge: 'bg-rose-500/15 text-rose-600', glow: 'shadow-rose-500/10' },
  { gradient: 'from-cyan-500 to-sky-400', light: 'bg-cyan-500/8', text: 'text-cyan-500', border: 'border-cyan-400/30', badge: 'bg-cyan-500/15 text-cyan-600', glow: 'shadow-cyan-500/10' },
];

// ============================================================================
// INFERRED DEFAULTS
// ============================================================================

interface InferredDefaults {
  duration: number;
  durationType: string;
  programType: string;
}

const INFER_RULES: { pattern: RegExp; defaults: InferredDefaults }[] = [
  { pattern: /\bb\.?\s*tech/, defaults: { duration: 4, durationType: 'years', programType: 'undergraduate' } },
  { pattern: /\bb\.?\s*e\b/, defaults: { duration: 4, durationType: 'years', programType: 'undergraduate' } },
  { pattern: /\bengineering\b/, defaults: { duration: 4, durationType: 'years', programType: 'undergraduate' } },
  { pattern: /\bintegrated\b/, defaults: { duration: 5, durationType: 'years', programType: 'undergraduate' } },
  { pattern: /\bb\.?\s*sc/, defaults: { duration: 3, durationType: 'years', programType: 'undergraduate' } },
  { pattern: /\bb\.?\s*a\b/, defaults: { duration: 3, durationType: 'years', programType: 'undergraduate' } },
  { pattern: /\bb\.?\s*com/, defaults: { duration: 3, durationType: 'years', programType: 'undergraduate' } },
  { pattern: /\bb\.?\s*c\.?\s*a\b/, defaults: { duration: 3, durationType: 'years', programType: 'undergraduate' } },
  { pattern: /\bbca\b/, defaults: { duration: 3, durationType: 'years', programType: 'undergraduate' } },
  { pattern: /\bbba\b/, defaults: { duration: 3, durationType: 'years', programType: 'undergraduate' } },
  { pattern: /\bb\.?\s*des/, defaults: { duration: 4, durationType: 'years', programType: 'undergraduate' } },
  { pattern: /\bbachelor/, defaults: { duration: 3, durationType: 'years', programType: 'undergraduate' } },
  { pattern: /\bm\.?\s*tech/, defaults: { duration: 2, durationType: 'years', programType: 'postgraduate' } },
  { pattern: /\bm\.?\s*e\b/, defaults: { duration: 2, durationType: 'years', programType: 'postgraduate' } },
  { pattern: /\bm\.?\s*sc/, defaults: { duration: 2, durationType: 'years', programType: 'postgraduate' } },
  { pattern: /\bm\.?\s*a\b/, defaults: { duration: 2, durationType: 'years', programType: 'postgraduate' } },
  { pattern: /\bm\.?\s*com/, defaults: { duration: 2, durationType: 'years', programType: 'postgraduate' } },
  { pattern: /\bmca\b/, defaults: { duration: 2, durationType: 'years', programType: 'postgraduate' } },
  { pattern: /\bmba\b/, defaults: { duration: 2, durationType: 'years', programType: 'postgraduate' } },
  { pattern: /\bmaster/, defaults: { duration: 2, durationType: 'years', programType: 'postgraduate' } },
  { pattern: /\bmca.*3/, defaults: { duration: 3, durationType: 'years', programType: 'postgraduate' } },
  { pattern: /\bdiploma\b/, defaults: { duration: 3, durationType: 'years', programType: 'diploma' } },
  { pattern: /\bpoly/, defaults: { duration: 3, durationType: 'years', programType: 'diploma' } },
  { pattern: /\bcertificate\b/, defaults: { duration: 1, durationType: 'years', programType: 'certificate' } },
  { pattern: /\bcert\b/, defaults: { duration: 6, durationType: 'months', programType: 'certificate' } },
  { pattern: /\bph\.?\s*d/, defaults: { duration: 3, durationType: 'years', programType: 'postgraduate' } },
  { pattern: /\bdoctoral/, defaults: { duration: 3, durationType: 'years', programType: 'postgraduate' } },
];

function inferDefaults(name: string): InferredDefaults | null {
  const lower = name.toLowerCase().trim();
  if (!lower) return null;
  for (const rule of INFER_RULES) {
    if (rule.pattern.test(lower)) return rule.defaults;
  }
  return null;
}

const DRAFT_KEY = 'ACADEMIC_BLUEPRINT_DRAFT';

let _counter = 0;
const uid = () => `n${++_counter}_${Date.now()}`;

// ============================================================================
// HELPERS
// ============================================================================

function buildClasses(duration: number, durationType: string, defaultSections: number): BlueprintClass[] {
  const semCount = durationType === 'semesters' ? duration
    : durationType === 'years' ? duration * 2
      : Math.max(1, Math.ceil(duration / 6));

  return Array.from({ length: semCount }, (_, i) => ({
    id: uid(),
    name: `Semester ${i + 1}`,
    semester: i + 1,
    year: Math.ceil((i + 1) / 2),
    maxStudents: 60,
    collapsed: false,
    sections: Array.from({ length: defaultSections }, (_, j) => ({
      id: uid(),
      name: `Section ${SECTION_LETTERS[j]}`,
      maxStudents: 30,
    })),
  }));
}

function groupByYear(classes: BlueprintClass[]): Map<number, BlueprintClass[]> {
  const map = new Map<number, BlueprintClass[]>();
  for (const cls of classes) {
    const arr = map.get(cls.year) || [];
    arr.push(cls);
    map.set(cls.year, arr);
  }
  return map;
}

// ============================================================================
// ANIMATED COUNTER — numbers roll up/down
// ============================================================================

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="inline-block tabular-nums"
      transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
    >
      {value.toLocaleString()}
    </motion.span>
  );
}

// ============================================================================
// GRADIENT BORDER CARD — the glowing card wrapper
// ============================================================================

function GlowCard({
  children,
  className = '',
  glowColor = 'from-primary/20 via-violet-500/20 to-cyan-500/20',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  return (
    <div className={`relative group/card ${className}`}>
      {/* Animated gradient border glow */}
      <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${glowColor} opacity-0 group-hover/card:opacity-100 blur-sm transition-opacity duration-500`} />
      <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${glowColor} opacity-40`} />
      {/* Inner */}
      <div className="relative rounded-2xl bg-background/95 backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// INLINE-EDIT
// ============================================================================

function InlineEdit({
  value,
  onChange,
  className = '',
  placeholder = '',
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft !== value) onChange(draft.trim());
    else setDraft(value);
  };

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className={`cursor-text hover:bg-white/5 rounded px-1.5 -mx-1 transition-all duration-200 border border-transparent hover:border-primary/20 ${className}`}
        title="Click to edit"
      >
        {value || <span className="text-muted-foreground italic">{placeholder}</span>}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
      className={`bg-primary/5 border border-primary/30 rounded px-1.5 -mx-1 outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
      style={{ width: `${Math.max(draft.length, 4) + 2}ch` }}
    />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AcademicSetupWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedCollege } = useSuperAdminContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const collegeId = useMemo(
    () => (isSuperAdmin(user as any) ? selectedCollege : getCurrentUserCollege(user as any)) || 0,
    [user, selectedCollege],
  );

  const { results: faculties = [], isLoading: loadingFaculties, refresh: refetchFaculties } = useFacultiesSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { results: sessions = [], isLoading: loadingSessions, refresh: refetchSessions } = useAcademicSessionsSWR({ page_size: DROPDOWN_PAGE_SIZE });

  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState('');
  const [createdNodes, setCreatedNodes] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const [bp, setBp] = useState<BlueprintState>(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      programName: '', programCode: '', shortName: '', programType: 'undergraduate',
      faculty: 0, academicSession: 0, duration: 4, durationType: 'years',
      totalCredits: '', description: '', defaultSections: 2,
      classes: buildClasses(4, 'years', 2),
    };
  });

  useEffect(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(bp)); }, [bp]);

  const totalClasses = bp.classes.length;
  const totalSections = bp.classes.reduce((s: number, c: BlueprintClass) => s + c.sections.length, 0);
  const totalCapacity = bp.classes.reduce((s: number, c: BlueprintClass) => s + c.sections.reduce((ss: number, sec: BlueprintSection) => ss + sec.maxStudents, 0), 0);
  const yearGroups = useMemo(() => groupByYear(bp.classes), [bp.classes]);

  const set = useCallback(<K extends keyof BlueprintState>(k: K, v: BlueprintState[K]) => {
    setBp(prev => ({ ...prev, [k]: v }));
  }, []);

  useEffect(() => {
    if (faculties.length > 0 && !bp.faculty) set('faculty', (faculties[0] as any).id);
  }, [faculties]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sessions.length > 0 && !bp.academicSession) set('academicSession', (sessions[0] as any).id);
  }, [sessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastInferRef = useRef<string>('');
  useEffect(() => {
    const inferred = inferDefaults(bp.programName);
    if (!inferred) return;
    const sig = `${inferred.duration}-${inferred.durationType}-${inferred.programType}`;
    if (sig === lastInferRef.current) return;
    lastInferRef.current = sig;
    setBp(prev => ({
      ...prev, programType: inferred.programType, duration: inferred.duration,
      durationType: inferred.durationType,
      classes: buildClasses(inferred.duration, inferred.durationType, prev.defaultSections),
    }));
  }, [bp.programName]);

  const setDuration = useCallback((d: number) => {
    setBp(prev => ({ ...prev, duration: d, classes: buildClasses(d, prev.durationType, prev.defaultSections) }));
  }, []);

  const setDurationType = useCallback((dt: string) => {
    setBp(prev => ({ ...prev, durationType: dt, classes: buildClasses(prev.duration, dt, prev.defaultSections) }));
  }, []);

  const setDefaultSections = useCallback((ds: number) => {
    setBp(prev => ({ ...prev, defaultSections: ds, classes: buildClasses(prev.duration, prev.durationType, ds) }));
  }, []);

  const updateClass = useCallback((id: string, patch: Partial<BlueprintClass>) => {
    setBp(prev => ({ ...prev, classes: prev.classes.map(c => c.id === id ? { ...c, ...patch } : c) }));
  }, []);

  const removeClass = useCallback((id: string) => {
    setBp(prev => ({ ...prev, classes: prev.classes.filter(c => c.id !== id) }));
  }, []);

  const addClass = useCallback(() => {
    setBp(prev => {
      const nextSem = prev.classes.length > 0 ? Math.max(...prev.classes.map(c => c.semester)) + 1 : 1;
      return {
        ...prev, classes: [...prev.classes, {
          id: uid(), name: `Semester ${nextSem}`, semester: nextSem,
          year: Math.ceil(nextSem / 2), maxStudents: 60, collapsed: false,
          sections: Array.from({ length: prev.defaultSections }, (_, j) => ({
            id: uid(), name: `Section ${SECTION_LETTERS[j]}`, maxStudents: 30,
          })),
        }]
      };
    });
  }, []);

  const addSection = useCallback((classId: string) => {
    setBp(prev => ({
      ...prev, classes: prev.classes.map(c => {
        if (c.id !== classId) return c;
        const letter = SECTION_LETTERS[c.sections.length] || `${c.sections.length + 1}`;
        return { ...c, sections: [...c.sections, { id: uid(), name: `Section ${letter}`, maxStudents: 30 }] };
      })
    }));
  }, []);

  const updateSection = useCallback((classId: string, secId: string, patch: Partial<BlueprintSection>) => {
    setBp(prev => ({
      ...prev, classes: prev.classes.map(c => {
        if (c.id !== classId) return c;
        return { ...c, sections: c.sections.map(s => s.id === secId ? { ...s, ...patch } : s) };
      })
    }));
  }, []);

  const removeSection = useCallback((classId: string, secId: string) => {
    setBp(prev => ({
      ...prev, classes: prev.classes.map(c => {
        if (c.id !== classId) return c;
        return { ...c, sections: c.sections.filter(s => s.id !== secId) };
      })
    }));
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setBp(prev => ({ ...prev, classes: prev.classes.map(c => c.id === id ? { ...c, collapsed: !c.collapsed } : c) }));
  }, []);

  const handleFacultyCreated = async (id: number) => { await refetchFaculties(); set('faculty', id); setShowFacultyModal(false); };
  const handleSessionCreated = async (id: number) => { await refetchSessions(); set('academicSession', id); setShowSessionModal(false); };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    lastInferRef.current = '';
    setBp({
      programName: '', programCode: '', shortName: '', programType: 'undergraduate',
      faculty: faculties.length > 0 ? (faculties[0] as any).id : 0,
      academicSession: sessions.length > 0 ? (sessions[0] as any).id : 0,
      duration: 4, durationType: 'years', totalCredits: '', description: '',
      defaultSections: 2, classes: buildClasses(4, 'years', 2),
    });
    setCreatedNodes(new Set());
    toast.info('Blueprint cleared.');
  };

  const handleCreate = async () => {
    if (!bp.programName.trim()) { toast.error('Enter a program name.'); return; }
    if (!bp.programCode.trim()) { toast.error('Enter a program code.'); return; }
    if (!bp.shortName.trim()) { toast.error('Enter a short name.'); return; }
    if (!bp.faculty) { toast.error('Select a faculty.'); return; }
    if (!bp.academicSession) { toast.error('Select an academic session.'); return; }
    if (bp.classes.length === 0) { toast.error('Add at least one class.'); return; }
    if (!collegeId) { toast.error('Select a college from the header.'); return; }
    for (const cls of bp.classes) {
      if (!cls.name.trim()) { toast.error(`A class is missing a name.`); return; }
      if (cls.sections.length === 0) { toast.error(`"${cls.name}" needs at least one section.`); return; }
    }

    try {
      setIsSubmitting(true); setCreatedNodes(new Set());
      setProgress('Creating program...');
      const program = await programApi.create({
        college: collegeId, faculty: bp.faculty, code: bp.programCode,
        name: bp.programName, short_name: bp.shortName, program_type: bp.programType,
        duration: bp.duration, duration_type: bp.durationType,
        total_credits: bp.totalCredits ? parseInt(bp.totalCredits) : null,
        description: bp.description || null, is_active: true,
      });
      setCreatedNodes(prev => new Set(prev).add('program'));

      for (let i = 0; i < bp.classes.length; i++) {
        const cls = bp.classes[i];
        setProgress(`Creating ${cls.name}...`);
        const created = await classApi.create({
          college: collegeId, program: program.id, academic_session: bp.academicSession,
          name: cls.name, semester: cls.semester, year: cls.year,
          max_students: cls.maxStudents, is_active: true,
        });
        setCreatedNodes(prev => new Set(prev).add(cls.id));
        for (const sec of cls.sections) {
          await sectionApi.create({
            class_obj: created.id, name: sec.name,
            max_students: sec.maxStudents, is_active: true, college: collegeId,
          });
          setCreatedNodes(prev => new Set(prev).add(sec.id));
        }
      }

      localStorage.removeItem(DRAFT_KEY); setProgress('');
      setShowConfetti(true);
      toast.success(`Created "${bp.programName}" — ${totalClasses} classes, ${totalSections} sections!`);
      setTimeout(() => { setShowConfetti(false); navigate('/academic/programs'); }, 3500);
    } catch (err: any) {
      console.error('Blueprint create error:', err);
      toast.error(typeof err.message === 'string' ? err.message : 'Failed to create. Partial data may exist.');
    } finally { setIsSubmitting(false); setProgress(''); }
  };

  const inferred = inferDefaults(bp.programName);
  const inferredLabel = inferred
    ? `${inferred.duration} ${inferred.durationType}, ${PROGRAM_TYPES.find(p => p.value === inferred.programType)?.full}`
    : null;

  // Completion percentage for progress ring
  const totalNodes = 1 + bp.classes.length + totalSections;
  const createdCount = createdNodes.size;
  const progressPct = totalNodes > 0 ? Math.round((createdCount / totalNodes) * 100) : 0;

  // ── RENDER ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative min-h-[calc(100vh-4rem)] pb-44 overflow-x-hidden">
      {/* ── AMBIENT BACKGROUND ──────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/3 -left-1/4 w-[60%] h-[60%] bg-gradient-to-br from-primary/[0.06] to-violet-500/[0.04] rounded-full blur-[100px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[50%] bg-gradient-to-tl from-cyan-500/[0.04] to-primary/[0.02] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-violet-500/[0.02] rounded-full blur-[80px]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      {showConfetti && (
        <Confetti
          width={containerRef.current?.offsetWidth || window.innerWidth}
          height={containerRef.current?.offsetHeight || window.innerHeight}
          recycle={false} numberOfPieces={500} gravity={0.12}
        />
      )}

      <div className="max-w-6xl mx-auto px-6 pt-8 flex flex-col gap-8">

        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            {/* Glowing icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-violet-500 rounded-2xl blur-lg opacity-40" />
              <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-xl shadow-primary/25">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                Academic Blueprint
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Design your entire academic structure visually
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearDraft} disabled={isSubmitting} className="text-muted-foreground gap-1.5 hover:text-foreground">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} disabled={isSubmitting} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
          </div>
        </motion.div>

        {/* ── CONTROL DECK ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* IDENTITY ZONE */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <GlowCard glowColor="from-primary/20 via-violet-500/15 to-transparent">
              <div className="p-6 space-y-5">
                {/* Zone header */}
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">Identity</h2>
                    <p className="text-[11px] text-muted-foreground">What is this program?</p>
                  </div>
                </div>

                {/* Hero program name */}
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      value={bp.programName}
                      onChange={e => set('programName', e.target.value)}
                      placeholder="Type a program — B.Tech, BCA, MBA..."
                      className="h-14 text-xl font-bold border-2 border-border/40 focus:border-primary/60 bg-muted/20 rounded-xl placeholder:text-muted-foreground/30 placeholder:font-normal placeholder:text-base pr-10"
                      disabled={isSubmitting}
                    />
                    {bp.programName && inferred && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <Wand2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <AnimatePresence>
                    {bp.programName && inferredLabel && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -6, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                          <Wand2 className="h-3 w-3 text-primary shrink-0" />
                          <span className="text-xs text-primary font-medium">Auto-configured: {inferredLabel}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Code + Short Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">Program Code</Label>
                    <Input
                      value={bp.programCode}
                      onChange={e => set('programCode', e.target.value)}
                      placeholder="BCA"
                      className="h-11 text-base font-semibold border-border/40 bg-muted/20 rounded-xl"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">Short Name</Label>
                    <Input
                      value={bp.shortName}
                      onChange={e => set('shortName', e.target.value)}
                      placeholder="BCA"
                      className="h-11 text-base font-semibold border-border/40 bg-muted/20 rounded-xl"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Program Type — rich segmented with emoji */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">Program Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {PROGRAM_TYPES.map(pt => (
                      <motion.button
                        key={pt.value}
                        onClick={() => set('programType', pt.value)}
                        disabled={isSubmitting}
                        whileTap={{ scale: 0.97 }}
                        className={`relative h-20 flex flex-col items-center justify-center rounded-xl transition-all duration-200 ${bp.programType === pt.value
                          ? 'bg-primary/10 border-2 border-primary/40 shadow-md shadow-primary/10'
                          : 'bg-muted/30 border-2 border-transparent hover:border-border/60 hover:bg-muted/50'
                          }`}
                      >
                        <div className={`mb-1.5 rounded-lg p-1.5 transition-colors ${bp.programType === pt.value ? 'bg-primary/20 text-primary' : 'bg-transparent text-muted-foreground'}`}>
                          <pt.icon className="h-5 w-5" />
                        </div>
                        <div className={`text-xs font-bold ${bp.programType === pt.value ? 'text-primary' : 'text-muted-foreground'}`}>
                          {pt.label}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </GlowCard>
          </motion.div>

          {/* STRUCTURE ZONE */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <GlowCard glowColor="from-cyan-500/15 via-primary/15 to-transparent">
              <div className="p-6 space-y-5">
                {/* Zone header */}
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-primary/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">Structure</h2>
                    <p className="text-[11px] text-muted-foreground">How is it organized?</p>
                  </div>
                </div>

                {/* Duration — chunky pills */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">Duration</Label>
                  <div className="flex gap-2">
                    {DURATION_CHIPS.map(d => (
                      <motion.button
                        key={d}
                        onClick={() => setDuration(d)}
                        disabled={isSubmitting}
                        whileTap={{ scale: 0.92 }}
                        className={`relative h-12 flex-1 rounded-xl text-base font-extrabold transition-all duration-200 overflow-hidden ${bp.duration === d
                          ? 'text-white shadow-lg shadow-primary/30'
                          : 'bg-muted/30 border-2 border-border/30 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                          }`}
                      >
                        {bp.duration === d && (
                          <motion.div
                            layoutId="dur-pill"
                            className="absolute inset-0 bg-gradient-to-r from-primary to-violet-500"
                            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                          />
                        )}
                        <span className="relative z-10">{d}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Duration Type */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">Unit</Label>
                  <div className="flex rounded-xl bg-muted/25 border border-border/30 p-1.5 gap-1.5">
                    {DURATION_TYPES.map(dt => (
                      <motion.button
                        key={dt.value}
                        onClick={() => setDurationType(dt.value)}
                        disabled={isSubmitting}
                        className={`relative flex-1 h-10 rounded-lg text-sm font-semibold transition-colors ${bp.durationType === dt.value ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        {bp.durationType === dt.value && (
                          <motion.div
                            layoutId="unit-pill"
                            className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/60"
                            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <dt.icon className="h-4 w-4" />
                          {dt.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">Sections per Class</Label>
                  <div className="flex rounded-xl bg-muted/25 border border-border/30 p-1.5 gap-1.5">
                    {SECTION_PRESETS.map(sp => (
                      <motion.button
                        key={sp.count}
                        onClick={() => setDefaultSections(sp.count)}
                        disabled={isSubmitting}
                        className={`relative flex-1 h-10 rounded-lg text-xs font-bold transition-colors ${bp.defaultSections === sp.count ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        {bp.defaultSections === sp.count && (
                          <motion.div
                            layoutId="sec-pill"
                            className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/60"
                            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                          />
                        )}
                        <span className="relative z-10">{sp.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Advanced toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1 group"
                >
                  <Settings2 className="h-3.5 w-3.5 group-hover:rotate-45 transition-transform duration-300" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  <motion.div animate={{ rotate: showAdvanced ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight className="h-3 w-3" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pt-2 border-t border-border/20">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">Faculty</Label>
                            <SearchableSelectWithCreate
                              value={bp.faculty?.toString() || ''}
                              onChange={(v: string | number) => set('faculty', parseInt(String(v)))}
                              options={faculties.map((f: any) => ({ value: f.id.toString(), label: f.name }))}
                              placeholder="Select faculty..."
                              onCreateNew={() => setShowFacultyModal(true)}
                              createButtonText="Create Faculty"
                              isLoading={loadingFaculties}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">Session</Label>
                            <SearchableSelectWithCreate
                              value={bp.academicSession?.toString() || ''}
                              onChange={(v: string | number) => set('academicSession', parseInt(String(v)))}
                              options={sessions.map((s: any) => ({ value: s.id.toString(), label: s.name }))}
                              placeholder="Select session..."
                              onCreateNew={() => setShowSessionModal(true)}
                              createButtonText="Create Session"
                              isLoading={loadingSessions}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">Credits</Label>
                            <Input value={bp.totalCredits} onChange={e => set('totalCredits', e.target.value)}
                              placeholder="160" type="number" min={1} disabled={isSubmitting}
                              className="h-10 border-border/40 bg-muted/20 rounded-xl" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">Description</Label>
                            <Input value={bp.description} onChange={e => set('description', e.target.value)}
                              placeholder="Optional..." disabled={isSubmitting}
                              className="h-10 border-border/40 bg-muted/20 rounded-xl" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlowCard>
          </motion.div>
        </div>

        {/* ── LIVE CANVAS — Year-Grouped Tree ──────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlowCard glowColor="from-primary/10 via-cyan-500/10 to-violet-500/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">Live Structure Preview</h2>
                    <p className="text-[11px] text-muted-foreground">Click any name to edit it inline</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={addClass} disabled={isSubmitting}
                  className="h-9 text-xs rounded-xl border-dashed border-2 hover:border-primary/40 hover:bg-primary/5 gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Semester
                </Button>
              </div>

              {bp.classes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 opacity-30" />
                  </div>
                  <p className="text-sm font-medium">No semesters yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Pick a duration above to auto-generate</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Program Root — hero card */}
                  <motion.div layout className="relative overflow-hidden rounded-xl border-2 border-primary/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.06] via-violet-500/[0.03] to-transparent" />
                    <div className="relative flex items-center gap-3 py-3.5 px-5">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${createdNodes.has('program')
                        ? 'bg-green-500/15 shadow-md shadow-green-500/10'
                        : 'bg-gradient-to-br from-primary/15 to-violet-500/15'
                        }`}>
                        <GraduationCap className={`h-5 w-5 ${createdNodes.has('program') ? 'text-green-500' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base truncate">
                          {bp.programName || <span className="text-muted-foreground/40 font-normal italic">Enter program name above</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {bp.programCode && (
                            <Badge variant="outline" className="text-[10px] font-bold h-5">{bp.programCode}</Badge>
                          )}
                          {bp.programType && (
                            <Badge className="text-[10px] font-bold h-5 bg-primary/10 text-primary border-0 hover:bg-primary/10">
                              {PROGRAM_TYPES.find(p => p.value === bp.programType)?.full}
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {bp.duration} {bp.durationType}
                          </span>
                        </div>
                      </div>
                      {createdNodes.has('program') && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <div className="h-7 w-7 rounded-full bg-green-500/15 flex items-center justify-center">
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Year Groups */}
                  <AnimatePresence initial={false}>
                    {Array.from(yearGroups.entries()).map(([year, classes]) => {
                      const color = YEAR_COLORS[(year - 1) % YEAR_COLORS.length];
                      return (
                        <motion.div
                          key={`year-${year}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.3, delay: (year - 1) * 0.06 }}
                          className="ml-2"
                        >
                          {/* Year header bar */}
                          <div className={`flex items-center gap-3 mb-2`}>
                            <div className={`h-8 w-1 rounded-full bg-gradient-to-b ${color.gradient}`} />
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color.light}`}>
                              <Calendar className={`h-3.5 w-3.5 ${color.text}`} />
                              <span className={`text-xs font-extrabold uppercase tracking-widest ${color.text}`}>
                                Year {year}
                              </span>
                            </div>
                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${color.badge}`}>
                              {classes.length} {classes.length === 1 ? 'sem' : 'sems'}
                            </span>
                            <div className="flex-1 h-px bg-border/20" />
                          </div>

                          {/* Semester cards */}
                          <div className="ml-5 space-y-2 border-l-2 border-border/15 pl-5">
                            {classes.map((cls) => (
                              <div key={cls.id}>
                                <motion.div
                                  layout
                                  className={`group rounded-xl border transition-all duration-200 ${createdNodes.has(cls.id)
                                    ? 'border-green-500/30 bg-green-500/[0.03] shadow-sm shadow-green-500/5'
                                    : `${color.border} hover:shadow-md ${color.glow} hover:border-opacity-60 bg-background/50`
                                    }`}
                                >
                                  <div className="flex items-center gap-2.5 py-2.5 px-4">
                                    <button
                                      onClick={() => toggleCollapse(cls.id)}
                                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <motion.div animate={{ rotate: cls.collapsed ? 0 : 90 }} transition={{ duration: 0.15 }}>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                      </motion.div>
                                    </button>

                                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${createdNodes.has(cls.id) ? 'bg-green-500/15' : color.light
                                      }`}>
                                      <BookOpen className={`h-3.5 w-3.5 ${createdNodes.has(cls.id) ? 'text-green-500' : color.text}`} />
                                    </div>

                                    <InlineEdit
                                      value={cls.name}
                                      onChange={v => updateClass(cls.id, { name: v })}
                                      className="text-sm font-semibold"
                                    />

                                    <Badge variant="secondary" className="text-[10px] shrink-0 bg-muted/40 font-semibold">
                                      {cls.sections.length} {cls.sections.length === 1 ? 'section' : 'sections'}
                                    </Badge>

                                    {createdNodes.has(cls.id) && (
                                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                      </motion.div>
                                    )}

                                    <div className="ml-auto flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                      <button onClick={() => addSection(cls.id)}
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Add section">
                                        <Plus className="h-3.5 w-3.5" />
                                      </button>
                                      <button onClick={() => removeClass(cls.id)}
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Remove">
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Section children */}
                                  <AnimatePresence initial={false}>
                                    {!cls.collapsed && cls.sections.length > 0 && (
                                      <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="border-t border-border/10 px-4 py-2 space-y-0.5">
                                          {cls.sections.map((sec, secIdx) => (
                                            <motion.div
                                              key={sec.id}
                                              initial={{ opacity: 0, x: -8 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              exit={{ opacity: 0, x: -8 }}
                                              transition={{ duration: 0.15, delay: secIdx * 0.03 }}
                                              className={`group/sec flex items-center gap-2.5 py-1.5 px-3 ml-4 rounded-lg transition-all duration-150
                                                ${createdNodes.has(sec.id) ? 'bg-green-500/5' : 'hover:bg-muted/30'}`}
                                            >
                                              <div className="w-4 h-px bg-border/30" />
                                              <div className={`h-5 w-5 rounded-md flex items-center justify-center ${createdNodes.has(sec.id) ? 'bg-green-500/10' : 'bg-muted/40'
                                                }`}>
                                                <Layers className={`h-3 w-3 ${createdNodes.has(sec.id) ? 'text-green-500' : 'text-muted-foreground/50'}`} />
                                              </div>

                                              <InlineEdit
                                                value={sec.name}
                                                onChange={v => updateSection(cls.id, sec.id, { name: v })}
                                                className="text-sm text-muted-foreground"
                                              />

                                              {createdNodes.has(sec.id) && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                  <Check className="h-3 w-3 text-green-500" />
                                                </motion.div>
                                              )}

                                              <button
                                                onClick={() => removeSection(cls.id, sec.id)}
                                                className="ml-auto p-1 rounded-md text-transparent group-hover/sec:text-muted-foreground hover:!text-destructive hover:bg-destructive/10 transition-all"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            </motion.div>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </GlowCard>
        </motion.div>
      </div>

      {/* ── FLOATING BOTTOM BAR ──────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 lg:left-64 z-50 pointer-events-none transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 pb-4 md:px-6 md:pb-5">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring', bounce: 0.15 }}
            className="pointer-events-auto"
          >
            <div className="relative">
              {/* Glow behind the bar */}
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 via-violet-500/5 to-cyan-500/10 rounded-3xl blur-xl opacity-60" />

              <div className="relative rounded-2xl border border-border/40 bg-background/95 backdrop-blur-2xl shadow-2xl shadow-black/15 px-4 py-3 md:px-6 md:py-3.5 flex flex-col md:flex-row items-center gap-4 md:gap-5">
                {/* Stats */}
                <div className="grid grid-cols-4 md:flex md:items-center md:gap-6 w-full md:w-auto md:flex-1 min-w-0">
                  {[
                    { icon: GraduationCap, color: 'text-primary', value: 1, label: 'Program' },
                    { icon: BookOpen, color: 'text-blue-500', value: totalClasses, label: 'Classes' },
                    { icon: Layers, color: 'text-violet-500', value: totalSections, label: 'Sections' },
                    { icon: Users, color: 'text-amber-500', value: totalCapacity, label: 'Capacity' },
                  ].map((stat, i) => (
                    <div key={stat.label} className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 text-center md:text-left">
                      {i > 0 && <div className="hidden md:block w-px h-6 bg-border/30 -ml-1.5" />}
                      <div className={`h-8 w-8 md:h-7 md:w-7 rounded-lg bg-muted/30 flex items-center justify-center mb-1 md:mb-0`}>
                        <stat.icon className={`h-4 w-4 md:h-3.5 md:w-3.5 ${stat.color}`} />
                      </div>
                      <div className="flex flex-col items-center md:items-start">
                        <span className="text-xs md:text-sm font-extrabold leading-none">
                          <AnimatedNumber value={stat.value} />
                        </span>
                        <span className="text-[10px] md:text-[9px] text-muted-foreground/70 font-medium uppercase tracking-wider mt-0.5 md:mt-0">{stat.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress indicator during submission */}
                <AnimatePresence>
                  {isSubmitting && progress && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex items-center gap-3 overflow-hidden w-full sm:w-auto justify-center sm:justify-start"
                    >
                      {/* Mini progress ring */}
                      <div className="relative h-8 w-8 shrink-0">
                        <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
                          <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="3" />
                          <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" className="text-primary" strokeWidth="3"
                            strokeDasharray={`${2 * Math.PI * 14}`}
                            strokeDashoffset={`${2 * Math.PI * 14 * (1 - progressPct / 100)}`}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-primary">{progressPct}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[140px]">{progress}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Launch button */}
                <motion.div className="w-full sm:w-auto" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={handleCreate}
                    disabled={isSubmitting || !bp.programName.trim()}
                    className="h-12 w-full sm:w-auto px-8 text-sm font-extrabold rounded-xl bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-xl shadow-primary/25 transition-all border-0 shrink-0"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Launch Structure
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <InlineCreateFaculty open={showFacultyModal} onOpenChange={setShowFacultyModal} onSuccess={handleFacultyCreated} collegeId={collegeId || undefined} />
      <InlineCreateAcademicSession open={showSessionModal} onOpenChange={setShowSessionModal} onSuccess={handleSessionCreated} collegeId={collegeId || undefined} />
    </div>
  );
}

export default AcademicSetupWizard;

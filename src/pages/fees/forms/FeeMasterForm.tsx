import { useEffect, useMemo, useState } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { InlineCreateAcademicYear } from '../../../components/common/InlineCreateAcademicYear';
import { InlineCreateFeeType } from '../../../components/common/InlineCreateFeeType';
import { InlineCreateProgram } from '../../../components/common/InlineCreateProgram';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelectWithCreate } from '../../../components/ui/searchable-select-with-create';
import { useProgramsSWR } from '../../../hooks/useAcademicSWR';
import { useAcademicYearsSWR } from '../../../hooks/useCoreSWR';
import { useFeeTypesSWR, invalidateFeeTypes } from '../../../hooks/swr';
import { FeeMaster, FeeMasterCreateInput } from '../../../types/fees.types';

interface FeeMasterFormProps {
  feeMaster: FeeMaster | null;
  onSubmit: (data: Partial<FeeMasterCreateInput>) => void;
  onCancel: () => void;
}

export const FeeMasterForm = ({ feeMaster, onSubmit, onCancel }: FeeMasterFormProps) => {
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showAcademicYearModal, setShowAcademicYearModal] = useState(false);
  const [showFeeTypeModal, setShowFeeTypeModal] = useState(false);

  const [formData, setFormData] = useState<Partial<FeeMasterCreateInput>>({
    semester: 1,
    amount: '0',
    college: 0,
    program: 0,
    academic_year: 0,
    fee_type: 0,
    is_active: true,
  });

  // Loading states for inline creation
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [isCreatingAcademicYear, setIsCreatingAcademicYear] = useState(false);
  const [isCreatingFeeType, setIsCreatingFeeType] = useState(false);

  // Fetch dropdowns data using SWR
  const { results: programs = [], isLoading: isLoadingPrograms, refresh: refetchPrograms } = useProgramsSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { results: academicYears = [], isLoading: isLoadingAcademicYears, refresh: refetchAcademicYears } = useAcademicYearsSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: feeTypesData, isLoading: isLoadingFeeTypes } = useFeeTypesSWR({ page_size: DROPDOWN_PAGE_SIZE });

  // Create options for dropdowns
  const programOptions = useMemo(() => {
    return programs.map((program) => ({
      value: program.id,
      label: program.name,
      subtitle: `${program.code || ''} • ${program.department_name || ''}`,
    }));
  }, [programs]);

  const academicYearOptions = useMemo(() => {
    return academicYears.map((year) => ({
      value: year.id,
      label: year.year || `Academic Year ${year.id}`,
      subtitle: year.description || `${year.start_date || ''} - ${year.end_date || ''}`,
    }));
  }, [academicYears]);

  const feeTypeOptions = useMemo(() => {
    if (!feeTypesData?.results) return [];
    return feeTypesData.results.map((feeType: any) => ({
      value: feeType.id,
      label: feeType.name || feeType.type_name || `Fee Type ${feeType.id}`,
      subtitle: feeType.description || feeType.code || '',
    }));
  }, [feeTypesData]);

  useEffect(() => {
    if (feeMaster) {
      setFormData({
        semester: feeMaster.semester,
        amount: feeMaster.amount,
        college: feeMaster.college,
        program: feeMaster.program,
        academic_year: feeMaster.academic_year,
        fee_type: feeMaster.fee_type,
        is_active: feeMaster.is_active,
      });
    } else {
      // Auto-populate college from user data
      const storedUser = localStorage.getItem('kumss_user');
      let collegeId = 1;

      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.college) {
          collegeId = user.college;
        } else if (user?.user_roles && user.user_roles.length > 0) {
          const primaryRole = user.user_roles.find((r: any) => r.is_primary) || user.user_roles[0];
          collegeId = primaryRole.college_id || 1;
        }
      }

      setFormData(prev => ({ ...prev, college: collegeId }));
    }
  }, [feeMaster]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('kumss_user_id') || undefined;
    const submitData: any = { ...formData };

    if (!feeMaster && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (feeMaster && userId) {
      submitData.updated_by = userId;
    }

    onSubmit(submitData);
  };

  const handleProgramCreated = async (programId: number) => {
    setIsCreatingProgram(true);
    try {
      await refetchPrograms();
      setFormData(prev => ({ ...prev, program: programId }));
    } finally {
      setIsCreatingProgram(false);
      setShowProgramModal(false);
    }
  };

  const handleAcademicYearCreated = async (yearId: number) => {
    setIsCreatingAcademicYear(true);
    try {
      await refetchAcademicYears();
      setFormData(prev => ({ ...prev, academic_year: yearId }));
    } finally {
      setIsCreatingAcademicYear(false);
      setShowAcademicYearModal(false);
    }
  };

  const handleFeeTypeCreated = async (feeTypeId: number) => {
    setIsCreatingFeeType(true);
    try {
      await invalidateFeeTypes();
      setFormData(prev => ({ ...prev, fee_type: feeTypeId }));
    } finally {
      setIsCreatingFeeType(false);
      setShowFeeTypeModal(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Configuration Section */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/20">
            <h3 className="font-semibold leading-none tracking-tight">Configuration details</h3>
            <p className="text-sm text-muted-foreground">Set up the structural elements.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="program">Program <span className="text-destructive">*</span></Label>
              <SearchableSelectWithCreate
                options={programOptions}
                value={formData.program || ''}
                onChange={(value) => setFormData({ ...formData, program: Number(value) })}
                placeholder="Select program"
                searchPlaceholder="Search programs..."
                emptyText="No programs available"
                isLoading={isLoadingPrograms || isCreatingProgram}
                disabled={!!feeMaster}
                onCreateNew={() => setShowProgramModal(true)}
                createButtonText="Create New Program"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic Year <span className="text-destructive">*</span></Label>
              <SearchableSelectWithCreate
                options={academicYearOptions}
                value={formData.academic_year || ''}
                onChange={(value) => setFormData({ ...formData, academic_year: Number(value) })}
                placeholder="Select academic year"
                searchPlaceholder="Search academic years..."
                emptyText="No academic years available"
                isLoading={isLoadingAcademicYears || isCreatingAcademicYear}
                onCreateNew={() => setShowAcademicYearModal(true)}
                createButtonText="Create New Academic Year"
              />
            </div>
          </div>
        </div>

        {/* Fee Details Section */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/20">
            <h3 className="font-semibold leading-none tracking-tight">Fee Specifics</h3>
            <p className="text-sm text-muted-foreground">Define fee type and amount.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fee_type">Fee Type <span className="text-destructive">*</span></Label>
              <SearchableSelectWithCreate
                options={feeTypeOptions}
                value={formData.fee_type || ''}
                onChange={(value) => setFormData({ ...formData, fee_type: Number(value) })}
                placeholder="Select fee type"
                searchPlaceholder="Search fee types..."
                emptyText="No fee types available"
                isLoading={isLoadingFeeTypes || isCreatingFeeType}
                onCreateNew={() => setShowFeeTypeModal(true)}
                createButtonText="Create New Fee Type"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester <span className="text-destructive">*</span></Label>
                <Input
                  id="semester"
                  type="number"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
                  placeholder="Semester number"
                  required
                  min="1"
                  max="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) <span className="text-destructive">*</span></Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t mt-2">
          <Button type="submit" className="flex-1">
            {feeMaster ? 'Update' : 'Create'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>

      <InlineCreateProgram
        open={showProgramModal}
        onOpenChange={setShowProgramModal}
        onSuccess={handleProgramCreated}
        collegeId={formData.college}
      />

      <InlineCreateAcademicYear
        open={showAcademicYearModal}
        onOpenChange={setShowAcademicYearModal}
        onSuccess={handleAcademicYearCreated}
        collegeId={formData.college}
      />

      <InlineCreateFeeType
        open={showFeeTypeModal}
        onOpenChange={setShowFeeTypeModal}
        onSuccess={handleFeeTypeCreated}
        collegeId={formData.college}
      />
    </>
  );
};

/**
 * Marking Register Page - Complete marking UI for students
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  AlertCircle,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  QuestionPaper,
  StudentAnswerSheet,
  StudentAnswer,
  mockQuestionPapers,
  mockStudentAnswerSheets,
  mockMarksheets,
} from '../../data/markingMockData';

const MarkingRegisterPage = () => {
  const { questionPaperId } = useParams();
  const navigate = useNavigate();

  const [questionPaper, setQuestionPaper] = useState<QuestionPaper | null>(null);
  const [answerSheets, setAnswerSheets] = useState<StudentAnswerSheet[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [currentSheet, setCurrentSheet] = useState<StudentAnswerSheet | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Load question paper
    const paper = mockQuestionPapers.find(p => p.id === parseInt(questionPaperId || '0'));
    setQuestionPaper(paper || null);

    // Load all answer sheets for this question paper
    const sheets = mockStudentAnswerSheets.filter(s => s.question_paper_id === parseInt(questionPaperId || '0'));
    setAnswerSheets(sheets);
    if (sheets.length > 0) {
      setCurrentSheet(sheets[0]);
    }
  }, [questionPaperId]);

  const handleMarksChange = (questionId: number, marks: string) => {
    if (!currentSheet) return;

    const marksNum = parseFloat(marks);
    const updatedAnswers = currentSheet.answers.map(ans => {
      if (ans.question_id === questionId) {
        const maxMarks = ans.max_marks;
        const validMarks = marksNum > maxMarks ? maxMarks : marksNum;
        return {
          ...ans,
          marks_obtained: isNaN(validMarks) ? null : validMarks,
          is_marked: !isNaN(validMarks),
        };
      }
      return ans;
    });

    setCurrentSheet({
      ...currentSheet,
      answers: updatedAnswers,
    });
    setIsDirty(true);
  };

  const handleRemarksChange = (questionId: number, remarks: string) => {
    if (!currentSheet) return;

    const updatedAnswers = currentSheet.answers.map(ans => {
      if (ans.question_id === questionId) {
        return { ...ans, remarks };
      }
      return ans;
    });

    setCurrentSheet({
      ...currentSheet,
      answers: updatedAnswers,
    });
    setIsDirty(true);
  };

  const calculateTotal = () => {
    if (!currentSheet) return { obtained: 0, max: 0, percentage: 0 };

    const obtained = currentSheet.answers.reduce((sum, ans) => {
      return sum + (ans.marks_obtained || 0);
    }, 0);

    const max = currentSheet.answers.reduce((sum, ans) => sum + ans.max_marks, 0);
    const percentage = max > 0 ? (obtained / max) * 100 : 0;

    return { obtained, max, percentage };
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const handleSave = () => {
    setIsDirty(false);
    toast.success('Progress saved successfully!');
  };

  const handleFinalize = () => {
    if (!currentSheet) return;

    const allMarked = currentSheet.answers.every(ans => ans.is_marked);
    if (!allMarked) {
      toast.warning('Please mark all questions before finalizing!');
      return;
    }

    const totals = calculateTotal();
    const grade = getGrade(totals.percentage);

    setIsDirty(false);
    toast.success('Marks finalized successfully! Moving to next student...');
    handleNextStudent();
  };

  const handlePreviousStudent = () => {
    if (currentSheetIndex > 0) {
      if (isDirty) {
        if (!confirm('You have unsaved changes. Continue anyway?')) return;
      }
      const newIndex = currentSheetIndex - 1;
      setCurrentSheetIndex(newIndex);
      setCurrentSheet(answerSheets[newIndex]);
      setIsDirty(false);
    }
  };

  const handleNextStudent = () => {
    if (currentSheetIndex < answerSheets.length - 1) {
      if (isDirty) {
        if (!confirm('You have unsaved changes. Continue anyway?')) return;
      }
      const newIndex = currentSheetIndex + 1;
      setCurrentSheetIndex(newIndex);
      setCurrentSheet(answerSheets[newIndex]);
      setIsDirty(false);
    }
  };

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Continue anyway?')) return;
    }
    const newIndex = parseInt(e.target.value);
    setCurrentSheetIndex(newIndex);
    setCurrentSheet(answerSheets[newIndex]);
    setIsDirty(false);
  };

  const handleGenerateMarksheet = () => {
    if (!currentSheet) return;

    const marksheet = mockMarksheets.find(m => m.student_id === currentSheet.student_id);
    if (marksheet) {
      toast.success(`Marksheet generated for ${currentSheet.student_name}! Total: ${marksheet.total_marks_obtained}/${marksheet.total_max_marks}, Percentage: ${marksheet.overall_percentage}%, Grade: ${marksheet.overall_grade}`);
    } else {
      toast.error('Marksheet data not available for this student.');
    }
  };

  if (!questionPaper || !currentSheet) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const totals = calculateTotal();
  const progress = currentSheet.answers.filter(a => a.is_marked).length / currentSheet.answers.length * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/exams/marking')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{questionPaper.subject_name} - Marking</h1>
            <p className="text-muted-foreground">{questionPaper.exam_name} | {questionPaper.class_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={!isDirty}>
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
          <Button onClick={handleFinalize} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalize & Next
          </Button>
        </div>
      </div>

      {/* Student Selection Bar */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousStudent}
                disabled={currentSheetIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex-1 max-w-md">
                <Label htmlFor="student-select" className="text-xs text-muted-foreground mb-1 block">
                  Select Student
                </Label>
                <select
                  id="student-select"
                  className="w-full p-2 border rounded-lg font-medium"
                  value={currentSheetIndex}
                  onChange={handleStudentSelect}
                >
                  {answerSheets.map((sheet, index) => (
                    <option key={sheet.id} value={index}>
                      {sheet.student_roll_number} - {sheet.student_name}
                      {sheet.is_fully_marked ? ' ✓' : ''}
                      {sheet.is_absent ? ' (Absent)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextStudent}
                disabled={currentSheetIndex === answerSheets.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Student</p>
                <p className="text-lg font-bold">{currentSheetIndex + 1}/{answerSheets.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-lg font-bold">{progress.toFixed(0)}%</p>
              </div>
              {currentSheet.is_fully_marked && (
                <Badge variant="success" className="px-3 py-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              {currentSheet.is_absent && (
                <Badge variant="destructive" className="px-3 py-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Absent
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Left Column - Questions and Marking */}
        <div className="lg:col-span-2 space-y-4">
          {currentSheet.is_absent ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Student Absent</h3>
                <p className="text-muted-foreground">This student was marked as absent for this exam.</p>
              </CardContent>
            </Card>
          ) : (
            currentSheet.answers.map((answer, index) => {
              const question = questionPaper.questions.find(q => q.id === answer.question_id);
              if (!question) return null;

              return (
                <Card key={answer.question_id} className={answer.is_marked ? 'border-green-200 bg-green-50/50' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Q{answer.question_number}</Badge>
                          <Badge variant="secondary">{question.question_type.replace('_', ' ').toUpperCase()}</Badge>
                          <Badge>{question.max_marks} marks</Badge>
                        </div>
                        <CardTitle className="text-lg">{question.question_text}</CardTitle>
                      </div>
                      {answer.is_marked && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Marking Scheme */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Marking Scheme
                      </p>
                      <ul className="space-y-1">
                        {question.marking_scheme.map((scheme, idx) => (
                          <li key={idx} className="text-sm text-blue-800 flex justify-between">
                            <span>• {scheme.criteria}</span>
                            <span className="font-semibold">{scheme.marks} marks</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Model Answer */}
                    {question.model_answer && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-purple-900 mb-1">Model Answer:</p>
                        <p className="text-sm text-purple-800">{question.model_answer}</p>
                      </div>
                    )}

                    {/* Student Answer */}
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed">
                      <p className="text-sm font-semibold mb-2">Student's Answer:</p>
                      <p className="text-sm">{answer.answer_text || <span className="text-muted-foreground italic">No answer provided</span>}</p>
                    </div>

                    {/* Marking Input */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`marks-${answer.question_id}`}>
                          Marks Obtained (Max: {answer.max_marks})
                        </Label>
                        <Input
                          id={`marks-${answer.question_id}`}
                          type="number"
                          min="0"
                          max={answer.max_marks}
                          step="0.5"
                          value={answer.marks_obtained ?? ''}
                          onChange={(e) => handleMarksChange(answer.question_id, e.target.value)}
                          placeholder="Enter marks"
                          className="text-lg font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`remarks-${answer.question_id}`}>Remarks</Label>
                        <Textarea
                          id={`remarks-${answer.question_id}`}
                          value={answer.remarks}
                          onChange={(e) => handleRemarksChange(answer.question_id, e.target.value)}
                          placeholder="Add feedback..."
                          rows={1}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-4">
          {/* Student Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-semibold">{currentSheet.student_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Roll Number</p>
                <p className="font-semibold">{currentSheet.student_roll_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subject</p>
                <p className="font-semibold">{currentSheet.subject_name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Marks Summary */}
          <Card className="bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Marks Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Obtained</p>
                  <p className="text-2xl font-bold text-green-600">{totals.obtained.toFixed(1)}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Maximum</p>
                  <p className="text-2xl font-bold">{totals.max}</p>
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Percentage</p>
                <p className="text-3xl font-bold text-blue-600">{totals.percentage.toFixed(2)}%</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Grade</p>
                <Badge variant="default" className="text-2xl px-6 py-2">
                  {getGrade(totals.percentage)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Question-wise Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {currentSheet.answers.map((ans, idx) => (
                  <div
                    key={ans.question_id}
                    className={`p-2 rounded text-center text-sm font-semibold ${
                      ans.is_marked
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {currentSheet.answers.filter(a => a.is_marked).length} of {currentSheet.answers.length} marked
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={handleGenerateMarksheet}
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Marksheet
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Generate comprehensive marksheet for this student
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarkingRegisterPage;

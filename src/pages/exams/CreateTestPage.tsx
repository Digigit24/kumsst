/**
 * Create Test Page
 * Teachers can create test papers with questions and send to store for printing
 */

import { Plus, Save, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';

interface Question {
  id?: number;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'long_answer' | 'true_false' | 'fill_blank';
  marks: number;
  options?: string[];
  correct_answer?: string | number;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  display_order: number;
}

const CreateTestPage = () => {
  const [testPaper, setTestPaper] = useState({
    subject: '',
    exam_name: '',
    max_marks: 100,
    allowed_time: 180, // minutes
    print_count: 50,
    instructions: '',
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question_text: '',
    question_type: 'short_answer',
    marks: 5,
    difficulty: 'medium',
    display_order: 1,
    options: ['', '', '', ''],
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.question_text.trim()) {
      toast.warning('Please enter question text');
      return;
    }

    setQuestions([...questions, { ...currentQuestion, display_order: questions.length + 1 }]);
    setCurrentQuestion({
      question_text: '',
      question_type: 'short_answer',
      marks: 5,
      difficulty: 'medium',
      display_order: questions.length + 2,
      options: ['', '', '', ''],
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSaveAsDraft = () => {
    toast.success('Test paper saved as draft!');
  };

  const handleSendToStore = () => {
    if (questions.length === 0) {
      toast.warning('Please add at least one question');
      return;
    }

    if (!testPaper.subject || !testPaper.exam_name) {
      toast.warning('Please fill in all required fields');
      return;
    }

    toast.success(`Test paper sent to store for printing ${testPaper.print_count} copies!`);
  };

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Create Test Paper</h1>
          <p className="text-muted-foreground">Create questions and send to store for printing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveAsDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button onClick={handleSendToStore}>
            <Send className="h-4 w-4 mr-2" />
            Send to Store
          </Button>
        </div>
      </div>

      {/* Test Paper Details */}
      <Card>
        <CardHeader>
          <CardTitle>Test Paper Details</CardTitle>
          <CardDescription>Enter basic information about the test</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={testPaper.subject} onValueChange={(value) => setTestPaper({ ...testPaper, subject: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam_name">Exam Name *</Label>
              <Input
                id="exam_name"
                value={testPaper.exam_name}
                onChange={(e) => setTestPaper({ ...testPaper, exam_name: e.target.value })}
                placeholder="e.g., Mid-Term Exam 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_marks">Max Marks *</Label>
              <Input
                id="max_marks"
                type="number"
                value={testPaper.max_marks}
                onChange={(e) => setTestPaper({ ...testPaper, max_marks: parseInt(e.target.value) })}
              />
              <p className="text-sm text-muted-foreground">Current total: {totalMarks} marks</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowed_time">Allowed Time (minutes) *</Label>
              <Input
                id="allowed_time"
                type="number"
                value={testPaper.allowed_time}
                onChange={(e) => setTestPaper({ ...testPaper, allowed_time: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="print_count">Print Count *</Label>
              <Input
                id="print_count"
                type="number"
                value={testPaper.print_count}
                onChange={(e) => setTestPaper({ ...testPaper, print_count: parseInt(e.target.value) })}
                placeholder="Number of copies to print"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={testPaper.instructions}
                onChange={(e) => setTestPaper({ ...testPaper, instructions: e.target.value })}
                placeholder="Enter exam instructions for students"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Question</CardTitle>
          <CardDescription>Create a new question for the test paper</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={currentQuestion.question_type}
                  onValueChange={(value: any) => setCurrentQuestion({ ...currentQuestion, question_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="long_answer">Long Answer</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Marks</Label>
                <Input
                  type="number"
                  value={currentQuestion.marks}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) })}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={currentQuestion.difficulty}
                  onValueChange={(value: any) => setCurrentQuestion({ ...currentQuestion, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                value={currentQuestion.question_text}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                placeholder="Enter the question..."
                rows={3}
              />
            </div>

            {currentQuestion.question_type === 'mcq' && (
              <div className="space-y-2">
                <Label>Options (for MCQ)</Label>
                {currentQuestion.options?.map((option, index) => (
                  <Input
                    key={index}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(currentQuestion.options || [])];
                      newOptions[index] = e.target.value;
                      setCurrentQuestion({ ...currentQuestion, options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>Hint (optional)</Label>
              <Input
                value={currentQuestion.hint || ''}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, hint: e.target.value })}
                placeholder="Add a hint for students"
              />
            </div>

            <Button onClick={handleAddQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({questions.length})</CardTitle>
          <CardDescription>Total Marks: {totalMarks}</CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No questions added yet</p>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">Q{index + 1}.</span>
                        <Badge variant="outline">{question.question_type.replace('_', ' ')}</Badge>
                        <Badge variant="secondary">{question.marks} marks</Badge>
                        <Badge variant={
                          question.difficulty === 'easy' ? 'success' :
                          question.difficulty === 'medium' ? 'default' :
                          'destructive'
                        }>
                          {question.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{question.question_text}</p>
                      {question.options && question.options.length > 0 && (
                        <div className="ml-4 mt-2 space-y-1">
                          {question.options.map((opt, i) => (
                            opt && <p key={i} className="text-sm text-muted-foreground">({String.fromCharCode(65 + i)}) {opt}</p>
                          ))}
                        </div>
                      )}
                      {question.hint && (
                        <p className="text-sm text-muted-foreground italic mt-2">Hint: {question.hint}</p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTestPage;

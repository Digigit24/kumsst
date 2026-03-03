import { AlertCircle, BookOpen, Calendar, Clock, Loader2 } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Book } from '../../components/ui/book';
import { useMyBookIssues } from '../../hooks/useLibrary';

// Generate a book color based on the book title or id
const getBookColor = (title: string, index: number): string => {
  const colors = [
    '#f50537', // red
    '#1e3a5f', // navy blue
    '#2d5016', // forest green
    '#6b3a5c', // plum
    '#8b4513', // saddle brown
    '#4a4a4a', // dark gray
    '#1a4d4d', // teal
    '#5c4033', // dark tan
    '#4b0082', // indigo
    '#800020', // burgundy
  ];
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[(hash + index) % colors.length];
};

const MyBooksPage = () => {
  const { data, isLoading, error } = useMyBookIssues();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p>Failed to load your books</p>
      </div>
    );
  }

  const issues = data?.results || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Library Books</h1>
          <p className="text-muted-foreground">Manage your issued books and reading history</p>
        </div>
      </div>

      {issues.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No books issued</h3>
            <p className="text-sm text-muted-foreground">
              You haven't borrowed any books from the library yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-8 justify-start items-start">
          {issues.map((issue, index) => {
            const isOverdue = new Date(issue.due_date) < new Date() && !issue.return_date;
            const bookTitle = issue.book_title || "Unknown Book";
            const bookAuthor = issue.book_author || "Unknown Author";

            return (
              <div key={issue.id} className="flex flex-col items-center gap-4">
                <Book
                  color={getBookColor(bookTitle, index)}
                  depth={8}
                  width={160}
                  textColor="#fff"
                >
                  <div className="p-3 text-white">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {bookTitle}
                    </h3>
                    <p className="text-xs opacity-80 line-clamp-1">
                      {bookAuthor}
                    </p>
                  </div>
                </Book>

                <div className="text-center space-y-2 w-[160px] min-h-[100px]">
                  <Badge
                    variant={isOverdue ? "destructive" : issue.return_date ? "secondary" : "default"}
                    className="mb-1"
                  >
                    {isOverdue ? "Overdue" : issue.return_date ? "Returned" : "Issued"}
                  </Badge>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Issued: {new Date(issue.issue_date).toLocaleDateString()}
                    </p>
                    <p className={`flex items-center justify-center gap-1 ${isOverdue ? "text-destructive" : ""}`}>
                      <Clock className="h-3 w-3" />
                      Due: {new Date(issue.due_date).toLocaleDateString()}
                    </p>
                    {issue.return_date && (
                      <p className="flex items-center justify-center gap-1">
                        Returned: {new Date(issue.return_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBooksPage;

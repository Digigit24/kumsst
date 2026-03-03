import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
const SavedReportsPage = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Saved Reports</h1>
    <Card><CardHeader><CardTitle>Your Saved Reports</CardTitle></CardHeader>
      <CardContent><div className="text-center py-12 text-muted-foreground"><p>Saved reports will be available soon</p></div></CardContent>
    </Card>
  </div>
);
export default SavedReportsPage;

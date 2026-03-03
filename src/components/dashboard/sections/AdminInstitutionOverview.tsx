import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollege, useColleges } from '@/hooks/useCore';
import { Building2, Globe, Mail, MapPin, Phone } from 'lucide-react';
import React from 'react';

export const AdminInstitutionOverview: React.FC = () => {
  const { data: collegesData, isLoading: isLoadingList } = useColleges({ is_main: true });
  const mainCollegeId = collegesData?.results?.[0]?.id;
  const { data: college, isLoading: isLoadingDetail } = useCollege(mainCollegeId || null);

  const isLoading = isLoadingList || (!!mainCollegeId && isLoadingDetail);

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!college) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Institution Overview</CardTitle>
          <CardDescription>Main institution details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No main institution configured.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {college.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <div className="px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium text-primary">
                {college.code}
              </div>
              {college.established_date && <span>Est. {new Date(college.established_date).getFullYear()}</span>}
            </CardDescription>
          </div>
          {college.logo && (
            <img src={college.logo} alt={college.name} className="h-12 w-12 object-contain" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact</h4>

            {college.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${college.email}`} className="hover:text-primary transition-colors">{college.email}</a>
              </div>
            )}

            {college.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${college.phone}`} className="hover:text-primary transition-colors">{college.phone}</a>
              </div>
            )}

            {college.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={college.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  {college.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Address</h4>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p>{college.address_line1}</p>
                {college.address_line2 && <p>{college.address_line2}</p>}
                <p>{college.city}, {college.state} - {college.pincode}</p>
                <p>{college.country}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Pill } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { searchMedication } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const searchSchema = z.object({
  medicationName: z.string().min(2, 'Medication name must be at least 2 characters.'),
});

export default function MedicationSearchPage() {
  const [searchResults, setSearchResults] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { medicationName: '' },
  });

  const handleSearch = async (values: z.infer<typeof searchSchema>) => {
    setIsLoading(true);
    setSearchResults(null);

    const result = await searchMedication(values);

    setIsLoading(false);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Search Error', description: result.error });
    } else {
      setSearchResults(result.searchResults || 'No information found.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Medication Information</h2>
        <p className="text-muted-foreground">Search for detailed medication information, alternatives, and studies.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSearch)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="medicationName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Pill className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search for medication e.g., 'Ibuprofen'" {...field} className="pl-10 h-11 text-base"/>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" disabled={isLoading}>
                <Search className="mr-2 h-5 w-5" />
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <br/>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      )}

      {searchResults && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results for "{form.getValues('medicationName')}"</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: searchResults.replace(/\n/g, '<br />') }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

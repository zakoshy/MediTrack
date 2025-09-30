
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, Eye, EyeOff } from 'lucide-react';

import { MediTrackLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { loginUser } from '@/app/actions';

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function LoginPage() {
  const router = useRouter();

  const getRedirectUrl = (role: string) => {
    switch (role) {
      case 'Admin':
        return '/admin';
      case 'Doctor':
        return '/doctor';
      case 'Receptionist':
        return '/reception';
      default:
        return '/';
    }
  };

  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    const result = await loginUser(values);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: result.error,
      });
    } else if (result.user) {
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${result.user.name}! Redirecting...`,
      });

      setTimeout(() => {
        router.push(getRedirectUrl(result.user.role));
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <MediTrackLogo className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-semibold font-headline">MediTrack</h1>
          </Link>
          <p className="text-muted-foreground">Welcome back! Please sign in to your account.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin@meditrack.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="underline hover:text-primary">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

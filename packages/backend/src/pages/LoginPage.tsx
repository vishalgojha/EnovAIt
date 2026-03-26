import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@enovait.com',
      password: 'password123',
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Mock login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful auth
      setAuth(
        { id: 'u1', email: data.email, name: 'Admin User', role: 'owner' },
        { 
          id: 't1', 
          name: 'EnovAIt Global', 
          slug: 'enovait-global', 
          settings: { theme: 'light' } 
        },
        'mock-jwt-token'
      );
      
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl">
              E
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to EnovAIt</CardTitle>
          <CardDescription>
            Enter your credentials to access your control panel
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="px-0 font-normal text-xs h-auto">
                  Forgot password?
                </Button>
              </div>
              <Input 
                id="password" 
                type="password" 
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

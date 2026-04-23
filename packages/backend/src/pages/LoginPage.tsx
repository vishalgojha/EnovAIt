import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";
import { signIn } from "@/lib/api/auth";
import { roleCatalog } from "@/lib/rbac";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "owner@enovait.com",
      password: "password123",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const session = await signIn(data);
      setAuth(session.user, session.tenant, session.token);
      toast.success("Signed in with RBAC scope");
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to login. Please check your credentials.";
      toast.error(message);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,rgba(74,103,65,0.08),transparent_30%),linear-gradient(180deg,#fbfbf8_0%,#f3f5f1_100%)] p-4">
      <Card className="w-full max-w-5xl overflow-hidden border-white/60 bg-white/85 shadow-[0_20px_80px_-40px_rgba(12,18,20,0.35)] backdrop-blur">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-border/60 p-8 lg:border-b-0 lg:border-r">
            <CardHeader className="p-0">
              <div className="flex justify-start mb-4">
                <div className="w-12 h-12 bg-[#101513] rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                  E
                </div>
              </div>
              <CardTitle className="text-3xl">Welcome to EnovAIt</CardTitle>
              <CardDescription className="text-base leading-7">
                Sign in to inspect the role ladder, review approvals, and switch between access
                scopes without losing the audit trail.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <Button className="w-full h-11 rounded-full bg-[#101513] text-white hover:bg-[#101513]/90" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Enter RBAC workspace"}
              </Button>
            </form>
          </div>

          <CardContent className="bg-[#101513] p-8 text-white">
            <div className="flex h-full flex-col justify-between gap-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                  Server-backed session
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">Backend-controlled access</h2>
                <p className="mt-4 text-sm leading-7 text-white/65">
                  The backend resolves the user role during sign in and stores it in the authenticated
                  session. The login form no longer fabricates access locally.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Dashboard and role matrix stay visible to all signed-in users.",
                  "Approvals and settings remain gated behind policy checks.",
                  "Audit and reporting surfaces keep a full access trail.",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
                    {item}
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Recognized roles</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {roleCatalog.slice(0, 3).map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">{item.label}</p>
                      <p className="mt-2 text-sm text-white/80">{item.scope}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

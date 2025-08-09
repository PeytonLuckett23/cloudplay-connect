import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthValues { email: string; password?: string }

export const AuthForm = () => {
  const { register, handleSubmit, formState: { isSubmitting }, getValues } = useForm<AuthValues>();

  const onSignIn = handleSubmit(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: password || "" });
    if (error) return toast({ title: "Sign in failed", description: error.message });
    toast({ title: "Signed in", description: "Welcome back!" });
  });

  const onSignUp = handleSubmit(async ({ email, password }) => {
    const { error } = await supabase.auth.signUp({ email, password: password || "" });
    if (error) return toast({ title: "Sign up failed", description: error.message });
    toast({ title: "Check your email", description: "Confirm your account to continue." });
  });

  const onMagic = async () => {
    const { email } = getValues();
    if (!email) return toast({ title: "Email required", description: "Enter your email above." });
    const redirectTo = `${window.location.origin}`;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (error) return toast({ title: "Magic link failed", description: error.message });
    toast({ title: "Magic link sent", description: "Check your inbox." });
  };

  return (
    <form className="space-y-4" onSubmit={onSignIn}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register("email", { required: true })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>Sign In</Button>
        <Button type="button" variant="secondary" onClick={onSignUp} disabled={isSubmitting}>Sign Up</Button>
        <Button type="button" variant="outline" onClick={onMagic} disabled={isSubmitting}>Magic Link</Button>
      </div>
    </form>
  );
};

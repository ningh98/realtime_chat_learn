import { SignUpForm } from "@/services/supabase/components/signup-form";

export default function Page() {
  return (
    <div className="flex min-h-screen-header w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access your Everflow Dashboard
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              card: "shadow-lg",
            },
          }}
        />
      </div>
    </div>
  );
}

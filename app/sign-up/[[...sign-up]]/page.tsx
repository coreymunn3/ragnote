import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      appearance={{
        layout: {
          socialButtonsPlacement: "top",
          socialButtonsVariant: "blockButton",
        },
        variables: {
          colorPrimary: "hsl(var(--primary))",
          colorBackground: "hsl(var(--background))",
          colorInputBackground: "hsl(var(--background))",
          colorInputText: "hsl(var(--foreground))",
          fontFamily: "var(--font-sans)",
          borderRadius: "0.5rem",
        },
        elements: {
          rootBox: "mx-auto w-full max-w-md",
          card: "shadow-2xl bg-card border border-border",
          headerTitle: "text-2xl font-semibold text-foreground",
          headerSubtitle: "text-sm text-muted-foreground",
          socialButtonsBlockButton:
            "border border-input hover:bg-accent hover:text-accent-foreground transition-colors",
          formFieldInput:
            "border border-input bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
          formFieldLabel: "text-sm font-medium text-foreground",
          formButtonPrimary:
            "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
          footer: "bg-card",
          footerActionLink: "text-primary hover:underline",
          footerActionText: "text-muted-foreground",
          formFieldError: "text-destructive",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
        },
      }}
    />
  );
}

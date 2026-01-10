import BackgroundPattern from "@/components/BackgroundPattern";

const SignUpLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative h-screen w-screen flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <BackgroundPattern />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default SignUpLayout;

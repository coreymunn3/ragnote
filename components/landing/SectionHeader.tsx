import { AnimatedScrollItem } from "../animations";

interface SectionHeaderProps {
  topText?: string;
  primaryText?: string;
  description?: string;
}

const SectionHeader = ({
  topText,
  primaryText,
  description,
}: SectionHeaderProps) => {
  return (
    <AnimatedScrollItem animation="fadeIn" duration={0.5} delay={0.2}>
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
          {topText}
          <br />
          <span className="text-primary">{primaryText}</span>
        </h2>
        <p className="text-lg text-muted-foreground">{description}</p>
      </div>
    </AnimatedScrollItem>
  );
};
export default SectionHeader;

import Image from "next/image";

export type StepInfo = {
  number: number;
  title: string;
  description: string;
};

export type StepSection = {
  stepInfo: StepInfo;
  imgUrl: string;
  imgSide?: "left" | "right";
};

const DemoSection = ({ stepInfo, imgUrl, imgSide = "left" }: StepSection) => {
  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div
        className={`order-2 ${imgSide === "left" ? "md:order-1" : "md:order-2"}`}
      >
        <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-border/50 flex items-center justify-center shadow-lg relative overflow-hidden">
          <Image
            src={imgUrl}
            alt={stepInfo.title}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div
        className={`order-1 ${imgSide === "left" ? "md:order-2" : "md:order-1"}`}
      >
        <div className="inline-flex items-center gap-2 text-primary font-semibold mb-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
            {stepInfo.number}
          </span>
          <span>{stepInfo.title}</span>
        </div>
        <h3 className="text-2xl font-bold mb-3">Write Your Notes</h3>
        <p className="text-muted-foreground">{stepInfo.description}</p>
      </div>
    </div>
  );
};
export default DemoSection;

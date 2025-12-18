interface MobilePageTitleProps {
  title: string;
}
const MobilePageTitle = ({ title }: MobilePageTitleProps) => {
  return <span className="font-semibold truncate max-w-[200px]">{title}</span>;
};
export default MobilePageTitle;

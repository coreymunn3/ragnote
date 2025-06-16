import NoteToolbar from "@/components/NoteToolbar";

const WebNoteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="">
        <NoteToolbar />
      </div>
      <div className="px-4 max-w-4xl mx-auto">{children}</div>
    </div>
  );
};
export default WebNoteLayout;

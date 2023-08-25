import { useEditor, EditorContent, Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { fileversedb } from "./newDB";
import { useEffect } from "react";

const addData = async ({ content, id }: { content: unknown; id: string }) => {
  await fileversedb.Collabdocs.upsert({
    id,
    content,
    updatedAt: new Date().toISOString() as string,
  });
};

const Tiptap = ({
  id,
  loadedContent,
}: {
  id: string;
  loadedContent: Content | undefined;
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p> New Document </p>",
    onUpdate: () => {
      const content = JSON.stringify(editor?.getJSON());
      addData({ content, id });
    },
  });

  useEffect(() => {
    editor?.commands.setContent(JSON.parse(loadedContent as string) as Content);
  }, [loadedContent]);

  return <EditorContent editor={editor} />;
};

export default Tiptap;

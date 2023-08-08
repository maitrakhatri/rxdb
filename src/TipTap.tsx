import { useEditor, EditorContent, Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { fileversedb } from "./database";
import { useEffect } from "react";

const addData = async ({ content, id }: { content: unknown; id: number }) => {
  await fileversedb.collabdocs.insert({
    id,
    content,
    timestamp: new Date().toISOString(),
  });
};

const Tiptap = ({
  id,
  loadedContent,
}: {
  id: number;
  loadedContent: Content | undefined;
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p> New Document </p>",
    onUpdate: () => {
      const content = editor?.getJSON();
      addData({ content, id });
    },
  });

  useEffect(() => {
    editor?.commands.setContent(loadedContent as Content);
  }, [loadedContent]);

  return <EditorContent editor={editor} />;
};

export default Tiptap;

import { useEditor, EditorContent, Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { fileversedb } from "./database";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { addRxPlugin } from "rxdb";
addRxPlugin(RxDBUpdatePlugin);

const Tiptap = ({
  id,
  loadedContent,
}: {
  id: number;
  loadedContent?: Content | undefined;
}) => {
  const addData = async ({ content, id }: { content: unknown; id: number }) => {
    const myDocument = fileversedb.collabdocs.find({
      selector: {
        id: {
          $eq: id,
        },
      },
    });
    await myDocument.update({
      $set: {
        content: content,
      },
    });
  };

  const editor = useEditor({
    extensions: [StarterKit],
    content: loadedContent,
    onUpdate: () => {
      const content = editor?.getJSON();
      addData({ content, id });
    },
  });

  return <EditorContent editor={editor} />;
};

export default Tiptap;

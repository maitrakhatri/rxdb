import { useEditor, EditorContent, Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { fileversedb } from "./database";
import { useEffect, useState } from "react";
import axios from "axios";

const Tiptap = ({
  id,
  loadedContent,
  rev,
}: {
  id: number;
  loadedContent?: Content | undefined;
  rev: string;
}) => {
  const [counter, setCounter] = useState<number>(0);
  const [latestRev, setLatestRev] = useState<string>(rev);
  const [editorContent, setEditorContent] = useState<Content>();

  const sendToCouchdb = async ({
    latestRev,
    content,
  }: {
    latestRev: string;
    content: Content;
  }) => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:5984/fileversedb/${id}`,
        {
          _rev: latestRev,
          content,
        }
      );
      setLatestRev(response.data.rev);
      setCounter(0);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (counter === 10) {
      if (editorContent) sendToCouchdb({ latestRev, content: editorContent });
    }
  }, [counter]);

  const addData = async ({ content, id }: { content: unknown; id: number }) => {
    await fileversedb.collabdocs.insert({
      id,
      content,
      timestamp: new Date().toISOString(),
    });
    setCounter((counter) => counter + 1);
  };

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p> New Document </p>",
    onUpdate: () => {
      const content = editor?.getJSON();
      addData({ content, id });
      setEditorContent(content);
    },
  });

  useEffect(() => {
    editor?.commands.setContent(loadedContent as Content);
  }, [loadedContent]);

  return <EditorContent editor={editor} />;
};

export default Tiptap;

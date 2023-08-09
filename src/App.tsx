import { useState } from "react";
import "./App.css";
import Tiptap from "./TipTap";
import { fileversedb, replicationState } from "./database";
import { Content } from "@tiptap/react";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { addRxPlugin } from "rxdb";
addRxPlugin(RxDBQueryBuilderPlugin);

function App() {
  const [id, setId] = useState<number>(0);
  const [loadedContent, setLoadedContent] = useState<Content>();

  const [showEditor, setShowEditor] = useState<boolean>(false);

  const getData = async (id: number) => {
    const foundDocuments = await replicationState.collection
      .find()
      .where("id")
      .equals(id)
      .exec();

    setLoadedContent(foundDocuments[0]._data.content);
    setShowEditor(true);
  };

  const createDocument = async () => {
    await fileversedb.collabdocs.insert({
      id,
      content: {},
      timestamp: new Date().toISOString(),
    });
    setShowEditor(true);
  };

  return (
    <div className="App">
      <input type="number" onChange={(e) => setId(Number(e.target.value))} />

      <button onClick={() => createDocument()}>Create document</button>

      <button onClick={() => getData(id)}>Load data</button>

      {showEditor && <Tiptap id={id} loadedContent={loadedContent} />}
    </div>
  );
}

export default App;

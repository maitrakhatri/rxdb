import { useState } from "react";
import "./App.css";
import Tiptap from "./TipTap";
import { fileversedb } from "./database";
import { Content } from "@tiptap/react";

function App() {
  const [id, setId] = useState<number>(0);
  const [loadedContent, setLoadedContent] = useState<Content>();

  const getData = async (id: number) => {
    const foundDocuments = await fileversedb.collabdocs
      .find({
        selector: {
          id: {
            $eq: id,
          },
        },
        sort: [{ timestamp: "desc" }],
      })
      .exec();

    setLoadedContent(foundDocuments[0]._data.content);
  };
  return (
    <div className="App">
      <input type="number" onChange={(e) => setId(Number(e.target.value))} />
      <button onClick={() => getData(id)}>Get Data</button>
      <Tiptap id={id} loadedContent={loadedContent} />
    </div>
  );
}

export default App;

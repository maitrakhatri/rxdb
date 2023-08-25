import { useState } from "react";
import "./App.css";
import Tiptap from "./TipTap";
import { fileversedb } from "./newDB";
import { Content } from "@tiptap/react";

function App() {
  const [id, setId] = useState<string>("");
  const [loadedContent, setLoadedContent] = useState<Content>();

  const getData = async (id: string) => {
    const foundDocuments = await fileversedb.Collabdocs.find({
      selector: {
        id: {
          $eq: id,
        },
      },
      sort: [{ timestamp: "desc" }],
    }).exec();
    console.log(foundDocuments[0]._data.content);
    setLoadedContent(foundDocuments[0]._data.content);
  };
  return (
    <div className="App">
      <input type="text" onChange={(e) => setId(e.target.value)} />
      <button onClick={() => getData(id)}>Get Data</button>
      <Tiptap id={id} loadedContent={loadedContent} />
    </div>
  );
}

export default App;

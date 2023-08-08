import { useState } from "react";
import "./App.css";
import Tiptap from "./TipTap";
// import { fileversedb } from "./database";
import { Content } from "@tiptap/react";
import axios from "axios";

function App() {
  const [id, setId] = useState<number>(0);
  const [loadedContent, setLoadedContent] = useState<Content>();
  const [latestRev, setLatestRev] = useState<string>();

  /* const getData = async (id: number) => {
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
  }; */

  const createDatabase = async () => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:5984/fileversedb/${id}`,
        {
          content: {},
        }
      );
      setLatestRev(response.data.rev);
    } catch (err) {
      console.log(err);
    }
  };

  const loadDatafromCouch = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5984/fileversedb/${id}`
      );
      setLoadedContent(response.data.content.content);
      setLatestRev(response.data._rev);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <input type="number" onChange={(e) => setId(Number(e.target.value))} />

      {/* <button onClick={() => getData(id)}>Get Data from rxdb</button> */}

      <button onClick={() => loadDatafromCouch()}>
        Load Data from Couchdb
      </button>

      <button onClick={() => createDatabase()}>Create database</button>

      {latestRev && !loadedContent && <Tiptap id={id} rev={latestRev} />}
      {latestRev && loadedContent && (
        <Tiptap id={id} rev={latestRev} loadedContent={loadedContent} />
      )}
    </div>
  );
}

export default App;

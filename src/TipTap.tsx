/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { useParams } from 'react-router-dom'
import { fromUint8Array, toUint8Array } from 'js-base64'
import * as Y from 'yjs'
import uuid from 'react-uuid'
// @ts-ignore
import { WebrtcProvider } from 'y-webrtc'
import { useEffect, useMemo, useState } from "react";
import Gun from 'gun'
import { dbCollection, replicationState } from "./database";
// import { useEffect, useState } from "react";
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { addRxPlugin } from "rxdb";
addRxPlugin(RxDBQueryBuilderPlugin);

const instantiateGun = () => {
  return Gun({
    peers: ['https://fileverse-gun-server.herokuapp.com/gun'],
  })
}

const gun = instantiateGun()
const userId = uuid()
const idTracker: any[] = []
const ydoc = new Y.Doc()



const Tiptap = () => {
  const [collaborators, setCollaborators] = useState<any>([])
  const [isToSave, setIsToSave] = useState(false)
  // const [counter, setCounter] = useState<number>(0);
  // const [editorContent, setEditorContent] = useState<Content>();
  const { id: docId } = useParams()

  const provider = useMemo(() => {
    return new WebrtcProvider(docId, ydoc, {
      signaling: ['ws://localhost:4444'],
    })
  }, []) 

  const saveContent = async ({ content }: { content: string }) => {
    // OVERWRITE THE DOCUMENT WITH THE NEW INFO
    await dbCollection.upsert({
      id: docId,
      content,
      timestamp: new Date().toISOString(),
    });
  };
  const usercolors = [
    '#30bced',
    '#6eeb83',
    '#fa69d1',
    '#ecd444',
    '#ee6352',
    '#db3041',
    '#0ad7f2',
    '#1bff39',
  ]

  const loadDocument = async () => {
    const foundDocuments = await replicationState.collection
    .find()
    .where("id")
    .equals(docId)
    .exec();
    if(foundDocuments.length){
      // @ts-ignore
      const contents = toUint8Array(foundDocuments[0]._data.content)
      Y.applyUpdate(ydoc, contents)
    }
  };
  const editor = useEditor({
    extensions: [
      StarterKit, 
      Collaboration.configure({
      document: ydoc,
      }),       
      CollaborationCursor.configure({
      provider,
      user: {
        name: usercolors[Math.floor(Math.random() * usercolors.length)],
        color: usercolors[Math.floor(Math.random() * usercolors.length)],
      },
    })
    ]
  });

  useEffect(() => {
    // KEEP RECORD OF ALL THE COLLABORATORS
    const collaboratorsRecord = gun.get('document/collaborators')

    collaboratorsRecord.get(`${docId}`).put({
      user: userId
    })

    collaboratorsRecord.map().on((data: any, id: any) => {
      if(!idTracker.includes(id) && !collaborators.includes(data?.user) && data?.user){
        idTracker.push(id)
        console.log(data?.user, "coooo")
        setCollaborators([...collaborators, data?.user])
      }
    })



    // LISTEN FOR UPDATES AND SAVE IN DB
    ydoc.on('update', () => {
      setIsToSave(true)
    })
    // LOAD DOCUMENT CONTENTS FROM RXDB
    loadDocument()

    return () => {
      if(collaborators.length === 1){
        const state = fromUint8Array( Y.encodeStateAsUpdate(ydoc))
        // SAVE STATE IN RXDB
        saveContent({content: state})
      }
      collaboratorsRecord.get(`${docId}`).put({
        user: null
      })
    }
  }, [])


  // WRITE A USEEFECT THAT LOADS CONTENT FROM RXDB AND APPLIES IT ON YDOC

console.log(collaborators, "herer")


useEffect(() => {
  if(isToSave){
    const publisher = collaborators[Math.floor(Math.random() * collaborators.length)]
  
    if(publisher === userId){
      console.log('saving content')
      const state = fromUint8Array( Y.encodeStateAsUpdate(ydoc))
      // SAVE STATE IN RXDB
      saveContent({content: state})
    }
    setIsToSave(false)
  }

}, [isToSave])

  // useEffect(() => {
  //   editor?.commands.setContent(loadedContent as Content);
  // }, [loadedContent]);

  return <EditorContent editor={editor} />;
};

export default Tiptap;

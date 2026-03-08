import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const LibraryDropdowns = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "document"));
        const data = querySnapshot.docs.map(doc => ({
          category: doc.id,
          pdfs: doc.data().pdfs || []
        }));
        setGroups(data);
      } catch (err) {
        console.error("Firestore Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center p-10 text-amber-600 animate-pulse font-bold">Loading Library...</div>;

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <details key={group.category} className="group bg-white dark:bg-[#1e1e1e] rounded-2xl border-2 border-amber-100 dark:border-amber-900/20 overflow-hidden shadow-sm">
          <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-xl text-gray-800 dark:text-white">
            <span className="flex items-center gap-3">
              <span className="text-amber-500">📁</span> {group.category}
            </span>
            <span className="transition-transform group-open:rotate-180 text-amber-500">▼</span>
          </summary>
          
          <div className="px-6 pb-6 pt-2">
            <ul className="divide-y divide-amber-50 dark:divide-gray-800">
              {group.pdfs.map((pdfName) => (
                <li key={pdfName}>
                  <a 
                    href={`/exclusive-content/view?file=${encodeURIComponent(pdfName)}`}
                    className="flex items-center justify-between py-4 hover:bg-amber-50 dark:hover:bg-amber-900/10 px-4 rounded-xl transition-all group/item"
                  >
                    <span className="text-gray-700 dark:text-gray-300 font-medium">📄 {pdfName}</span>
                    <span className="text-amber-600 text-sm font-bold opacity-0 group-hover/item:opacity-100 transition-opacity">Read Online →</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </details>
      ))}
    </div>
  );
};

export default LibraryDropdowns;

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const LibraryDropdowns = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "document"));
        const data = querySnapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            category: doc.id,
            pdfs: docData.pdfs || [],
            downloads: docData.downloads || [] // Fetch the parallel downloads array
          };
        });
        setGroups(data);
      } catch (err) {
        console.error("Firestore Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async (category, index, pdfName) => {
    // 1. Find the specific group we are modifying
    const groupIndex = groups.findIndex(g => g.category === category);
    if (groupIndex === -1) return;

    // Create a deep copy of our state to update it optimally
    const newGroups = [...groups];
    const currentGroup = newGroups[groupIndex];

    // Ensure the downloads array matches the length of the pdfs array 
    // (in case you added new PDFs manually in Firestore but forgot to add the 0s)
    const newDownloads = [...(currentGroup.downloads || [])];
    while (newDownloads.length < currentGroup.pdfs.length) {
      newDownloads.push(0);
    }

    // Increment the download count for this specific index
    newDownloads[index] += 1;
    currentGroup.downloads = newDownloads;

    // 2. Optimistically update the UI so it feels instant to the user
    setGroups(newGroups);

    // 3. Update the array in Firestore
    try {
      const docRef = doc(db, "document", category);
      await updateDoc(docRef, {
        downloads: newDownloads
      });
    } catch (error) {
      console.error("Error updating download count in Firestore:", error);
    }

    // 4. Trigger the actual file download
    // Note: Adjust the href path below based on where your PDFs are actually stored.
    const link = document.createElement('a');
    link.href = `/exclusive-content/view?file=${encodeURIComponent(pdfName)}`; 
    link.download = pdfName; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              {group.pdfs.map((pdfName, index) => (
                <li key={pdfName} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 hover:bg-amber-50 dark:hover:bg-amber-900/10 px-4 rounded-xl transition-all group/item gap-3">
                  
                  {/* Left Side: Title & Read Link */}
                  <a 
                    href={`/exclusive-content/view?file=${encodeURIComponent(pdfName)}`}
                    className="flex-1 flex items-center gap-3"
                  >
                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate">📄 {pdfName}</span>
                    <span className="text-amber-600 text-sm font-bold opacity-0 group-hover/item:opacity-100 transition-opacity hidden sm:inline-block">
                      Read Online →
                    </span>
                  </a>

                  {/* Right Side: Download Button with Counter */}
                  <button
                    onClick={() => handleDownload(group.category, index, pdfName)}
                    className="flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors active:scale-95 whitespace-nowrap"
                  >
                    <span>📥 Download</span>
                    <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-md text-xs">
                      {group.downloads && group.downloads[index] ? group.downloads[index] : 0}
                    </span>
                  </button>

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

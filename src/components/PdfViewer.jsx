import React, { useState, useEffect } from 'react';

const PdfViewer = () => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const getLink = async () => {
      // SAFE: window is defined here because useEffect only runs in the browser
      const params = new URLSearchParams(window.location.search);
      const fileName = params.get('file');

      if (!fileName) {
        setError(true);
        return;
      }

      try {
        const res = await fetch(`/api/sign-r2?file=${fileName}`);
        const data = await res.json();
        
        if (data.url) {
          setPdfUrl(data.url);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("R2 Fetch Error:", err);
        setError(true);
      }
    };

    getLink();
  }, []);

  if (error) return (
    <div className="flex items-center justify-center h-full text-red-500 font-medium">
      Unable to load document. Please return to the library and try again.
    </div>
  );

  if (!pdfUrl) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-amber-600 font-bold animate-pulse">Unlocking Secure Document...</p>
    </div>
  );

  return (
    <iframe 
      src={`${pdfUrl}#toolbar=0&navpanes=0`} 
      className="w-full h-full border-none"
      onContextMenu={(e) => e.preventDefault()}
      title="Secure PDF Viewer"
    ></iframe>
  );
};

export default PdfViewer;

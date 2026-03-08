import React, { useState, useEffect } from 'react';

const PdfViewer = ({ fileName }) => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const getLink = async () => {
      if (!fileName) return;
      try {
        const res = await fetch(`/api/sign-r2?file=${fileName}`);
        const data = await res.json();
        if (data.url) {
          setPdfUrl(data.url);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      }
    };
    getLink();
  }, [fileName]);

  if (error) return <div className="p-10 text-red-500">Error loading document.</div>;
  if (!pdfUrl) return <div className="p-10 animate-pulse text-amber-600 font-bold">Unlocking Secure Document...</div>;

  return (
    <iframe 
      src={`${pdfUrl}#toolbar=0&navpanes=0`} 
      className="w-full h-full border-none"
      onContextMenu={(e) => e.preventDefault()}
    ></iframe>
  );
};

export default PdfViewer;

import React, { useState, useEffect } from 'react';

const PdfViewer = ({ fileName }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const res = await fetch(`/api/sign-r2?file=${fileName}`);
        const data = await res.json();
        setUrl(data.url);
      } catch (err) {
        console.error("Failed to get PDF link");
      } finally {
        setLoading(false);
      }
    };
    if (fileName) fetchLink();
  }, [fileName]);

  if (loading) return <div className="p-20 text-center animate-pulse text-amber-600">Unlocking PDF...</div>;

  return (
    <iframe 
      src={`${url}#toolbar=0&navpanes=0`} 
      className="w-full h-full border-none"
      onContextMenu={(e) => e.preventDefault()}
    ></iframe>
  );
};

export default PdfViewer;

import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null); // ✅ store full JSON response
  const [contracts, setContracts] = useState([]);

  // Upload PDF -> FastAPI -> Save to backend
  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      // ✅ Step 1: Send to FastAPI
      const response = await axios.post(
        `${import.meta.env.VITE_FASTAPI_URL}/process-pdf`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setAnalysis(response.data);

      // ✅ Step 2: Save to backend (Express + MongoDB)
      await axios.post(`${import.meta.env.VITE_EXPRESS_URL}/contracts`, {
        filename: file.name,
        analysis: response.data,
      });

      // ✅ Step 3: Refresh contracts list
      fetchContracts();
    } catch (error) {
      console.error("Upload error:", error);
      setAnalysis({ error: "❌ Error processing PDF" });
    }
  };

  // Fetch contracts from backend
  const fetchContracts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_EXPRESS_URL}/contracts`);
      console.log("Contracts response:", res.data);

      // ✅ Ensure contracts is always an array
      if (Array.isArray(res.data)) {
        setContracts(res.data);
      } else {
        console.error("Unexpected contracts response:", res.data);
        setContracts([]); // fallback to empty array
      }
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setContracts([]); // prevent crash
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Legal Contract Analyzer</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4">Upload Your Legal Contract</h2>
            <p className="mb-8 text-lg">
              AI-powered analysis of your PDF contracts, right here on the page.
            </p>

            <div className="bg-white text-gray-800 rounded-lg shadow-lg p-6 max-w-lg mx-auto">
              <input
                type="file"
                className="mb-4 w-full border p-2 rounded"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button
                onClick={handleUpload}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
              >
                Upload & Analyze
              </button>
            </div>
          </div>
        </section>

        {/* Output Section */}
        <section className="container mx-auto px-6 py-12">
          {analysis && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-2xl font-bold mb-4">AI Risk Report</h3>
              <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-auto">
                {analysis.error ? (
                  <p className="text-red-600">{analysis.error}</p>
                ) : (
                  <>
                    <p className="text-gray-700 font-semibold">
                      Risk Level: {analysis?.risk_level || "Unknown"}
                    </p>
                    <p className="text-gray-700">
                      Missing Clauses:{" "}
                      {analysis?.missing_clauses?.length > 0
                        ? analysis.missing_clauses.join(", ")
                        : "None"}
                    </p>

                    <h4 className="text-lg font-bold mt-4">Detected Categories:</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {analysis?.categories
                        ? Object.entries(analysis.categories).map(([category, items]) => (
                            <li key={category}>
                              <strong>{category}</strong>
                              <ul className="ml-6 list-disc text-sm">
                                {items.map((item, idx) => (
                                  <li key={idx}>
                                    {item.text} (confidence: {item.confidence})
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))
                        : <li>No categories detected</li>}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Contracts History Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4">Saved Contracts</h3>
            <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-auto">
              {contracts.length === 0 ? (
                <p className="text-gray-500">No contracts saved yet.</p>
              ) : (
                <ul className="space-y-4">
                  {contracts.map((c) => (
                    <li key={c._id} className="border-b pb-2">
                      <p className="font-semibold">{c.filename}</p>
                      <pre className="text-gray-600 text-sm whitespace-pre-wrap">
                        {JSON.stringify(c.analysis, null, 2)}
                      </pre>
                      <p className="text-sm text-gray-400">
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} Legal Contract Analyzer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Backend URL from Netlify env variable
  const backendUrl = import.meta.env.VITE_API_URL;

  // Upload PDF -> FastAPI
  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setAnalysis(null);

      // ✅ Call FastAPI /process-pdf
      const response = await axios.post(
        `${backendUrl}/process-pdf`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setAnalysis(response.data);
    } catch (error) {
      console.error("Upload error:", error);
      setAnalysis({ error: "❌ Error processing PDF" });
    } finally {
      setLoading(false);
    }
  };

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
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Upload & Analyze"}
              </button>
            </div>
          </div>
        </section>

        {/* Output Section */}
        <section className="container mx-auto px-6 py-12">
          {loading && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
              <p className="text-blue-600 font-semibold">⏳ Processing your contract...</p>
            </div>
          )}

          {analysis && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-2xl font-bold mb-4">AI Risk Report</h3>
              <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-auto">
                {analysis.error ? (
                  <p className="text-red-600">{analysis.error}</p>
                ) : (
                  <>
                    {/* Risk Level */}
                    <p className="text-gray-700 font-semibold">
                      Risk Level: {analysis?.risk_level || "Unknown"}
                    </p>

                    {/* Missing Clauses */}
                    <p className="text-gray-700">
                      Missing Clauses:{" "}
                      {analysis?.missing_clauses?.length > 0
                        ? analysis.missing_clauses.join(", ")
                        : "None"}
                    </p>

                    {/* Categories */}
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
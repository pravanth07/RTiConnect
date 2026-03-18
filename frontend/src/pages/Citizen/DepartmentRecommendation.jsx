import { useState } from "react";
import { recommendDepartment } from "../../api/moduleAPI";

const DepartmentRecommendation = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim().length < 3) return;

    setLoading(true);
    setSearched(true);
    try {
      const { data } = await recommendDepartment(query);
      setResults(data.recommendations || []);
    } catch (error) {
      console.error("Recommendation error:", error);
      setResults([]);
    }
    setLoading(false);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "bg-green-100 text-green-800 border-green-300";
    if (confidence >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getConfidenceBarColor = (confidence) => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 50) return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Smart Department Finder
        </h1>
        <p className="text-gray-600">
          Describe your RTI query in plain language and we'll suggest the right
          government department to file your request with.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col gap-3">
          <label htmlFor="query" className="text-sm font-medium text-gray-700">
            What information are you looking for?
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I want to know about road repair status in my area, or I need details about my land records and mutation status..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-800"
          />
          <button
            type="submit"
            disabled={loading || query.trim().length < 3}
            className="self-start px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Searching...
              </span>
            ) : (
              "Find Department"
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && !loading && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {results.length > 0
              ? `${results.length} Department${results.length > 1 ? "s" : ""} Recommended`
              : "No matching departments found"}
          </h2>

          {results.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-2">
                Try using different keywords or a more detailed description.
              </p>
              <p className="text-sm text-gray-400">
                Example: "water supply problem", "school teacher vacancy",
                "FIR complaint status"
              </p>
            </div>
          )}

          <div className="space-y-4">
            {results.map((dept, index) => (
              <div
                key={dept._id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {dept.name}
                      </h3>
                      <span className="text-xs text-gray-500 font-mono">
                        Code: {dept.code}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border ${getConfidenceColor(dept.confidence)}`}
                  >
                    {dept.confidence}% Match
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3">{dept.description}</p>

                {/* Confidence Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getConfidenceBarColor(dept.confidence)}`}
                      style={{ width: `${dept.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Keywords */}
                <div className="flex flex-wrap gap-1.5">
                  {dept.keywords.slice(0, 8).map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {kw}
                    </span>
                  ))}
                  {dept.keywords.length > 8 && (
                    <span className="px-2 py-0.5 text-gray-400 text-xs">
                      +{dept.keywords.length - 8} more
                    </span>
                  )}
                </div>

                {/* Action */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <a
                    href={`/citizen/submit-rti?department=${encodeURIComponent(dept.name)}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    File RTI to this department →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Examples */}
      {!searched && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="font-medium text-blue-900 mb-3">Try these examples:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Road repair status in my area",
              "School teacher vacancies",
              "Hospital doctor availability",
              "Land mutation status",
              "Water supply problem",
              "FIR complaint status",
              "Pension payment delay",
              "Building permission",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="px-3 py-1.5 bg-white text-blue-700 text-sm rounded-full border border-blue-300 hover:bg-blue-100 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentRecommendation;

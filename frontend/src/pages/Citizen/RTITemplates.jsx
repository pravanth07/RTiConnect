import { useState, useEffect } from "react";
import {
  getTemplates,
  getTemplateById,
  generateFromTemplate,
  getTemplateCategories,
} from "../../api/moduleAPI";

const RTITemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Template detail & form
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [generatedApp, setGeneratedApp] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // View mode: "list" | "form" | "result"
  const [view, setView] = useState("list");

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [selectedCategory]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await getTemplates(selectedCategory, searchTerm);
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const { data } = await getTemplateCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSelectTemplate = async (id) => {
    try {
      const { data } = await getTemplateById(id);
      setSelectedTemplate(data.template);
      // Initialize form values
      const initial = {};
      data.template.placeholders.forEach((p) => {
        initial[p.key] = "";
      });
      setFormValues(initial);
      setGeneratedApp("");
      setView("form");
    } catch (error) {
      console.error("Error loading template:", error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setGenerating(true);
    try {
      const { data } = await generateFromTemplate(selectedTemplate._id, formValues);
      setGeneratedApp(data.generatedApplication);
      setView("result");
    } catch (error) {
      const msg = error.response?.data?.message || "Error generating application";
      alert(msg);
    }
    setGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedApp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    if (view === "result") setView("form");
    else {
      setView("list");
      setSelectedTemplate(null);
      setFormValues({});
      setGeneratedApp("");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTemplates();
  };

  // ─── LIST VIEW ──────────────────────────────────────
  if (view === "list") {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            RTI Application Templates
          </h1>
          <p className="text-gray-600">
            Choose a ready-made template, fill in your details, and generate a
            properly formatted RTI application instantly.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </form>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Template Cards */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No templates found. Try a different category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => (
              <div
                key={tmpl._id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectTemplate(tmpl._id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    {tmpl.title}
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap ml-2">
                    {tmpl.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{tmpl.department}</p>
                <p className="text-sm text-gray-600 mb-3">{tmpl.description}</p>

                {tmpl.sampleQuestions?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Sample questions:
                    </p>
                    <ul className="text-xs text-gray-500 space-y-0.5">
                      {tmpl.sampleQuestions.slice(0, 2).map((q, i) => (
                        <li key={i}>• {q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    Used {tmpl.usageCount} times
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    Use Template →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── FORM VIEW ──────────────────────────────────────
  if (view === "form" && selectedTemplate) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          ← Back to templates
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-6">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {selectedTemplate.category}
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">
              {selectedTemplate.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedTemplate.department}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              {selectedTemplate.description}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Fill in your details
            </h3>
            <div className="space-y-4">
              {selectedTemplate.placeholders.map((placeholder) => (
                <div key={placeholder.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {placeholder.label}
                    {placeholder.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {placeholder.type === "textarea" ? (
                    <textarea
                      value={formValues[placeholder.key] || ""}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          [placeholder.key]: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  ) : (
                    <input
                      type={placeholder.type || "text"}
                      value={formValues[placeholder.key] || ""}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          [placeholder.key]: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-6 w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {generating ? "Generating..." : "Generate RTI Application"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULT VIEW ────────────────────────────────────
  if (view === "result") {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          ← Back to form
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Your RTI Application
            </h2>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
              {generatedApp}
            </pre>
          </div>

          <div className="flex gap-3 mt-6">
            <a
              href="/citizen/submit-rti"
              className="flex-1 text-center px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
            >
              Submit as RTI Request
            </a>
            <button
              onClick={() => setView("form")}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RTITemplates;

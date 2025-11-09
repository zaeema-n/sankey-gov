import { useEffect, useState } from "react";
import SankeyChart from "./components/SankeyChart";

const BASE_URL = "http://localhost:8000/data/orgchart/sankey";

const SELECTED_PRESIDENT_ID = "2149-34_cit_1";

const REQUEST_DATES = [
  "2022-04-05",
  "2022-05-05",
  "2022-06-05",
  "2022-07-05",
];

const LAYER_WIDTH = 190;

const getInitialViewportSize = () => {
  if (typeof window === "undefined") {
    return { width: 1280, height: 720 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
};

const estimateSankeyHeight = (data, fallbackHeight) => {
  if (!data?.nodes?.length) {
    return fallbackHeight;
  }

  // Estimate height based on node count. Adjust multiplier as needed to provide spacing.
  const estimatedHeight = data.nodes.length * 30;

  return Math.max(fallbackHeight, estimatedHeight);
};

const estimateSankeyWidth = (data, fallbackWidth) => {
  if (!data?.nodes?.length) {
    return fallbackWidth;
  }

  // Estimate width based on number of distinct columns/layers inferred from node x-positions if available
  const uniqueLayers = new Set();
  data.nodes.forEach((node) => {
    if (typeof node.layer === "number") {
      uniqueLayers.add(node.layer);
    } else if (typeof node.x0 === "number") {
      uniqueLayers.add(node.x0);
    }
  });

  const layersCount = uniqueLayers.size || Math.ceil(Math.sqrt(data.nodes.length));

  // Rough width estimation based on desired layer width
  const estimatedWidth = layersCount * LAYER_WIDTH;

  return Math.max(fallbackWidth, estimatedWidth);
};

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewportSize, setViewportSize] = useState(getInitialViewportSize);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSankeyData() {
      try {
        setLoading(true);
        setError(null);

        const url = `${BASE_URL}/${SELECTED_PRESIDENT_ID}`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(REQUEST_DATES),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }

        const payload = await response.json();
        setData(payload);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Failed to fetch Sankey data:", err);
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSankeyData();

    return () => controller.abort();
  }, []);

  const baseAvailableHeight = Math.max(viewportSize.height - 200, 400);
  const chartHeight = estimateSankeyHeight(data, baseAvailableHeight);
  const chartWidth = estimateSankeyWidth(data, viewportSize.width);
  const visibleWidth = Math.min(viewportSize.width, LAYER_WIDTH * 2);
  const maxVisibleHeight = Math.max(baseAvailableHeight, Math.min(chartHeight, viewportSize.height - 140));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="px-8 py-6 border-b border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">
          Department Movement
        </h2>
      </header>

      <main className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            Loading Sankey data…
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-600">
            Unable to load data: {error.message || "Unknown error"}
          </div>
        )}

        {!loading && !error && data && (
          <div className="h-full w-full flex justify-center px-6 py-6">
            <div
              className="overflow-auto rounded border border-slate-200 shadow bg-white"
              style={{ width: visibleWidth, maxHeight: maxVisibleHeight }}
            >
              <div
                className="relative"
                style={{ width: chartWidth, minHeight: chartHeight }}
              >
                <SankeyChart
                  data={data}
                  width={chartWidth}
                  height={chartHeight}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

import SankeyChart from './components/SankeyChart'

// const data = {
//   nodes: [
//     { name: "Health" },
//     { name: "Education" },
//     { name: "Defense" },
//     { name: "Finance" },
//   ],
//   links: [
//     { source: 0, target: 1, value: 5 },
//     { source: 0, target: 3, value: 6 },
//     { source: 1, target: 2, value: 8 },
//     { source: 3, target: 2, value: 10 },
//   ],
// };

const data = {
  nodes : [
    { name: "Min A", time: "t1" }, // 0
    { name: "Min B", time: "t1" }, // 1
    { name: "Min C", time: "t1" }, // 2
    { name: "Min A", time: "t2" }, // 3
    { name: "Min B", time: "t2" }, // 4
    { name: "Min D", time: "t2" }, // 5
    { name: "Min A", time: "t3" }, // 6
    { name: "Min B", time: "t3" }  // 7
  ],
  links: [
    // t1 → t2
  { source: 0, target: 3, value: 20 }, // A → A (20 depts)
  { source: 1, target: 4, value: 15 }, // B → B (15 depts)
  { source: 2, target: 5, value: 10 }, // C → D (10 depts)
  { source: 2, target: 3, value: 5 },  // C → A (5 depts)
  
  // t2 → t3
  { source: 3, target: 6, value: 22 }, // A → A (22 depts)
  { source: 4, target: 7, value: 18 }, // B → B (18 depts)
  { source: 5, target: 6, value: 8 }   // D → A (8 depts)
  ],
};

function App() {

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Department Movement</h2>
      <SankeyChart data={data} width={800} height={400} />
    </div>
  )
}

export default App

import React, { useEffect, useRef, useState } from "react";
import "./styles.css";

const CELL_SIZE = 20; // size of each grid cell in px

function App() {
  const canvasRef = useRef(null);

  // Auto-detect grid size
  const [screenWidth, setScreenWidth] = useState(window.innerWidth - 40);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight - 200);

  const COLS = Math.floor(screenWidth / CELL_SIZE);
  const ROWS = Math.floor(screenHeight / CELL_SIZE);

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(ROWS * COLS - 1);
  const [walls, setWalls] = useState(new Set());
  const [path, setPath] = useState([]);
  const [mode, setMode] = useState("");

  useEffect(() => {
    const listener = () => {
      setScreenWidth(window.innerWidth - 40);
      setScreenHeight(window.innerHeight - 200);
    };

    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

  useEffect(() => {
    shuffleWalls();
  }, [ROWS, COLS]);

  useEffect(() => {
    drawGrid();
  }, [walls, start, end, path, ROWS, COLS]);

  const shuffleWalls = () => {
    const newWalls = new Set();
    const total = ROWS * COLS;

    for (let i = 0; i < total / 5; i++) {
      let idx;
      do {
        idx = Math.floor(Math.random() * total);
      } while (idx === start || idx === end);
      newWalls.add(idx);
    }
    setWalls(newWalls);
    setPath([]);
  };

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    const index = row * COLS + col;

    if (mode === "start") {
      setStart(index);
      setMode("");
      return;
    }
    if (mode === "end") {
      setEnd(index);
      setMode("");
      return;
    }

    if (index !== start && index !== end) {
      const newWalls = new Set(walls);
      newWalls.has(index) ? newWalls.delete(index) : newWalls.add(index);
      setWalls(newWalls);
    }
  };

  const getNeighbors = (idx) => {
    const row = Math.floor(idx / COLS);
    const col = idx % COLS;
    const moves = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    const neighbors = [];
    for (let [dr, dc] of moves) {
      const nr = row + dr;
      const nc = col + dc;
      const nidx = nr * COLS + nc;

      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !walls.has(nidx)) {
        neighbors.push(nidx);
      }
    }
    return neighbors;
  };

  const findShortestPath = () => {
    setPath([]);
    const total = ROWS * COLS;
    const queue = [start];
    const visited = Array(total).fill(false);
    const parent = {};

    visited[start] = true;

    while (queue.length) {
      const curr = queue.shift();
      if (curr === end) break;

      for (let nxt of getNeighbors(curr)) {
        if (!visited[nxt]) {
          visited[nxt] = true;
          parent[nxt] = curr;
          queue.push(nxt);
        }
      }
    }

    if (!parent[end]) {
      alert("No path found");
      return;
    }

    const result = [];
    let step = end;
    while (step !== start) {
      result.push(step);
      step = parent[step];
    }
    setPath(result.reverse());
  };

  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    const totalCells = ROWS * COLS;

    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / COLS);
      const col = i % COLS;

      if (i === start) ctx.fillStyle = "green";
      else if (i === end) ctx.fillStyle = "blue";
      else if (walls.has(i)) ctx.fillStyle = "black";
      else if (path.includes(i)) ctx.fillStyle = "aqua";
      else ctx.fillStyle = "#d9d9d9";

      ctx.fillRect(
        col * CELL_SIZE,
        row * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      );
    }
  };

  return (
    <div className="container">
      <h1>Shortest Path Finder (Grid Version)</h1>

      <canvas
        ref={canvasRef}
        width={screenWidth}
        height={screenHeight}
        className="grid-canvas"
        onClick={handleClick}
      ></canvas>

      <div className="buttons">
        <button onClick={() => setMode("start")}>Set Start</button>
        <button onClick={() => setMode("end")}>Set End</button>
        <button onClick={shuffleWalls}>Shuffle Walls</button>
        <button onClick={findShortestPath}>Shortest Path</button>
      </div>
    </div>
  );
}

export default App;

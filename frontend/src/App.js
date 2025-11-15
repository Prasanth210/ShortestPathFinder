import React, { useEffect, useRef, useState } from "react";
import "./styles.css";

const CELL_SIZE = 20;

function App() {
  const canvasRef = useRef(null);

  const [screenWidth, setScreenWidth] = useState(window.innerWidth - 40);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight - 200);

  const COLS = Math.floor(screenWidth / CELL_SIZE);
  const ROWS = Math.floor(screenHeight / CELL_SIZE);

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(ROWS * COLS - 1);
  const [walls, setWalls] = useState(new Set());
  const [path, setPath] = useState([]);
  const [mode, setMode] = useState(""); // "start", "end"
  const [stopSearch, setStopSearch] = useState(false);
  const [isRightDown, setIsRightDown] = useState(false);

  const intervals = useRef([]);

  const clearAllIntervals = () => {
    intervals.current.forEach(clearInterval);
    intervals.current = [];
  };

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
  }, [walls, start, end, path]);

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

  // WALL EDITING
  const paintWall = (index) => {
    if (index === start || index === end) return;
    setWalls((prev) => {
      const updated = new Set(prev);
      updated.add(index);
      return updated;
    });
  };

  const eraseWall = (index) => {
    if (index === start || index === end) return;
    setWalls((prev) => {
      const updated = new Set(prev);
      updated.delete(index);
      return updated;
    });
  };

  const toggleWall = (index) => {
    if (index === start || index === end) return;
    setWalls((prev) => {
      const updated = new Set(prev);
      updated.has(index) ? updated.delete(index) : updated.add(index);
      return updated;
    });
  };

  const getCellFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    const index = row * COLS + col;
    return { row, col, index };
  };

  // MOUSE EVENTS
  const handleMouseDown = (e) => {
    const { index } = getCellFromEvent(e);

    if (e.button === 2) {
      setIsRightDown(true);
      paintWall(index);
    } else if (e.button === 0) {
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

      toggleWall(index);
    }
  };

  const handleMouseUp = () => {
    setIsRightDown(false);
  };

  const handleMouseMove = (e) => {
    if (isRightDown) {
      const { index } = getCellFromEvent(e);
      paintWall(index);
    }
  };

  // BFS SEARCH
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

      if (
        nr >= 0 &&
        nr < ROWS &&
        nc >= 0 &&
        nc < COLS &&
        !walls.has(nidx)
      ) {
        neighbors.push(nidx);
      }
    }
    return neighbors;
  };

  const findShortestPath = () => {
    setStopSearch(false);
    clearAllIntervals();
    setPath([]);

    const total = ROWS * COLS;
    const queue = [start];
    const visited = Array(total).fill(false);
    const parent = {};

    visited[start] = true;
    let visitOrder = [];

    while (queue.length) {
      if (stopSearch) return;

      const curr = queue.shift();
      visitOrder.push(curr);

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
      alert("No path found!");
      return;
    }

    let shortest = [];
    let step = end;

    while (step !== start) {
      shortest.push(step);
      step = parent[step];
    }

    shortest.reverse();
    animateBFS(visitOrder, shortest);
  };

  const animateBFS = (visitOrder, shortestPath) => {
    let i = 0;

    const explore = setInterval(() => {
      intervals.current.push(explore);

      if (stopSearch) {
        clearAllIntervals();
        setPath([]);
        return;
      }

      setPath(visitOrder.slice(0, i));
      i++;

      if (i >= visitOrder.length) {
        clearInterval(explore);

        setTimeout(() => {
          setPath([]);
          animateShortestPath(shortestPath);
        }, 50);
      }
    }, 10);
  };

  const animateShortestPath = (shortestPath) => {
    let i = 0;

    const anim = setInterval(() => {
      intervals.current.push(anim);

      if (stopSearch) {
        clearAllIntervals();
        setPath([]);
        return;
      }

      setPath(shortestPath.slice(0, i + 1));
      i++;

      if (i >= shortestPath.length) clearInterval(anim);
    }, 40);
  };

  // GRID DRAWING
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    const total = ROWS * COLS;

    for (let i = 0; i < total; i++) {
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

  // UI
  return (
    <div className="container">
      <h1>Shortest Path Finder (Grid)</h1>

      <canvas
        ref={canvasRef}
        width={screenWidth}
        height={screenHeight}
        className="grid-canvas"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onContextMenu={(e) => e.preventDefault()} // disable default menu
      />

      <div className="buttons">
        <button onClick={() => setMode("start")}>Set Start</button>
        <button onClick={() => setMode("end")}>Set End</button>
        <button onClick={shuffleWalls}>Shuffle Walls</button>
        <button onClick={findShortestPath}>Shortest Path</button>

        <button
          onClick={() => {
            setStopSearch(true);
            clearAllIntervals();
            setPath([]);
          }}
        >
          Stop
        </button>

        <button
          onClick={() => {
            setWalls(new Set());
            setPath([]);
          }}
        >
          Clear Walls
        </button>
      </div>
    </div>
  );
}

export default App;


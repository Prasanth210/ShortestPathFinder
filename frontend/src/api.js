export async function getShortestPath(graph, start, end) {
  const response = await fetch("http://localhost:5000/shortest-path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ graph, start, end }),
  });

  return await response.json();
}

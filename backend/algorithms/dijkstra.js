function runDijkstra(graph, start, end) {
  const distances = {};
  const visited = {};
  const previous = {};

  // Initialize
  for (let node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
  }

  distances[start] = 0;

  while (true) {
    let closestNode = null;

    // Find the unvisited node with smallest distance
    for (let node in distances) {
      if (!visited[node]) {
        if (closestNode === null || distances[node] < distances[closestNode]) {
          closestNode = node;
        }
      }
    }

    if (closestNode === null) break; // No more reachable nodes

    visited[closestNode] = true;

    // Update neighbors
    for (let neighbor in graph[closestNode]) {
      let newDist = distances[closestNode] + graph[closestNode][neighbor];

      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        previous[neighbor] = closestNode;
      }
    }
  }

  // Build path
  let path = [];
  let current = end;

  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  return {
    path: path,
    distance: distances[end]
  };
}

module.exports = { runDijkstra };

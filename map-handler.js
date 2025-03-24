// Sample Graph Representation (Adjacency List)
const graph = {
    'A': { 'B': 2, 'C': 5 },
    'B': { 'A': 2, 'D': 4, 'E': 7 },
    'C': { 'A': 5, 'F': 6 },
    'D': { 'B': 4, 'E': 1, 'G': 3 },
    'E': { 'B': 7, 'D': 1, 'G': 2, 'H': 3 },
    'F': { 'C': 6, 'H': 4 },
    'G': { 'D': 3, 'E': 2, 'I': 5 },
    'H': { 'E': 3, 'F': 4, 'I': 6 },
    'I': { 'G': 5, 'H': 6 }
};

// Dijkstra's Algorithm Implementation
function dijkstra(graph, start, end) {
    let distances = {};
    let previous = {};
    let queue = new Set(Object.keys(graph));
    
    Object.keys(graph).forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    distances[start] = 0;
    
    while (queue.size > 0) {
        let minNode = Array.from(queue).reduce((a, b) => distances[a] < distances[b] ? a : b);
        queue.delete(minNode);
        
        if (minNode === end) break;
        
        for (let neighbor in graph[minNode]) {
            if (!queue.has(neighbor)) continue; // Ignore processed nodes
            
            let newDist = distances[minNode] + graph[minNode][neighbor];
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = minNode;
            }
        }
    }
    
    let path = [];
    let step = end;
    while (step) {
        path.unshift(step);
        step = previous[step];
    }
    return { path, distance: distances[end] };
}

// Function to Calculate Route and Save Commute History
async function calculateRoute() {
    const start = document.getElementById('start').value.trim();
    const end = document.getElementById('end').value.trim();
    
    if (!graph[start] || !graph[end]) {
        alert("Invalid locations. Choose from A, B, C, D, E, F, G, H, I.");
        return;
    }
    
    const { path, distance } = dijkstra(graph, start, end);
    const duration = (distance * 10) + ' min'; // Approximate travel time
    
    console.log(`Shortest path: ${path.join(' -> ')}, Distance: ${distance} km`);
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Unauthorized. Please log in.");
            return;
        }

        const response = await fetch('/api/commute/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ startLocation: start, endLocation: end, distance, duration })
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Commute History Saved:', data);
            alert("Commute saved successfully!");
        } else {
            console.error('Error:', data.message);
            alert("Failed to save commute: " + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred while saving commute.");
    }
}

// Set Current Location Without Map API
function setCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log(`Current Location: Latitude ${position.coords.latitude}, Longitude ${position.coords.longitude}`);
            },
            (error) => {
                alert("Error getting location: " + error.message);
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Fetch Commute History
async function fetchCommuteHistory() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Unauthorized. Please log in.");
            return;
        }

        const response = await fetch('/api/commute/history', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        let historyContainer = document.getElementById('commuteHistory');
        historyContainer.innerHTML = ''; // Clear previous data

        if (response.ok) {
            data.history.forEach(item => {
                const entry = document.createElement('li');
                entry.textContent = `Start: ${item.startLocation} → End: ${item.endLocation}, Distance: ${item.distance} km, Time: ${item.duration}`;
                historyContainer.appendChild(entry);
            });
        } else {
            alert("Error fetching history: " + data.message);
        }
    } catch (error) {
        console.error('Error fetching history:', error);
        alert("Failed to fetch commute history.");
    }
}

// Load commute history on page load
document.addEventListener('DOMContentLoaded', fetchCommuteHistory);

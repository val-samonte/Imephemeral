const directions = ['N', 'E', 'S', 'W']

export interface Room {
  x: number
  y: number
  doors: string[]
}

function createRoom(x: number, y: number): Room {
  return { x, y, doors: [] }
}

function getNeighbors(x: number, y: number, size: number) {
  return [
    { x: x, y: y - 1, dir: 'N' },
    { x: x + 1, y: y, dir: 'E' },
    { x: x, y: y + 1, dir: 'S' },
    { x: x - 1, y: y, dir: 'W' },
  ].filter((n) => n.x >= 0 && n.x < size && n.y >= 0 && n.y < size)
}

class UnionFind {
  parent: number[]
  rank: number[]

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i)
    this.rank = Array(size).fill(0)
  }

  find(i: number) {
    if (this.parent[i] !== i) {
      this.parent[i] = this.find(this.parent[i])
    }
    return this.parent[i]
  }

  union(x: number, y: number) {
    const rootX = this.find(x)
    const rootY = this.find(y)
    if (rootX !== rootY) {
      if (this.rank[rootX] > this.rank[rootY]) {
        this.parent[rootY] = rootX
      } else if (this.rank[rootX] < this.rank[rootY]) {
        this.parent[rootX] = rootY
      } else {
        this.parent[rootY] = rootX
        this.rank[rootX] += 1
      }
    }
  }
}

function connectRooms(room1: Room, room2: Room, dir: string) {
  room1.doors.push(dir)
  room2.doors.push(directions[(directions.indexOf(dir) + 2) % 4])
}

async function generateSeededRandom(seed: string) {
  const seedHash = async (data: BufferSource) => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const encoder = new TextEncoder()
  let data = encoder.encode(seed)
  let hash = await seedHash(data)
  let index = 0

  return async () => {
    if (index >= hash.length) {
      hash = await seedHash(encoder.encode(hash))
      index = 0
    }

    const randomValue =
      parseInt(hash.substring(index, index + 8), 16) / 0xffffffff
    index += 8

    return randomValue
  }
}

export async function generateMaze(size: number, seed: string) {
  // console.time('generateMaze')

  const rooms = Array.from({ length: size * size }, (_, i) =>
    createRoom(i % size, Math.floor(i / size))
  )
  const unionFind = new UnionFind(size * size)
  const random = await generateSeededRandom(seed)

  function getRoomIndex(x: number, y: number) {
    return y * size + x
  }

  const visited = new Set()

  async function processRoom(x: number, y: number) {
    const roomIndex = getRoomIndex(x, y)
    const room = rooms[roomIndex]
    const unvisitedNeighbors = getNeighbors(x, y, size).filter(
      (n) => !visited.has(`${n.x},${n.y}`)
    )

    if (unvisitedNeighbors.length > 0) {
      const next =
        unvisitedNeighbors[
          Math.floor((await random()) * unvisitedNeighbors.length)
        ]
      connectRooms(room, rooms[getRoomIndex(next.x, next.y)], next.dir)
      unionFind.union(roomIndex, getRoomIndex(next.x, next.y))
      visited.add(`${x},${y}`)
    }
  }

  // Randomly splatter doors
  for (let i = 0; i < size * size; i++) {
    const x = Math.floor((await random()) * size)
    const y = Math.floor((await random()) * size)
    await processRoom(x, y)
  }

  // Connect remaining rooms
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const currentRoomIndex = getRoomIndex(x, y)
      getNeighbors(x, y, size).forEach(async (neighbor) => {
        const neighborRoomIndex = getRoomIndex(neighbor.x, neighbor.y)
        if (
          unionFind.find(currentRoomIndex) !== unionFind.find(neighborRoomIndex)
        ) {
          connectRooms(
            rooms[currentRoomIndex],
            rooms[neighborRoomIndex],
            neighbor.dir
          )
          unionFind.union(currentRoomIndex, neighborRoomIndex)
        }
      })
    }
  }
  // console.timeEnd('generateMaze')

  return rooms
}

function bfs(rooms: Room[], size: number, start: { x: number; y: number }) {
  const queue = [start]
  const distances = Array(size * size).fill(Infinity)
  const previous = Array(size * size).fill(null)
  distances[start.y * size + start.x] = 0

  while (queue.length > 0) {
    const { x, y } = queue.shift()!
    const currentIndex = y * size + x
    const currentRoom = rooms[currentIndex]

    for (const door of currentRoom.doors) {
      const neighbor = getNeighbors(x, y, size).find((n) => n.dir === door)
      if (neighbor) {
        const neighborIndex = neighbor.y * size + neighbor.x
        if (distances[neighborIndex] === Infinity) {
          distances[neighborIndex] = distances[currentIndex] + 1
          previous[neighborIndex] = { x, y }
          queue.push(neighbor)
        }
      }
    }
  }

  return { distances, previous }
}

export function findLongestPath(rooms: Room[], size: number) {
  let maxDistance = 0
  let longestPath: { x: number; y: number }[] = []
  let path = []

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const start = { x, y }
      const { distances, previous } = bfs(rooms, size, start)

      for (let i = 0; i < distances.length; i++) {
        if (distances[i] > maxDistance) {
          maxDistance = distances[i]
          longestPath = [start, { x: i % size, y: Math.floor(i / size) }]
          path = []
          let current = { x: i % size, y: Math.floor(i / size) }
          while (current) {
            path.unshift(current)
            current = previous[current.y * size + current.x]
          }
        }
      }
    }
  }

  return { longestPath, maxDistance, path }
}

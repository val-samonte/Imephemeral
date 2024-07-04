function doRectanglesOverlap(rect1, rect2) {
  // Extract points from the rectangles
  const [x1, y1, x2, y2] = rect1
  const [x3, y3, x4, y4] = rect2

  // Calculate the left, right, top, and bottom edges of each rectangle
  const left1 = Math.min(x1, x2)
  const right1 = Math.max(x1, x2)
  const top1 = Math.min(y1, y2)
  const bottom1 = Math.max(y1, y2)

  const left2 = Math.min(x3, x4)
  const right2 = Math.max(x3, x4)
  const top2 = Math.min(y3, y4)
  const bottom2 = Math.max(y3, y4)

  // Check if the rectangles overlap
  if (
    right1 <= left2 ||
    right2 <= left1 ||
    bottom1 <= top2 ||
    bottom2 <= top1
  ) {
    // They are touching or not overlapping
    return false
  } else {
    // They are overlapping
    return true
  }
}

// Example usage:
const rect1 = [1, 1, 3, 3]
const rect2 = [2, 2, 4, 4]
const rect3 = [3, 3, 5, 5] // Just touching

console.log(doRectanglesOverlap(rect1, rect2)) // true
console.log(doRectanglesOverlap(rect1, rect3)) // false

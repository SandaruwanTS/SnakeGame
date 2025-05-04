"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

// Game constants
const GRID_SIZE = 20
const CELL_SIZE = 20
const GAME_SPEED = 150
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE

// Direction types
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [snake, setSnake] = useState<Array<[number, number]>>([
    [5, 5], // Head
  ])
  const [food, setFood] = useState<[number, number]>([10, 10])
  const [highScore, setHighScore] = useState(0)
  const isMobile = useMobile()

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver || isPaused) return

    const gameLoop = setInterval(() => {
      moveSnake()
    }, GAME_SPEED)

    return () => clearInterval(gameLoop)
  }, [isPlaying, gameOver, isPaused, snake, direction])

  // Draw game
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw snake
    ctx.fillStyle = "#10b981" // Emerald green
    snake.forEach(([x, y]) => {
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    })

    // Draw food
    ctx.fillStyle = "#ef4444" // Red
    ctx.fillRect(food[0] * CELL_SIZE, food[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE)

    // Draw grid (optional)
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 0.5
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }
  }, [snake, food])

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return

      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP")
          break
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN")
          break
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT")
          break
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT")
          break
        case " ": // Space bar to pause/resume
          setIsPaused((prev) => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPlaying, direction])

  // Move snake
  const moveSnake = () => {
    const head = [...snake[0]] as [number, number]

    // Move head based on direction
    switch (direction) {
      case "UP":
        head[1] -= 1
        break
      case "DOWN":
        head[1] += 1
        break
      case "LEFT":
        head[0] -= 1
        break
      case "RIGHT":
        head[0] += 1
        break
    }

    // Check for collisions
    if (
      head[0] < 0 ||
      head[0] >= GRID_SIZE ||
      head[1] < 0 ||
      head[1] >= GRID_SIZE ||
      snake.some(([x, y]) => x === head[0] && y === head[1])
    ) {
      endGame()
      return
    }

    // Create new snake
    const newSnake = [head, ...snake]

    // Check if snake ate food
    if (head[0] === food[0] && head[1] === food[1]) {
      setScore((prev) => prev + 1)
      generateFood(newSnake)
    } else {
      // Remove tail if no food was eaten
      newSnake.pop()
    }

    setSnake(newSnake)
  }

  // Generate new food position
  const generateFood = (currentSnake: Array<[number, number]> = snake) => {
    let newFood: [number, number]

    do {
      newFood = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)]
      // Make sure food doesn't spawn on snake
    } while (currentSnake.some(([x, y]) => x === newFood[0] && y === newFood[1]))

    setFood(newFood)
  }

  // Start new game
  const startGame = () => {
    setSnake([[5, 5]])
    setDirection("RIGHT")
    setScore(0)
    setGameOver(false)
    setIsPaused(false)
    setIsPlaying(true)
    generateFood([[5, 5]])
  }

  // End game
  const endGame = () => {
    setGameOver(true)
    setIsPlaying(false)
    if (score > highScore) {
      setHighScore(score)
    }
  }

  // Handle direction button clicks (for mobile)
  const handleDirectionClick = (newDirection: Direction) => {
    if (!isPlaying) return

    // Prevent 180-degree turns
    if (
      (newDirection === "UP" && direction !== "DOWN") ||
      (newDirection === "DOWN" && direction !== "UP") ||
      (newDirection === "LEFT" && direction !== "RIGHT") ||
      (newDirection === "RIGHT" && direction !== "LEFT")
    ) {
      setDirection(newDirection)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-medium">Score: {score}</div>
          <div className="text-lg font-medium">High Score: {highScore}</div>
        </div>

        <div className="relative mb-4">
          <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="border border-gray-200 mx-auto" />

          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Button onClick={startGame} size="lg" className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Start Game
              </Button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
              <div className="text-white text-2xl font-bold mb-4">Game Over!</div>
              <Button onClick={startGame} size="lg" className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Play Again
              </Button>
            </div>
          )}

          {isPaused && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Button onClick={() => setIsPaused(false)} size="lg" className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Resume
              </Button>
            </div>
          )}
        </div>

        {isPlaying && !gameOver && (
          <div className="flex justify-center mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused((prev) => !prev)}
              className="flex items-center gap-1"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
          </div>
        )}

        {isMobile && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div></div>
            <Button variant="outline" onClick={() => handleDirectionClick("UP")} className="aspect-square">
              <ArrowUp className="h-6 w-6" />
            </Button>
            <div></div>

            <Button variant="outline" onClick={() => handleDirectionClick("LEFT")} className="aspect-square">
              <ArrowLeft className="h-6 w-6" />
            </Button>

            <Button variant="outline" onClick={() => handleDirectionClick("DOWN")} className="aspect-square">
              <ArrowDown className="h-6 w-6" />
            </Button>

            <Button variant="outline" onClick={() => handleDirectionClick("RIGHT")} className="aspect-square">
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

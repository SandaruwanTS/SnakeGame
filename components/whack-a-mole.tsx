"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock } from "lucide-react"

export default function WhackAMole() {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameActive, setGameActive] = useState(false)
  const [activeMole, setActiveMole] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState(1000) // Time between moles in ms
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const moleTimerRef = useRef<NodeJS.Timeout | null>(null)

  const startGame = () => {
    setScore(0)
    setTimeLeft(30)
    setGameActive(true)
    setActiveMole(null)
    setDifficulty(1000)
  }

  const whackMole = (index: number) => {
    if (index === activeMole && gameActive) {
      setScore(score + 1)
      setActiveMole(null)

      // Increase difficulty as score increases
      if (score > 0 && score % 5 === 0 && difficulty > 400) {
        setDifficulty((prev) => Math.max(prev - 100, 400))
      }
    }
  }

  // Game timer
  useEffect(() => {
    if (gameActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameActive])

  // Mole appearance logic
  useEffect(() => {
    const showRandomMole = () => {
      if (!gameActive) return

      // Hide current mole
      setActiveMole(null)

      // Wait a bit before showing next mole
      setTimeout(() => {
        if (gameActive) {
          const randomIndex = Math.floor(Math.random() * 9)
          setActiveMole(randomIndex)

          // Auto-hide mole after a delay
          moleTimerRef.current = setTimeout(() => {
            if (gameActive) setActiveMole(null)
          }, difficulty - 200)
        }
      }, 300)
    }

    if (gameActive) {
      showRandomMole()

      const interval = setInterval(showRandomMole, difficulty)
      return () => {
        clearInterval(interval)
        if (moleTimerRef.current) clearTimeout(moleTimerRef.current)
      }
    }
  }, [gameActive, activeMole, difficulty])

  // Clean up timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (moleTimerRef.current) clearTimeout(moleTimerRef.current)
    }
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-medium">Score: {score}</div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        <Progress value={(timeLeft / 30) * 100} className="mb-6" />

        {gameActive ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className={`aspect-square rounded-full flex items-center justify-center cursor-pointer transition-all duration-100 ${
                  activeMole === index ? "bg-amber-600 scale-100" : "bg-amber-800/20 scale-90"
                }`}
                onClick={() => whackMole(index)}
              >
                {activeMole === index && (
                  <div className="w-2/3 h-2/3 rounded-full bg-amber-950 flex items-center justify-center text-2xl">
                    🐹
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center space-y-4 py-8">
            {timeLeft === 0 ? (
              <>
                <h2 className="text-xl font-bold mb-2">Game Over!</h2>
                <p className="text-lg mb-4">Your score: {score}</p>
              </>
            ) : (
              <div className="space-y-2 mb-4">
                <h2 className="text-xl font-bold">Whack-a-Mole</h2>
                <p className="text-muted-foreground">Click on the moles as they appear to score points!</p>
              </div>
            )}
            <Button onClick={startGame}>{timeLeft === 0 ? "Play Again" : "Start Game"}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

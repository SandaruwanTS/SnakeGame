"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Clock } from "lucide-react"

const WORDS = [
  "react",
  "javascript",
  "typescript",
  "nextjs",
  "vercel",
  "tailwind",
  "component",
  "function",
  "developer",
  "coding",
  "website",
  "application",
  "interface",
  "responsive",
  "design",
]

const GAME_TIME = 60 // seconds

export default function WordScramble() {
  const [currentWord, setCurrentWord] = useState("")
  const [scrambledWord, setScrambledWord] = useState("")
  const [userInput, setUserInput] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [gameActive, setGameActive] = useState(false)
  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Start game
  const startGame = () => {
    setScore(0)
    setTimeLeft(GAME_TIME)
    setGameActive(true)
    setMessage("")
    getNewWord()
    if (inputRef.current) inputRef.current.focus()
  }

  // Get a new random word and scramble it
  const getNewWord = () => {
    const randomIndex = Math.floor(Math.random() * WORDS.length)
    const word = WORDS[randomIndex]
    setCurrentWord(word)
    setScrambledWord(scrambleWord(word))
    setUserInput("")
  }

  // Scramble a word
  const scrambleWord = (word: string) => {
    const wordArray = word.split("")
    let scrambled = ""

    // Keep scrambling until we get a different arrangement
    do {
      scrambled = wordArray.sort(() => Math.random() - 0.5).join("")
    } while (scrambled === word)

    return scrambled
  }

  // Check user's answer
  const checkAnswer = () => {
    if (userInput.toLowerCase() === currentWord) {
      setScore(score + 1)
      setMessage("Correct! 🎉")
      getNewWord()
    } else {
      setMessage("Try again!")
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (gameActive && userInput) {
      checkAnswer()
    }
  }

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false)
      setMessage(`Game over! Your score: ${score}`)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timeLeft, gameActive, score])

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

        <Progress value={(timeLeft / GAME_TIME) * 100} className="mb-6" />

        {gameActive ? (
          <>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold tracking-wider mb-2">{scrambledWord}</div>
              <p className="text-sm text-muted-foreground">Unscramble the word above</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your answer"
                className="text-center"
                autoComplete="off"
              />

              <div className="flex justify-center gap-2">
                <Button type="submit" disabled={!userInput}>
                  Check
                </Button>
                <Button type="button" variant="outline" onClick={getNewWord} className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  Skip
                </Button>
              </div>
            </form>

            {message && (
              <div className={`mt-4 text-center ${message.includes("Correct") ? "text-green-500" : "text-red-500"}`}>
                {message}
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-4">
            {message ? (
              <div className="text-xl font-medium mb-4">{message}</div>
            ) : (
              <div className="space-y-2 mb-4">
                <h2 className="text-xl font-bold">Word Scramble</h2>
                <p className="text-muted-foreground">Unscramble as many words as you can in 60 seconds!</p>
              </div>
            )}
            <Button onClick={startGame}>{message ? "Play Again" : "Start Game"}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

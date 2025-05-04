"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, Check, X } from "lucide-react"

type Question = {
  question: string
  options: number[]
  answer: number
}

type Difficulty = "easy" | "medium" | "hard"

export default function MathQuiz() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameActive, setGameActive] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null)

  // Generate a random math question based on difficulty
  const generateQuestion = (diff: Difficulty): Question => {
    let num1, num2, operation, answer, question

    switch (diff) {
      case "easy":
        num1 = Math.floor(Math.random() * 10) + 1
        num2 = Math.floor(Math.random() * 10) + 1
        operation = Math.random() > 0.5 ? "+" : "-"

        if (operation === "-" && num2 > num1) {
          ;[num1, num2] = [num2, num1] // Swap to avoid negative answers
        }

        answer = operation === "+" ? num1 + num2 : num1 - num2
        question = `${num1} ${operation} ${num2} = ?`
        break

      case "medium":
        num1 = Math.floor(Math.random() * 12) + 1
        num2 = Math.floor(Math.random() * 12) + 1
        operation = Math.random() > 0.3 ? (Math.random() > 0.5 ? "+" : "-") : "×"

        if (operation === "-" && num2 > num1) {
          ;[num1, num2] = [num2, num1]
        }

        answer = operation === "+" ? num1 + num2 : operation === "-" ? num1 - num2 : num1 * num2
        question = `${num1} ${operation} ${num2} = ?`
        break

      case "hard":
        const operations = ["+", "-", "×", "÷"]
        operation = operations[Math.floor(Math.random() * operations.length)]

        if (operation === "÷") {
          // Generate division problems with whole number answers
          answer = Math.floor(Math.random() * 10) + 1
          num2 = Math.floor(Math.random() * 10) + 1
          num1 = answer * num2
          question = `${num1} ${operation} ${num2} = ?`
        } else {
          num1 = Math.floor(Math.random() * 20) + 1
          num2 = Math.floor(Math.random() * 20) + 1

          if (operation === "-" && num2 > num1) {
            ;[num1, num2] = [num2, num1]
          }

          answer = operation === "+" ? num1 + num2 : operation === "-" ? num1 - num2 : num1 * num2
          question = `${num1} ${operation} ${num2} = ?`
        }
        break
    }

    // Generate options (including the correct answer)
    const options = [answer]

    while (options.length < 4) {
      // Generate a random offset based on difficulty
      const offset =
        diff === "easy"
          ? Math.floor(Math.random() * 5) + 1
          : diff === "medium"
            ? Math.floor(Math.random() * 10) + 1
            : Math.floor(Math.random() * 15) + 1

      // Randomly add or subtract the offset
      const wrongAnswer = answer + (Math.random() > 0.5 ? offset : -offset)

      // Only add unique and positive options
      if (!options.includes(wrongAnswer) && wrongAnswer >= 0) {
        options.push(wrongAnswer)
      }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5)

    return { question, options, answer }
  }

  // Generate a set of questions
  const generateQuestions = (diff: Difficulty, count = 10) => {
    const newQuestions = []
    for (let i = 0; i < count; i++) {
      newQuestions.push(generateQuestion(diff))
    }
    return newQuestions
  }

  // Start game with selected difficulty
  const startGame = (diff: Difficulty) => {
    setDifficulty(diff)
    setQuestions(generateQuestions(diff))
    setCurrentQuestionIndex(0)
    setScore(0)
    setTimeLeft(60)
    setGameActive(true)
    setLastAnswerCorrect(null)
  }

  // Handle answer selection
  const handleAnswer = (selectedAnswer: number) => {
    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.answer

    if (isCorrect) {
      setScore(score + 1)
    }

    setLastAnswerCorrect(isCorrect)

    // Show feedback briefly
    setTimeout(() => {
      setLastAnswerCorrect(null)

      // Move to next question or end game if no more questions
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        setGameActive(false)
      }
    }, 500)
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
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timeLeft, gameActive])

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        {gameActive ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-medium">Score: {score}</div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            <Progress value={(timeLeft / 60) * 100} className="mb-6" />

            <div className="text-center mb-6">
              <div className="text-2xl font-bold mb-2">{questions[currentQuestionIndex]?.question}</div>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {questions[currentQuestionIndex]?.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  className="text-lg py-6"
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>

            {lastAnswerCorrect !== null && (
              <div
                className={`flex items-center justify-center gap-2 mt-4 ${
                  lastAnswerCorrect ? "text-green-500" : "text-red-500"
                }`}
              >
                {lastAnswerCorrect ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5" />
                    <span>Incorrect!</span>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            {timeLeft === 0 || currentQuestionIndex > 0 ? (
              <>
                <h2 className="text-xl font-bold mb-2">Game Over!</h2>
                <p className="text-lg mb-4">Your score: {score}</p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => startGame("easy")}>Play Again (Easy)</Button>
                  <Button onClick={() => startGame("medium")}>Play Again (Medium)</Button>
                  <Button onClick={() => startGame("hard")}>Play Again (Hard)</Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2">Math Quiz</h2>
                <p className="text-muted-foreground mb-4">Test your math skills! Choose a difficulty to start.</p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => startGame("easy")}>Easy</Button>
                  <Button onClick={() => startGame("medium")}>Medium</Button>
                  <Button onClick={() => startGame("hard")}>Hard</Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

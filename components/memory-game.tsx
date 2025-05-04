"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shuffle } from "lucide-react"

type CardType = {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"]

export default function MemoryGame() {
  const [cards, setCards] = useState<CardType[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)

  // Initialize game
  useEffect(() => {
    initGame()
  }, [])

  const initGame = () => {
    // Create pairs of cards with emojis
    const duplicatedEmojis = [...emojis, ...emojis]
    const shuffledEmojis = duplicatedEmojis.sort(() => Math.random() - 0.5)

    const newCards = shuffledEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }))

    setCards(newCards)
    setFlippedCards([])
    setMoves(0)
    setGameComplete(false)
  }

  const handleCardClick = (id: number) => {
    // Don't allow more than 2 cards flipped at once
    if (flippedCards.length === 2) return

    // Don't allow clicking already matched or flipped cards
    const clickedCard = cards.find((card) => card.id === id)
    if (clickedCard?.matched || flippedCards.includes(id)) return

    // Flip the card
    const newCards = cards.map((card) => (card.id === id ? { ...card, flipped: true } : card))

    const newFlippedCards = [...flippedCards, id]

    setCards(newCards)
    setFlippedCards(newFlippedCards)

    // If we have 2 cards flipped, check for a match
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1)

      const [firstId, secondId] = newFlippedCards
      const firstCard = newCards.find((card) => card.id === firstId)
      const secondCard = newCards.find((card) => card.id === secondId)

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match found
        setTimeout(() => {
          const matchedCards = newCards.map((card) =>
            card.id === firstId || card.id === secondId ? { ...card, matched: true } : card,
          )

          setCards(matchedCards)
          setFlippedCards([])

          // Check if all cards are matched
          if (matchedCards.every((card) => card.matched)) {
            setGameComplete(true)
          }
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          const resetCards = newCards.map((card) =>
            card.id === firstId || card.id === secondId ? { ...card, flipped: false } : card,
          )

          setCards(resetCards)
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-medium">Moves: {moves}</div>
        <Button variant="outline" size="sm" onClick={initGame} className="flex items-center gap-1">
          <Shuffle className="h-4 w-4" />
          Restart
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`aspect-square flex items-center justify-center text-3xl cursor-pointer transition-all duration-300 ${
              card.flipped || card.matched ? "bg-primary/10" : "bg-primary/5"
            } ${card.matched ? "opacity-70" : "opacity-100"}`}
            onClick={() => handleCardClick(card.id)}
          >
            {card.flipped || card.matched ? card.emoji : ""}
          </Card>
        ))}
      </div>

      {gameComplete && (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold mb-2">Congratulations! 🎉</h2>
          <p className="mb-4">You completed the game in {moves} moves.</p>
          <Button onClick={initGame}>Play Again</Button>
        </div>
      )}
    </div>
  )
}

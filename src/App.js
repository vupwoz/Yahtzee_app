import "./styles.css";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const DICE_SIDES = 6;
const MAX_ROLLS = 3;
const UPPER_CATS = ["Ones", "Twos", "Threes", "Fours", "Fives", "Sixes"];
const LOWER_CATS = [
  "Three of a Kind",
  "Four of a Kind",
  "Full House",
  "Small Straight",
  "Large Straight",
  "Yahtzee",
  "Chance",
];
const CATEGORIES = [...UPPER_CATS, ...LOWER_CATS];

function rollDie() {
  return Math.floor(Math.random() * DICE_SIDES) + 1;
}

function scoreCategory(name, dice) {
  const counts = Array(7).fill(0);
  dice.forEach((d) => counts[d]++);
  const total = dice.reduce((a, b) => a + b, 0);

  switch (name) {
    case "Ones":
      return counts[1] * 1;
    case "Twos":
      return counts[2] * 2;
    case "Threes":
      return counts[3] * 3;
    case "Fours":
      return counts[4] * 4;
    case "Fives":
      return counts[5] * 5;
    case "Sixes":
      return counts[6] * 6;
    case "Three of a Kind":
      return counts.some((c) => c >= 3) ? total : 0;
    case "Four of a Kind":
      return counts.some((c) => c >= 4) ? total : 0;
    case "Full House":
      return counts.some((c) => c === 3) && counts.some((c) => c === 2)
        ? 25
        : 0;
    case "Small Straight": {
      const runs = [
        [1, 2, 3, 4],
        [2, 3, 4, 5],
        [3, 4, 5, 6],
      ];
      for (const r of runs) if (r.every((i) => counts[i] > 0)) return 30;
      return 0;
    }
    case "Large Straight":
      return (counts[1] && counts[2] && counts[3] && counts[4] && counts[5]) ||
        (counts[2] && counts[3] && counts[4] && counts[5] && counts[6])
        ? 40
        : 0;
    case "Yahtzee":
      return counts.some((c) => c === 5) ? 50 : 0;
    case "Chance":
      return total;
    default:
      return 0;
  }
}

export default function YahtzeeGame() {
  const [dice, setDice] = useState([1, 1, 1, 1, 1]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState(MAX_ROLLS);
  const [message, setMessage] = useState("Welcome — press ROLL to start");
  const [scores, setScores] = useState(
    Object.fromEntries(CATEGORIES.map((c) => [c, null]))
  );
  const [gameHistory, setGameHistory] = useState([]);

  useEffect(() => setDice(dice.map(() => rollDie())), []);

  const totalScore = Object.values(scores).reduce((a, c) => a + (c || 0), 0);

  function roll() {
    if (rollsLeft <= 0) return;
    setDice(dice.map((v, i) => (held[i] ? v : rollDie())));
    setRollsLeft((r) => r - 1);
    setMessage(`Rolled — ${rollsLeft - 1} rolls left`);
  }

  function toggleHold(i) {
    setHeld((h) => {
      const copy = [...h];
      copy[i] = !copy[i];
      return copy;
    });
  }

  function applyScore(cat) {
    if (scores[cat] !== null) return;
    const pts = scoreCategory(cat, dice);
    setScores((s) => ({ ...s, [cat]: pts }));
    setHeld([false, false, false, false, false]);
    setRollsLeft(MAX_ROLLS);
    setDice(dice.map(() => rollDie()));
    setMessage(`${cat} scored ${pts}`);
  }

  function newGame() {
    if (totalScore > 0)
      setGameHistory((h) => [
        { date: new Date().toLocaleString(), score: totalScore },
        ...h,
      ]);
    setScores(Object.fromEntries(CATEGORIES.map((c) => [c, null])));
    setDice(dice.map(() => rollDie()));
    setHeld([false, false, false, false, false]);
    setRollsLeft(MAX_ROLLS);
    setMessage("New game — press ROLL");
  }

  function dieFace(n) {
    const pips = {
      1: [[2, 2]],
      2: [
        [1, 1],
        [3, 3],
      ],
      3: [
        [1, 1],
        [2, 2],
        [3, 3],
      ],
      4: [
        [1, 1],
        [1, 3],
        [3, 1],
        [3, 3],
      ],
      5: [
        [1, 1],
        [1, 3],
        [2, 2],
        [3, 1],
        [3, 3],
      ],
      6: [
        [1, 1],
        [1, 2],
        [1, 3],
        [3, 1],
        [3, 2],
        [3, 3],
      ],
    };
    return (
      <motion.svg
        viewBox="0 0 4 4"
        width="60"
        height="60"
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 0.4 }}
      >
        <rect
          x="0"
          y="0"
          width="4"
          height="4"
          rx="0.5"
          fill="white"
          stroke="black"
          strokeWidth="0.1"
        />
        {pips[n].map((p, j) => (
          <circle key={j} cx={p[0]} cy={p[1]} r="0.25" fill="orange" />
        ))}
      </motion.svg>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom, black, gray, orange)",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "black",
          border: "4px solid orange",
          borderRadius: "20px",
          padding: "20px",
          textAlign: "center",
          color: "white",
        }}
      >
        <h1
          style={{
            fontFamily: "'Comic Sans MS', cursive",
            fontSize: "2.5em",
            marginBottom: "10px",
          }}
        >
          🎲 Fun Yahtzee!
        </h1>
        <div
          style={{ color: "orange", fontWeight: "bold", marginBottom: "10px" }}
        >
          Rolls left: {rollsLeft}
        </div>
        <div style={{ fontStyle: "italic", marginBottom: "20px" }}>
          {message}
        </div>

        {/* Dice */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {dice.map((d, i) => (
            <button
              key={i}
              onClick={() => toggleHold(i)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "5px",
                borderRadius: "12px",
                border: held[i] ? "3px solid orange" : "2px solid white",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              {dieFace(d)}
              <span
                style={{ marginTop: "5px", fontWeight: "bold", color: "black" }}
              >
                {held[i] ? "HELD" : "HOLD"}
              </span>
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={roll}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              backgroundColor: rollsLeft > 0 ? "orange" : "gray",
              color: "black",
              fontWeight: "bold",
              borderRadius: "12px",
              cursor: rollsLeft > 0 ? "pointer" : "not-allowed",
            }}
          >
            Roll
          </button>
          <button
            onClick={newGame}
            style={{
              padding: "10px 20px",
              backgroundColor: "white",
              color: "black",
              fontWeight: "bold",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            New Game
          </button>
        </div>

        {/* Score Sheet */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderTop: "2px solid orange",
            borderBottom: "2px solid orange",
            marginBottom: "20px",
          }}
        >
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 10px",
                backgroundColor: i % 2 === 0 ? "#222" : "#111",
              }}
            >
              <span>{cat}</span>
              <span>
                {scores[cat] ?? "—"}{" "}
                {scores[cat] === null && (
                  <button
                    onClick={() => applyScore(cat)}
                    style={{
                      backgroundColor: "orange",
                      color: "black",
                      borderRadius: "8px",
                      marginLeft: "5px",
                      padding: "2px 5px",
                      cursor: "pointer",
                    }}
                  >
                    Score
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            backgroundColor: "orange",
            color: "black",
            fontWeight: "bold",
            padding: "10px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          Total Score: {totalScore}
        </div>

        {gameHistory.length > 0 && (
          <div
            style={{
              backgroundColor: "white",
              color: "black",
              borderRadius: "12px",
              padding: "10px",
            }}
          >
            <h2 style={{ fontWeight: "bold", marginBottom: "10px" }}>
              Game History
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "orange" }}>
                <tr>
                  <th style={{ border: "1px solid black" }}>#</th>
                  <th style={{ border: "1px solid black" }}>Date</th>
                  <th style={{ border: "1px solid black" }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {gameHistory.map((g, i) => (
                  <tr
                    key={i}
                    style={{ backgroundColor: i % 2 === 0 ? "#eee" : "#ccc" }}
                  >
                    <td style={{ border: "1px solid black" }}>{i + 1}</td>
                    <td style={{ border: "1px solid black" }}>{g.date}</td>
                    <td style={{ border: "1px solid black" }}>{g.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

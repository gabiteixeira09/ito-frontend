import React, { useEffect, useState } from "react";
import socket from "../socket";
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
} from "@mui/material";
import OrderBoard from "./OrderBoard";

function Game({ room }) {
  const [players, setPlayers] = useState({});
  const [clue, setClue] = useState("");
  const [messages, setMessages] = useState([]);
  const [myCard, setMyCard] = useState(null);
  const [theme, setTheme] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [clueSent, setClueSent] = useState(false);

  // estados para tema livre
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customLow, setCustomLow] = useState("");
  const [customHigh, setCustomHigh] = useState("");

  useEffect(() => {
    socket.on("updateRoom", (roomData) => setPlayers(roomData.players));

    socket.on("gameStarted", () => setGameStarted(true));

    socket.on("newClue", (data) => {
      setMessages((prev) => [
        ...prev,
        `${data.name || "SemNome"}: ${data.clue}`,
      ]);
    });

    socket.on("yourCard", (card) => {
      setMyCard(card);
      setClueSent(false);
    });

    socket.on("newTheme", (theme) => {
      setTheme(theme);
      setClueSent(false);
    });

    // 🔹 Resetar estados quando host inicia nova partida
    socket.on("newGameStarted", () => {
        console.log("📥 Evento newGameStarted recebido, resetando estados");
      setTheme(null);
      setMyCard(null);
      setMessages([]);
      setClue("");
      setClueSent(false);
    });

    return () => {
      socket.off("updateRoom");
      socket.off("gameStarted");
      socket.off("newClue");
      socket.off("yourCard");
      socket.off("newTheme");
      socket.off("newGameStarted");
    };
  }, []);

  const sendClue = () => {
    if (!clue.trim()) return;
    socket.emit("sendClue", { roomCode: room.code, clue });
    setClue("");
    setClueSent(true);
  };

  const startGame = () => {
    socket.emit("startGame", room.code);
  };

  const startRound = () => {
    socket.emit("startRound", room.code);
    setMessages([]);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 3,
        backgroundColor: "#2c3e47",
      }}
    >
      {/* Sala */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "white" }}>
        Sala: {room.code}
      </Typography>

      {/* Jogadores */}
      <Paper elevation={4} sx={{ width: "100%", p: 2, mb: 3, borderRadius: "12px" }}>
        <Typography variant="h6" gutterBottom>
          Jogadores
        </Typography>
        <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
          {Object.values(players).map((p, i) => (
            <li key={i}>{p.name}</li>
          ))}
        </ul>
      </Paper>

      {/* Antes de iniciar a partida */}
      {room.isHost && !gameStarted && (
        <Button
          fullWidth
          variant="contained"
          sx={{
            mb: 3,
            py: 1.5,
            borderRadius: "12px",
            backgroundColor: "#f97316",
            "&:hover": { backgroundColor: "#ea580c" },
          }}
          onClick={startGame}
        >
          Iniciar Partida
        </Button>
      )}

      {/* Escolha de tema */}
      {room.isHost && gameStarted && !theme && (
        <Paper elevation={3} sx={{ width: "100%", p: 2, mb: 3, borderRadius: "12px" }}>
          <Typography variant="h6" gutterBottom>
            Escolher Tema
          </Typography>

          <Button
            fullWidth
            variant="contained"
            sx={{
              mb: 2,
              backgroundColor: "#f97316",
              "&:hover": { backgroundColor: "#ea580c" },
            }}
            onClick={startRound}
          >
            Sortear Tema
          </Button>

          <Button
            fullWidth
            variant="outlined"
            sx={{ borderColor: "#f97316", color: "#f97316" }}
            onClick={() => setShowCustomTheme(true)}
          >
            Tema Livre
          </Button>
        </Paper>
      )}

      {/* Formulário de tema livre */}
      {room.isHost && showCustomTheme && !theme && (
        <Paper elevation={3} sx={{ width: "100%", p: 2, mb: 3, borderRadius: "12px" }}>
          <TextField
            label="Título do Tema"
            variant="outlined"
            fullWidth
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Valor 1"
            variant="outlined"
            fullWidth
            value={customLow}
            onChange={(e) => setCustomLow(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Valor 100"
            variant="outlined"
            fullWidth
            value={customHigh}
            onChange={(e) => setCustomHigh(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#f97316",
              "&:hover": { backgroundColor: "#ea580c" },
            }}
            onClick={() => {
              socket.emit("customTheme", {
                roomCode: room.code,
                title: customTitle,
                low: customLow,
                high: customHigh,
              });
              setShowCustomTheme(false);
            }}
          >
            Confirmar Tema
          </Button>
        </Paper>
      )}

      {/* Tema sorteado ou livre */}
      {theme && (
        <Paper elevation={3} sx={{ width: "100%", p: 2, mb: 3, borderRadius: "12px", backgroundColor: "#e0f2fe" }}>
          <Typography variant="h6" sx={{ color: "#0369a1", fontWeight: "bold" }}>
            {theme.title}
          </Typography>
          <Typography><b>1:</b> {theme.low}</Typography>
          <Typography><b>100:</b> {theme.high}</Typography>
        </Paper>
      )}

      {/* Carta e pista */}
      {myCard && (
        <Paper elevation={3} sx={{ width: "100%", p: 2, mb: 3, borderRadius: "12px", backgroundColor: "#fff3cd" }}>
          <Typography variant="h5" sx={{ color: "red", fontWeight: "bold", mb: 2 }}>
            Sua carta: {myCard}
          </Typography>

          <TextField
            label="Sua pista"
            variant="outlined"
            fullWidth
            value={clue}
            disabled={clueSent}
            onChange={(e) => setClue(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={sendClue}
            disabled={clueSent}
            sx={{
              py: 1.5,
              borderRadius: "12px",
              backgroundColor: clueSent ? "gray" : "#f97316",
              "&:hover": { backgroundColor: clueSent ? "gray" : "#ea580c" },
            }}
          >
            {clueSent ? "Pista enviada" : "Enviar Pista"}
          </Button>
        </Paper>
      )}

      {/* Pistas recebidas */}
      <Paper elevation={4} sx={{ width: "100%", p: 2, mb: 3, borderRadius: "12px" }}>
        <Typography variant="h6" gutterBottom>
          Pistas recebidas
        </Typography>
        <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
          <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {messages.map((m, i) => (
              <li key={i}>
                <Typography variant="body1">{m}</Typography>
              </li>
            ))}
          </ul>
        </Box>
      </Paper>

      {/* Organização da ordem */}
      {theme && <OrderBoard room={{ ...room, players }} />}

      {/* Rodapé */}
      <Typography
        variant="body2"
        sx={{ mt: 4, textAlign: "center", color: "gray", fontStyle: "italic" }}
      >
        App designed by Gabriela Teixeira
      </Typography>
    </Container>
  );
}

export default Game;

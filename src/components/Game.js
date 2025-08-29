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
  const [roundStarted, setRoundStarted] = useState(false);
  const [clueSent, setClueSent] = useState(false);

  useEffect(() => {
    socket.on("updateRoom", (roomData) => setPlayers(roomData.players));

    socket.on("newClue", (data) => {
      setMessages((prev) => [
        ...prev,
        `${data.name || "SemNome"}: ${data.clue}`,
      ]);
    });

    socket.on("yourCard", (card) => {
      setMyCard(card);
      setRoundStarted(true);
      setClueSent(false);
    });

    socket.on("newTheme", (theme) => {
      setTheme(theme);
      setClueSent(false);
    });

    return () => {
      socket.off("updateRoom");
      socket.off("newClue");
      socket.off("yourCard");
      socket.off("newTheme");
    };
  }, []);

  const sendClue = () => {
    if (!clue.trim()) return;
    socket.emit("sendClue", { roomCode: room.code, clue });
    setClue("");
    setClueSent(true);
  };

  const startRound = () => {
    socket.emit("startRound", room.code);
    setRoundStarted(true);
    setClueSent(false);
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
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "white" }}
      >
        Sala: {room.code}
      </Typography>

      {/* Jogadores */}
      <Paper
        elevation={4}
        sx={{ width: "100%", p: 2, mb: 3, borderRadius: "12px" }}
      >
        <Typography variant="h6" gutterBottom>
          Jogadores
        </Typography>
        <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
          {Object.values(players).map((p, i) => (
            <li key={i}>{p.name}</li>
          ))}
        </ul>
      </Paper>

      {/* Botão iniciar rodada */}
      {room.isHost && !roundStarted && (
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
          onClick={startRound}
        >
          Iniciar Rodada
        </Button>
      )}

      {/* Tema sorteado */}
      {theme && (
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            p: 2,
            mb: 3,
            borderRadius: "12px",
            backgroundColor: "#e0f2fe",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#0369a1", fontWeight: "bold" }}
          >
            {theme.title}
          </Typography>
          <Typography>
            <b>1:</b> {theme.low}
          </Typography>
          <Typography>
            <b>100:</b> {theme.high}
          </Typography>
        </Paper>
      )}

      {/* Carta e pista */}
      {myCard && (
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            p: 2,
            mb: 3,
            borderRadius: "12px",
            backgroundColor: "#fff3cd",
          }}
        >
          <Typography
            variant="h5"
            sx={{ color: "red", fontWeight: "bold", mb: 2 }}
          >
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
      <Paper
        elevation={4}
        sx={{ width: "100%", p: 2, mb: 3, borderRadius: "12px" }}
      >
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
      {roundStarted && <OrderBoard room={{ ...room, players }} />}
    </Container>
  );
}

export default Game;

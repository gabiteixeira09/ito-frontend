import React, { useState } from "react";
import socket from "../socket";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";

function Lobby({ setRoom }) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreate = () => {
    if (!name.trim()) {
      setErrorMessage("Digite seu nome para criar a sala!");
      return;
    }
    setErrorMessage("");

    socket.emit("createRoom", { playerName: name.toUpperCase() }, (code) => {
      setRoom({ code, name: name.toUpperCase(), isHost: true });
    });
  };

  const handleJoin = () => {
    if (!name.trim() || !roomCode.trim()) {
      setErrorMessage("Digite seu nome e o código da sala!");
      return;
    }
    setErrorMessage("");

    socket.emit(
      "joinRoom",
      { roomCode, playerName: name.toUpperCase() },
      (status) => {
        if (status === "ok") {
          setRoom({
            code: roomCode,
            name: name.toUpperCase(),
            isHost: false,
          });
        } else if (status === "notFound") {
          setErrorMessage("Sala não encontrada.");
        } else if (status === "alreadyStarted") {
          setErrorMessage(
            "A partida já foi iniciada, não é possível entrar agora."
          );
        }
      }
    );
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2c3e47",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: "2rem",
          borderRadius: "16px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#2c3e47" }}
        >
          Bem-vindo ao PITITO 
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <TextField
          label="Seu nome"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          sx={{ mb: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: "#f97316",
            "&:hover": { backgroundColor: "#ea580c" },
            borderRadius: "12px",
            mb: 3,
          }}
          onClick={handleCreate}
        >
          Criar Sala
        </Button>

        <TextField
          label="Código da sala"
          variant="outlined"
          fullWidth
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          sx={{ mb: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: "#f97316",
            "&:hover": { backgroundColor: "#ea580c" },
            borderRadius: "12px",
          }}
          onClick={handleJoin}
        >
          Entrar na Sala
        </Button>
        {/* Rodapé */}
        <Typography
        variant="body2"
        sx={{
            mt: 3,
            textAlign: "center",
            color: "gray",
            fontStyle: "italic",
        }}
        >
        App designed by Gabriela Teixeira
        </Typography>
      </Paper>
    </Container>
  );
}

export default Lobby;

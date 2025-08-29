import React, { useState } from "react";
import socket from "../socket";
import { Container, Paper, Typography, TextField, Button } from "@mui/material";

function Lobby({ setRoom }) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Digite seu nome!");
      return;
    }
    socket.emit("createRoom", { playerName: name.toUpperCase() }, (code) => {
      setRoom({ code, name: name.toUpperCase(), isHost: true });
    });
  };

  const handleJoin = () => {
    if (!name.trim() || !roomCode.trim()) {
      alert("Digite nome e código!");
      return;
    }
    socket.emit("joinRoom", { roomCode, playerName: name.toUpperCase() }, (ok) => {
      if (ok) {
        setRoom({ code: roomCode, name: name.toUpperCase(), isHost: false });
      } else {
        alert("Sala não encontrada!");
      }
    });
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2c3e47", // fundo cinza escuro
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
          Bem-vindo ao ITO 🎴
        </Typography>

        <TextField
          label="Seu nome"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          sx={{ marginBottom: "1.5rem" }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: "#f97316",
            "&:hover": { backgroundColor: "#ea580c" },
            borderRadius: "12px",
            marginBottom: "2rem",
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
          sx={{ marginBottom: "1.5rem" }}
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
      </Paper>
    </Container>
  );
}

export default Lobby;

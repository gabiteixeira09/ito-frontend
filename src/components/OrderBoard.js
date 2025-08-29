import React, { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import socket from "../socket";
import { Paper, Button, Typography } from "@mui/material";

function SortableItem({ id, name }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px",
    marginBottom: "8px",
    background: "#f1f5f9",
    borderRadius: "8px",
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {name}
    </div>
  );
}

export default function OrderBoard({ room }) {
  const [order, setOrder] = useState([]);
  const [revealed, setRevealed] = useState([]);

  useEffect(() => {
    socket.on("orderUpdated", (newOrder) => setOrder(newOrder));
    socket.on("revealResult", (data) => setRevealed(data));

    return () => {
      socket.off("orderUpdated");
      socket.off("revealResult");
    };
  }, []);

  useEffect(() => {
    // Inicializa ordem com os jogadores da sala
    setOrder(Object.keys(room.players));
  }, [room.players]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = order.indexOf(active.id);
      const newIndex = order.indexOf(over.id);
      const newOrder = arrayMove(order, oldIndex, newIndex);
      setOrder(newOrder);
      socket.emit("updateOrder", { roomCode: room.code, newOrder });
    }
  };

  const confirm = () => {
    socket.emit("confirmOrder", room.code);
  };

  return (
    <Paper elevation={4} sx={{ p: 2, mt: 3, width: "100%", borderRadius: "12px" }}>
      <Typography variant="h6" gutterBottom>
        Organizar ordem das cartas
      </Typography>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          {order.map((id) => (
            <SortableItem key={id} id={id} name={room.players[id]?.name} />
          ))}
        </SortableContext>
      </DndContext>

      {room.isHost && (
        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: "#f97316",
            "&:hover": { backgroundColor: "#ea580c" },
            borderRadius: "12px",
          }}
          onClick={confirm}
        >
          Confirmar Ordem
        </Button>
      )}

      {/* Resultado revelado */}
      {revealed.length > 0 && (
        <Paper
          elevation={2}
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: "#fff",
            borderRadius: "12px",
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#2c3e47" }}>
            Ordem Confirmada
          </Typography>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {revealed.map((p, i) => (
              <li key={i} style={{ marginBottom: "6px" }}>
                <b>{i + 1}º</b> — {p.name}:{" "}
                <span style={{ color: "red", fontWeight: "bold" }}>{p.card}</span>
              </li>
            ))}
          </ul>
        </Paper>
      )}
    </Paper>
  );
}

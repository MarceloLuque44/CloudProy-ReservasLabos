import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import {
  ReservaError,
  obtenerHorarios,
  crearReserva,
  obtenerReserva,
  cancelarReserva,
  listarReservas,
} from "./reservas.js";

const app = express();
const port = 3001;

app.use(express.json());

if (process.env.DEVELOPMENT) {
  app.use(cors());
}

app.get("/", (req, res) => {
  res.send("API de reservas de laboratorios");
});

app.get("/horarios", async (req, res) => {
  try {
    const respuesta = await obtenerHorarios(req.query);
    res.send(respuesta);
  } catch (err) {
    if (err instanceof ReservaError) {
      res.status(err.estado).send({ mensaje: err.message });
      return;
    }
    res.status(500).send({ mensaje: "Error al consultar los horarios." });
  }
});

app.post("/reservas", async (req, res) => {
  try {
    const reserva = await crearReserva(req.body);
    res.status(201).send(reserva);
  } catch (err) {
    if (err instanceof ReservaError) {
      res.status(err.estado).send({ mensaje: err.message });
      return;
    }
    res.status(500).send({ mensaje: "Error interno al registrar la reserva." });
  }
});

app.get("/reservas", async (req, res) => {
  try {
    const respuesta = await listarReservas();
    res.send(respuesta);
  } catch (err) {
    res.status(500).send({ mensaje: "Error al listar las reservas." });
  }
});

app.get("/reservas/:codigo", async (req, res) => {
  try {
    const reserva = await obtenerReserva(req.params.codigo);
    res.send(reserva);
  } catch (err) {
    if (err instanceof ReservaError) {
      res.status(err.estado).send({ mensaje: err.message });
      return;
    }
    res.status(500).send({ mensaje: "Error al consultar la reserva." });
  }
});

app.delete("/reservas/:codigo", async (req, res) => {
  try {
    const reserva = await cancelarReserva(req.params.codigo);
    res.send(reserva);
  } catch (err) {
    if (err instanceof ReservaError) {
      res.status(err.estado).send({ mensaje: err.message });
      return;
    }
    res.status(500).send({ mensaje: "Error al cancelar la reserva." });
  }
});

if (process.env.DEVELOPMENT) {
  app.listen(port, () => {
    console.log(`API de reservas listening on port ${port}`);
  });
}

export const handler = serverless(app);

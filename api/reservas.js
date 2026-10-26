// Lógica de reservas adaptada de backend/lambda/registrarReserva de CloudProyectoFunciones
// al estilo del proyecto ya desplegado (Express + SDK v3 de DynamoDB).
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
  GetCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const client = new DynamoDBClient({ region: "us-east-2" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLA_RESERVAS = process.env.TABLA_RESERVAS || "ReservasLaboratorio";

export class ReservaError extends Error {
  constructor(mensaje, estado) {
    super(mensaje);
    this.estado = estado;
  }
}

export const HORARIOS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
];

const normalizar = (texto) =>
  String(texto).trim().toUpperCase().replace(/\s+/g, "_");

const hoyISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

// GET /horarios?fecha=...&laboratorio=...
// comit prueba
export const obtenerHorarios = async ({ fecha, laboratorio }) => {
  if (!fecha || !laboratorio) {
    throw new ReservaError("Indica la fecha y el laboratorio", 400);
  }

  const command = new QueryCommand({
    TableName: TABLA_RESERVAS,
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: {
      ":pk": `LAB#${normalizar(laboratorio)}#${fecha}`,
    },
  });

  const response = await docClient.send(command);

  const ocupados = (response.Items ?? [])
    .filter((item) => item.estado === "CONFIRMADA")
    .map((item) => item.horario);

  return {
    fecha,
    laboratorio,
    horarios: HORARIOS.map((horario) => ({
      horario,
      disponible: !ocupados.includes(horario),
    })),
  };
};

// POST /reservas
export const crearReserva = async (datos) => {
  const obligatorios = [
    "nombre",
    "tipoSolicitante",
    "sigla",
    "materia",
    "actividad",
    "laboratorio",
    "fecha",
    "horario",
  ];
  const faltan = obligatorios.filter((c) => !String(datos?.[c] ?? "").trim());
  if (faltan.length) {
    throw new ReservaError(`Faltan datos obligatorios: ${faltan.join(", ")}`, 400);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)) {
    throw new ReservaError("Fecha inválida. Usa el formato YYYY-MM-DD.", 400);
  }
  if (datos.fecha < hoyISO()) {
    throw new ReservaError("No se puede reservar una fecha pasada.", 400);
  }
  if (!HORARIOS.includes(datos.horario)) {
    throw new ReservaError("El horario indicado no existe", 400);
  }

  const codigo = `RES-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()
    .slice(0, 6)}`;

  const item = {
    PK: `LAB#${normalizar(datos.laboratorio)}#${datos.fecha}`,
    SK: `SLOT#${datos.horario}`,
    codigo,
    nombre: datos.nombre.trim(),
    tipoSolicitante: datos.tipoSolicitante,
    sigla: datos.sigla.trim(),
    materia: datos.materia.trim(),
    actividad: datos.actividad,
    laboratorio: datos.laboratorio,
    fecha: datos.fecha,
    horario: datos.horario,
    estado: "CONFIRMADA",
    creadaEn: new Date().toISOString(),
    GSI1PK: `CODIGO#${codigo}`,
    GSI1SK: "RESERVA",
  };

  if (datos.paralelo && String(datos.paralelo).trim()) {
    item.paralelo = datos.paralelo.trim();
  }

  const command = new PutCommand({
    TableName: TABLA_RESERVAS,
    Item: item,
    ConditionExpression: "attribute_not_exists(PK)",
  });

  try {
    await docClient.send(command);
    return item;
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      throw new ReservaError(
        "Ese laboratorio ya está reservado en esa fecha y horario",
        409
      );
    }
    throw err;
  }
};

// GET /reservas/{codigo}
export const obtenerReserva = async (codigo) => {
  const clave = String(codigo).trim().toUpperCase();

  const command = new QueryCommand({
    TableName: TABLA_RESERVAS,
    IndexName: "GSI1_Codigo",
    KeyConditionExpression: "GSI1PK = :gpk",
    ExpressionAttributeValues: {
      ":gpk": `CODIGO#${clave}`,
    },
  });

  const response = await docClient.send(command);
  const reserva = (response.Items ?? [])[0];

  if (!reserva) {
    throw new ReservaError("No existe una reserva con ese código", 404);
  }
  return reserva;
};

// DELETE /reservas/{codigo} -> cancelar reserva y liberar el horario
export const cancelarReserva = async (codigo) => {
  const reserva = await obtenerReserva(codigo);

  if (reserva.estado === "CANCELADA") {
    throw new ReservaError("Esa reserva ya estaba cancelada", 409);
  }

  const command = new DeleteCommand({
    TableName: TABLA_RESERVAS,
    Key: { PK: reserva.PK, SK: reserva.SK },
  });

  await docClient.send(command);

  return {
    ...reserva,
    estado: "CANCELADA",
    canceladaEn: new Date().toISOString(),
  };
};

// GET /reservas
export const listarReservas = async () => {
  const command = new ScanCommand({ TableName: TABLA_RESERVAS });

  const response = await docClient.send(command);

  const reservas = (response.Items ?? []).sort((a, b) =>
    `${a.fecha} ${a.horario}`.localeCompare(`${b.fecha} ${b.horario}`)
  );

  return { reservas };
};

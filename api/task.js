import { ListTablesCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  UpdateCommand,
  PutCommand,
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const client = new DynamoDBClient({ region: "us-west-1" });
const docClient = DynamoDBDocumentClient.from(client);


const fetchTasks = async () => {
  try {
    const { data } = await axios.get(API_URL);

    // Lambda devuelve la respuesta HTTP completa como objeto.
    const body = data.body;

    // El body contiene un JSON serializado.
    const tasks = typeof body === "string"
      ? JSON.parse(body)
      : body;

    if (!Array.isArray(tasks)) {
      console.error("La respuesta no contiene una lista:", tasks);
      setTasks([]);
      return;
    }

    setTasks(tasks);
  } catch (err) {
    console.error(
      "Error al obtener tareas:",
      err.response?.data ?? err.message
    );
    setTasks([]);
  }
};


export const createTasks = async ({ name, completed }) => {
  const uuid = crypto.randomUUID();
  const command = new PutCommand({
    TableName: "Tasks",
    Item: {
      id: uuid,
      name,
      completed,
    },
  });

  const response = await docClient.send(command);

  return response;
};

export const updateTasks = async ({ id, name, completed }) => {
  const command = new UpdateCommand({
    TableName: "Tasks",
    Key: {
      id,
    },
    ExpressionAttributeNames: {
      "#name": "name",
    },
    UpdateExpression: "set #name = :n, completed = :c",
    ExpressionAttributeValues: {
      ":n": name,
      ":c": completed,
    },
    ReturnValues: "ALL_NEW",
  });

  const response = await docClient.send(command);

  return response;
};

export const deleteTasks = async (id) => {
  const command = new DeleteCommand({
    TableName: "Tasks",
    Key: {
      id,
    },
  });

  const response = await docClient.send(command);

  return response;
};

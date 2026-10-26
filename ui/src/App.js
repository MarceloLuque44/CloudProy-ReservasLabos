import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AddTaskForm } from "./components/AddTaskForm";
import { Task } from "./components/Task";
import axios from "axios";
import { API_URL } from "./utils";

const darkTheme = createTheme({
  palette: { mode: "dark" },
});

export default function App() {
  const [tasks, setTasks] = useState([]);

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

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <h2>Prueba de tareas</h2>
      <p>Total de tareas: {tasks.length}</p>
      <AddTaskForm fetchTasks={fetchTasks} />
      {tasks.map((task) => (
        <Task
          task={task}
          key={task.id}
          fetchTasks={fetchTasks}
        />
      ))}
    </ThemeProvider>
  );
}

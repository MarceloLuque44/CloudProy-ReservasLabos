import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AddTaskForm } from "./components/AddTaskForm";
import { Task } from "./components/Task";
import axios from "axios";
import { API_URL } from "./utils";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function App() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
  try {
    const { data } = await axios.get(API_URL);

    console.log("Respuesta de la API:", data);

    if (!Array.isArray(data)) {
      console.error("La API no devolvió una lista:", data);
      setTasks([]);
      return;
    }

    setTasks(data);
  } catch (err) {
    console.error(
      "Error al obtener tareas:",
      err.response?.status,
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
      <AddTaskForm fetchTasks={fetchTasks} />
      {tasks.map((task) => (
        <Task task={task} key={task.id} fetchTasks={fetchTasks} />
      ))}
    </ThemeProvider>
  );
}

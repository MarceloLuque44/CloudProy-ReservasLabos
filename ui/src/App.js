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
      const response = await axios.get(API_URL);
      const data = response.data;

      console.log("API_URL:", API_URL);
      console.log("Respuesta:", data);
      console.log("¿Es array?:", Array.isArray(data));

      if (!Array.isArray(data)) {
        console.error("La API no devuelve un array:", data);
        setTasks([]);
        return;
      }

      setTasks(data);
    } catch (err) {
      console.error("Error de API:", err.response?.data ?? err.message);
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

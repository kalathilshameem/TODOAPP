"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "./firebase";

export default function ToDoApp() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Low");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const tasksRef = collection(db, "tasks");

  // Sign up a new user
  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      alert("Error signing up: " + error.message);
    }
  };

  // Log in an existing user
  const logIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      alert("Error logging in: " + error.message);
    }
  };

  // Fetch tasks in real time
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const tasksData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (task) =>
            task.ownerId === user.uid || task.collaborators.includes(user.uid)
        );

      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [user]);

  // Add a new task
  const addTask = async () => {
    if (task.trim()) {
      const newTask = {
        title: task,
        description,
        dueDate,
        priority,
        completed: false,
        ownerId: user.uid,
        collaborators: [],
      };

      const docRef = await addDoc(tasksRef, newTask);
      setTasks([...tasks, { id: docRef.id, ...newTask }]);
      setTask("");
      setDescription("");
      setDueDate("");
      setPriority("Low");
    }
  };

  // Add a collaborator to a task
  const addCollaborator = async (taskId, email) => {
    try {
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const collaboratorId = userSnapshot.docs[0].id;

        const taskDoc = doc(db, "tasks", taskId);
        await updateDoc(taskDoc, {
          collaborators: arrayUnion(collaboratorId),
        });

        setTasks(
          tasks.map((task) =>
            task.id === taskId
              ? { ...task, collaborators: [...task.collaborators, collaboratorId] }
              : task
          )
        );
      } else {
        alert("User not found!");
      }
    } catch (error) {
      alert("Error adding collaborator: " + error.message);
    }
  };

  // Toggle task completion
  const toggleTask = async (id, completed) => {
    const taskDoc = doc(db, "tasks", id);
    await updateDoc(taskDoc, { completed: !completed });

    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
  };

  // Delete a task
  const deleteTask = async (id) => {
    const taskDoc = doc(db, "tasks", id);
    await deleteDoc(taskDoc);

    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Collaborative To-Do App</h1>

        {/* Authentication */}
        {!user ? (
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 mb-2 border rounded"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 mb-2 border rounded"
            />
            <button onClick={signUp} className="w-full p-2 bg-blue-500 text-white rounded">
              Sign Up
            </button>
            <button onClick={logIn} className="w-full mt-2 p-2 bg-green-500 text-white rounded">
              Log In
            </button>
          </div>
        ) : (
          <p className="mb-4">Welcome, {user.email}</p>
        )}

        {/* Add Task Form */}
        <div className="mb-4">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Task Title"
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task Description"
            className="w-full p-2 mb-2 border rounded"
          ></textarea>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <button onClick={addTask} className="w-full p-2 bg-blue-500 text-white rounded">
            Add Task
          </button>
        </div>

        {/* Task List */}
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li
              key={t.id}
              className={`p-4 border rounded ${t.priority === "High"
                  ? "border-red-500"
                  : t.priority === "Medium"
                    ? "border-yellow-500"
                    : "border-green-500"
                }`}
            >
              <h2 className="font-bold">{t.title}</h2>
              <p>{t.description}</p>
              <p>Due: {t.dueDate || "No due date"}</p>
              <p>Priority: {t.priority}</p>
              <div>
                <h3 className="font-bold">Collaborators</h3>
                <ul>
                  {t.collaborators.map((collaborator, index) => (
                    <li key={index} className="text-gray-600">
                      {collaborator}
                    </li>
                  ))}
                </ul>
                {t.ownerId === user.uid && (
                  <div className="mt-2">
                    <input
                      type="email"
                      placeholder="Add collaborator by email"
                      className="p-2 border rounded"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addCollaborator(t.id, e.target.value);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => toggleTask(t.id, t.completed)}
                  className={`p-1 rounded ${t.completed
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-800"
                    }`}
                >
                  {t.completed ? "Completed" : "Mark Complete"}
                </button>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
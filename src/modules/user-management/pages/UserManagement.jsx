// src/modules/user-management/pages/UserManagement.jsx
// Página contenedora principal que maneja las rutas de usuarios

import React from "react";
import { Routes, Route } from "react-router-dom";
import UserList from "../components/UserList";
import CreateUserForm from "../components/CreateUserForm";
import EditUserForm from "../components/EditUserForm";
import AssignPermissions from "../components/AssignPermissions";
import AssignSchedule from "../components/AssignSchedule";

const UserManagement = () => {
  return (
    <Routes>
      <Route path="/" element={<UserList />} />
      <Route path="/list" element={<UserList />} />
      <Route path="/new" element={<CreateUserForm />} />
      <Route path="/edit/:id" element={<EditUserForm />} />
      <Route path="/permissions" element={<AssignPermissions />} />
      <Route path="/schedule" element={<AssignSchedule />} />
    </Routes>
  );
};

export default UserManagement;

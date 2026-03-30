// UserManagementPage.jsx - Página principal refactorizada manteniendo toda la funcionalidad
import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// Componentes modularizados
import UserList from "../components/UserList";
import CreateUserForm from "../components/CreateUserForm";
import EditUserForm from "../components/EditUserForm";
import { UserProvider } from "../context/UserContext";
import AssignPermissions from "../components/AssignPermissions";
import AssignSchedule from "../components/AssignSchedule";

const UserManagementPageContent = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route index element={<Navigate to="list" replace />} />
      <Route 
        path="list" 
        element={
          <UserList 
            onCreateUser={() => navigate("/users/new")}
            onEditUser={(user) => navigate(`/users/edit/${user.id || user.usuario_ID}`)}
            onAssignPermissions={(user) => navigate("/users/permissions")}
            onAssignSchedule={(user) => navigate("/users/schedule")}
          />
        } 
      />
      <Route path="new" element={<CreateUserForm />} />
      <Route path="edit/:id" element={<EditUserForm />} />
      <Route path="permissions" element={<AssignPermissions />} />
      <Route path="schedule" element={<AssignSchedule />} />
      <Route path="*" element={<Navigate to="list" replace />} />
    </Routes>
  );
};

const UserManagementPage = () => {
  return (
    <UserProvider>
      <UserManagementPageContent />
    </UserProvider>
  );
};

export default UserManagementPage;

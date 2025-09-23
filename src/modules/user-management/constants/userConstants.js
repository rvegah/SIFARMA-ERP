// userConstants.js - Datos completos con campo nombreEquipo agregado

// Constantes de configuración
export const sucursales = ['BRASIL', 'SAN MARTIN', 'URUGUAY', 'TIQUIPAYA'];
export const roles = ['ADMIN', 'FARMACEUTICO', 'VENDEDOR', 'SUPERVISOR', 'CONTADOR'];
export const tiposUsuario = ['ADMINISTRADOR', 'USUARIO NORMAL', 'INVITADO'];
export const generos = ['Masculino', 'Femenino'];

// Datos completos de usuarios - EXACTAMENTE como en el monolítico + nombreEquipo
export const allUsers = [
  // Usuarios de BRASIL
  {
    id: 1,
    usuario: 'brasil_admin',
    nombreCompleto: 'Brasil Admin',
    nombreEquipo: 'PC-BRASIL-01',
    email: 'brazil@hotmail.es',
    cedula: '12345678',
    telefono: '655999',
    rol: 'ADMIN',
    sucursal: 'BRASIL',
    genero: 'Masculino',
    direccion: 'Av. Principal 123',
    estado: 'Activo',
    fechaCreacion: '2024-01-15',
    ultimoAcceso: '2024-09-16 10:30'
  },
  {
    id: 2,
    usuario: 'brasil_farm01',
    nombreCompleto: 'MARCELA VILCA',
    nombreEquipo: 'PC-BRASIL-02',
    email: 'marcela@sifarma.com',
    cedula: '87654321',
    telefono: '77788899',
    rol: 'FARMACEUTICO',
    sucursal: 'BRASIL',
    genero: 'Femenino',
    direccion: 'Calle Brasil 456',
    estado: 'Habilitado',
    fechaCreacion: '2024-02-10',
    ultimoAcceso: '2024-09-15 16:45'
  },
  // Usuarios de SAN MARTIN
  {
    id: 3,
    usuario: 'sanmartin_admin',
    nombreCompleto: 'USUARIO DE PRUEBA',
    nombreEquipo: 'PC-SANMARTIN-01',
    email: 'sanmartin@sifarma.com',
    cedula: '11223344',
    telefono: '66677788',
    rol: 'ADMIN',
    sucursal: 'SAN MARTIN',
    genero: 'Masculino',
    direccion: 'Av. San Martin 789',
    estado: 'Habilitado',
    fechaCreacion: '2024-03-05',
    ultimoAcceso: '2024-09-10 14:20'
  },
  {
    id: 4,
    usuario: 'veronica_brasil',
    nombreCompleto: 'VERONICA OCAÑA',
    nombreEquipo: 'PC-SANMARTIN-02',
    email: 'veronica@sifarma.com',
    cedula: '55443322',
    telefono: '99887766',
    rol: 'VENDEDOR',
    sucursal: 'SAN MARTIN',
    genero: 'Femenino',
    direccion: 'Calle Veronica 321',
    estado: 'Habilitado',
    fechaCreacion: '2024-04-12',
    ultimoAcceso: '2024-09-12 11:30'
  },
  // Usuarios de URUGUAY
  {
    id: 5,
    usuario: 'valerio_valerolo',
    nombreCompleto: 'Valerio Valerolo',
    nombreEquipo: 'PC-URUGUAY-01',
    email: 'valerio@sifarma.com',
    cedula: '44556677',
    telefono: '88776655',
    rol: 'SUPERVISOR',
    sucursal: 'URUGUAY',
    genero: 'Masculino',
    direccion: 'Uruguay Central 654',
    estado: 'Deshabilitado',
    fechaCreacion: '2024-05-20',
    ultimoAcceso: '2024-09-05 09:15'
  },
  // Usuarios de TIQUIPAYA
  {
    id: 6,
    usuario: 'xinienio_xinienito',
    nombreCompleto: 'Xinienio Xinienito',
    nombreEquipo: 'PC-TIQUIPAYA-01',
    email: 'xinienio@sifarma.com',
    cedula: '33445566',
    telefono: '77665544',
    rol: 'FARMACEUTICO',
    sucursal: 'TIQUIPAYA',
    genero: 'Masculino',
    direccion: 'Tiquipaya Norte 987',
    estado: 'Deshabilitado',
    fechaCreacion: '2024-06-15',
    ultimoAcceso: '2024-08-30 15:45'
  }
];

// Configuración de usuario actual (simulando sesión) - del monolítico
export const currentUserConfig = {
  sucursal: 'BRASIL',
  isAdmin: true
};

// Estructura del formulario inicial - ACTUALIZADA con nombreEquipo
export const initialFormState = {
  sucursal: '',
  nombreEquipo: '',
  tipoUsuario: '',
  usuario: '',
  password: '',
  cedula: '',
  nombreCompleto: '',
  apellidos: '',
  titulo: '',
  telefono: '',
  email: '',
  genero: 'Masculino',
  direccion: ''
};

// Campos obligatorios para validación
export const requiredFields = ['usuario', 'password', 'nombreCompleto', 'email'];
export const requiredFieldsEdit = ['usuario', 'nombreCompleto', 'email']; // Sin password en edición
// Base de Datos e Inicialización local SAMGY
const INITIAL_STUDENTS = [
    { id: "STU-001", nombre: "Laura Martínez", documento: "TI 1045689123", edad: "14 años", curso: "Grado 9°", direccion: "Calle 45 # 12-34", correo: "laura.martinez@estudiante.edu.co", acudiente: "María Rodríguez", contacto: "3001234567", alergias: ["Penicilina"], enfermedades: ["Asma"], sintomas: ["Dolor de Cabeza", "Mareos"], visitasCount: 3 },
    { id: "STU-002", nombre: "Carlos Eduardo Mendoza", documento: "TI 1045892301", edad: "12 años", curso: "Grado 6°", direccion: "Cra 18 # 56-89", correo: "carlos.mendoza@estudiante.edu.co", acudiente: "Roberto Mendoza", contacto: "3119876543", alergias: ["Polen"], enfermedades: ["Ninguna"], sintomas: ["Congestión nasal"], visitasCount: 2 },
    { id: "STU-003", nombre: "Santiago Alejandro Silva", documento: "TI 1045892303", edad: "13 años", curso: "Grado 7°", direccion: "Calle 80 # 23-11", correo: "santiago.silva@estudiante.edu.co", acudiente: "Jorge Silva", contacto: "3204567890", alergias: ["Maní"], enfermedades: ["Rinitis"], sintomas: ["Dolor abdominal"], visitasCount: 4 },
    { id: "STU-004", nombre: "Mariana López Castro", documento: "TI 1045892304", edad: "13 años", curso: "Grado 7°", direccion: "Cra 52 # 74-10", correo: "mariana.lopez@estudiante.edu.co", acudiente: "Lucía Castro", contacto: "3156543210", alergias: ["Ibuprofeno"], enfermedades: ["Ninguna"], sintomas: ["Fiebre leve"], visitasCount: 1 },
    { id: "STU-005", nombre: "Mateo Fernando Torres", documento: "TI 1045892305", edad: "14 años", curso: "Grado 8°", direccion: "Calle 12 # 45-67", correo: "mateo.torres@estudiante.edu.co", acudiente: "Fernando Torres", contacto: "3182345678", alergias: ["Ninguna"], enfermedades: ["Ninguna"], sintomas: ["Ninguno"], visitasCount: 0 },
    { id: "STU-006", nombre: "Camila Andrea Morales", documento: "TI 1045892306", edad: "14 años", curso: "Grado 8°", direccion: "Cra 30 # 15-22", correo: "camila.morales@estudiante.edu.co", acudiente: "Diana Morales", contacto: "3138765432", alergias: ["Mariscos"], enfermedades: ["Ninguna"], sintomas: ["Excoriación rodilla"], visitasCount: 3 },
    { id: "STU-007", nombre: "Gabriel José Ramírez", documento: "TI 1045892309", edad: "15 años", curso: "Grado 10°", direccion: "Calle 33 # 44-55", correo: "gabriel.ramirez@estudiante.edu.co", acudiente: "Andrés Ramírez", contacto: "3012345678", alergias: ["Lactosa"], enfermedades: ["Gastritis"], sintomas: ["Cefalea"], visitasCount: 5 }
];

const INITIAL_VISITAS = [
    { id: "VIS-101", studentId: "STU-001", studentName: "Laura Martínez", curso: "Grado 9°", fechaHora: "20/03/2024 10:15 AM", sintomas: "Dolor de cabeza", observaciones: "Tensión arterial normal 110/70.", tratamiento: "Descanso en camilla 20 min y rehidratación." },
    { id: "VIS-102", studentId: "STU-001", studentName: "Laura Martínez", curso: "Grado 9°", fechaHora: "15/03/2024 09:30 AM", sintomas: "Mareos", observaciones: "Mareo leve por ayuno prolongado.", tratamiento: "Suministro de snack y agua." },
    { id: "VIS-103", studentId: "STU-001", studentName: "Laura Martínez", curso: "Grado 9°", fechaHora: "10/03/2024 11:00 AM", sintomas: "Revisión de Peso", observaciones: "Control rutinario de peso y talla.", tratamiento: "Registro en ficha médica." },
    { id: "VIS-104", studentId: "STU-007", studentName: "Gabriel José Ramírez", curso: "Grado 10°", fechaHora: "19/10/2026 10:15 AM", sintomas: "Cefalea intensa y fatiga", observaciones: "Refiere desvelo por exámenes.", tratamiento: "Descanso y analgésico autorizado." }
];

let students = JSON.parse(localStorage.getItem('samgy_bs_students')) || INITIAL_STUDENTS;
let visitas = JSON.parse(localStorage.getItem('samgy_bs_visitas')) || INITIAL_VISITAS;
let selectedStudentIdForFicha = students[0]?.id || "STU-001";

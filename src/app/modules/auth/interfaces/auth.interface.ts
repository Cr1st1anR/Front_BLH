export interface Auth {
    accessToken: string;
    user: User;
}

export interface User {
    id: number;
    usuario: string;
    password: string;
    activo: number;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface AuthBody {
    usuario: string;
    password: string;
}

export interface TokenPayload {
    sub: string;      // ID del usuario
    usuario: string;  // Nombre de usuario
    rol: string;      // Rol del usuario (Administrador, Auxiliar)
    iat?: number;     // Timestamp de emisión
    exp?: number;     // Timestamp de expiración
}

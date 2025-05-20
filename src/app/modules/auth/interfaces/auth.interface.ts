export interface Auth {
    accessToken: string;
    user:        User;
}

export interface User {
    id:        number;
    usuario:   string;
    password:  string;
    activo:    number;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface AuthBody {
    usuario:  string;
    password: string;
}


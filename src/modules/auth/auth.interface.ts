
export enum UserRole {
    CONTRIBUTOR = "contributor",
    MAINTAINER = "maintainer"
}

export interface IUser {
    name: string;
    email: string;
    password: string;
    role?: UserRole
}



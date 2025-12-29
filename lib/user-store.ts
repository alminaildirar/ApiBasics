interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  createdAt: string;
}

class UserStore {
  private users: User[] = [];
  private nextId: number = 1;

  constructor() {
    this.initializeMockUsers();
  }

  private initializeMockUsers(): void {
    this.users = [];
    this.nextId = 1;
  }

  findByUsername(username: string): User | undefined {
    return this.users.find((u) => u.username === username);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  validateCredentials(username: string, password: string): User | null {
    const user = this.findByUsername(username);
    if (!user) return null;
    if (user.password !== password) return null;
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(username: string, password: string, email: string): User {
    const newUser: User = {
      id: this.nextId.toString(),
      username,
      password,
      email,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.nextId++;

    return newUser;
  }

  getAllUsers(): User[] {
    return [...this.users];
  }
}

export const userStore = new UserStore();

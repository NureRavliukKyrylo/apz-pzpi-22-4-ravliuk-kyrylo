export type User = {
  id: Number;
  username: String;
  email: String;
  role: number;
  date_joined: String;
};

export type UserResponse = {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: number;
    date_joined: string;
  };
  access_token: string;
  csrf_token: string;
};

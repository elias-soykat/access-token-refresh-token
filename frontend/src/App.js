import axios from "axios";
import jwt_decode from "jwt-decode";
import React, { useState } from "react";

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const refreshToken = async () => {
    try {
      const res = await axios.post("/api/refresh", {
        token: user.refreshToken,
      });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      const decodedToken = jwt_decode(user.accessToken);

      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers["authorization"] = "Bearer " + data.accessToken;
      }

      return config;
    },

    (error) => {
      return Promise.reject(error);
    }
  );

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/login", { name, password });
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);
    try {
      await axiosJWT.delete("/api/users/" + id, {
        headers: { authorization: "Bearer " + user.accessToken },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="container">
      <form className="login-form" onSubmit={handleSubmitForm}>
        {user ? (
          <>
            <div style={{ textAlign: "center" }}>
              Welcome to <b>{user?.isAdmin ? "admin" : "user"} </b> dashboard{" "}
              <b>{user?.name}</b>
            </div>
            <br />{" "}
            <button className="delete" onClick={() => handleDelete(1)}>
              Delete John
            </button>
            <button className="delete" onClick={() => handleDelete(2)}>
              Delete Jane
            </button>
            <button className="delete" onClick={() => handleDelete(3)}>
              Delete Elias
            </button>
            <br />
            {success && (
              <i style={{ color: "green", textAlign: "center" }}>
                User has been deleted successfully
              </i>
            )}
            {error && (
              <i style={{ color: "red", textAlign: "center" }}>
                You are not allowed to delete this user!
              </i>
            )}
          </>
        ) : (
          <>
            <label htmlFor="name">Enter Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="password">Enter Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input type="submit" value="Submit" className="submit" />
          </>
        )}
      </form>
    </div>
  );
}

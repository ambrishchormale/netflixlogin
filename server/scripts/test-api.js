import axios from "axios";

const API = "http://127.0.0.1:5000/api";

async function run() {
  const email = `tester_${Date.now()}@example.com`;
  const password = "Passw0rd!";

  const register = await axios.post(`${API}/auth/register`, {
    name: "Test User",
    email,
    password,
  });

  const token = register.data.token;

  const me = await axios.get(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const rows = await axios.get(`${API}/movies/rows`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log("Register status:", register.status);
  console.log("Profile email:", me.data.email);
  console.log("Rows fetched:", rows.data.rows.length);
  console.log("First row movie count:", rows.data.rows[0]?.movies?.length || 0);
}

run().catch((error) => {
  console.error("API test failed:");
  console.error("message:", error.message);
  console.error("code:", error.code);
  console.error("response:", error.response?.data);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});

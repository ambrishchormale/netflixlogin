import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { MovieRow } from "../components/MovieRow";

export function HomePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function loadRows() {
      try {
        const { data } = await api.get("/movies/rows");
        if (mounted) {
          setRows(data.rows || []);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }
        setError(err.response?.data?.message || "Unable to load movies");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRows();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const featured = rows[0]?.movies?.[0];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="home-page">
      <header className="topbar">
        <div className="brand">MOVIEFLIX</div>
        <nav>
          <button onClick={logout}>Logout</button>
        </nav>
      </header>

      <section className="hero" style={featured ? { backgroundImage: `url(${featured.poster})` } : {}}>
        <div className="hero-gradient" />
        <div className="hero-content">
          <p className="badge">Featured Movie</p>
          <h1>{featured?.title || "Movie Night Starts Here"}</h1>
          <p>
            Welcome {user?.name || "Viewer"}. Explore OMDB content in a Netflix-style experience built with React, REST and MySQL auth.
          </p>
        </div>
      </section>

      <main>
        {loading ? <p className="state">Loading movies...</p> : null}
        {error ? <p className="state error">{error}</p> : null}
        {!loading && !error && rows.map((row) => <MovieRow key={row.id} title={row.title} movies={row.movies} />)}
      </main>
    </div>
  );
}

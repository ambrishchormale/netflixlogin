export function MovieRow({ title, movies }) {
  return (
    <section className="movie-row">
      <h2>{title}</h2>
      <div className="movie-strip">
        {movies.map((movie) => (
          <article key={movie.imdbID} className="movie-card" title={`${movie.title} (${movie.year})`}>
            <img src={movie.poster} alt={movie.title} loading="lazy" />
            <div className="movie-meta">
              <h3>{movie.title}</h3>
              <span>{movie.year}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function PageHeader({ titulo, descripcion }) {
  return (
    <header className="encabezado-pagina">
      <h1>{titulo}</h1>
      {descripcion && <p>{descripcion}</p>}
    </header>
  )
}

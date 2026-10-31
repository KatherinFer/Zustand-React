// Importamos los hooks que necesitamos para traer los productos de la API
import { useEffect, useState } from 'react'
// Importamos el hook del store
import { useCarritoStore } from '../store/useCarritoStore'

// Reto 4: dirección de la API pública de donde salen los productos
const API_PRODUCTOS = 'https://fakestoreapi.com/products'

// Petición a la API que devuelve los productos ya adaptados a la tienda
async function pedirProductos() {
  const respuesta = await fetch(API_PRODUCTOS)

  // Si la API responde con un error, lanzamos uno para caer en el catch
  if (!respuesta.ok) {
    throw new Error('La API respondió con un error')
  }

  const datos = await respuesta.json()

  // Adaptamos los nombres de la API a los que usamos en la tienda
  // Math.round deja el precio sin decimales, como en los datos de la guía
  return datos.map((producto) => ({
    id: producto.id,
    nombre: producto.title,
    precio: Math.round(producto.price),
    imagen: producto.image,
  }))
}

// Definimos el componente ListaProductos
function ListaProductos() {
  // Del store solo necesitamos la acción para agregar
  const agregarProducto = useCarritoStore((state) => state.agregarProducto)

  // Estos datos son propios de la lista; el carrito no los necesita
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Al abrir la página pedimos los productos una sola vez
  useEffect(() => {
    let activo = true

    pedirProductos()
      .then((datos) => {
        if (activo) setProductos(datos)
      })
      .catch(() => {
        if (activo) {
          setError(
            'No se pudieron cargar los productos. Revisa tu conexión a internet.'
          )
        }
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    // Si el componente se desmonta, evitamos actualizar el estado
    return () => {
      activo = false
    }
  }, [])

  // Esta función se usa cuando el usuario pulsa Reintentar
  async function reintentar() {
    setCargando(true)
    setError('')

    try {
      setProductos(await pedirProductos())
    } catch {
      setError(
        'No se pudieron cargar los productos. Revisa tu conexión a internet.'
      )
    } finally {
      setCargando(false)
    }
  }

  // Mientras llega la respuesta mostramos un aviso
  if (cargando) {
    return (
      <section className="panel">
        <h2>Productos</h2>
        <p className="aviso">Cargando productos...</p>
      </section>
    )
  }

  // Si algo falló, mostramos el mensaje y un botón para intentar de nuevo
  if (error) {
    return (
      <section className="panel">
        <h2>Productos</h2>
        <p className="aviso aviso-error">{error}</p>
        <button className="btn btn-primario" onClick={reintentar}>
          Reintentar
        </button>
      </section>
    )
  }

  return (
    // section agrupa todo el catálogo; panel le da apariencia de tarjeta
    <section className="panel">
      <h2>Productos</h2>

      {/* Recorremos los productos y creamos una fila por cada uno */}
      {productos.map((producto) => (
        // key ayuda a React a identificar cada elemento de la lista
        <div key={producto.id} className="fila">
          {/* Bloque con la imagen, el nombre y el precio */}
          <div className="producto">
            <img
              className="miniatura"
              src={producto.imagen}
              alt={producto.nombre}
              loading="lazy"
            />
            <div>
              <p className="fila-nombre">{producto.nombre}</p>
              {/* toLocaleString('es-CO') da formato de pesos: 45.000 */}
              <p className="fila-detalle">
                ${producto.precio.toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          {/* Al hacer clic, enviamos el producto completo a la acción del store */}
          <button
            className="btn btn-primario"
            onClick={() => agregarProducto(producto)}
          >
            Agregar
          </button>
        </div>
      ))}
    </section>
  )
}

// Exportamos el componente
export default ListaProductos

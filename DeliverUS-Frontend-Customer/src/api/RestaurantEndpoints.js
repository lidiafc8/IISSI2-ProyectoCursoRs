import { get } from './helpers/ApiRequestsHelper'

function getAll () { // ponemos el nombre de la función, la cual llamaremos en los screens después
  return get('users/myrestaurants') // el verbo del return variará dependiendo de lo que queramos conseguir, get(leer), post(crear), put(actualizar), destroy(eliminar), patch (actualizar una determinada propiedad únicamente)
} // la ruta que le pasamos es la del RestaurantRoutes del backend, la que haga lo que necesitamos concretamente.

function getRestaurants () { // dejar siempre el espacio entre el paréntesis y el nombre de la función
  return get('restaurants')
}

function getDetail (id) {
  return get(`restaurants/${id}`)
}

function getRestaurantCategories () {
  return get('restaurantCategories')
}

export { getAll, getDetail, getRestaurantCategories, getRestaurants } // NO OLVIDARNOS DE EXPORTAR LAS NUEVAS FUNCIONES QUE CREEMOS

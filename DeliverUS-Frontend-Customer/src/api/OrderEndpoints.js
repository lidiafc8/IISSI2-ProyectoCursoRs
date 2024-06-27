import { get, destroy, post, put } from './helpers/ApiRequestsHelper'

export function getOrderDetail (id) {
  return get(`orders/${id}`)
}

export function getAllOrders () {
  return get('orders')
}

export function remove (id) {
  return destroy(`orders/${id}`)
}

export function create (data) {
  return post('orders', data)
}

export function update (id, data) { // recibe el ID del order y los datos actualizados del order
  return put(`orders/${id}`, data)
}
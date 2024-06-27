import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, FlatList, View, Pressable } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemibold from '../../components/TextSemibold'
import { showMessage } from 'react-native-flash-message'
import { getOrderDetail, remove } from '../../api/OrderEndpoints'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import productLogo from '../../../assets/product.jpeg'
import ImageCard from '../../components/ImageCard'
import { useNavigation } from '@react-navigation/native'
import DeleteModal from '../../components/DeleteModal'

export default function OrderDetailScreen ({ route }) { // el route que le llega es el order, ya que a OrderDetailScreen llegamos porque previamente hemos pulsado en un order concreto en OrderScreen, venimos de allí, es un accesorio que le pasamos
  const [order, setOrder] = useState({})
  const { loggedInUser } = useContext(AuthorizationContext) // AuthorizationContext almacena información relacionada con la autenticación y autorización del usuario. useContext(AuthorizationContext) obtiene el valor del contexto AuthorizationContext. { loggedInUser } desestructura ese valor para obtener la información del usuario conectado.
  const navigation = useNavigation() // proporciona métodos para navegar entre pantallas, volver atrás, y otras funcionalidades de navegación
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null) // objeto de estado para almacenar el order que se eliminará cuando el usuario presione el botón Eliminar

  useEffect(() => {
    async function fetchOrderDetail () {
      try {
        const fetchedOrder = await getOrderDetail(route.params.id)
        setOrder(fetchedOrder)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving order details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    if (loggedInUser) {
      fetchOrderDetail()
    } else {
      setOrder(null)
    }
  }, [loggedInUser, route])

  const renderEmptyProductsList = () => {
    return (
      <TextRegular style={styles.emptyList}>
        This order has no products.
      </TextRegular>
    )
  }

  const renderProduct = ({ item }) => { // el item es el order que se le pasa cada una de las veces
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : productLogo}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemibold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemibold>
        <TextSemibold>
          Quantity: <TextRegular>{item.OrderProducts.quantity}</TextRegular>
        </TextSemibold>
      </ImageCard>
    )
  }

  const cancelOrder = async (order) => { // el order que le pasamos es el que se va a eliminar, el que tenemos almacenado en el estado orderToBeDeleted
    try {
      await remove(order.id) // llamamos al método remove del OrderEndpoints
      setOrderToBeDeleted(null) // restablecemos el objeto de estado orderToBeDeleted para limpiar el estado y reflejar que ya no hay ninguna order en proceso de eliminación
      showMessage({
        message: `Order ${order.id} successfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })

      navigation.goBack() // se llama para navegar de vuelta a la pantalla anterior en la pila de navegación. El usuario vuelve a la lista de orders donde la order eliminada ya no aparecerá
    } catch (error) {
      console.log(error)
      setOrderToBeDeleted(null) //  si hay un error restablecemos el objeto de estado igualmente
      showMessage({
        message: `Order ${order.id} could not be cancelled.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return ( // DELETE MODAL DEBE INCLUIRSE AQUÍ, EN LA ORACIÓN DE RETURN DE LA SCREEN
    <View style={styles.container}>
      <FlatList
        style={styles.container}
        data={order?.products || []} // ?. es un operador de encadenamiento opcional que permite acceder a 'products' solo si 'order' no es null ni undefined. Si lo es, se utilizará un arreglo vacío []
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyProductsList}
      />
      {order.status === 'pending' && (
        <>
          <Pressable
            onPress={() => navigation.navigate('OrderEditScreen', { order })}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? GlobalStyles.brandPrimaryTap : GlobalStyles.brandPrimary
              },
              styles.buttonPending
            ]}
          >
            <TextRegular textStyle={styles.text}>Edit Order</TextRegular>
          </Pressable>

          <Pressable
            onPress={() => setOrderToBeDeleted(order)} // cuando el usuario presione, el orderToBeDeleted estado se establecerá con el order renderizado
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? GlobalStyles.brandPrimaryTap : GlobalStyles.brandPrimary
              },
              styles.buttonPending
            ]}
          >
            <TextRegular textStyle={styles.text}>Cancel Order</TextRegular>
          </Pressable>
        </>
      )}
      {orderToBeDeleted && (
        <DeleteModal // abre un ventana modal que incluye: un botón para cancelar la operación, otro para confirmarla y los elementos pasados como hijos de  este componente se representan como el cuerpo de la ventana modal, por eso necesita que le pasemos tres propiedades
          isVisible={true} // expresión booleana que se evalúa para mostrar o no la ventana modal
          onCancel={() => setOrderToBeDeleted(null)} // función que se ejecutará cuando el usuario presione el botón de cancelar
          onConfirm={() => cancelOrder(orderToBeDeleted)} // función que se ejecutará cuando el usuario presione el botón de confirmar
        >
          <TextRegular>Are you sure you want to cancel your order?</TextRegular>
        </DeleteModal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  price: {
    color: GlobalStyles.brandPrimary,
    fontSize: 16
  },
  buttonPending: {
    textAlign: 'center',
    borderRadius: 8,
    width: '30%',
    padding: 10,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 12
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center'
  }
})

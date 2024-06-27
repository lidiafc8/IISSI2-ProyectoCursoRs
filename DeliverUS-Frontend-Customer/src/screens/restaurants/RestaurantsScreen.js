/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { getRestaurants } from '../../api/RestaurantEndpoints'
import { showMessage } from 'react-native-flash-message'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'

import ImageCard from '../../components/ImageCard'

import { brandPrimary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'

import { FlatList, ScrollView, Text } from 'react-native-web'
import { getPopular } from '../../api/ProductEndpoints'

import restaurantLogo from '../../../assets/restaurantLogo.jpeg'

export default function RestaurantsScreen ({ navigation, route }) {
  // TODO: Create a state for storing the restaurants

  // para crear un state (gancho) definimos una matriz de elementos [state, setState]
  // siendo state el objeto (en este caso donde almacenaremos la lista de restaurantes) y setState el método para cambiar de estado
  // useState(initialValue) -> definir el valor inicial del state objeto
  const [restaurants, setRestaurants] = useState([]) // en este caso queremos realizar una solicituud al backend para recuperar la lista de restaurantes, los datos devueltos deben mantenerse en el estado del componente RestaurantScreen, por lo que para ello definimos un state que contenga la matriz de restaurantes que inicialmente será una matriz vacía que tras completarse la solicitud al backend, contendrá todos los restaurantes
  const [popular, setPopular] = useState([]) // igual pero para recuperar los productos más populares

  useEffect(() => { // useEffect es un gancho
    // TODO: Fetch all restaurants and set them to state.
    //      Notice that it is not required to be logged in.
    async function fetchRestaurants () { // definimos la función que se ejecutará cuando se active el gancho
      try {
        const fetchedRestaurants = await getRestaurants() // llamamos a la función que definimos en RestaurantEndpoints que nos obtendrá todos los restaurantes de la base de datos (backend) y la metemos en una variable
        setRestaurants(fetchedRestaurants) // actualizamos el objeto de estado con los restaurantes que hemos obtenido
      } catch (error) { // si no puede hacerlo se lanza un error y un mensaje
        showMessage({
          message: `There was an error while retrieving restaurants. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    // TODO: set restaurants to state
    fetchRestaurants() // llamamos a la función que acabamos de definir arriba
  }, [route]) // ponemos las dependencias. En este caso cada vez que route cambie, useEffect volverá a ejecutarse

  useEffect(() => {
    async function fetchPopular () {
      try {
        const fetchedPopular = await getPopular()
        setPopular(fetchedPopular)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving the popular products ${error}`,
          type: 'error',
          style: flashStyle,
          textStyle: flashTextStyle
        })
      }
    }
    fetchPopular()
  }, [])

  const renderRestaurant = ({ item }) => { // esta función define cómo se mostrará cada restaurante en nuestra web (renderizará cada restaurante), por lo que el item que le llega es un restaurante concreto cada vez
    return (
      <ImageCard
      imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : restaurantLogo}
      title={item.name} // el nombre del restaurante
      onPress={() => { // cuando el botón esté pulsado
        navigation.navigate('RestaurantDetailScreen', { id: item.id }) // pasamos el restaurante id como accesorio y el route objeto.
      }}

      // TextRegular es un texto de fuente normal. La letra que aparecerá será normal
      // TextSemiBold es un texto de fuente semi negrita. La letra que aparecerá será seminegrita y un poco gruesa
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceTime !== null &&
        <TextSemiBold>Avg. service time:
          <TextSemiBold textStyle={{ color: brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold>
        </TextSemiBold>}
        <TextSemiBold>Shipping: <TextRegular style={{ color: brandPrimary }}>{item.shippingCosts.toFixed(2)} €</TextRegular></TextSemiBold>
      </ImageCard>
    )
  }

  // FR7: Show top 3 products. Rendering the products we have retrieved before

  const renderPopular = ({ item }) => {
    return (
      <View style={styles.cardBody}>
        <Text style={styles.cardText}>{item.name}</Text>
        <ImageCard
          imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}
          onPress={() => {
            navigation.navigate('RestaurantDetailScreen', { id: item.restaurantId })
          }}
        />
        <TextRegular style={{ marginRight: 100 }} numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
      </View>
    )
  }

  const renderEmptyRestaurant = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No restaurants were retreived. Are you logged in?
      </TextRegular>
    )
  }
  const renderEmptyPopular = () => {
    return (
    <TextRegular textStyle={styles.emptyList}>
        No popular products were retreived. Are you logged in?
      </TextRegular>
    )
  }

  return (
    // el ScrollView nos permite poder bajar y subir por la pantalla cuando hay muchos restaurantes (en este caso)
    <ScrollView>
    <View style={styles.container}>
      <FlatList
      ListHeaderComponent={<TextSemiBold textStyle={styles.title}> Top 3 most popular products</TextSemiBold>} // texto que aparecerá como cabecera del componente
      data={popular}
      renderItem={renderPopular}
      ListEmptyComponent={renderEmptyPopular} // en caso de que el componente sea una lista vacía
      />
      <FlatList
        ListHeaderComponent={<TextSemiBold textStyle={styles.title}> Restaurants </TextSemiBold>}
        data={restaurants}
        renderItem={renderRestaurant}
        ListEmptyComponent={renderEmptyRestaurant}
      />
    </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'flex-start',
    margin: 50 // aplica un margen de 50 píxeles en todos los lados del View
  },
  title: {
    textAlign: 'center', // centra el texto horizontalmente dentro de su contenedor
    padding: 50, // agrega espacio dentro del contenedor del texto, alrededor del contenido
    fontSize: 20, // tamaño de fuente
    backgroundColor: GlobalStyles.brandPrimary // color de fondo del contenedor del texto
  },
  container: {
    flex: 1, // hace que el contenedor ocupe todo el espacio disponible en su contenedor padre. Permite que el contenedor se expanda para llenar el espacio disponible
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  button: {
    borderRadius: 8, // aplica un raadio de borde de 8 píxeles a las esquinas del botón, haciéndolas redondeadas
    height: 40, // altura del botón
    margin: 12, // margen en todos los laodos del botón. Crea espacio alrededor del botón fuera de sus bordes
    padding: 10, // padding(relleno) en todos los lados del botón, creando espacio dentro del botón alrededor de su contenido (ej:texto)
    width: '100%' // ancho del botón
  },
  text: {
    fontSize: 16,
    color: 'white', // color de la letra
    textAlign: 'center'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  cardBody: {
    flex: 5, // hace que el componente ocupe 5 uds de espacio disponible en su contenedor padre usando flexbox
    padding: 10
  },
  cardText: {
    marginLeft: 10, // margen izquierdo
    fontSize: 20,
    alignSelf: 'center', // se usa para alinear un componente hijo a lo largo del eje secundario dentro de su contenedor flex
    fontFamily: 'Montserrat_600SemiBold' // fuente concreta de texto
  }
})

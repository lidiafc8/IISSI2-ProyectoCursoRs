import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import RestaurantDetailScreen from './RestaurantDetailScreen'
import RestaurantsScreen from './RestaurantsScreen'

const Stack = createNativeStackNavigator()

export default function RestaurantsStack () {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='RestaurantsScreen' // nombre con el que podremos llamar a la navegación
        component={RestaurantsScreen} // la screen/clase a la que saltará
        options={{
          title: 'Restaurants' // texto que queremos que se nos muestre como cabecera al navegar ya en la web de internet
        }} />
      <Stack.Screen
        name='RestaurantDetailScreen'
        component={RestaurantDetailScreen}
        options={{
          title: 'Restaurant Detail'
        }} />
    </Stack.Navigator>
  )
}

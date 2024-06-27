import React, { useEffect, useState } from 'react'
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as yup from 'yup'
import DropDownPicker from 'react-native-dropdown-picker'
import { create, getRestaurantCategories } from '../../api/RestaurantEndpoints'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import restaurantBackground from '../../../assets/restaurantBackground.jpeg'
import { showMessage } from 'react-native-flash-message'
import { ErrorMessage, Formik } from 'formik'
import TextError from '../../components/TextError'

export default function CreateRestaurantScreen ({ navigation }) {
  const [open, setOpen] = useState(false) // NECESITAMOS UN ESTADO BOOLEANO PARA ESTABLECER SI LA LISTA DE OPCIONES DE DropDownPicker son visibles o no
  const [restaurantCategories, setRestaurantCategories] = useState([]) // NECESITAMOS UN ESTADO PARA ALMACENAR LAS CATEGORIAS DE RESTAURANTES PARA PODER CREAR LA OPCION DESPLEGABLE EN NUESTRO FORMULARIO
  const [backendErrors, setBackendErrors] = useState() // necesitamos almacenar los errores de backend que eventualmente se devuelven en una variable de estado

  // propiedades de FORMIK
  const initialRestaurantValues = { name: null, description: null, address: null, postalCode: null, url: null, shippingCosts: null, email: null, phone: null, restaurantCategoryId: null } // valores iniciales, tienen que tener el mismo nombre que en el backend
  const validationSchema = yup.object().shape({ // definimos las validaciones que deberán pasar los datos que introduzcamos al crear un restaurante
    name: yup
      .string() // tipo de dato
      .max(255, 'Name too long') // la longitud máxima que puede tener, si se pasa, devuelve el mensaje proporcionado
      .required('Name is required'),
    address: yup
      .string()
      .max(255, 'Address too long')
      .required('Address is required'),
    postalCode: yup
      .string()
      .max(255, 'Postal code too long')
      .required('Postal code is required'),
    url: yup
      .string()
      .nullable()
      .url('Please enter a valid url'),
    shippingCosts: yup
      .number()
      .positive('Please provide a valid shipping cost value')
      .required('Shipping costs value is required'),
    email: yup
      .string()
      .nullable()
      .email('Please enter a valid email'),
    phone: yup
      .string()
      .nullable()
      .max(255, 'Phone too long'),
    restaurantCategoryId: yup
      .number()
      .positive()
      .integer()
      .required('Restaurant category is required')
  })

  useEffect(() => { // para recuperar las categorías de restaurantes desde el backend
    async function fetchRestaurantCategories () {
      try {
        const fetchedRestaurantCategories = await getRestaurantCategories()
        const fetchedRestaurantCategoriesReshaped = fetchedRestaurantCategories.map((e) => {
          return {
            label: e.name,
            value: e.id
          }
        })
        setRestaurantCategories(fetchedRestaurantCategoriesReshaped)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving restaurant categories. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchRestaurantCategories()
  }, [])

  useEffect(() => { // necesario para obtener los permisos del dispositivo para acceder a la galería multimedia (es necesario para iOS y Android)
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!')
        }
      }
    })()
  }, [])

  const pickImage = async (onSuccess) => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })
    if (!result.canceled) {
      if (onSuccess) {
        onSuccess(result)
      }
    }
  }

  const createRestaurant = async (values) => {
    setBackendErrors([]) // manejar los errores de backend si ocurren
    try {
      const createdRestaurant = await create(values) // las operaciones de E/S pueden congelar la interfaz, por lo que debemos manejarlas con promesas, con async y await
      showMessage({
        message: `Restaurant ${createdRestaurant.name} succesfully created`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('RestaurantsScreen', { dirty: true }) // si el restaurante se crea, tenemos que navegar hasta RestaurantScreen, actualizando la vista para que ahora se muestre el restaurante que acabamos de crear. En RestaurantsScreen, debemos agregar {ruta} como componente de propiedad y agregar otro valor de activación al useEffect que consulta la lista de restaurantes. En el momento en que se activó si loggedInUser se cambió, ahora agregue el parámetro de ruta de la siguiente manera: [loggedInUser, route]
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }
  return (
    <Formik // FORMULARIO PARA CREAR UN NUEVO RESTAURANTE, las entradas deben estar anidadas debajo del componente Formik
      validationSchema={validationSchema} // las reglas de validación, generalmente un objeto
      initialValues={initialRestaurantValues} // los valores iniciales dados a cada una de las entradas del formulario
      onSubmit={createRestaurant} // función que se llamará cuando los valores del formulario insertados pasen la validación
      >
      {({ handleSubmit, setFieldValue, values }) => ( // handleSubmit: función que desencadena la validación. Debe llamarse cunado el usuario presiona el botón de envío. setFieldValue: mirar apuntes de Formik. values: conjunto de elementos que representa el estado del formulario
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem // entradas de texto
                name='name' // nombre del campo. TIENE QUE COINCIDIR CON EL NOMBRE DEL CAMPO ESPERADO EN EL BACKEND
                label='Name:' // el texto presentado al usuario para que se represente entre la entrada de texto
              />
              <InputItem
                name='description'
                label='Description:'
              />
              <InputItem
                name='address'
                label='Address:'
              />
              <InputItem
                name='postalCode'
                label='Postal code:'
              />
              <InputItem
                name='url'
                label='Url:'
              />
              <InputItem
                name='shippingCosts'
                label='Shipping costs:'
              />
              <InputItem
                name='email'
                label='Email:'
              />
              <InputItem
                name='phone'
                label='Phone:'
              />

              <DropDownPicker // SELECCIÓN/DESPLEGABLE. Las opciones de DropDownPicker son una lista de pares valor/etiqueta. Por ejemplo, las categorías de restaurantes serían el par value: restaurantCategoryId, label: restaurantCategoryName.
                open={open} // indica si el menú desplegable está abierto o cerrado
                value={values.restaurantCategoryId} // establece el valor actualmente seleccionado en el menú desplegable
                items={restaurantCategories} // opciones disponibles en el menú desplegable
                setOpen={setOpen} // función que cambia el estadod de open para abrir o cerrar el menú desplegable
                onSelectItem={ item => { // función que se llama cuando se selecciona un item del menú desplegable
                  setFieldValue('restaurantCategoryId', item.value) // actualiza el campo restaurantCategoryId con el valor seleccionado
                }}
                setItems={setRestaurantCategories} // función para actualizar las opciones disponibles en el menú desplegable
                placeholder="Select the restaurant category" // texto que se muestra cuando no se ha seleccionado ninguna opción
                containerStyle={{ height: 40, marginTop: 20 }}
                style={{ backgroundColor: GlobalStyles.brandBackground }}
                dropDownStyle={{ backgroundColor: '#fafafa' }} // estilo del menu desplegable que se muestra cuando está abierto, con un color de fondo claro
              />
              <ErrorMessage name={'restaurantCategoryId'} render={msg => <TextError>{msg}</TextError> } // manejo de errores
              />

              <Pressable
                onPress={() => // añadimos un botón que cuando sea presionado
                  pickImage( // inicia la interfaz de selección para elegir una imagen
                    async result => {
                      await setFieldValue('logo', result) // almacenamos su contenido en la variable de estado
                    }
                  )
              }
                style={styles.imagePicker}
              >
                <TextRegular>Logo: </TextRegular>
                <Image style={styles.image} source={values.logo ? { uri: values.logo.assets[0].uri } : restaurantLogo} />
              </Pressable>

              <Pressable onPress={() =>
                pickImage(
                  async result => {
                    await setFieldValue('heroImage', result)
                  }
                )
              }
                style={styles.imagePicker}
              >
                <TextRegular>Hero image: </TextRegular>
                <Image style={styles.image} source={values.heroImage ? { uri: values.heroImage.assets[0].uri } : restaurantBackground} />
              </Pressable>

              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>) // mostramos los errores de backend si están presentes
              }

              <Pressable // componente final para llamar al método handleSubmit
                onPress={handleSubmit}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccessTap
                      : GlobalStyles.brandSuccess
                  },
                  styles.button
                ]}>
              <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                <MaterialCommunityIcons name='content-save' color={'white'} size={20}/>
                <TextRegular textStyle={styles.text}>
                  Save
                </TextRegular>
              </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5
  },
  imagePicker: { // estilos para la imagen que importamos
    height: 40,
    paddingLeft: 10,
    marginTop: 20,
    marginBottom: 80
  },
  image: { // estilos para la imagen que importamos
    width: 100,
    height: 100,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 5
  }
})

/* EJEMPLO DE CÓMO USAR UN SWITCH
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { TextRegular } from './TextRegular'; // Importa tu componente TextRegular aquí
import GlobalStyles from './GlobalStyles'; // Importa tus estilos globales aquí

const MyComponent = ({ values, setFieldValue }) => {
  return (
    <View style={styles.container}>
      <TextRegular style={styles.switch}>Is it available?</TextRegular>
      <Switch
        trackColor={{ false: GlobalStyles.brandSecondary, true: GlobalStyles.brandPrimary }}
        thumbColor={values.availability ? GlobalStyles.brandSecondary : '#f4f3f4'}
        value={values.availability}
        style={styles.switch}
        onValueChange={value => setFieldValue('availability', value)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  switch: {
    marginLeft: 10,
  },
});

export default MyComponent;
*/

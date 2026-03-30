import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import {TamaguiProvider} from 'tamagui';
import config from './tamagui.config';
import Home from '@/views/Home';
import AllNotes from '@/views/AllNotes';
import NoteDetail from '@/views/NoteDetail';
import store from '@/stores';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistStore(store)}>
        <TamaguiProvider config={config} defaultTheme="light">
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: {backgroundColor: 'transparent'},
                animation: 'slide_from_right',
              }}>
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="AllNotes" component={AllNotes} />
              <Stack.Screen name="NoteDetail" component={NoteDetail} />
            </Stack.Navigator>
          </NavigationContainer>
        </TamaguiProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;

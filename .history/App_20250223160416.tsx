import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import {NativeBaseProvider} from 'native-base';
import Home from '@/views/Home';
import NoteDetail from '@/views/NoteDetail';
import store from '@/stores';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistStore(store)}>
        <NativeBaseProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{}}>
              <Stack.Screen
                name="Home"
                component={Home}
                options={{title: '密码本'}}
              />
              <Stack.Screen
                name="NoteDetail"
                component={NoteDetail}
                options={{title: '密码本'}}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </NativeBaseProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;

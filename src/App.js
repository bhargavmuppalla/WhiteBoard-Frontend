import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import ProfileForm from './components/profile-forms/ProfileForm';
import AddExperience from './components/profile-forms/AddExperience';
import AddEducation from './components/profile-forms/AddEducation';
import Profiles from './components/profiles/Profiles';
import Profile from './components/profile/Profile';
import Posts from './components/posts/Posts';
import Post from './components/post/Post';
import NotFound from './components/layout/NotFound';
import PrivateRoute from './components/routing/PrivateRoute';
import { LOGOUT } from './actions/types';
import Forms from './components/Forms';
import RoomPage from './pages/RoomPage';

import io from 'socket.io-client';

// Redux
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';

const server = 'http://localhost:8080';
const connectionOptions = {
  'force new connection': true,
  reconnectionAttempts: 'Infinity',
  timeout: 10000,
  transports: ['websocket']
};

const socket = io(server, connectionOptions);

const App = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // check for token in LS when app first runs
    if (localStorage.token) {
      // if there is a token set axios headers for all requests
      setAuthToken(localStorage.token);
    }
    // try to fetch a user, if no token or invalid token we
    // will get a 401 response from our API
    store.dispatch(loadUser());

    // log user out from all tabs if they log out in one tab
    window.addEventListener('storage', () => {
      if (!localStorage.token) store.dispatch({ type: LOGOUT });
    });
  }, []);

  useEffect(() => {
    socket.on('allUsers', (data) => {
      setUsers(data);
    });
  }, []);

  const uuid = () => {
    let S4 = () => {
      // return (((1 + Math.random()) * 0x10000) | 0).toString(10).substring(1);
      return Math.floor(Math.random() * 9000) + 1000;
    };
    return (
      S4()
    );
  };

  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <Alert />
        <div>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route path="profiles" element={<Profiles />} />
            <Route path="profile/:id" element={<Profile />} />
            <Route
              path="/forms"
              element={
                <PrivateRoute>
                  <Forms uuid={uuid} socket={socket} setUser={setUser} />
                </PrivateRoute>
              }
            />
            <Route
              path="/:roomId"
              element={
                <PrivateRoute>
                  <RoomPage user={user} socket={socket} users={users} />
                </PrivateRoute>
              }
            />
            <Route
              path="create-profile"
              element={<PrivateRoute component={ProfileForm} />}
            />
            <Route
              path="edit-profile"
              element={<PrivateRoute component={ProfileForm} />}
            />
            <Route
              path="add-experience"
              element={<PrivateRoute component={AddExperience} />}
            />
            <Route
              path="add-education"
              element={<PrivateRoute component={AddEducation} />}
            />
            <Route path="posts" element={<PrivateRoute component={Posts} />} />
            <Route
              path="posts/:id"
              element={<PrivateRoute component={Post} />}
            />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;

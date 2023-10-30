// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}
const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()

  const initAuth = async () => {
    const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
    const userData = window.JSON.parse(localStorage.getItem('userData'));
    // console.log(storedToken)
    if (storedToken) {
      // console.log(userData)
      // console.log(userData.email)
      setLoading(true)
      await axios
        .get(`http://localhost:8000/user/${userData.email}`, {
          headers: {
            Authorization: storedToken
          }
        })
        .then(async response => {
          // console.log(response);
          // console.log(response.data);
          setLoading(false)
          setUser(response.data)
        })
        .catch((err) => {
          console.log(err);
          localStorage.removeItem('userData')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('accessToken')
          setUser(null)
          setLoading(false)
          if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
            router.replace('/login')
          }
        })
    } else {
      setLoading(false)
      console.log("else");
    }
  }

  // console.log(user);

  useEffect(() => { 
    initAuth()
  }, [])

  const handleLogin = (params, errorCallback) => {
    axios
      .post(`http://localhost:8000/user/login`, params)
      .then(async response => {
        params.rememberMe
          ? window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.token)
          : null
        const returnUrl = router.query.returnUrl
        if(response){
          console.log(response)
        }else{
          console.log("error")
        }
        setUser(response.data.user)
        params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(response.data.user)) : null
        initAuth();
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/dashboards/crm';
        router.replace(redirectURL);
      })
      .catch(err => {
        if (errorCallback) errorCallback(err);
      });
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }

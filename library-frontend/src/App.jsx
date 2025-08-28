import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useApolloClient, useQuery } from '@apollo/client/react'
import Recommended from './components/Recommended'
import { ME } from './queries'

const App = () => {
  const [token, setToken] = useState(null)
  const navigate = useNavigate()
  const client = useApolloClient()
  const userQuery = useQuery(ME)

  useEffect(() => {
    const storedToken = localStorage.getItem('user-token')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  if (userQuery.loading) {
    return <div>loading...</div>
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    navigate('/')
  }

  const user = userQuery.data.me

  return (
    <div>
      <div>
        <button onClick={() => navigate('/authors')}>Authors</button>
        <button onClick={() => navigate('/books')}>Books</button>
        {token && (
          <>
            <button onClick={() => navigate('/addbook')}>Add book</button>
            <button onClick={() => navigate('/recommended')}>
              Recommended
            </button>
          </>
        )}
        {token ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <button onClick={() => navigate('/login')}>Login</button>
        )}
      </div>

      <Routes>
        <Route path="/" element={<Authors token={token} />} />
        <Route path="/authors" element={<Authors token={token} />} />
        <Route path="/books" element={<Books />} />
        <Route path="/addbook" element={<NewBook />} />
        <Route path="/recommended" element={<Recommended user={user} />} />
        <Route path="/login" element={<LoginForm setToken={setToken} />} />
      </Routes>
    </div>
  )
}

export default App

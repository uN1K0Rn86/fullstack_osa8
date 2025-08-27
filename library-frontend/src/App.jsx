import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useApolloClient } from '@apollo/client/react'

const App = () => {
  const [token, setToken] = useState(null)
  const navigate = useNavigate()
  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => navigate('/authors')}>Authors</button>
        <button onClick={() => navigate('/books')}>Books</button>
        {token && (
          <button onClick={() => navigate('/addbook')}>Add book</button>
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
        <Route path="/login" element={<LoginForm setToken={setToken} />} />
      </Routes>
    </div>
  )
}

export default App

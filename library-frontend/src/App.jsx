import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  useApolloClient,
  useQuery,
  useSubscription,
} from '@apollo/client/react'
import Recommended from './components/Recommended'
import {
  ALL_BOOKS,
  BOOK_ADDED,
  ME,
  ALL_GENRES,
  BOOKS_BY_GENRE,
} from './queries'

const App = () => {
  const [token, setToken] = useState(null)
  const navigate = useNavigate()
  const client = useApolloClient()
  const userQuery = useQuery(ME)
  const genreQuery = useQuery(ALL_GENRES)

  useEffect(() => {
    const storedToken = localStorage.getItem('user-token')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      window.alert(`New book added: ${addedBook.title}`)

      client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(addedBook),
        }
      })

      genres.forEach(g => {
        client.cache.updateQuery(
          { query: BOOKS_BY_GENRE, variables: { genre: g } },
          booksByGenre => {
            if (!booksByGenre) {
              return booksByGenre
            }

            return {
              allBooks: booksByGenre.allBooks.concat(addedBook),
            }
          }
        )
      })
    },
  })

  if (userQuery.loading || genreQuery.loading) {
    return <div>loading...</div>
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    navigate('/')
  }

  const user = userQuery.data.me
  const genres = genreQuery.data.allGenres

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
        <Route path="/books" element={<Books genres={genres} />} />
        <Route path="/addbook" element={<NewBook genresToUpdate={genres} />} />
        <Route path="/recommended" element={<Recommended user={user} />} />
        <Route path="/login" element={<LoginForm setToken={setToken} />} />
      </Routes>
    </div>
  )
}

export default App

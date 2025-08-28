import { useQuery } from '@apollo/client/react'
import { BOOKS_BY_GENRE } from '../queries'

const Recommended = ({ user }) => {
  const booksByGenreQuery = useQuery(BOOKS_BY_GENRE, {
    variables: { genre: user.favoriteGenre },
  })

  if (booksByGenreQuery.loading) {
    return <div>loading...</div>
  }

  const books = booksByGenreQuery.data.allBooks

  return (
    <div>
      <h2>Recommended</h2>
      <div>
        Books in your favorite genre <b>{user.favoriteGenre}</b>
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {books.map(a => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended

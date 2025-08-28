import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ALL_GENRES, BOOKS_BY_GENRE } from '../queries'
import { useState } from 'react'

const Books = () => {
  const [genre, setGenre] = useState('all')
  const bookQuery = useQuery(ALL_BOOKS)
  const genreQuery = useQuery(ALL_GENRES)
  const booksByGenreQuery = useQuery(BOOKS_BY_GENRE, {
    variables: { genre },
  })

  if (bookQuery.loading || genreQuery.loading || booksByGenreQuery.loading) {
    return <div>loading...</div>
  }

  const books =
    genre === 'all' ? bookQuery.data.allBooks : booksByGenreQuery.data.allBooks

  const genres = genreQuery.data.allGenres

  return (
    <div>
      <h2>Books</h2>
      {genre !== 'all' && (
        <div>
          In genre <b>{genre}</b>
        </div>
      )}
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
      <div>
        {genres.map(g => (
          <button key={g} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => setGenre('all')}>All Genres</button>
      </div>
    </div>
  )
}

export default Books

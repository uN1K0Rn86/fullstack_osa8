import { useMutation, useQuery } from '@apollo/client/react'
import { ALL_AUTHORS, ALL_BOOKS, EDIT_BIRTHYEAR } from '../queries'
import { useState } from 'react'
import Select from 'react-select'

const Authors = ({ token }) => {
  const result = useQuery(ALL_AUTHORS)

  const [editAuthor] = useMutation(EDIT_BIRTHYEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }],
  })

  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  if (result.loading) {
    return <div>loading...</div>
  }

  const handleSubmit = event => {
    event.preventDefault()

    editAuthor({ variables: { name, born: Number(born) } })
    setBorn('')
  }

  const authors = result.data.allAuthors
  const options = authors.map(a => ({ value: a.name, label: a.name }))

  const handleAuthorChange = option => {
    setName(option.value)
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map(a => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {token && (
        <>
          <h3>Set Birthyear</h3>
          <form onSubmit={handleSubmit}>
            <Select
              placeholder="Select author here"
              onChange={handleAuthorChange}
              options={options}
            />
            <div>
              Born
              <input
                value={born}
                onChange={({ target }) => setBorn(target.value)}
              />
            </div>
            <button type="submit">Change year</button>
          </form>
        </>
      )}
    </div>
  )
}

export default Authors

import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export default function NotFoundPage() {
  return (
    <section style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h2>Page not found</h2>
      <p>The route you requested does not exist.</p>
      <Link to={ROUTES.root}>Back to home</Link>
    </section>
  )
}

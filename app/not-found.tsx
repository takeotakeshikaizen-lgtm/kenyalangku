/* Home is a standalone HTML document and requires a full navigation. */
/* eslint-disable @next/next/no-html-link-for-pages */
export default function NotFound() {
  return (
    <main id="main" className="container not-found">
      <span className="small-label">404 · AN UNCHARTED PATH</span>
      <h1>
        This world is
        <br />
        <em>yet to be discovered.</em>
      </h1>
      <p>
        The page you’re looking for isn’t here. Let’s head back to familiar
        ground.
      </p>
      <a className="button button-dark" href="/">
        Back to KenyalangKu ↗
      </a>
    </main>
  );
}

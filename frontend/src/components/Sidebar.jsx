export default function Sidebar({ setPage }) {
  return (
    <aside className="soc-sidebar">
      <h2>CryptoGuard</h2>
      <nav>
        <span onClick={() => setPage("dashboard")}>Home</span>
        <span onClick={() => setPage("hash")}>Hashing Demo</span>
        <span onClick={() => setPage("encrypt")}>Encryption Demo</span>
        <span onClick={() => setPage("hmac")}>API Authentication</span>
        <span onClick={() => setPage("attack")}>Attack Simulation</span>
      </nav>
    </aside>
  );
}

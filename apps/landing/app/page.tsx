import styles from "./page.module.css";

export default function Page() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Hello There!</h1>
      </main>

      <footer className={styles.footer}>Footer</footer>
    </div>
  );
}

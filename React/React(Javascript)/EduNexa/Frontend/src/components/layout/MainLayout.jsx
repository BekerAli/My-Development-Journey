
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import "../../styles/MainLayout.css";

export default function MainLayout({ children }) {
    return (
        <div className="main-layout">

            <Sidebar />

            <main className="main-content">

                <Navbar />

                <section className="page-content">
                    {children}
                </section>

            </main>

        </div>
    );
}

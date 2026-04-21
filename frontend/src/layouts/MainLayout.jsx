import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

function MainLayout({ children }) {
	return (
		<div className="min-h-screen bg-stone-50">
			<Navbar />
			<div className="flex min-h-[calc(100vh-72px)]">
				<Sidebar />
				<main className="flex-1 overflow-y-auto p-6">{children}</main>
			</div>
		</div>
	);
}

export default MainLayout;
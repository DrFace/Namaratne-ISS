import { usePage } from '@inertiajs/react';
import { BarChart3, Users, MessageSquare, Calendar, FileText } from 'lucide-react';
import Authenticated from '@/Layouts/AuthenticatedLayout';

export default function Dashboard() {
    const { auth } = usePage().props as any;
    const user = auth.user;

    return (
        <Authenticated bRoutes={undefined}>
            <div className="p-6 space-y-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 font-Inter">
                        Welcome back, {user.first_name}
                    </h1>
                    <p className="text-sm text-gray-600">
                        Here’s your personalized overview based on your role.
                    </p>
                </div>

                {/* Admin Dashboard */}
                {user.role === 'admin' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <DashboardCard title="Total Users" icon={<Users />} value="128" />
                        <DashboardCard title="Active Pipelines" icon={<BarChart3 />} value="12" />
                        <DashboardCard title="Conversion Rate" icon={<FileText />} value="37%" />
                    </div>
                )}

            </div>


        </Authenticated>
    );
}

function DashboardCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4 hover:shadow-md transition">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
                <div className="w-6 h-6">{icon}</div>
            </div>
            <div>
                <div className="text-sm text-gray-600 font-medium">{title}</div>
                <div className="text-xl font-bold text-gray-800">{value}</div>
            </div>
        </div>
    );
}






///////////////////////////////////////
// import { useState } from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Bar, Pie } from "react-chartjs-2";
// import AdminHeader from "@/Components/shared/AdminHeader";

// ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// const Dashboard = ({ user }: { user: any }) => {
//   // Bar chart data
//   const barData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
//     datasets: [
//       {
//         label: "Purchase",
//         data: [55000, 60000, 42000, 38000, 47000, 25000, 53000, 45000],
//         backgroundColor: "rgba(59,130,246,0.7)",
//       },
//       {
//         label: "Sales",
//         data: [50000, 48000, 45000, 39000, 42000, 31000, 49000, 40000],
//         backgroundColor: "rgba(34,197,94,0.7)",
//       },
//     ],
//   };

//   // Pie chart data
//   const pieData = {
//     labels: ["Apple 61%", "Samsung 15%", "Asus 13%", "Xiaomi 8%"],
//     datasets: [
//       {
//         data: [61, 15, 13, 8],
//         backgroundColor: ["#60A5FA", "#22C55E", "#FACC15", "#A855F7"],
//       },
//     ],
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <aside className="hidden lg:flex flex-col w-64 bg-white border-r">
//         <div className="flex items-center justify-center h-16 border-b">
//           <img src="/logo.png" alt="logo" className="h-10" />
//         </div>
//         <nav className="flex-1 p-4 space-y-2">
//           <a className="flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
//             Dashboard
//           </a>
//           <a className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
//             Inventory
//           </a>
//           <a className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
//             Reports
//           </a>
//           <a className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
//             User Management
//           </a>
//           <a className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
//             Manage User Access
//           </a>
//           <a className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
//             Customers
//           </a>
//           <a className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
//             Billing
//           </a>
//         </nav>
//       </aside>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col">
//         {/* Use AdminHeader */}
//         <AdminHeader user={user} />

//         {/* Dashboard Content */}
//         <main className="flex-1 p-6 overflow-y-auto mt-[4.3rem] lg:mt-20">
//           {/* Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//             <div className="p-4 bg-white rounded-xl shadow">
//               <h3 className="text-sm text-gray-500">Purchase Overview</h3>
//               <div className="mt-2 flex flex-col space-y-1 text-sm">
//                 <p>82 Purchase</p>
//                 <p>LKR 13,573 Cost</p>
//                 <p>5 Cancel</p>
//                 <p>LKR 17,432 Return</p>
//               </div>
//             </div>
//             <div className="p-4 bg-white rounded-xl shadow">
//               <h3 className="text-sm text-gray-500">Inventory Summary</h3>
//               <div className="mt-2 flex flex-col space-y-1 text-sm">
//                 <p>868 Qty in Hand</p>
//                 <p>200 To be received</p>
//               </div>
//             </div>
//             <div className="p-4 bg-white rounded-xl shadow">
//               <h3 className="text-sm text-gray-500">Top Categories</h3>
//               <div className="w-40 mx-auto">
//                 <Pie data={pieData} />
//               </div>
//             </div>
//           </div>

//           {/* Charts */}
//           <div className="bg-white p-6 rounded-xl shadow">
//             <h3 className="text-sm text-gray-500 mb-4">Sales vs Purchase</h3>
//             <Bar data={barData} />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

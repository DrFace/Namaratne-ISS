import React from 'react';
import Authenticated from "@/Layouts/AuthenticatedLayout";
import Breadcrumbs from "@/Components/UI/Breadcrumbs";
import Card from "@/Components/UI/Card";
import { 
    BookOpen, 
    LayoutDashboard, 
    Archive, 
    ShoppingCart, 
    Users, 
    Building2, 
    BarChart3, 
    Settings, 
    FileText,
    Truck,
    HelpCircle,
    Plus,
    MousePointer2,
    ArrowRight,
    CornerRightDown,
    Search
} from "lucide-react";

const HelpSection = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Icon className="w-5 h-5" />
            <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <div className="text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed">
            {children}
        </div>
    </div>
);

const PositionBadge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 ml-2">
        <MousePointer2 className="w-3 h-3 mr-1" />
        {children}
    </span>
);

export default function HelpIndex() {
    return (
        <Authenticated>
            <div className="flex-1 p-6 space-y-6 animate-premium-in min-h-screen bg-gray-50/50">
                <Breadcrumbs items={[{ label: 'Help & User Manual', href: route('help.index') }]} />
                
                <div className="max-w-5xl mx-auto space-y-8 pb-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">System User Manual</h2>
                        </div>
                    </div>

                    {/* NEW SECTION: Order of Operations */}
                    <Card className="p-8 border-none shadow-xl bg-indigo-600 text-white overflow-hidden relative">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2">
                                <ArrowRight className="w-6 h-6" />
                                <h3 className="text-2xl font-bold">The Golden Rule: Order of Operations</h3>
                            </div>
                            <p className="text-indigo-100 max-w-2xl">
                                To ensure data consistency, some items must be created before others. 
                                Follow this sequence when setting up your inventory:
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                                {[
                                    { step: 1, title: "Vehicle Types", desc: "Add Categories first" },
                                    { step: 2, title: "Suppliers", desc: "Add Vendors second" },
                                    { step: 3, title: "Products", desc: "Link to Type & Supplier" },
                                    { step: 4, title: "Stock", desc: "Update final quantities" }
                                ].map((item) => (
                                    <div key={item.step} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                        <div className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-1">Step {item.step}</div>
                                        <div className="font-bold text-lg">{item.title}</div>
                                        <div className="text-xs text-indigo-100">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    </Card>

                    <Card className="p-8 border-none shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/5">
                        <div className="space-y-12">
                            
                            {/* Inventory Detailed */}
                            <HelpSection icon={Archive} title="1. Inventory & Products">
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                            <Plus className="w-4 h-4 text-indigo-600" />
                                            Adding Vehicle Types (Categories)
                                        </h4>
                                        <p className="text-sm">Navigate to <strong>Inventory</strong>. Look for the <span className="text-indigo-600 font-bold">"Add Vehicle Type"</span> button.<PositionBadge>Top-Right Header</PositionBadge></p>
                                        <p className="text-xs text-gray-500 mt-2 italic">Example: Add "Toyota Hilux 2022" before adding its specific brake pads.</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                            <Plus className="w-4 h-4 text-indigo-600" />
                                            Creating New Products
                                        </h4>
                                        <p className="text-sm">Click the <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-xs font-bold">New Product</span> button.<PositionBadge>Top-Right Corner</PositionBadge></p>
                                        <p className="text-sm mt-1">Fill in the Name, SKU, and critically, select the <strong>Vehicle Type</strong> you created in the previous step.</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                            <Plus className="w-4 h-4 text-indigo-600" />
                                            Restocking (Add Stock)
                                        </h4>
                                        <p className="text-sm">Use the <span className="border-2 border-gray-200 px-2 py-0.5 rounded text-xs font-bold">Add Stock</span> button.<PositionBadge>Header Center-Right</PositionBadge></p>
                                        <p className="text-sm mt-1">This allows you to update quantities for existing products and set specific buying/selling prices for the new batch.</p>
                                    </div>
                                </div>
                            </HelpSection>

                            {/* Billing Detailed */}
                            <HelpSection icon={ShoppingCart} title="2. Sales & Billing (POS)">
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-3 font-medium">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">1</div>
                                                <p className="text-sm"><strong>Find Customer:</strong> Use the search fields.<PositionBadge>Right Sidebar</PositionBadge> Type at least 2 characters to see results.</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">2</div>
                                                <p className="text-sm"><strong>Add Products:</strong> Search for items on the left and click <span className="text-indigo-600 font-bold">"Add to Cart"</span>.</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">3</div>
                                                <p className="text-sm"><strong>Payment:</strong> Select Cash or Credit and click <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">Approve Sale</span>.<PositionBadge>Bottom Right</PositionBadge></p>
                                            </div>
                                        </div>
                                        
                                        {/* POS Visual ASCII Representation */}
                                        <div className="hidden md:block w-64 bg-gray-100 p-4 rounded-xl border-2 border-dashed border-gray-300">
                                            <div className="text-[10px] font-mono text-gray-400 leading-tight">
                                                [ SEARCH PRODUCTS ] [ CART/USER ]<br/>
                                                -------------------  ----------<br/>
                                                | [ ITEM ] [ ITEM ] | | USER: ? |<br/>
                                                |                   | |        |<br/>
                                                | [ ITEM ] [ ITEM ] | | TOTAL: |<br/>
                                                |                   | |        |<br/>
                                                -------------------  | [SAVE]  |<br/>
                                                                     ----------
                                            </div>
                                            <p className="text-[10px] text-center mt-2 font-bold text-gray-500 uppercase italic">POS Layout Glance</p>
                                        </div>
                                    </div>
                                </div>
                            </HelpSection>

                            {/* Reports & Exports */}
                            <HelpSection icon={BarChart3} title="3. Reporting & Exports">
                                <p>Every table in the system (Inventory, Sales, Customers) features an <strong>Export</strong> button.</p>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    <li><strong>Excel Export:</strong> Look for the <span className="text-green-600 font-bold">"Excel"</span> or <span className="text-gray-600 font-bold">"Export"</span> buttons usually located in the header or next to bulk actions.</li>
                                    <li><strong>ABC Analysis:</strong> Located in the <strong>Reports</strong> module, this helps you categorize high-value inventory.</li>
                                </ul>
                            </HelpSection>

                            {/* Support */}
                            <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
                                <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 flex items-start gap-4 shadow-sm">
                                    <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Technical Guidance</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            If a button is disabled (greyed out), you may lack the necessary permissions. Contact your system administrator to adjust your role access.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes premium-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-premium-in {
                    animation: premium-in 0.5s ease-out forwards;
                }
            `}} />
        </Authenticated>
    );
}

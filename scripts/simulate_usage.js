import { createClient } from '@supabase/supabase-js';

// Configuration (Mirrored from src/lib/supabase.ts)
const supabaseUrl = 'https://usatbokjphhscygveqsv.supabase.co';
const supabaseKey = 'sb_publishable_T8sOwYq6jA3AWbO70_n0ww_AW706_b4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const branches = ['chilanzar', 'uchtepa', 'shayzantaur'];

const sampleProducts = [
    { id: '1', name: 'Potato', quantity: 50, unit: 'kg', category: 'Vegetables', price: 5000 },
    { id: '2', name: 'Carrot', quantity: 20, unit: 'kg', category: 'Vegetables', price: 3000 },
    { id: '3', name: 'Beef', quantity: 10, unit: 'kg', category: 'Meat', price: 85000 },
];

async function simulate() {
    console.log('🚀 Starting Project Usage Simulation...\n');

    // --- Step 1: Chefs create orders ---
    console.log('👨‍🍳 [Chefs] 3 Chefs are creating usage orders...');
    const createdOrders = [];

    for (const branch of branches) {
        const newOrder = {
            id: Date.now().toString() + Math.floor(Math.random() * 1000), // Unique ID
            status: 'sent_to_financier', // Chef sends to financier immediately in this sim
            branch: branch,
            products: sampleProducts,
            createdAt: new Date(),
        };

        const { data, error } = await supabase.from('orders').upsert(newOrder).select();
        if (error) {
            console.error(`❌ Chef (${branch}) failed to create order:`, error.message);
        } else {
            console.log(`✅ Chef (${branch}) sent order #${newOrder.id} to Financier.`);
            createdOrders.push(data[0]);
        }
        await sleep(500); // Simulate some delay between chefs
    }

    console.log('\n⏳ Waiting for Financiers to notice...\n');
    await sleep(1500);

    // --- Step 2: Financiers review and approve ---
    console.log('💼 [Financiers] 2 Financiers are reviewing incoming orders...');

    // Fetch orders waiting for financier
    const { data: financierOrders, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'sent_to_financier');

    if (fetchError) console.error('Error fetching financier orders:', fetchError.message);

    if (financierOrders && financierOrders.length > 0) {
        console.log(`   Found ${financierOrders.length} orders pending review.`);

        for (const order of financierOrders) {
            // Simulate checking (randomly pick one of the "2 financiers")
            const financierName = Math.random() > 0.5 ? 'Financier A' : 'Financier B';

            // Update status to 'sent_to_supplier'
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: 'sent_to_supplier' })
                .eq('id', order.id);

            if (updateError) {
                console.error(`❌ ${financierName} failed to approve order #${order.id}:`, updateError.message);
            } else {
                console.log(`✅ ${financierName} approved order #${order.id} -> Sent to Supplier.`);
            }
            await sleep(800);
        }
    } else {
        console.log('   No orders to review.');
    }

    console.log('\n⏳ Waiting for Supplier to receive...\n');
    await sleep(1500);

    // --- Step 3: Supplier processes orders ---
    console.log('🚚 [Supplier] The Supplier is checking for new consolidated lists...');

    // Fetch orders waiting for supplier
    const { data: supplierOrders, error: supFetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'sent_to_supplier');

    if (supFetchError) console.error('Error fetching supplier orders:', supFetchError.message);

    if (supplierOrders && supplierOrders.length > 0) {
        console.log(`   Supplier found ${supplierOrders.length} orders to process.`);

        for (const order of supplierOrders) {
            // Update status to 'chef_checking' (Delivered)
            const { error: deliverError } = await supabase
                .from('orders')
                .update({
                    status: 'chef_checking',
                    deliveredAt: new Date()
                })
                .eq('id', order.id);

            if (deliverError) {
                console.error(`❌ Supplier failed to deliver order #${order.id}:`, deliverError.message);
            } else {
                console.log(`✅ Supplier delivered order #${order.id} -> Sent back to Chef for checking.`);
            }
            await sleep(1000);
        }
    } else {
        console.log('   No orders for Supplier.');
    }

    console.log('\n✨ Simulation Complete!');
}

simulate();

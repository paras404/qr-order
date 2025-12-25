const supabase = require('./config/supabase');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
    try {
        console.log('Starting database seeding...');

        // Clear existing data
        await supabase.from('admins').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log('Cleared existing data');

        // Create admin user with hashed password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const { data: admin, error: adminError } = await supabase
            .from('admins')
            .insert([{
                username: 'admin',
                password: hashedPassword
            }])
            .select()
            .single();

        if (adminError) {
            console.error('Error creating admin:', adminError);
        } else {
            console.log('Admin user created: username=admin, password=admin123');
        }

        // Create menu items
        const menuItems = [
            // Indian
            {
                name: 'Butter Chicken',
                description: 'Creamy tomato-based curry with tender chicken pieces',
                price: 350,
                category: 'Indian',
                image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
                is_available: true
            },
            {
                name: 'Paneer Tikka Masala',
                description: 'Grilled cottage cheese in rich spiced gravy',
                price: 280,
                category: 'Indian',
                image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
                is_available: true
            },
            {
                name: 'Biryani',
                description: 'Aromatic basmati rice with spiced chicken/veg',
                price: 320,
                category: 'Indian',
                image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
                is_available: true
            },
            {
                name: 'Dal Makhani',
                description: 'Creamy black lentils slow-cooked with butter',
                price: 220,
                category: 'Indian',
                image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
                is_available: true
            },
            // Chinese
            {
                name: 'Hakka Noodles',
                description: 'Stir-fried noodles with vegetables and sauces',
                price: 180,
                category: 'Chinese',
                image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
                is_available: true
            },
            {
                name: 'Manchurian',
                description: 'Deep-fried veggie/chicken balls in tangy sauce',
                price: 200,
                category: 'Chinese',
                image_url: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400',
                is_available: true
            },
            {
                name: 'Fried Rice',
                description: 'Wok-tossed rice with vegetables and egg',
                price: 160,
                category: 'Chinese',
                image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
                is_available: true
            },
            // Italian
            {
                name: 'Margherita Pizza',
                description: 'Classic pizza with tomato, mozzarella, and basil',
                price: 380,
                category: 'Italian',
                image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                is_available: true
            },
            {
                name: 'Pasta Alfredo',
                description: 'Creamy fettuccine pasta with parmesan cheese',
                price: 320,
                category: 'Italian',
                image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
                is_available: true
            },
            {
                name: 'Lasagna',
                description: 'Layered pasta with meat sauce and cheese',
                price: 400,
                category: 'Italian',
                image_url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400',
                is_available: true
            },
            // Beverages
            {
                name: 'Fresh Lime Soda',
                description: 'Refreshing lime juice with soda',
                price: 60,
                category: 'Beverages',
                image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
                is_available: true
            },
            {
                name: 'Mango Lassi',
                description: 'Sweet yogurt drink with mango pulp',
                price: 80,
                category: 'Beverages',
                image_url: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400',
                is_available: true
            },
            // Desserts
            {
                name: 'Gulab Jamun',
                description: 'Soft milk dumplings in sugar syrup',
                price: 100,
                category: 'Desserts',
                image_url: 'https://images.unsplash.com/photo-1589119908995-c6b8c6d8b5b0?w=400',
                is_available: true
            },
            {
                name: 'Tiramisu',
                description: 'Italian coffee-flavored dessert',
                price: 180,
                category: 'Desserts',
                image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
                is_available: true
            }
        ];

        const { data: insertedItems, error: menuError } = await supabase
            .from('menu_items')
            .insert(menuItems)
            .select();

        if (menuError) {
            console.error('Error creating menu items:', menuError);
        } else {
            console.log(`${insertedItems.length} menu items created`);
        }

        console.log('\n✅ Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();

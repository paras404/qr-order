const nodemailer = require('nodemailer');
const supabase = require('../config/supabase');
const { generateInvoiceHTML } = require('../templates/invoiceTemplate');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail', // or 'smtp' for custom SMTP
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
        },
    });
};

/**
 * Send invoice email to customer
 * @param {string} orderId - The order ID
 * @returns {Promise<boolean>} - Success status
 */
const sendInvoiceEmail = async (orderId) => {
    try {
        // Fetch order details from database
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            console.error('Error fetching order:', orderError);
            return false;
        }

        // Fetch customer details
        if (!order.customer_id) {
            console.log('No customer ID associated with order');
            return false;
        }

        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', order.customer_id)
            .single();

        if (customerError || !customer) {
            console.error('Error fetching customer:', customerError);
            return false;
        }

        // Check if customer has email
        if (!customer.email) {
            console.log('Customer has no email address');
            return false;
        }

        // Generate HTML invoice
        const htmlContent = generateInvoiceHTML(order, customer);

        // Create transporter
        const transporter = createTransporter();

        // Email options
        const mailOptions = {
            from: {
                name: process.env.RESTAURANT_NAME || 'QR Order Restaurant',
                address: process.env.EMAIL_USER,
            },
            to: customer.email,
            subject: `Invoice for Order #${order.id.substring(0, 8).toUpperCase()} - ${process.env.RESTAURANT_NAME || 'Restaurant'}`,
            html: htmlContent,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Invoice email sent:', info.messageId);
        return true;

    } catch (error) {
        console.error('Error sending invoice email:', error);
        return false;
    }
};

/**
 * Test email configuration
 */
const testEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email configuration is valid');
        return true;
    } catch (error) {
        console.error('❌ Email configuration error:', error.message);
        return false;
    }
};

module.exports = {
    sendInvoiceEmail,
    testEmailConfig,
};

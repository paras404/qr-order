const generateInvoiceHTML = (orderData, customerData) => {
    const { id, table_id, items, subtotal, service_charge, tax, total_amount, createdAt } = orderData;
    const { name, phone, email } = customerData;

    const restaurantName = process.env.RESTAURANT_NAME || 'QR Order Restaurant';
    const restaurantPhone = process.env.RESTAURANT_PHONE || '+91-XXXXXXXXXX';
    const restaurantEmail = process.env.RESTAURANT_EMAIL || 'restaurant@example.com';

    const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;
    const formatDate = (date) => new Date(date).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${restaurantName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${restaurantName}</h1>
                            <p style="margin: 10px 0 0 0; color: #fecaca; font-size: 16px;">Payment Invoice</p>
                        </td>
                    </tr>

                    <!-- Order Information -->
                    <tr>
                        <td style="padding: 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <h2 style="margin: 0 0 15px 0; color: #333333; font-size: 18px; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Order Information</h2>
                                        <table width="100%" cellpadding="5" cellspacing="0">
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;"><strong>Order ID:</strong></td>
                                                <td style="color: #333333; font-size: 14px; text-align: right;">#${id.substring(0, 8).toUpperCase()}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;"><strong>Table:</strong></td>
                                                <td style="color: #333333; font-size: 14px; text-align: right;">Table ${table_id}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;"><strong>Date & Time:</strong></td>
                                                <td style="color: #333333; font-size: 14px; text-align: right;">${formatDate(createdAt)}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Customer Details -->
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <h2 style="margin: 0 0 15px 0; color: #333333; font-size: 18px; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Customer Details</h2>
                                        <table width="100%" cellpadding="5" cellspacing="0">
                                            ${name ? `
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;"><strong>Name:</strong></td>
                                                <td style="color: #333333; font-size: 14px; text-align: right;">${name}</td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;"><strong>Phone:</strong></td>
                                                <td style="color: #333333; font-size: 14px; text-align: right;">${phone}</td>
                                            </tr>
                                            ${email ? `
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;"><strong>Email:</strong></td>
                                                <td style="color: #333333; font-size: 14px; text-align: right;">${email}</td>
                                            </tr>
                                            ` : ''}
                                        </table>
                                    </td>
                                </tr>

                                <!-- Order Items -->
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <h2 style="margin: 0 0 15px 0; color: #333333; font-size: 18px; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Order Items</h2>
                                        <table width="100%" cellpadding="8" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 4px;">
                                            <thead>
                                                <tr style="background-color: #f9f9f9;">
                                                    <th style="text-align: left; color: #666666; font-size: 13px; font-weight: 600; padding: 10px;">Item</th>
                                                    <th style="text-align: center; color: #666666; font-size: 13px; font-weight: 600; padding: 10px;">Qty</th>
                                                    <th style="text-align: right; color: #666666; font-size: 13px; font-weight: 600; padding: 10px;">Price</th>
                                                    <th style="text-align: right; color: #666666; font-size: 13px; font-weight: 600; padding: 10px;">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${items.map((item, index) => `
                                                <tr style="${index % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f9f9f9;'}">
                                                    <td style="color: #333333; font-size: 14px; padding: 10px; border-bottom: 1px solid #e5e5e5;">${item.name}</td>
                                                    <td style="color: #333333; font-size: 14px; padding: 10px; text-align: center; border-bottom: 1px solid #e5e5e5;">${item.qty}</td>
                                                    <td style="color: #333333; font-size: 14px; padding: 10px; text-align: right; border-bottom: 1px solid #e5e5e5;">${formatCurrency(item.price)}</td>
                                                    <td style="color: #333333; font-size: 14px; padding: 10px; text-align: right; border-bottom: 1px solid #e5e5e5;">${formatCurrency(item.price * item.qty)}</td>
                                                </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Bill Summary -->
                                <tr>
                                    <td>
                                        <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f9f9f9; border-radius: 4px; padding: 15px;">
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; padding: 5px;">Subtotal</td>
                                                <td style="color: #333333; font-size: 14px; text-align: right; padding: 5px;">${formatCurrency(subtotal)}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; padding: 5px;">Service Charge (${process.env.SERVICE_CHARGE_PERCENT || 5}%)</td>
                                                <td style="color: #333333; font-size: 14px; text-align: right; padding: 5px;">${formatCurrency(service_charge)}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; padding: 5px;">GST (${process.env.TAX_PERCENT || 18}%)</td>
                                                <td style="color: #333333; font-size: 14px; text-align: right; padding: 5px;">${formatCurrency(tax)}</td>
                                            </tr>
                                            <tr style="border-top: 2px solid #dc2626;">
                                                <td style="color: #333333; font-size: 18px; font-weight: bold; padding: 10px 5px 5px 5px;">Grand Total</td>
                                                <td style="color: #dc2626; font-size: 20px; font-weight: bold; text-align: right; padding: 10px 5px 5px 5px;">${formatCurrency(total_amount)}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 25px; text-align: center; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0 0 10px 0; color: #dc2626; font-size: 18px; font-weight: bold;">Thank you for dining with us!</p>
                            <p style="margin: 0; color: #666666; font-size: 13px;">
                                ${restaurantName}<br>
                                Phone: ${restaurantPhone}<br>
                                Email: ${restaurantEmail}
                            </p>
                            <p style="margin: 15px 0 0 0; color: #999999; font-size: 11px;">
                                This is an automated invoice. Please keep it for your records.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

module.exports = { generateInvoiceHTML };

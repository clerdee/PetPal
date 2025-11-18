// backend/utils/createPDF.js
// Function: createPDF(order, callback)
const PDFDocument = require('pdfkit');

const formatCurrency = (num) => {
    const value = Number(num);
    const safe = Number.isFinite(value) ? value : 0;
    return `₱${safe.toFixed(2)}`;
};

const ensureNumber = (v, def = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
};

const ensureString = (v, def = '') => {
    if (v === null || v === undefined) return def;
    return String(v);
};

const createPDF = (order, callback) => {
    try {
        console.log(`🧾 Starting PDF generation for order ${order?._id}`);

        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);
            console.log(`🧾 Completed PDF for order ${order?._id}, size=${pdfBuffer.length} bytes`);
            callback(pdfBuffer);
        });

        // Header
        doc.fontSize(25).text('PetPal Order Receipt', { align: 'center' }).moveDown();

        const dateString = order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        const customerName = ensureString(order?.user?.name, 'Customer');
        const customerEmail = ensureString(order?.user?.email, 'N/A');

        doc.fontSize(12)
           .text(`Order ID: ${ensureString(order?._id, '')}`, { continued: true })
           .text(`Date: ${dateString}`, { align: 'right' })
           .moveDown();

        doc.text(`Customer: ${customerName} (${customerEmail})`).moveDown();

        // Order Items
        doc.fillColor('#000').fontSize(14).text('ORDER SUMMARY', { underline: true }).moveDown(0.5);

        const itemX = ensureNumber(50);
        const qtyX = ensureNumber(300);
        const priceX = ensureNumber(380);
        const totalX = ensureNumber(470);

        doc.font('Helvetica-Bold')
           .text('Item', itemX, ensureNumber(doc.y))
           .text('Qty', qtyX, ensureNumber(doc.y))
           .text('Price', priceX, ensureNumber(doc.y))
           .text('Total', totalX, ensureNumber(doc.y), { align: 'right' })
           .font('Helvetica');

        let y = ensureNumber(doc.y) + 20;

        if (Array.isArray(order?.orderItems) && order.orderItems.length > 0) {
            order.orderItems.forEach(item => {
                const name = ensureString(item?.name, 'Product');
                const quantity = ensureNumber(item?.quantity, 0);
                const price = ensureNumber(item?.price, 0);
                const itemTotal = price * quantity;

                doc.fontSize(10)
                   .text(name, itemX, y)
                   .text(String(quantity), qtyX, y)
                   .text(formatCurrency(price), priceX, y)
                   .text(formatCurrency(itemTotal), totalX, y, { align: 'right' });
                y += 20;
            });
        } else {
            doc.fontSize(10).text('No items in this order.', itemX, y);
            y += 20;
        }

        // Totals — avoid doc.y and use controlled y
        const subtotal = ensureNumber(order?.itemsPrice, 0);
        const tax = ensureNumber(order?.taxPrice, 0);
        const shipping = ensureNumber(order?.shippingPrice, 0);
        const grandTotal = ensureNumber(order?.totalPrice, 0);

        y += 10;
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Items Subtotal:', 350, y, { align: 'right' });
        doc.text(formatCurrency(subtotal), totalX, y, { align: 'right' });

        y += 16;
        doc.text('Tax:', 350, y, { align: 'right' });
        doc.text(formatCurrency(tax), totalX, y, { align: 'right' });

        y += 16;
        doc.text('Shipping:', 350, y, { align: 'right' });
        doc.text(formatCurrency(shipping), totalX, y, { align: 'right' });

        y += 20;
        doc.text('GRAND TOTAL:', 350, y, { align: 'right' });
        doc.text(formatCurrency(grandTotal), totalX, y, { align: 'right' });

        // Footer
        const footerY = ensureNumber(doc.page?.height, 792) - 50;
        doc.moveDown(2)
           .fontSize(10)
           .text('Thank you for shopping at PetPal!', 50, footerY, { align: 'center' });

        doc.end();
    } catch (error) {
        console.error("PDF Generation Error:", error);
        // Fallback: generate a minimal PDF instead of throwing
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                console.log(`🧾 Fallback PDF generated for order ${order?._id}, size=${pdfBuffer.length} bytes`);
                callback(pdfBuffer);
            });
            doc.fontSize(18).text('PetPal Receipt', { align: 'center' }).moveDown();
            doc.fontSize(12).text(`Order ID: ${ensureString(order?._id, '')}`).moveDown();
            doc.text('An error occurred while generating the detailed receipt.').moveDown();
            doc.text('Please contact support if you need assistance.');
            doc.end();
        } catch (fallbackErr) {
            console.error("PDF Fallback Error:", fallbackErr);
            callback(Buffer.from(''));
        }
    }
};

module.exports = createPDF;
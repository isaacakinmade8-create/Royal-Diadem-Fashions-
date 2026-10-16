ROYAL DIADEM — E-COMMERCE WEBSITE
=================================

This is a responsive fashion storefront for Royal Diadem.

Included:
- Traditional Wears
- Ready to Wear
- Accessories
- Bespoke Styles
- Jewellery
- Bags
- Direct WhatsApp ordering
- Email contact
- Mobile responsive navigation
- Category filtering
- Supplied Royal Diadem artwork used in the site

CONTACT
-------
WhatsApp: +44 7467 508756
Email: mamatroyal@yahoo.com

FILES
-----
index.html
style.css
script.js
assets/royal-diadem-logo.jpg
assets/royal-diadem-icon.png (header + footer logo)
assets/favicon.ico, favicon.png, favicon-16.png, favicon-32.png, apple-touch-icon.png (browser tab icon)
assets/royal-diadem-showcase.jpg

HOW TO USE
----------
Open index.html in a browser, or deploy the folder to Vercel/Netlify/GitHub Pages.

TO ADD REAL PRODUCTS
--------------------
Duplicate a product-card in index.html and update:
1. data-category
2. image source
3. category name
4. product name
5. data-product

For a production store, the next step can be a database/admin dashboard so products can be added from the live website rather than editing files.

ADMIN DASHBOARD
---------------
The database is already set up and connected (Supabase project "Royal Diadem", see config.js).
Remaining one-time steps in the Supabase dashboard:
1. Authentication > Users > Add user: create your admin email + password.
2. Authentication > Sign In / Providers: turn OFF "Allow new users to sign up" (otherwise anyone could register and become an admin).
3. Open /admin.html, log in, add products. Orders appear under Orders.
Customers click "Order on WhatsApp", enter name/quantity/notes; the order is saved and WhatsApp opens with the details.
(supabase-setup.sql is the SQL already applied, kept for reference.)
